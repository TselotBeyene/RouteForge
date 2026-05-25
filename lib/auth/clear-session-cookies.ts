import { NextRequest, NextResponse } from "next/server";

export function cookieDeleteOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };
}

const KNOWN_AUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.pkce.code_verifier",
  "__Secure-next-auth.pkce.code_verifier",
  "next-auth.state",
  "__Secure-next-auth.state",
  "next-auth.nonce",
  "__Secure-next-auth.nonce",
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.pkce.code_verifier",
  "__Secure-authjs.pkce.code_verifier",
  "authjs.state",
  "__Secure-authjs.state",
  "authjs.nonce",
  "__Secure-authjs.nonce",
];

function isAuthCookieName(name: string): boolean {
  return (
    name.includes("next-auth") ||
    name.includes("authjs") ||
    name.startsWith("__Secure-next-auth") ||
    name.startsWith("__Host-next-auth") ||
    name.startsWith("__Secure-authjs") ||
    name.startsWith("__Host-authjs")
  );
}

function clearCookieName(
  response: NextResponse,
  name: string,
  secure: boolean
) {
  response.cookies.set(name, "", cookieDeleteOptions(secure));

  for (let index = 0; index < 30; index += 1) {
    response.cookies.set(`${name}.${index}`, "", cookieDeleteOptions(secure));
  }
}

export function clearSessionCookies(
  response: NextResponse,
  secure: boolean,
  request?: NextRequest
) {
  const requestCookieNames =
    request?.cookies
      .getAll()
      .map((cookie) => cookie.name)
      .filter(isAuthCookieName) ?? [];

  const names = Array.from(
    new Set([...KNOWN_AUTH_COOKIE_NAMES, ...requestCookieNames])
  );

  for (const name of names) {
    clearCookieName(response, name, secure);
  }
}
