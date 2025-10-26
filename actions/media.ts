"use server";

import { writeFile, mkdir, unlink, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  validateFile,
  buildMediaPath,
  buildMediaUrl,
  generateUniqueFilename,
  sanitizePath,
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
 * Save a file to the media directory
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

    // Build file path
    const filePath = buildMediaPath(pathSegments, finalFilename);
    const fullPath = path.join(process.cwd(), filePath);

    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(fullPath, buffer);

    // Build URL
    const url = buildMediaUrl(pathSegments, finalFilename);

    return {
      success: true,
      url,
      path: filePath,
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
 * Delete a file from the media directory
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

    // Build file path
    const filePath = buildMediaPath(pathSegments, filename);
    const fullPath = path.join(process.cwd(), filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return { success: false, error: "File not found" };
    }

    // Delete file
    await unlink(fullPath);

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
 * List files in a directory
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

    // Build directory path
    const sanitized = sanitizePath(pathSegments);
    const dirPath = path.join(process.cwd(), "media", ...sanitized);

    // Check if directory exists
    if (!existsSync(dirPath)) {
      return { success: true, files: [] };
    }

    // Read directory
    const entries = await readdir(dirPath);
    const files: FileInfo[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isFile()) {
        const fileType = getFileTypeFromExtension(entry);
        files.push({
          name: entry,
          path: buildMediaPath(pathSegments, entry),
          url: buildMediaUrl(pathSegments, entry),
          size: stats.size,
          formattedSize: formatFileSize(stats.size),
          type: fileType,
          createdAt: stats.birthtime,
        });
      }
    }

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
 * Get file information
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

    // Build file path
    const filePath = buildMediaPath(pathSegments, filename);
    const fullPath = path.join(process.cwd(), filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return { success: false, error: "File not found" };
    }

    // Get file stats
    const stats = await stat(fullPath);
    const fileType = getFileTypeFromExtension(filename);

    const file: FileInfo = {
      name: filename,
      path: filePath,
      url: buildMediaUrl(pathSegments, filename),
      size: stats.size,
      formattedSize: formatFileSize(stats.size),
      type: fileType,
      createdAt: stats.birthtime,
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
 * Move/rename a file
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

    // Build paths
    const oldPath = path.join(process.cwd(), buildMediaPath(oldPathSegments, oldFilename));
    const newPath = path.join(process.cwd(), buildMediaPath(newPathSegments, newFilename));

    // Check if old file exists
    if (!existsSync(oldPath)) {
      return { success: false, error: "Source file not found" };
    }

    // Create new directory if needed
    const newDir = path.dirname(newPath);
    if (!existsSync(newDir)) {
      await mkdir(newDir, { recursive: true });
    }

    // Move file (rename in Node.js)
    const { rename } = await import("fs/promises");
    await rename(oldPath, newPath);

    const url = buildMediaUrl(newPathSegments, newFilename);

    return {
      success: true,
      url,
      path: buildMediaPath(newPathSegments, newFilename),
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
