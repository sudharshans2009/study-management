# Media Management System

A comprehensive file upload and management system for SS.Study with server actions and API routes.

## Features

- ✅ **File Upload**: Save files with server actions
- ✅ **File Serving**: Retrieve files via API routes
- ✅ **File Management**: List, delete, move/rename files
- ✅ **Validation**: File type, size, and security validation
- ✅ **Categories**: Organized storage (profile, user, documents, attachments, temp)
- ✅ **Authentication**: User-based access control
- ✅ **Caching**: ETag support and cache headers
- ✅ **Type Safety**: Full TypeScript support
- ✅ **React Hooks**: Easy integration in components

## Directory Structure

```
media/
├── profile/        # User profile images
├── user/           # General user files
├── documents/      # Document files (PDF, DOCX, etc.)
├── attachments/    # Email/message attachments
└── temp/           # Temporary files
```

## Installation

The system is already integrated. Just ensure the `media` directory exists:

```powershell
New-Item -ItemType Directory -Path "media" -Force
```

## Usage

### Server Actions

#### Save a File

```typescript
import { saveFile } from "@/actions/media";

const result = await saveFile(
  file,                      // File object
  ["profile", "user"],       // Path segments
  "avatar.jpg",              // Optional: custom filename
  userId                     // Optional: user ID
);

// Result:
// {
//   success: true,
//   url: "/api/media/profile/user/1234567890_abc123_avatar.jpg",
//   path: "media/profile/user/1234567890_abc123_avatar.jpg",
//   filename: "1234567890_abc123_avatar.jpg"
// }
```

#### Delete a File

```typescript
import { deleteFile } from "@/actions/media";

const result = await deleteFile(
  ["profile", "user"],
  "1234567890_abc123_avatar.jpg"
);
```

#### List Files

```typescript
import { listFiles } from "@/actions/media";

const result = await listFiles(["profile", "user"]);

// Result:
// {
//   success: true,
//   files: [
//     {
//       name: "avatar.jpg",
//       path: "media/profile/user/avatar.jpg",
//       url: "/api/media/profile/user/avatar.jpg",
//       size: 102400,
//       formattedSize: "100 KB",
//       type: "image",
//       createdAt: Date
//     }
//   ]
// }
```

#### Move/Rename File

```typescript
import { moveFile } from "@/actions/media";

const result = await moveFile(
  ["profile", "temp"],        // Old path
  "temp_avatar.jpg",          // Old filename
  ["profile", "user"],        // New path
  "avatar.jpg"                // New filename
);
```

#### Get File Info

```typescript
import { getFileInfo } from "@/actions/media";

const result = await getFileInfo(
  ["profile", "user"],
  "avatar.jpg"
);
```

### API Routes

Files are served through the API route: `/api/media/[...path]`

#### Access a File

```typescript
// Image in profile
<img src="/api/media/profile/user/1234.jpg" alt="Profile" />

// Document download
<a href="/api/media/documents/report.pdf" download>
  Download Report
</a>
```

#### Check if File Exists (HEAD request)

```typescript
const response = await fetch("/api/media/profile/user/1234.jpg", {
  method: "HEAD"
});

if (response.ok) {
  console.log("File exists");
}
```

### React Hooks

#### useMediaUpload Hook

```typescript
"use client";

import { useMediaUpload } from "@/hooks/use-media-upload";

function UploadComponent() {
  const { isUploading, progress, error, result, upload, reset } = useMediaUpload();

  const handleUpload = async (file: File) => {
    const result = await upload(
      file,
      ["profile", "avatar"],
      undefined,
      userId
    );

    if (result.success) {
      console.log("Uploaded:", result.url);
    }
  };

  return (
    <div>
      {isUploading && progress && (
        <div>Uploading: {progress.percentage}%</div>
      )}
      {error && <div>Error: {error}</div>}
      {result?.success && <img src={result.url} alt="Uploaded" />}
    </div>
  );
}
```

#### useMediaFiles Hook

```typescript
"use client";

import { useMediaFiles } from "@/hooks/use-media-upload";
import { useEffect } from "react";

function FilesListComponent() {
  const { files, isLoading, error, loadFiles, removeFile } = useMediaFiles(
    ["profile", "user"]
  );

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      {files.map((file) => (
        <div key={file.path}>
          <img src={file.url} alt={file.name} />
          <button onClick={() => removeFile(file.name)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Demo Component

A complete file upload demo component is available:

```typescript
import { FileUploadDemo } from "@/components/media/file-upload-demo";

