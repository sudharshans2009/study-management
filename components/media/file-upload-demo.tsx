"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMediaUpload, useMediaFiles } from "@/hooks/use-media-upload";
import {
  Upload,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  Video,
  X,
  Download,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

type FileUploadDemoProps = {
  category?: "profile" | "user" | "documents" | "attachments" | "temp";
  pathSegments?: string[];
  userId?: string;
};

export function FileUploadDemo({
  category = "profile",
  pathSegments: initialPathSegments,
  userId,
}: FileUploadDemoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pathSegments, setPathSegments] = useState<string[]>(
    initialPathSegments || [category, "demo"]
  );

  const { isUploading, progress, error: uploadError, result, upload, reset } = useMediaUpload();
  const { files, isLoading, error: filesError, loadFiles, removeFile } = useMediaFiles(pathSegments);

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathSegments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    reset();

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await upload(selectedFile, pathSegments, undefined, userId);

    if (result.success) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Reload files list
      await loadFiles();
    }
  };

  const handleDelete = async (filename: string) => {
    await removeFile(filename);
  };

  const getFileIcon = (type: string) => {
    if (type === "image") return <ImageIcon className="h-5 w-5" />;
    if (type === "document") return <FileText className="h-5 w-5" />;
    if (type === "video") return <Video className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Upload files to {pathSegments.join("/")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Path Configuration */}
          <div className="space-y-2">
            <Label>Path Segments (comma-separated)</Label>
            <Input
              value={pathSegments.join(", ")}
              onChange={(e) =>
                setPathSegments(
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="profile, user"
            />
            <p className="text-xs text-muted-foreground">
              Files will be saved to: /media/{pathSegments.join("/")}
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
          </div>

          {/* Preview */}
          {selectedFile && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {previewUrl ? (
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress */}
              {isUploading && progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} />
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success Message */}
          {result?.success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                File uploaded successfully! URL: {result.url}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Files List Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                Files in {pathSegments.join("/")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadFiles} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{filesError}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No files uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {file.type === "image" ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden">
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.formattedSize} • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={`Download ${file.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.name)}
                      title={`Delete ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
