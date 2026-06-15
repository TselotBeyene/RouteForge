export const DEMO_INTEGRATIONS = [
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
  {
    name: "customer-notify",
    namespace: "camel-k",
    phase: "Running",
    runtimeVersion: "3.15.0",
    createdAt: "2025-03-22T09:15:00.000Z",
  },
  {
    name: "shipment-tracker",
    namespace: "camel-k",
    phase: "Running",
    runtimeVersion: "3.15.0",
    createdAt: "2025-04-05T11:40:00.000Z",
  },
  {
    name: "fraud-check",
    namespace: "camel-k",
    phase: "Error",
    runtimeVersion: "3.14.2",
    createdAt: "2025-04-18T16:05:00.000Z",
  },
  {
    name: "catalog-export",
    namespace: "camel-k",
    phase: "Building",
    runtimeVersion: "3.15.0",
    createdAt: "2025-05-02T07:50:00.000Z",
  },
  {
    name: "email-dispatcher",
    namespace: "camel-k",
    phase: "Running",
    runtimeVersion: "3.15.0",
    createdAt: "2025-05-20T13:25:00.000Z",
  },
] as const;

export const DEMO_SCHEMA_ROUTES = [
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
      schema: {
        type: "object",
        required: ["orderId", "customerId"],
        properties: {
          orderId: { type: "string" },
          customerId: { type: "string" },
          total: { type: "number" },
          currency: { type: "string", enum: ["USD", "EUR", "ETB"] },
        },
      },
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
      schema: {
        type: "object",
        required: ["transactionId", "amount"],
        properties: {
          transactionId: { type: "string" },
          amount: { type: "number" },
          status: { type: "string", enum: ["pending", "settled", "failed"] },
        },
      },
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
      schema: {
        type: "object",
        properties: {
          sku: { type: "string" },
          quantity: { type: "integer" },
          warehouse: { type: "string" },
        },
      },
    },
  },
  {
    routeIntegrationId: 4,
    routeId: "customer-notify.sms",
    path: "/notifications/sms",
    uri: "twilio:sms",
    metadataId: 104,
    validateSchema: true,
    stripPrefix: 0,
    schemaId: "notification-v1",
    schema: {
      id: 4,
      type: "notification",
      version: "1.2.0",
      baseVersion: "1.0.0",
      base: false,
      enabled: true,
      validFrom: "2025-03-20",
      validTo: null,
      schema: {
        type: "object",
        required: ["to", "body"],
        properties: {
          to: { type: "string" },
          body: { type: "string", maxLength: 160 },
          channel: { type: "string", enum: ["sms", "email", "push"] },
        },
      },
    },
  },
  {
    routeIntegrationId: 5,
    routeId: "shipment-tracker.events",
    path: "/shipments/events",
    uri: "kafka:logistics.tracking",
    metadataId: 105,
    validateSchema: true,
    stripPrefix: 1,
    schemaId: "shipment-v1",
    schema: {
      id: 5,
      type: "shipment",
      version: "1.0.0",
      baseVersion: "1.0.0",
      base: true,
      enabled: true,
      validFrom: "2025-04-01",
      validTo: null,
      schema: {
        type: "object",
        required: ["trackingId", "status"],
        properties: {
          trackingId: { type: "string" },
          status: { type: "string", enum: ["picked_up", "in_transit", "delivered"] },
          location: { type: "string" },
        },
      },
    },
  },
  {
    routeIntegrationId: 6,
    routeId: "fraud-check.score",
    path: "/fraud/score",
    uri: "https://risk.example.com/score",
    metadataId: 106,
    validateSchema: true,
    stripPrefix: 0,
    schemaId: "fraud-v1",
    schema: {
      id: 6,
      type: "fraud",
      version: "1.1.0",
      baseVersion: "1.0.0",
      base: false,
      enabled: true,
      validFrom: "2025-04-15",
      validTo: null,
      schema: {
        type: "object",
        properties: {
          accountId: { type: "string" },
          riskScore: { type: "number", minimum: 0, maximum: 100 },
          flags: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  {
    routeIntegrationId: 7,
    routeId: "catalog-export.products",
    path: "/catalog/export",
    uri: "sftp://catalog.example.com/export",
    metadataId: 107,
    validateSchema: true,
    stripPrefix: 0,
    schemaId: "product-v2",
    schema: {
      id: 7,
      type: "product",
      version: "2.0.0",
      baseVersion: "1.5.0",
      base: false,
      enabled: false,
      validFrom: "2025-05-01",
      validTo: "2026-05-01",
      schema: {
        type: "object",
        required: ["productId", "name"],
        properties: {
          productId: { type: "string" },
          name: { type: "string" },
          category: { type: "string" },
          price: { type: "number" },
        },
      },
    },
  },
  {
    routeIntegrationId: 8,
    routeId: "email-dispatcher.send",
    path: "/email/send",
    uri: "smtp://mail.example.com:587",
    metadataId: 108,
    validateSchema: true,
    stripPrefix: 0,
    schemaId: "email-v1",
    schema: {
      id: 8,
      type: "email",
      version: "1.0.0",
      baseVersion: "1.0.0",
      base: true,
      enabled: true,
      validFrom: "2025-05-15",
      validTo: null,
      schema: {
        type: "object",
        required: ["to", "subject"],
        properties: {
          to: { type: "string", format: "email" },
          subject: { type: "string" },
          templateId: { type: "string" },
          variables: { type: "object", additionalProperties: { type: "string" } },
        },
      },
    },
  },
];

const DEMO_SOURCE_TEMPLATES: Record<string, string> = {
  "order-sync": `- route:
    id: order-sync
    from:
      uri: kafka:orders.inbound
      steps:
        - validate: { jsonSchema: "order-v1" }
        - to: https://api.example.com/orders
        - log: "Order forwarded"`,
  "payment-gateway": `- route:
    id: payment-gateway
    from:
      uri: rest:post:/payments/webhook
      steps:
        - unmarshal: { json: {} }
        - to: kafka:payments.events
        - setHeader: { name: Content-Type, constant: application/json }`,
  "inventory-bridge": `- route:
    id: inventory-bridge
    from:
      uri: timer:inventory?period=60000
      steps:
        - to: https://erp.example.com/stock
        - split: { jsonpath: $.items }
        - to: kafka:inventory.updates`,
  "customer-notify": `- route:
    id: customer-notify
    from:
      uri: kafka:notifications.outbound
      steps:
        - choice:
            when:
              - simple: "\${body[channel]} == 'sms'"
                steps:
                  - to: twilio:sms
            otherwise:
              steps:
                - to: smtp://mail.example.com`,
  "shipment-tracker": `- route:
    id: shipment-tracker
    from:
      uri: kafka:logistics.tracking
      steps:
        - marshal: { json: {} }
        - to: https://tracking.example.com/events
        - log: "Shipment event published"`,
  "fraud-check": `- route:
    id: fraud-check
    from:
      uri: rest:post:/fraud/score
      steps:
        - to: https://risk.example.com/score
        - filter: { simple: "\${body[riskScore]} > 80" }
        - to: kafka:fraud.alerts`,
  "catalog-export": `- route:
    id: catalog-export
    from:
      uri: timer:catalog?period=3600000
      steps:
        - to: https://pim.example.com/products
        - marshal: { csv: {} }
        - to: sftp://catalog.example.com/export/products.csv`,
  "email-dispatcher": `- route:
    id: email-dispatcher
    from:
      uri: kafka:email.outbound
      steps:
        - to: velocity:classpath:templates/welcome.vm
        - to: smtp://mail.example.com:587`,
};

const DEMO_ROUTE_GRAPHS: Record<string, { nodes: { id: string; type: string; label: string; routeId: string }[]; edges: { id: string; source: string; target: string }[] }> = {
  "order-sync": {
    nodes: [
      { id: "kafka", type: "source", label: "kafka:orders.inbound", routeId: "order-sync" },
      { id: "validate", type: "processor", label: "validate", routeId: "order-sync" },
      { id: "http", type: "processor", label: "https://api.example.com/orders", routeId: "order-sync" },
    ],
    edges: [
      { id: "kafka-validate", source: "kafka", target: "validate" },
      { id: "validate-http", source: "validate", target: "http" },
    ],
  },
  "payment-gateway": {
    nodes: [
      { id: "rest", type: "source", label: "rest:post:/payments/webhook", routeId: "payment-gateway" },
      { id: "unmarshal", type: "processor", label: "unmarshal", routeId: "payment-gateway" },
      { id: "kafka", type: "processor", label: "kafka:payments.events", routeId: "payment-gateway" },
    ],
    edges: [
      { id: "rest-unmarshal", source: "rest", target: "unmarshal" },
      { id: "unmarshal-kafka", source: "unmarshal", target: "kafka" },
    ],
  },
  default: {
    nodes: [
      { id: "from", type: "source", label: "timer:tick", routeId: "demo" },
      { id: "log", type: "processor", label: "log", routeId: "demo" },
    ],
    edges: [{ id: "from-log", source: "from", target: "log" }],
  },
};

export function demoIntegrationSource(name: string): string {
  return (
    DEMO_SOURCE_TEMPLATES[name] ??
    `- route:
    id: ${name}
    from:
      uri: timer:tick?period=5000
      steps:
        - log: Demo integration`
  );
}

export function demoRouteGraph(name: string) {
  const graph = DEMO_ROUTE_GRAPHS[name] ?? DEMO_ROUTE_GRAPHS.default;
  return {
    nodes: graph.nodes.map((node) => ({ ...node, routeId: name })),
    edges: graph.edges,
  };
}
