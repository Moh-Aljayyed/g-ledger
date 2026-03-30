import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Arabic-speaking country codes
const ARABIC_COUNTRIES = [
  "SA", "EG", "AE", "KW", "BH", "OM", "QA", "JO", "IQ",
  "MA", "TN", "SD", "LY", "LB", "SY", "YE", "DJ", "MR", "PS",
];

const intlMiddleware = createMiddleware(routing);

function detectPreferredLocale(request: NextRequest): "ar" | "en" {
  // 1. Check cookie for persisted preference
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale === "ar" || cookieLocale === "en") {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLang = request.headers.get("Accept-Language") || "";
  if (acceptLang.match(/^ar\b/i) || acceptLang.match(/,\s*ar\b/i)) {
    return "ar";
  }

  // 3. Check geo header (Vercel sets x-vercel-ip-country)
  const country = request.headers.get("x-vercel-ip-country") || "";
  if (ARABIC_COUNTRIES.includes(country.toUpperCase())) {
    return "ar";
  }

  // 4. Default to English for all other countries
  return "en";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip intl middleware for API routes and static files
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/logo") || pathname.endsWith(".txt") || pathname.endsWith(".xml") || pathname.endsWith(".json") || pathname.endsWith(".svg") || pathname.endsWith(".png") || pathname.endsWith(".ico")) {
    const response = NextResponse.next();
    // Still add security headers
    addSecurityHeaders(response);
    return response;
  }

  // If user is visiting root "/" without locale, detect and redirect
  if (pathname === "/") {
    const locale = detectPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    addSecurityHeaders(response);
    return response;
  }

  // If user explicitly navigates to /ar or /en, persist their choice
  const localeMatch = pathname.match(/^\/(ar|en)(\/|$)/);
  if (localeMatch) {
    const chosenLocale = localeMatch[1] as "ar" | "en";
    const response = intlMiddleware(request);
    response.cookies.set("NEXT_LOCALE", chosenLocale, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
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
