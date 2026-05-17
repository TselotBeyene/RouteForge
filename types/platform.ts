export type IntegrationPhase = "Running" | "Building" | "Error" | "Unknown" | string;

export interface IntegrationSummary {
  name: string;
  namespace: string;
  phase: IntegrationPhase;
  runtimeVersion?: string;
  createdAt?: string;
}

export interface IntegrationFile {
  name: string;
  path: string;
  language: "yaml" | "java" | "text" | string;
  content: string;
  type: "integration" | "route" | "other" | string;
}

export interface IntegrationDetail extends IntegrationSummary {
  sourceName?: string;
  sourceContent: string;
  sourceLanguage: "yaml" | "java";
  files?: IntegrationFile[];
  metadata?: Record<string, unknown>;
}

export interface RouteGraphNode {
  id: string;
  type: string;
  label: string;
  routeId?: string;
  uri?: string;
  data?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface RouteGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface RouteGraph {
  nodes: RouteGraphNode[];
  edges: RouteGraphEdge[];
}
