import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { IntegrationSchemaPayload, RouteSchemaEntry } from "@/types/schema";

export interface BaseResponse<T> {
  status: boolean;
  statusDesc: string;
  data: T;
  count?: number;
  errorCode?: string | null;
}

function unwrapBaseResponse<T>(response: BaseResponse<T>): T {
  if (!response.status) {
    throw new Error(response.statusDesc || response.errorCode || "Backend request failed.");
  }

  return response.data;
}

export const schemaApi = {
  async listRoutes(): Promise<RouteSchemaEntry[]> {
    const response = await apiClient.get<BaseResponse<RouteSchemaEntry[]>>("/api/integration-schemas/routes");
    return unwrapBaseResponse(response.data) ?? [];
  },

  async createSchema(payload: IntegrationSchemaPayload): Promise<number> {
    const response = await apiClient.post<BaseResponse<number>>("/api/integration-schemas/add-schema", payload);
    return unwrapBaseResponse(response.data);
  },

  async updateSchema(id: number, payload: IntegrationSchemaPayload): Promise<number> {
    const response = await apiClient.put<BaseResponse<number>>(
      `/api/integration-schemas/update-schema?id=${encodeURIComponent(String(id))}`,
      {
        id,
        routeId: payload.routeId ?? null,
        path: payload.path ?? null,
        uri: payload.uri ?? null,
        stripPrefix: payload.stripPrefix ?? null,
        validateSchema: payload.validateSchema ?? null,
        type: payload.type,
        version: payload.version,
        baseVersion: payload.baseVersion ?? null,
        base: payload.base,
        enabled: payload.enabled,
        validFrom: payload.validFrom,
        validTo: payload.validTo ?? null,
        schema: payload.schema
      }
    );

    return unwrapBaseResponse(response.data);
  },

  async deleteSchema(id: number): Promise<void> {
    const response = await apiClient.delete<BaseResponse<null>>(
      `/api/integration-schemas/delete-schema?id=${encodeURIComponent(String(id))}`
    );
    unwrapBaseResponse(response.data);
  }
};

export function getSchemaApiErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
}
