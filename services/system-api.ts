import { apiClient } from "@/lib/api-client";

export interface BackendHealth {
  status: string;
  components?: Record<string, unknown>;
}

export const systemApi = {
  async health(): Promise<BackendHealth> {
    const { data } = await apiClient.get("/actuator/health");
    return data;
  }
};
