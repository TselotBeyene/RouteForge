import { apiClient } from "@/lib/api-client";
import { IntegrationDetail, IntegrationSummary, RouteGraph } from "@/types/platform";

export const integrationsApi = {
  async list(): Promise<IntegrationSummary[]> {
    const { data } = await apiClient.get("/api/integrations");
    return data;
  },

  async get(name: string): Promise<IntegrationDetail> {
    const { data } = await apiClient.get(`/api/integrations/${encodeURIComponent(name)}`);
    return data;
  },

  async save(name: string, payload: Partial<IntegrationDetail>) {
    const { data } = await apiClient.put(`/api/integrations/${encodeURIComponent(name)}`, payload);
    return data;
  },

  async writeFile(payload: { path: string; content: string; commitMessage: string }) {
    const { data } = await apiClient.put("/api/repository/files/write", payload);
    return data;
  },

  async visualizeByName(name: string): Promise<RouteGraph> {
    const { data } = await apiClient.get(`/api/routes/visualize/${encodeURIComponent(name)}`);
    return data;
  },

  async visualizeSource(payload: { sourceContent: string; sourceLanguage: "yaml" | "java" }): Promise<RouteGraph> {
    const { data } = await apiClient.post("/api/routes/visualize", payload);
    return data;
  }
};
