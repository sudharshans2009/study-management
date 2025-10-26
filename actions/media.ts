"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { put, del, list, head } from "@vercel/blob";
import {
  validateFile,
  generateUniqueFilename,
  isValidCategory,
  formatFileSize,
} from "@/lib/media/utils";
import { getFileTypeFromExtension } from "@/lib/media/config";

export type SaveFileResult = {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  error?: string;
};

export type FileInfo = {
  name: string;
  path: string;
  url: string;
  size: number;
  formattedSize: string;
  type: string;
  createdAt: Date;
};

/**
 * Get current session using Better Auth
 */
async function getSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

/**
 * Build blob pathname from path segments and filename
 */
function buildBlobPathname(pathSegments: string[], filename: string): string {
  return `${pathSegments.join("/")}/${filename}`;
}

/**
 * Save a file to Vercel Blob storage
 * @param file - The file to save
 * @param pathSegments - Path segments (e.g., ["profile", "user"])
 * @param filename - Optional custom filename (will be sanitized)
 * @param userId - Optional user ID for filename generation
 * @returns Result with URL and path or error
 */
export async function saveFile(
  file: File,
  pathSegments: string[],
  filename?: string,
  userId?: string
): Promise<SaveFileResult> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate path segments
    if (!pathSegments.length) {
      return { success: false, error: "Path segments are required" };
    }

    // Validate first segment is a valid category
    if (!isValidCategory(pathSegments[0])) {
      return {
        success: false,
        error: `Invalid category: ${pathSegments[0]}. Must be one of: profile, user, documents, attachments, temp`,
      };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate filename if not provided
    const finalFilename = filename
      ? generateUniqueFilename(filename, userId || session.user.id)
      : generateUniqueFilename(file.name, userId || session.user.id);

    // Build pathname for Vercel Blob
    const pathname = buildBlobPathname(pathSegments, finalFilename);

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false, // We already add unique suffix
    });

    return {
      success: true,
      url: blob.url,
      path: pathname,
      filename: finalFilename,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save file",
    };
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param pathSegments - Path segments (e.g., ["profile", "user"])
 * @param filename - Filename to delete
 * @returns Success status or error
 */
export async function deleteFile(
  pathSegments: string[],
  filename: string
): Promise<SaveFileResult> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate category
    if (!isValidCategory(pathSegments[0])) {
      return { success: false, error: "Invalid category" };
    }

    // Build pathname
    const pathname = buildBlobPathname(pathSegments, filename);

    // Delete from Vercel Blob
    await del(pathname);

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

/**
 * List files in Vercel Blob storage with a specific prefix
 * @param pathSegments - Path segments (e.g., ["profile", "user"])
 * @returns Array of file information or error
 */
export async function listFiles(
  pathSegments: string[]
): Promise<{ success: boolean; files?: FileInfo[]; error?: string }> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate category
    if (!isValidCategory(pathSegments[0])) {
      return { success: false, error: "Invalid category" };
    }

    // Build prefix for listing
    const prefix = pathSegments.join("/") + "/";

    // List blobs with prefix
    const { blobs } = await list({ prefix });

    const files: FileInfo[] = blobs.map((blob) => {
      const filename = blob.pathname.split("/").pop() || "";
      const fileType = getFileTypeFromExtension(filename);
      
      return {
        name: filename,
        path: blob.pathname,
        url: blob.url,
        size: blob.size,
        formattedSize: formatFileSize(blob.size),
        type: fileType,
        createdAt: new Date(blob.uploadedAt),
      };
    });

    // Sort by creation date (newest first)
    files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { success: true, files };
  } catch (error) {
    console.error("Error listing files:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list files",
    };
  }
}

/**
 * Get file information from Vercel Blob
 * @param pathSegments - Path segments
 * @param filename - Filename
 * @returns File information or error
 */
export async function getFileInfo(
  pathSegments: string[],
  filename: string
): Promise<{ success: boolean; file?: FileInfo; error?: string }> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Build pathname
    const pathname = buildBlobPathname(pathSegments, filename);

    // Get blob metadata using head
    const blobHead = await head(pathname);

    if (!blobHead) {
      return { success: false, error: "File not found" };
    }

    const fileType = getFileTypeFromExtension(filename);

    const file: FileInfo = {
      name: filename,
      path: pathname,
      url: blobHead.url,
      size: blobHead.size,
      formattedSize: formatFileSize(blobHead.size),
      type: fileType,
      createdAt: new Date(blobHead.uploadedAt),
    };

    return { success: true, file };
  } catch (error) {
    console.error("Error getting file info:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get file info",
    };
  }
}

/**
 * Move/rename a file in Vercel Blob (copy + delete)
 * @param oldPathSegments - Current path segments
 * @param oldFilename - Current filename
 * @param newPathSegments - New path segments
 * @param newFilename - New filename
 * @returns Success status or error
 */
export async function moveFile(
  oldPathSegments: string[],
  oldFilename: string,
  newPathSegments: string[],
  newFilename: string
): Promise<SaveFileResult> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate categories
    if (!isValidCategory(oldPathSegments[0]) || !isValidCategory(newPathSegments[0])) {
      return { success: false, error: "Invalid category" };
    }

    // Build pathnames
    const oldPathname = buildBlobPathname(oldPathSegments, oldFilename);
    const newPathname = buildBlobPathname(newPathSegments, newFilename);

    // Get the old blob to copy its content
    const oldBlob = await head(oldPathname);
    
    if (!oldBlob) {
      return { success: false, error: "Source file not found" };
    }

    // Fetch the blob content
    const response = await fetch(oldBlob.url);
    if (!response.ok) {
      return { success: false, error: "Failed to fetch source file" };
    }

    // Upload to new location
    const newBlob = await put(newPathname, await response.blob(), {
      access: "public",
      addRandomSuffix: false,
    });

    // Delete old blob
    await del(oldPathname);

    return {
      success: true,
      url: newBlob.url,
      path: newPathname,
      filename: newFilename,
    };
  } catch (error) {
    console.error("Error moving file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move file",
    };
  }
}
