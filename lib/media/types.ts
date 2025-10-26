/**
 * Type definitions for the media management system
 */

import { MEDIA_CONFIG } from "./config";

/**
 * Valid media categories
 */
export type MediaCategory = (typeof MEDIA_CONFIG.CATEGORIES)[number];

/**
 * File types supported by the system
 */
export type FileType = "image" | "document" | "video";

/**
 * Result from file save operations
 */
export interface SaveFileResult {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  error?: string;
}

/**
 * File information returned from listFiles
 */
export interface FileInfo {
  name: string;
  path: string;
  url: string;
  size: number;
  formattedSize: string;
  type: FileType;
  createdAt: Date;
}

/**
 * Result from listFiles operation
 */
export interface ListFilesResult {
  success: boolean;
  files?: FileInfo[];
  error?: string;
}

/**
 * Result from getFileInfo operation
 */
export interface GetFileInfoResult {
  success: boolean;
  file?: FileInfo;
  error?: string;
}

/**
 * Upload progress tracking
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload state for useMediaUpload hook
 */
export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  result: SaveFileResult | null;
}

/**
 * File validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Media URL builder options
 */
export interface MediaUrlOptions {
  pathSegments: string[];
  filename: string;
  cache?: boolean;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  /** Path segments for the file (e.g., ["profile", "avatars"]) */
  pathSegments: string[];
  /** Optional custom filename */
  filename?: string;
  /** Optional user ID for filename generation */
  userId?: string;
  /** Optional callback for progress updates */
  onProgress?: (progress: UploadProgress) => void;
  /** Optional callback on success */
  onSuccess?: (result: SaveFileResult) => void;
  /** Optional callback on error */
  onError?: (error: string) => void;
}

/**
 * File delete options
 */
export interface FileDeleteOptions {
  /** Path segments for the file */
  pathSegments: string[];
  /** Filename to delete */
  filename: string;
  /** Optional callback on success */
  onSuccess?: () => void;
  /** Optional callback on error */
  onError?: (error: string) => void;
}

/**
 * File list options
 */
export interface FileListOptions {
  /** Path segments to list files from */
  pathSegments: string[];
  /** Optional filter by file type */
  fileType?: FileType;
  /** Optional sort order */
  sortBy?: "name" | "date" | "size";
  /** Optional sort direction */
  sortDirection?: "asc" | "desc";
}

/**
 * Media configuration type
 */
export interface MediaConfig {
  ROOT_DIR: string;
  CATEGORIES: readonly MediaCategory[];
  MAX_FILE_SIZE: {
    image: number;
    document: number;
    video: number;
    default: number;
  };
  ALLOWED_MIME_TYPES: {
    image: readonly string[];
    document: readonly string[];
    video: readonly string[];
  };
  FILE_EXTENSIONS: {
    image: readonly string[];
    document: readonly string[];
    video: readonly string[];
  };
}

/**
 * Avatar upload component props
 */
export interface AvatarUploadProps {
  currentImage?: string | null;
  fallback: string;
  userId: string;
  onUploadSuccess?: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

/**
 * File upload demo component props
 */
export interface FileUploadDemoProps {
  category?: MediaCategory;
  pathSegments?: string[];
  userId?: string;
}

/**
 * useMediaUpload hook return type
 */
export interface UseMediaUploadReturn {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  result: SaveFileResult | null;
  upload: (
    file: File,
    pathSegments: string[],
    filename?: string,
    userId?: string
  ) => Promise<SaveFileResult>;
  reset: () => void;
}

/**
 * useMediaFiles hook return type
 */
export interface UseMediaFilesReturn {
  files: FileInfo[];
  isLoading: boolean;
  error: string | null;
  loadFiles: () => Promise<void>;
  removeFile: (filename: string) => Promise<{ success: boolean; error?: string }>;
}
