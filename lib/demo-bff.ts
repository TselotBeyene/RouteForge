import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_INTEGRATIONS,
  DEMO_SCHEMA_ROUTES,
  demoIntegrationSource,
  demoRouteGraph,
} from "@/lib/demo-data";
import { demoOpenApiSpec } from "@/lib/demo-openapi";

function isDemoMode() {
  const demoFlag = (value: string | undefined) => value?.trim().toLowerCase() === "true";
  return demoFlag(process.env.DEMO_MODE) || demoFlag(process.env.NEXT_PUBLIC_DEMO_MODE);
}

function normalizeRoute(path: string[]) {
  return `/${(path ?? []).join("/")}`.replace(/\/+$/, "") || "/";
}

function okJson<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

function baseResponse<T>(data: T) {
  return {
    status: true,
    statusDesc: "OK",
    data,
    count: Array.isArray(data) ? data.length : undefined,
    errorCode: null,
  };
}

export function demoBffResponse(request: NextRequest, path: string[]): NextResponse | null {
  if (!isDemoMode()) {
    return null;
  }

  const route = normalizeRoute(path ?? []);
  const method = request.method.toUpperCase();

  if (method === "GET" && route === "/api/repository/branches") {
    return okJson(baseResponse(["starter", "main"]));
  }

  if (method === "GET" && route === "/api/integrations") {
    return okJson(DEMO_INTEGRATIONS);
  }

  if (method === "GET" && route.startsWith("/api/integrations/")) {
    const name = decodeURIComponent(route.slice("/api/integrations/".length));
    const match = DEMO_INTEGRATIONS.find((item) => item.name === name);

    if (!match) {
      return okJson({ message: "Integration not found" }, { status: 404 });
    }

    return okJson({
      ...match,
      sourceName: `${name}.yaml`,
      sourceLanguage: "yaml",
      sourceContent: demoIntegrationSource(name),
      files: [],
    });
  }

  if (method === "GET" && route.startsWith("/api/routes/visualize/")) {
    const name = decodeURIComponent(route.slice("/api/routes/visualize/".length));
    return okJson(demoRouteGraph(name));
  }

  if (method === "GET" && route === "/api/integration-schemas/routes") {
    return okJson(baseResponse(DEMO_SCHEMA_ROUTES));
  }

  if (
    method === "GET" &&
    (route === "/v3/api-docs" ||
      route === "/v3/api-docs/default" ||
      route.endsWith("/v3/api-docs") ||
      route.endsWith("/v3/api-docs.yaml"))
  ) {
    return okJson(demoOpenApiSpec);
  }

  if (method === "GET" && route.includes("/v3/api-docs/swagger-config")) {
    return okJson({
      configUrl: "/api/bff/v3/api-docs/swagger-config",
      oauth2RedirectUrl: "/swagger/oauth2-redirect.html",
      url: "/api/bff/v3/api-docs",
    });
  }

  if (method !== "GET" && method !== "HEAD") {
    return okJson(
      { message: "Demo mode is read-only. Connect a backend to create or update data." },
      { status: 403 }
    );
  }

  return okJson({ message: "Demo mode: no mock data for this endpoint." }, { status: 404 });
}
