import path from "path";
import { MEDIA_CONFIG, type MediaCategory, getFileType } from "./media-config";

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const fileType = getFileType(file.type);
  const maxSize = MEDIA_CONFIG.MAX_FILE_SIZE[fileType] || MEDIA_CONFIG.MAX_FILE_SIZE.default;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const allowedTypes = Object.values(MEDIA_CONFIG.ALLOWED_MIME_TYPES).flat() as string[];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Validate complete file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) return sizeValidation;

  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) return typeValidation;

  return { valid: true };
}

/**
 * Sanitize path segments to prevent directory traversal
 */
export function sanitizePath(segments: string[]): string[] {
  return segments
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "_"));
}

/**
 * Build media file path
 */
export function buildMediaPath(pathSegments: string[], filename: string): string {
  const sanitizedSegments = sanitizePath(pathSegments);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  
  return path.join(MEDIA_CONFIG.ROOT_DIR, ...sanitizedSegments, sanitizedFilename);
}

/**
 * Build media URL for API access
 */
export function buildMediaUrl(pathSegments: string[], filename: string): string {
  const sanitizedSegments = sanitizePath(pathSegments);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  
  return `/api/media/${sanitizedSegments.join("/")}/${sanitizedFilename}`;
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, extension);
  
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 50);

  if (userId) {
    return `${userId}_${timestamp}_${random}_${sanitizedBaseName}${extension}`;
  }
  
  return `${timestamp}_${random}_${sanitizedBaseName}${extension}`;
}

/**
 * Parse media path from URL
 */
export function parseMediaPath(urlPath: string): { segments: string[]; filename: string } {
  const parts = urlPath.split("/").filter(Boolean);
  const filename = parts.pop() || "";
  const segments = parts;

  return { segments, filename };
}

/**
 * Check if path is within allowed categories
 */
export function isValidCategory(category: string): category is MediaCategory {
  return MEDIA_CONFIG.CATEGORIES.includes(category as MediaCategory);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