export default function MediaPage() {
  return (
    <FileUploadDemo
      category="profile"
      pathSegments={["profile", "avatars"]}
      userId="user123"
    />
  );
}
```

## Configuration

### File Size Limits

Edit `lib/media-config.ts`:

```typescript
MAX_FILE_SIZE: {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,   // 10MB
  video: 50 * 1024 * 1024,      // 50MB
  default: 5 * 1024 * 1024,     // 5MB
}
```

### Allowed File Types

Edit `lib/media-config.ts`:

```typescript
ALLOWED_MIME_TYPES: {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword"],
  video: ["video/mp4", "video/webm"],
}
```

### Categories

Edit `lib/media-config.ts`:

```typescript
CATEGORIES: ["profile", "user", "documents", "attachments", "temp", "custom"]
```

## Security Features

1. **Authentication**: All operations require user authentication
2. **Path Sanitization**: Prevents directory traversal attacks
3. **File Type Validation**: Only allowed MIME types are accepted
4. **File Size Limits**: Configurable size limits per file type
5. **Category Validation**: Files must be in valid categories
6. **User Authorization**: Files are user-specific

## Examples

### Profile Avatar Upload

```typescript
"use client";

import { useState } from "react";
import { saveFile } from "@/lib/actions/media";
import { useAuth } from "@/hooks/use-auth";

export function AvatarUpload() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.image);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await saveFile(
      file,
      ["profile", "avatars"],
      `avatar-${user?.id}.jpg`,
      user?.id
    );

    if (result.success && result.url) {
      setAvatarUrl(result.url);
      // Update user profile in database
    }
  };

  return (
    <div>
      <img src={avatarUrl || "/default-avatar.png"} alt="Avatar" />
      <input type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
```

### Document Manager

```typescript
"use client";

import { useMediaFiles } from "@/hooks/use-media-upload";
import { useEffect } from "react";

export function DocumentManager() {
  const { files, loadFiles, removeFile } = useMediaFiles(["documents", "reports"]);

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      <h2>My Documents</h2>
      {files.map((file) => (
        <div key={file.path}>
          <a href={file.url} download>
            {file.name} ({file.formattedSize})
          </a>
          <button onClick={() => removeFile(file.name)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Server Actions

| Function | Parameters | Returns |
|----------|-----------|---------|
| `saveFile` | `(file: File, pathSegments: string[], filename?: string, userId?: string)` | `SaveFileResult` |
| `deleteFile` | `(pathSegments: string[], filename: string)` | `SaveFileResult` |
| `listFiles` | `(pathSegments: string[])` | `{ success: boolean, files?: FileInfo[], error?: string }` |
| `getFileInfo` | `(pathSegments: string[], filename: string)` | `{ success: boolean, file?: FileInfo, error?: string }` |
| `moveFile` | `(oldPath: string[], oldFile: string, newPath: string[], newFile: string)` | `SaveFileResult` |

### Types

```typescript
type SaveFileResult = {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  error?: string;
};

type FileInfo = {
  name: string;
  path: string;
  url: string;
  size: number;
  formattedSize: string;
  type: string;
  createdAt: Date;
};
```

## Troubleshooting

### Files not uploading

1. Check authentication: User must be logged in
2. Verify file size: Must be within limits
3. Check file type: Must be in allowed MIME types
4. Ensure `media` directory exists and is writable

### Files not loading

1. Check API route is accessible: `/api/media/[...path]`
2. Verify file exists in filesystem
3. Check user authentication
4. Verify path segments are valid

### Permission errors

- Ensure Next.js has write permissions to the `media` directory
- On Windows: `icacls media /grant Everyone:F`
- On Linux/Mac: `chmod 755 media`

## Production Considerations

For production environments, consider:

1. **Cloud Storage**: Use S3, Cloudflare R2, or similar instead of filesystem
2. **CDN**: Serve files through a CDN for better performance
3. **Image Optimization**: Implement image resizing and optimization
4. **Backup**: Regular backups of the media directory
5. **Monitoring**: Track upload failures and storage usage

## License

Part of SS.Study platform.
