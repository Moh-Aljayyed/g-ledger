import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = new Set([
  "https://raqyy.com",
  "https://www.raqyy.com",
  "http://localhost:3000",
  "http://localhost:5173",
]);

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://raqyy.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Raqyy-Source, X-Tenant-Id",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function corsPreflight(request: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export function jsonWithCors(
  request: Request,
  body: unknown,
  init?: { status?: number },
): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: corsHeaders(request),
  });
}
