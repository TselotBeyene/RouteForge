import { create } from "zustand";
import { IntegrationDetail, IntegrationSummary, RouteGraph } from "@/types/platform";

interface PlatformState {
  integrations: IntegrationSummary[];
  selectedIntegration?: IntegrationDetail;
  routeGraph?: RouteGraph;
  setIntegrations: (integrations: IntegrationSummary[]) => void;
  setSelectedIntegration: (integration?: IntegrationDetail) => void;
  setRouteGraph: (graph?: RouteGraph) => void;
}

export const usePlatformStore = create<PlatformState>((set) => ({
  integrations: [],
  setIntegrations: (integrations) => set({ integrations }),
  setSelectedIntegration: (selectedIntegration) => set({ selectedIntegration }),
  setRouteGraph: (routeGraph) => set({ routeGraph })
}));
