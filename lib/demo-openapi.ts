export const demoOpenApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "RouteForge Integration API",
    description: "Demo OpenAPI spec for Camel K integration management.",
    version: "1.0.0",
  },
  servers: [{ url: "/api/bff", description: "RouteForge BFF proxy (demo)" }],
  paths: {
    "/api/integrations": {
      get: {
        tags: ["Integrations"],
        summary: "List Camel K integrations",
        parameters: [
          {
            name: "branch",
            in: "query",
            schema: { type: "string", default: "starter" },
          },
        ],
        responses: {
          "200": {
            description: "Integration summaries",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/IntegrationSummary" },
                },
              },
            },
          },
        },
      },
    },
    "/api/integrations/{name}": {
      get: {
        tags: ["Integrations"],
        summary: "Get integration detail and source",
        parameters: [
          { name: "name", in: "path", required: true, schema: { type: "string" } },
          {
            name: "branch",
            in: "query",
            schema: { type: "string", default: "starter" },
          },
        ],
        responses: {
          "200": {
            description: "Integration detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IntegrationDetail" },
              },
            },
          },
        },
      },
    },
    "/api/routes/visualize/{name}": {
      get: {
        tags: ["Routes"],
        summary: "Visualize integration routes",
        parameters: [
          { name: "name", in: "path", required: true, schema: { type: "string" } },
          {
            name: "branch",
            in: "query",
            schema: { type: "string", default: "starter" },
          },
        ],
        responses: {
          "200": {
            description: "Route graph",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RouteGraph" },
              },
            },
          },
        },
      },
    },
    "/api/integration-schemas/routes": {
      get: {
        tags: ["Schemas"],
        summary: "List route schema metadata",
        responses: {
          "200": {
            description: "Route schema entries",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BaseResponseRouteSchemaList" },
              },
            },
          },
        },
      },
    },
    "/api/repository/branches": {
      get: {
        tags: ["Repository"],
        summary: "List Git branches",
        responses: {
          "200": {
            description: "Branch names",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BaseResponseStringList" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      IntegrationSummary: {
        type: "object",
        properties: {
          name: { type: "string", example: "order-sync" },
          namespace: { type: "string", example: "camel-k" },
          phase: { type: "string", example: "Running" },
          runtimeVersion: { type: "string", example: "3.15.0" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      IntegrationDetail: {
        allOf: [
          { $ref: "#/components/schemas/IntegrationSummary" },
          {
            type: "object",
            properties: {
              sourceName: { type: "string", example: "order-sync.yaml" },
              sourceLanguage: { type: "string", enum: ["yaml", "java"] },
              sourceContent: { type: "string" },
              files: { type: "array", items: { type: "string" } },
            },
          },
        ],
      },
      RouteGraph: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                label: { type: "string" },
                routeId: { type: "string" },
              },
            },
          },
          edges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                source: { type: "string" },
                target: { type: "string" },
              },
            },
          },
        },
      },
      BaseResponseStringList: {
        type: "object",
        properties: {
          status: { type: "boolean" },
          statusDesc: { type: "string" },
          data: { type: "array", items: { type: "string" } },
          count: { type: "integer" },
          errorCode: { type: "string", nullable: true },
        },
      },
      BaseResponseRouteSchemaList: {
        type: "object",
        properties: {
          status: { type: "boolean" },
          statusDesc: { type: "string" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/RouteSchemaEntry" },
          },
          count: { type: "integer" },
          errorCode: { type: "string", nullable: true },
        },
      },
      RouteSchemaEntry: {
        type: "object",
        properties: {
          routeIntegrationId: { type: "integer" },
          routeId: { type: "string" },
          path: { type: "string" },
          uri: { type: "string" },
          metadataId: { type: "integer" },
          validateSchema: { type: "boolean" },
          stripPrefix: { type: "integer" },
          schemaId: { type: "string" },
          schema: { type: "object", additionalProperties: true },
        },
      },
    },
  },
} as const;
