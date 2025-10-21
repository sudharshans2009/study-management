/**
 * Media configuration for file uploads and storage
 */

export const MEDIA_CONFIG = {
  // Root directory for media files
  ROOT_DIR: "media",

  // Allowed file categories
  CATEGORIES: ["profile", "user", "documents", "attachments", "temp"] as const,

  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
    default: 5 * 1024 * 1024, // 5MB
  },

  // Allowed MIME types
  ALLOWED_MIME_TYPES: {
    image: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ],
    video: [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ],
  },

  // File type detection by extension
  FILE_EXTENSIONS: {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv"],
    video: [".mp4", ".mpeg", ".mov", ".avi", ".webm"],
  },
} as const;

export type MediaCategory = (typeof MEDIA_CONFIG.CATEGORIES)[number];
export type FileType = keyof typeof MEDIA_CONFIG.ALLOWED_MIME_TYPES;

/**
 * Get file type from MIME type
 */
export function getFileType(mimeType: string): FileType {
  for (const [type, mimes] of Object.entries(MEDIA_CONFIG.ALLOWED_MIME_TYPES)) {
    if ((mimes as string[]).includes(mimeType)) {
      return type as FileType;
    }
  }
  return "image"; // default
}

/**
 * Get file type from extension
 */
export function getFileTypeFromExtension(filename: string): FileType {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext) return "image";

  for (const [type, extensions] of Object.entries(MEDIA_CONFIG.FILE_EXTENSIONS)) {
    if ((extensions as string[]).includes(ext)) {
      return type as FileType;
    }
  }
  return "image";
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".webm": "video/webm",
  };

  return mimeMap[ext || ""] || "application/octet-stream";
}
