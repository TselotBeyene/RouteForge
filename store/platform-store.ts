import { create } from "zustand";
import { IntegrationDetail, IntegrationSummary, RouteGraph } from "@/types/platform";

interface PlatformState {
  integrations: IntegrationSummary[];
  selectedIntegration?: IntegrationDetail;
  routeGraph?: RouteGraph;
  branches: string[];
  selectedBranch: string;
  setIntegrations: (integrations: IntegrationSummary[]) => void;
  setSelectedIntegration: (integration?: IntegrationDetail) => void;
  setRouteGraph: (graph?: RouteGraph) => void;
  setBranches: (branches: string[]) => void;
  setSelectedBranch: (branch: string) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  integrations: [],
  branches: [],
  selectedBranch: "starter",
  setIntegrations: (integrations) => set({ integrations }),
  setSelectedIntegration: (selectedIntegration) => set({ selectedIntegration }),
  setRouteGraph: (routeGraph) => set({ routeGraph }),
  setBranches: (branches) => set({ branches }),
  setSelectedBranch: (selectedBranch) => set({ selectedBranch: selectedBranch || "starter" })
}));
