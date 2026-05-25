import { apiClient } from "@/lib/api-client";
import { IntegrationDetail, IntegrationSummary, RouteGraph } from "@/types/platform";

export interface BaseResponse<T> {
  status: boolean;
  statusDesc: string;
  data: T;
  count?: number;
  errorCode?: string | null;
}

const DEFAULT_BRANCH = "starter";

function normalizeBranch(branch?: string | null): string {
  return branch?.trim() || DEFAULT_BRANCH;
}

function unwrapBaseResponse<T>(response: BaseResponse<T>): T {
  if (!response.status) {
    throw new Error(response.statusDesc || response.errorCode || "Backend request failed.");
  }
  return response.data;
}

export const integrationsApi = {
  async branches(): Promise<string[]> {
    const { data } = await apiClient.get<BaseResponse<string[]>>("/api/repository/branches");
    return unwrapBaseResponse(data) ?? [];
  },

  async list(branch?: string): Promise<IntegrationSummary[]> {
    const { data } = await apiClient.get("/api/integrations", {
      params: { branch: normalizeBranch(branch) }
    });
    return data;
  },

  async get(name: string, branch?: string): Promise<IntegrationDetail> {
    const { data } = await apiClient.get(`/api/integrations/${encodeURIComponent(name)}`, {
      params: { branch: normalizeBranch(branch) }
    });
    return data;
  },

  async writeFile(payload: { path: string; content: string; branch: string; commitMessage: string }) {
    const { data } = await apiClient.put("/api/repository/files/write", {
      path: payload.path,
      content: payload.content,
      branch: normalizeBranch(payload.branch),
      commitMessage: payload.commitMessage?.trim() || `Update ${payload.path}`
    });
    return data;
  },

  async visualizeByName(name: string, branch?: string): Promise<RouteGraph> {
    const { data } = await apiClient.get(`/api/routes/visualize/${encodeURIComponent(name)}`, {
      params: { branch: normalizeBranch(branch) }
    });
    return data;
  },

  async visualizeSource(payload: { sourceContent: string; sourceLanguage: "yaml" | "java" }): Promise<RouteGraph> {
    const { data } = await apiClient.post("/api/routes/visualize", payload);
    return data;
  }
};
