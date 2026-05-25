import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { getAppBaseUrl, isSecureAppUrl } from "@/lib/auth/app-url";

function requiredSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: NEXTAUTH_SECRET");
  }
  return secret;
}

/** Reads the session JWT, trying both secure and non-secure cookie names. */
export async function getAuthToken(request: NextRequest): Promise<JWT | null> {
  const secret = requiredSecret();
  const preferredSecure = isSecureAppUrl(getAppBaseUrl(request));

  const preferred = await getToken({
    req: request,
    secret,
    secureCookie: preferredSecure,
  });

  if (preferred) {
    return preferred;
  }

  return getToken({
    req: request,
    secret,
    secureCookie: !preferredSecure,
  });
}
