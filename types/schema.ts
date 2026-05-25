export interface IntegrationSchemaSummary {
  id?: number;
  type?: string;
  version?: string;
  baseVersion?: string;
  base?: boolean;
  enabled?: boolean;
  validFrom?: string;
  validTo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  schema?: unknown;
}

export interface IntegrationSchemaPayload {
  routeId?: string | null;
  path?: string | null;
  uri?: string | null;
  stripPrefix?: number | null;
  validateSchema?: boolean | null;
  type: string;
  version: string;
  baseVersion?: string | null;
  base: boolean;
  enabled: boolean;
  validFrom: string;
  validTo?: string | null;
  schema: unknown;
}

export interface RouteSchemaEntry {
  routeIntegrationId?: number;
  routeId?: string;
  path?: string;
  uri?: string;
  metadataId?: number;
  validateSchema?: boolean;
  stripPrefix?: number;
  schemaId?: string;
  schema?: IntegrationSchemaSummary | null;
}
