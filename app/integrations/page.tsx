"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePlatformStore } from "@/store/platform-store";
import { integrationsApi } from "@/services/integrations-api";
import { IntegrationCard } from "@/components/IntegrationCard";

export default function IntegrationsPage() {
  const { integrations, setIntegrations } = usePlatformStore();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setApiError(null);

    try {
      setIntegrations(await integrationsApi.list());
    } catch (error) {
      setIntegrations([]);
      setApiError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Integrations</h1>
          <p className="section-subtitle">Select an integration to view its route files, integration config, graph and Git-backed source.</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {apiError && (
        <div className="atlas-panel p-5">
          <div className="mb-2 flex items-center gap-2 font-mono text-sm font-black uppercase text-orange-700 dark:text-orange-300">
            <AlertTriangle className="h-4 w-4" />
            Integrations unavailable
          </div>
          <p className="text-sm text-[hsl(var(--muted-ink))]">{apiError}</p>
        </div>
      )}

      {integrations.length === 0 ? (
        <div className="atlas-panel p-6 text-sm text-[hsl(var(--muted-ink))]">
          No integrations loaded from the configured Git repository.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.name} integration={integration} />
          ))}
        </div>
      )}
    </div>
  );
}
