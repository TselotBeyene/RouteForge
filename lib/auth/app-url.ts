import { NextRequest } from "next/server";

/** App origin for the current request (matches the host in the browser). */
export function getAppBaseUrl(request: NextRequest): string {
  return request.nextUrl.origin.replace(/\/+$/, "");
}

export function isSecureAppUrl(baseUrl: string): boolean {
  return baseUrl.startsWith("https://");
}
