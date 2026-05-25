"use client";

import { AlertTriangle, GitBranch, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePlatformStore } from "@/store/platform-store";
import { integrationsApi } from "@/services/integrations-api";
import { IntegrationCard } from "@/components/IntegrationCard";

export default function IntegrationsPage() {
  const { integrations, setIntegrations, branches, setBranches, selectedBranch, setSelectedBranch } = usePlatformStore();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function loadBranches() {
    try {
      const data = await integrationsApi.branches();
      setBranches(data);
      if (data.length > 0 && !data.includes(selectedBranch)) {
        setSelectedBranch(data[0]);
      }
    } catch {
      setBranches([]);
    }
  }

  async function load(branch = selectedBranch) {
    setLoading(true);
    setApiError(null);

    try {
      setIntegrations(await integrationsApi.list(branch));
    } catch (error) {
      setIntegrations([]);
      setApiError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBranches();
  }, []);

  useEffect(() => {
    void load(selectedBranch);
  }, [selectedBranch]);

  function changeBranch(branch: string) {
    setSelectedBranch(branch || "starter");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="section-title">Integrations</h1>
          <p className="section-subtitle">Select a branch, then load integrations from that Git branch.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <label className="flex items-center gap-1.5 sm:gap-2">
            <GitBranch className="h-3.5 w-3.5 text-[hsl(var(--muted-ink))] sm:h-4 sm:w-4" />
            <select
              value={selectedBranch}
              onChange={(event) => changeBranch(event.target.value)}
              className="input-clean min-w-[180px]"
            >
              {branches.length === 0 && <option value={selectedBranch}>{selectedBranch}</option>}
              {branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          </label>
          <button onClick={() => load(selectedBranch)} className="btn-secondary">
            <RefreshCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
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
          No integrations loaded from branch <span className="font-mono font-bold">{selectedBranch}</span>.
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
