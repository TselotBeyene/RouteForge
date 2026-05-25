import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, isSecureAppUrl } from "@/lib/auth/app-url";
import { clearSessionCookies } from "@/lib/auth/clear-session-cookies";
import { getAuthToken } from "@/lib/auth/get-auth-token";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function buildKeycloakLogoutUrl(
  issuer: string,
  clientId: string,
  idToken: string,
  postLogoutRedirectUri: string
) {
  const keycloakLogoutUrl = new URL(
    `${issuer}/protocol/openid-connect/logout`
  );

  keycloakLogoutUrl.searchParams.set("client_id", clientId);
  keycloakLogoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    postLogoutRedirectUri
  );
  keycloakLogoutUrl.searchParams.set("id_token_hint", idToken);

  return keycloakLogoutUrl;
}

export async function GET(request: NextRequest) {
  const issuer = normalizeUrl(requiredEnv("KEYCLOAK_ISSUER"));
  const appBaseUrl = getAppBaseUrl(request);
  const clientId = requiredEnv("KEYCLOAK_CLIENT_ID");
  const secureCookie = isSecureAppUrl(appBaseUrl);

  const token = await getAuthToken(request);
  const idToken = typeof token?.idToken === "string" ? token.idToken : undefined;

  const loginAfterLogout = `${appBaseUrl}/login?loggedOut=1`;
  const skipKeycloak = request.nextUrl.searchParams.get("local") === "1";

  const destination =
    idToken && !skipKeycloak
      ? buildKeycloakLogoutUrl(issuer, clientId, idToken, loginAfterLogout)
      : new URL(loginAfterLogout);

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  clearSessionCookies(response, secureCookie, request);

  return response;
}
