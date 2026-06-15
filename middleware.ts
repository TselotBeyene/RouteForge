import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth/get-auth-token";

const PUBLIC_PATHS = ["/login", "/api/auth"];
const DEMO_MODE =
  process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isBffApi(pathname: string) {
  return pathname.startsWith("/api/bff/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (DEMO_MODE || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getAuthToken(request);

  if (!token) {
    if (isBffApi(pathname)) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (token.error === "RefreshAccessTokenError" || token.error === "MissingRefreshToken") {
    if (isBffApi(pathname)) {
      return NextResponse.json({ message: "Session expired. Please sign in again." }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/integrations/:path*",
    "/schemas/:path*",
    "/karavan/:path*",
    "/swagger/:path*",
    "/logout",
    "/api/bff/:path*",
  ],
};
