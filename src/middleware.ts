import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip intl middleware for API routes and static files
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/logo") || pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/manifest.json") {
    const response = NextResponse.next();
    // Still add security headers
    addSecurityHeaders(response);
    return response;
  }

  // Run the next-intl middleware for page routes
  const response = intlMiddleware(request);

  // Add security headers
  addSecurityHeaders(response);

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://ipapi.co https://api.resend.com https://*.neon.tech https://*.vercel.app; frame-ancestors 'none';"
  );
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
