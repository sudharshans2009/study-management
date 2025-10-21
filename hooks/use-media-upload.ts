"use client";

import { useState } from "react";
import { saveFile, deleteFile, listFiles, type SaveFileResult, type FileInfo } from "@/actions/media";

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type UploadState = {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  result: SaveFileResult | null;
};

/**
 * Hook for uploading files to media storage
 */
export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    result: null,
  });

  const upload = async (
    file: File,
    pathSegments: string[],
    filename?: string,
    userId?: string
  ): Promise<SaveFileResult> => {
    setState({
      isUploading: true,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      error: null,
      result: null,
    });

    try {
      // Simulate progress (since we can't track actual upload progress with server actions)
      const progressInterval = setInterval(() => {
        setState((prev) => {
          if (!prev.progress) return prev;
          const newPercentage = Math.min(prev.progress.percentage + 10, 90);
          return {
            ...prev,
            progress: {
              ...prev.progress,
              loaded: (file.size * newPercentage) / 100,
              percentage: newPercentage,
            },
          };
        });
      }, 100);

      const result = await saveFile(file, pathSegments, filename, userId);

      clearInterval(progressInterval);

      if (result.success) {
        setState({
          isUploading: false,
          progress: { loaded: file.size, total: file.size, percentage: 100 },
          error: null,
          result,
        });
      } else {
        setState({
          isUploading: false,
          progress: null,
          error: result.error || "Upload failed",
          result,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setState({
        isUploading: false,
        progress: null,
        error: errorMessage,
        result: null,
      });

      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      progress: null,
      error: null,
      result: null,
    });
  };

  return {
    ...state,
    upload,
    reset,
  };
}

/**
 * Hook for managing files in media storage
 */
export function useMediaFiles(pathSegments: string[]) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listFiles(pathSegments);

      if (result.success && result.files) {
        setFiles(result.files);
      } else {
        setError(result.error || "Failed to load files");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = async (filename: string) => {
    try {
      const result = await deleteFile(pathSegments, filename);

      if (result.success) {
        setFiles((prev) => prev.filter((f) => f.name !== filename));
        return { success: true };
      } else {
        setError(result.error || "Failed to delete file");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete file";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    files,
    isLoading,
    error,
    loadFiles,
    removeFile,
  };
}
