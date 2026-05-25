import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "set-cookie",
]);

function backendBaseUrl() {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8484").replace(/\/$/, "");
}

function isMutatingMethod(method: string) {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

function isAllowedOrigin(request: NextRequest) {
  if (!isMutatingMethod(request.method)) return true;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    ...(process.env.BFF_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ].filter(Boolean);

  return allowedOrigins.includes(origin);
}

function buildBackendUrl(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const backendPath = `/${path.join("/")}`;
  return `${backendBaseUrl()}${backendPath}${url.search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401, headers: { "X-Auth-Action": "login" } }
    );
  }

  if (session.error === "RefreshAccessTokenError" || session.error === "MissingRefreshToken") {
    return NextResponse.json(
      { message: "Session expired. Please sign in again." },
      { status: 401, headers: { "X-Auth-Action": "session-expired" } }
    );
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const bearer = token?.accessToken;

  if (!bearer || typeof bearer !== "string") {
    return NextResponse.json(
      { message: "Missing backend access token" },
      { status: 401, headers: { "X-Auth-Action": "session-expired" } }
    );
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  if (isMutatingMethod(request.method) && request.headers.get("x-requested-with") !== "XMLHttpRequest") {
    return NextResponse.json({ message: "Missing CSRF protection header" }, { status: 403 });
  }

  const { path } = await context.params;
  const target = buildBackendUrl(request, path ?? []);

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  headers.set("authorization", `Bearer ${bearer}`);
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const body = ["GET", "HEAD"].includes(request.method.toUpperCase()) ? undefined : await request.arrayBuffer();

  const backendResponse = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
