import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth/clear-session-cookies";

export const dynamic = "force-dynamic";

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  return (value || fallback).trim().replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const nextAuthUrl = normalizeBaseUrl(
    process.env.NEXTAUTH_URL,
    request.nextUrl.origin
  );
  const secureCookie = nextAuthUrl.startsWith("https://");
  const response = NextResponse.redirect(`${nextAuthUrl}/login?sessionExpired=1`);

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  clearSessionCookies(response, secureCookie, request);
  return response;
}
