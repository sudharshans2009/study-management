import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { sanitizePath, isValidCategory } from "@/lib/media-utils";
import { getMimeTypeFromExtension } from "@/lib/media-config";

/**
 * GET handler for serving media files
 * Route: /api/media/[...path]
 * Example: /api/media/profile/user/1234.jpg
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get path segments
    const { path: pathSegments } = await params;

    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Sanitize path segments
    const sanitized = sanitizePath(pathSegments);

    // Validate category
    if (!isValidCategory(sanitized[0])) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Build file path
    const filename = sanitized[sanitized.length - 1];
    const directories = sanitized.slice(0, -1);
    const filePath = path.join(process.cwd(), "media", ...directories, filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file stats
    const stats = await stat(filePath);
    
    // Security check: ensure it's a file, not a directory
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine MIME type
    const mimeType = getMimeTypeFromExtension(filename);

    // Set cache headers
    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Content-Length", stats.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Last-Modified", stats.mtime.toUTCString());

    // Handle conditional requests (ETag)
    const etag = `"${stats.size}-${stats.mtime.getTime()}"`;
    headers.set("ETag", etag);

    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers });
    }

    // Return file
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving media file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * HEAD handler for checking if file exists
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }

    const { path: pathSegments } = await params;

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const sanitized = sanitizePath(pathSegments);

    if (!isValidCategory(sanitized[0])) {
      return new NextResponse(null, { status: 400 });
    }

    const filename = sanitized[sanitized.length - 1];
    const directories = sanitized.slice(0, -1);
    const filePath = path.join(process.cwd(), "media", ...directories, filename);

    if (!existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stats = await stat(filePath);
    
    if (!stats.isFile()) {
      return new NextResponse(null, { status: 400 });
    }

    const headers = new Headers();
    headers.set("Content-Type", getMimeTypeFromExtension(filename));
    headers.set("Content-Length", stats.size.toString());
    headers.set("Last-Modified", stats.mtime.toUTCString());
    headers.set("ETag", `"${stats.size}-${stats.mtime.getTime()}"`);

    return new NextResponse(null, { status: 200, headers });
  } catch (error) {
    console.error("Error checking media file:", error);
    return new NextResponse(null, { status: 500 });
  }
}
