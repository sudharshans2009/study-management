import { FileUploadDemo } from "@/components/media/file-upload-demo";

export default function MediaTestPage() {
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Media Management System</h1>
        <p className="text-muted-foreground">
          Test file uploads, management, and retrieval
        </p>
      </div>

      <FileUploadDemo
        category="profile"
        pathSegments={["profile", "test"]}
      />
    </div>
  );
}
