# Media System Integration Examples

## Integrating Avatar Upload into Profile Page

### Update `app/(app)/profile/page.tsx`

```typescript
"use client";

import { AvatarUpload } from "@/components/media/avatar-upload";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.image);

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url);
    
    // TODO: Update user profile in database
    // await updateUserProfile({ image: url });
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload Section */}
          <AvatarUpload
            currentImage={avatarUrl}
            fallback={user?.name?.charAt(0) || "U"}
            userId={user?.id || ""}
            onUploadSuccess={handleAvatarUpload}
            size="lg"
          />

          {/* Rest of your profile form */}
          <div className="space-y-4">
            {/* ... existing fields ... */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Document Upload in Settings

### Add to `app/(app)/settings/page.tsx`

```typescript
import { FileUploadDemo } from "@/components/media/file-upload-demo";

export default function SettingsPage() {
  return (
    <Tabs>
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Upload and manage your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadDemo
              category="documents"
              pathSegments={["documents", "personal"]}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

## Custom File Upload Component

### Create `components/custom-uploader.tsx`

```typescript
"use client";

import { useState } from "react";
import { saveFile } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function CustomUploader({ category, userId }: { category: string; userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    const result = await saveFile(
      file,
      [category, userId],
      file.name,
      userId
    );

    clearInterval(interval);
    setProgress(100);
    setUploading(false);

    if (result.success) {
      console.log("File uploaded:", result.url);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      
      {file && (
        <>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          
          {uploading && <Progress value={progress} />}
        </>
      )}
    </div>
  );
}
```

## Batch Upload

### Create `components/batch-uploader.tsx`

```typescript
"use client";

import { useState } from "react";
import { saveFile } from "@/actions/media";

export function BatchUploader({ category, userId }: { category: string; userId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const handleUploadAll = async () => {
    const uploadPromises = files.map((file) =>
      saveFile(file, [category, userId], file.name, userId)
    );

    const results = await Promise.all(uploadPromises);
    const urls = results
      .filter((r) => r.success)
      .map((r) => r.url)
      .filter(Boolean) as string[];

    setResults(urls);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />
      <button onClick={handleUploadAll}>Upload All ({files.length})</button>
      
      <div>
        {results.map((url) => (
          <div key={url}>
            <a href={url} target="_blank">View</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Drag and Drop Upload

### Create `components/drag-drop-upload.tsx`

```typescript
"use client";

import { useState } from "react";
import { saveFile } from "@/actions/media";
import { cn } from "@/lib/utils";

export function DragDropUpload({ category, userId }: { category: string; userId: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const result = await saveFile(file, [category, userId], file.name, userId);
    
    if (result.success && result.url) {
      setUploadedUrl(result.url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center",
        isDragging ? "border-primary bg-primary/10" : "border-muted"
      )}
    >
      <p>Drag and drop files here</p>
      
      {uploadedUrl && (
        <div className="mt-4">
          <img src={uploadedUrl} alt="Uploaded" className="max-w-xs mx-auto" />
        </div>
      )}
    </div>
  );
}
```

## API Usage Examples

### Direct File Access

```typescript
// In any component
<img 
  src="/api/media/profile/avatars/user123_avatar.jpg" 
  alt="Profile" 
/>

// Download link
<a 
  href="/api/media/documents/report.pdf" 
  download
>
  Download Report
</a>
```

### Check File Exists

```typescript
async function checkFileExists(path: string) {
  const response = await fetch(path, { method: "HEAD" });
  return response.ok;
}

// Usage
const exists = await checkFileExists("/api/media/profile/avatar.jpg");
```

### Preload Images

```typescript
useEffect(() => {
  const img = new Image();
  img.src = "/api/media/profile/avatar.jpg";
}, []);
```

## Server-Side Usage

### In Server Components

```typescript
import { getFileInfo, listFiles } from "@/actions/media";

export default async function FilesPage() {
  const { files } = await listFiles(["documents", "reports"]);

  return (
    <div>
      {files?.map((file) => (
        <div key={file.path}>
          <a href={file.url}>{file.name}</a>
          <span>{file.formattedSize}</span>
        </div>
      ))}
    </div>
  );
}
```

### In API Routes

```typescript
import { saveFile } from "@/actions/media";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  const result = await saveFile(
    file,
    ["attachments", "emails"],
    file.name
  );

  return Response.json(result);
}
```

## Advanced Features

### Image Optimization (Future Enhancement)

```typescript
import sharp from "sharp";

async function optimizeAndSave(file: File) {
  const buffer = await file.arrayBuffer();
  
  // Optimize with sharp
  const optimized = await sharp(Buffer.from(buffer))
    .resize(800, 800, { fit: "inside" })
    .webp({ quality: 80 })
    .toBuffer();

  // Save optimized version
  const optimizedFile = new File([optimized], "optimized.webp", {
    type: "image/webp",
  });

  return await saveFile(optimizedFile, ["profile", "avatars"]);
}
```

### Temporary Files with Auto-Delete

```typescript
// Upload to temp category
const result = await saveFile(file, ["temp", userId], file.name);

// Set up cleanup (in a cron job or scheduled task)
async function cleanupTempFiles() {
  const { files } = await listFiles(["temp"]);
  
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (const file of files || []) {
    if (new Date(file.createdAt).getTime() < oneDayAgo) {
      await deleteFile(["temp"], file.name);
    }
  }
}
```

### Secure File Sharing

```typescript
// Generate temporary signed URL (implement this)
async function generateSignedUrl(filePath: string, expiresIn: number) {
  const token = generateToken({ path: filePath, exp: Date.now() + expiresIn });
  return `/api/media/secure/${token}`;
}

// Usage
const shareUrl = await generateSignedUrl(
  "documents/private/report.pdf",
  60 * 60 * 1000 // 1 hour
);
```
