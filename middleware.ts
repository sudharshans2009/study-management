import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simplified middleware - only handles redirecting logged-in users away from auth pages
 * Individual route components handle their own authentication and verification checks
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const hasSession = !!sessionToken;

  // Only redirect logged-in users away from signin/signup pages
  // All other route protection is handled by the route components themselves
  if (hasSession && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow all other routes - let components handle their own access control
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};


