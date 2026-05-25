import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, isSecureAppUrl } from "@/lib/auth/app-url";
import { clearSessionCookies } from "@/lib/auth/clear-session-cookies";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const appBaseUrl = getAppBaseUrl(request);
  const secureCookie = isSecureAppUrl(appBaseUrl);
  const response = NextResponse.redirect(`${appBaseUrl}/login?loggedOut=1`);

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  clearSessionCookies(response, secureCookie, request);
  return response;
}
