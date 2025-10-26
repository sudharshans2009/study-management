import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { sanitizePath, isValidCategory } from "@/lib/media/utils";

/**
 * Helper to build blob pathname from path segments
 */
function buildBlobPathname(pathSegments: string[]): string {
  return pathSegments.join("/");
}

/**
 * GET handler for serving media files - redirects to Vercel Blob CDN
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

    // Build blob pathname
    const pathname = buildBlobPathname(sanitized);

    // Get blob metadata
    const blob = await head(pathname);

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Redirect to the Vercel Blob CDN URL
    // This allows the CDN to handle caching, compression, and delivery
    return NextResponse.redirect(blob.url, 307);
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

    const pathname = buildBlobPathname(sanitized);

    // Get blob metadata
    const blob = await head(pathname);

    if (!blob) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Length", blob.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(null, { status: 200, headers });
  } catch (error) {
    console.error("Error checking media file:", error);
    return new NextResponse(null, { status: 500 });
  }
}
