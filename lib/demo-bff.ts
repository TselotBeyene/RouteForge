import { NextRequest, NextResponse } from "next/server";
import { demoOpenApiSpec } from "@/lib/demo-openapi";

function isDemoMode() {
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
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

const DEMO_INTEGRATIONS = [
  {
    name: "order-sync",
    namespace: "camel-k",
    phase: "Running",
    runtimeVersion: "3.15.0",
    createdAt: "2025-01-15T10:00:00.000Z",
  },
  {
    name: "payment-gateway",
    namespace: "camel-k",
    phase: "Running",
    runtimeVersion: "3.15.0",
    createdAt: "2025-02-01T08:30:00.000Z",
  },
  {
    name: "inventory-bridge",
    namespace: "camel-k",
    phase: "Building",
    runtimeVersion: "3.14.2",
    createdAt: "2025-03-10T14:20:00.000Z",
  },
];

const DEMO_SCHEMA_ROUTES = [
  {
    routeIntegrationId: 1,
    routeId: "order-sync.main",
    path: "/orders",
    uri: "https://api.example.com/orders",
    metadataId: 101,
    validateSchema: true,
    stripPrefix: 0,
    schemaId: "order-v1",
    schema: {
      id: 1,
      type: "order",
      version: "1.0.0",
      baseVersion: "1.0.0",
      base: true,
      enabled: true,
      validFrom: "2025-01-01",
      validTo: null,
      schema: { type: "object", properties: { orderId: { type: "string" } } },
    },
  },
  {
    routeIntegrationId: 2,
    routeId: "payment-gateway.webhook",
    path: "/payments/webhook",
    uri: "kafka:payments.events",
    metadataId: 102,
    validateSchema: true,
    stripPrefix: 1,
    schemaId: "payment-v2",
    schema: {
      id: 2,
      type: "payment",
      version: "2.1.0",
      baseVersion: "2.0.0",
      base: false,
      enabled: true,
      validFrom: "2025-02-15",
      validTo: null,
      schema: { type: "object", properties: { amount: { type: "number" } } },
    },
  },
  {
    routeIntegrationId: 3,
    routeId: "inventory-bridge.sync",
    path: "/inventory/sync",
    uri: "timer:inventory?period=60000",
    metadataId: 103,
    validateSchema: false,
    stripPrefix: 0,
    schemaId: "inventory-draft",
    schema: {
      id: 3,
      type: "inventory",
      version: "0.9.0",
      baseVersion: "0.9.0",
      base: true,
      enabled: false,
      validFrom: "2025-03-01",
      validTo: "2025-12-31",
      schema: { type: "object", properties: { sku: { type: "string" } } },
    },
  },
];

export function demoBffResponse(request: NextRequest, path: string[]): NextResponse | null {
  if (!isDemoMode()) {
    return null;
  }

  const route = `/${(path ?? []).join("/")}`;
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
      sourceContent: `- route:\n    id: ${name}\n    from:\n      uri: timer:tick?period=5000\n      steps:\n        - log: Demo integration for portfolio screenshots\n`,
      files: [],
    });
  }

  if (method === "GET" && route.startsWith("/api/routes/visualize/")) {
    const name = decodeURIComponent(route.slice("/api/routes/visualize/".length));

    return okJson({
      nodes: [
        { id: "from", type: "source", label: "timer:tick", routeId: name },
        { id: "log", type: "processor", label: "log", routeId: name },
      ],
      edges: [{ id: "from-log", source: "from", target: "log" }],
    });
  }

  if (method === "GET" && route === "/api/integration-schemas/routes") {
    return okJson(baseResponse(DEMO_SCHEMA_ROUTES));
  }

  if (method === "GET" && (route === "/v3/api-docs" || route === "/v3/api-docs/")) {
    return okJson(demoOpenApiSpec);
  }

  if (method === "GET" && route === "/v3/api-docs/swagger-config") {
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
