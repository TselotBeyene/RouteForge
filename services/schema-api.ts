import { apiClient } from "@/lib/api-client";
import { RouteSchemaEntry } from "@/types/schema";

export const schemaApi = {
  async listRoutes(): Promise<RouteSchemaEntry[]> {
    const { data } = await apiClient.get("/api/integration-schemas/routes");
    return data;
  }
};
