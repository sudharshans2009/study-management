# Media System - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Test the System

Visit the test page to see it in action:
```
http://localhost:3000/media-test
```

Try uploading an image, document, or video file!

### 2. Add Avatar Upload to Profile Page

Open `app/(app)/profile/page.tsx` and import:

```typescript
import { AvatarUpload } from "@/components/media/avatar-upload";
```

Replace the Avatar component with:

```typescript
<AvatarUpload
  currentImage={user?.image}
  fallback={user?.name?.charAt(0) || "U"}
  userId={user?.id || ""}
  onUploadSuccess={async (url) => {
    // Update user profile
    console.log("New avatar URL:", url);
    // TODO: Save to database
  }}
  size="lg"
/>
```

### 3. Use in Your Components

```typescript
"use client";

import { saveFile } from "@/actions/media";

async function handleUpload(file: File) {
  const result = await saveFile(
    file,
    ["profile", "avatars"],  // Path
    "avatar.jpg",            // Filename (optional)
    userId                   // User ID (optional)
  );

  if (result.success) {
    console.log("Uploaded:", result.url);
    // Use the URL: result.url
  }
}
```

### 4. Display Files

```typescript
// In any component
<img src="/api/media/profile/avatars/filename.jpg" alt="Avatar" />

// Or with result from upload
<img src={result.url} alt="Avatar" />
```

## 📝 Common Use Cases

### Upload Profile Picture

```typescript
import { AvatarUpload } from "@/components/media/avatar-upload";

<AvatarUpload
  currentImage={user?.image}
  fallback="U"
  userId={user.id}
  onUploadSuccess={(url) => updateUserImage(url)}
/>
```

### Upload Document

```typescript
import { saveFile } from "@/actions/media";

const result = await saveFile(
  file,
  ["documents", "reports"],
  "report-2025.pdf",
  userId
);
```

### List User's Files

```typescript
import { useMediaFiles } from "@/hooks/use-media-upload";

const { files, loadFiles } = useMediaFiles(["documents", userId]);

useEffect(() => {
  loadFiles();
}, []);

// Display files
{files.map(file => (
  <a href={file.url} key={file.path}>
    {file.name} ({file.formattedSize})
  </a>
))}
```

### Delete File

```typescript
import { deleteFile } from "@/actions/media";

await deleteFile(["profile", "avatars"], "old-avatar.jpg");
```

## 🎯 API Reference

### Server Actions

```typescript
// Upload
saveFile(file, pathSegments, filename?, userId?)

// Delete
deleteFile(pathSegments, filename)

// List
listFiles(pathSegments)

// Get Info
getFileInfo(pathSegments, filename)

// Move
moveFile(oldPath, oldFile, newPath, newFile)
```

### React Hooks

```typescript
// Upload hook
const { upload, isUploading, progress, error, result, reset } = useMediaUpload();

// Files management hook
const { files, isLoading, error, loadFiles, removeFile } = useMediaFiles(pathSegments);
```

### API Endpoints

```
GET /api/media/{category}/{path}/{filename}
HEAD /api/media/{category}/{path}/{filename}
```

## 📂 Path Structure

Files are organized by categories and custom paths:

```
saveFile(file, ["profile", "avatars"], "image.jpg")
→ media/profile/avatars/user123_timestamp_random_image.jpg
→ URL: /api/media/profile/avatars/user123_timestamp_random_image.jpg

saveFile(file, ["documents", "reports"], "doc.pdf")
→ media/documents/reports/user123_timestamp_random_doc.pdf
→ URL: /api/media/documents/reports/user123_timestamp_random_doc.pdf
```

## 🔒 Security

- ✅ Authentication required for all operations
- ✅ Path sanitization (no directory traversal)
- ✅ File type validation
- ✅ File size limits
- ✅ User-specific access control

## 🎨 Components

### AvatarUpload
```typescript
<AvatarUpload
  currentImage={string}      // Current image URL
  fallback={string}          // Fallback text (initials)
  userId={string}            // User ID
  onUploadSuccess={fn}       // Callback with new URL
  size="sm" | "md" | "lg"   // Size variant
/>
```

### FileUploadDemo
```typescript
<FileUploadDemo
  category="profile"         // File category
  pathSegments={["profile", "test"]}  // Path
  userId={string}            // Optional user ID
/>
```

## ⚙️ Configuration

### File Size Limits

`lib/media/config.ts`:
```typescript
MAX_FILE_SIZE: {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,   // 10MB
  video: 50 * 1024 * 1024,      // 50MB
}
```

### Allowed File Types

`lib/media/config.ts`:
```typescript
ALLOWED_MIME_TYPES: {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  document: ["application/pdf", "application/msword", ...],
  video: ["video/mp4", "video/webm", ...],
}
```

## 🐛 Troubleshooting

### Files not uploading
- Check user is authenticated
- Verify file size is within limits
- Check file type is allowed
- Ensure `media` directory exists

### Files not displaying
- Check API route is accessible
- Verify user authentication
- Check file path is correct

### Permission errors
- Ensure Next.js can write to `media` directory
- On Windows: `icacls media /grant Everyone:F`

## 📚 More Documentation

- **Full Documentation**: `README_MEDIA.md`
- **Examples**: `docs/MEDIA_EXAMPLES.md`
- **Implementation Summary**: `lib/media/IMPLEMENTATION_SUMMARY.md`

## 🎉 You're Ready!

The media system is fully functional. Start by:
1. Testing at `/media-test`
2. Integrating `AvatarUpload` into profile
3. Adding file uploads where needed

Need help? Check the full documentation in `README_MEDIA.md`
