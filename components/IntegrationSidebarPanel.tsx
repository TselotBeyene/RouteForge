"use client";

import Link from "next/link";
import { AlertTriangle, CircleDot, Layers3, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePlatformStore } from "@/store/platform-store";
import { integrationsApi } from "@/services/integrations-api";
import { BranchPicker } from "@/components/BranchPicker";

export type IntegrationSidebarPanelProps = {
  onNavigate?: () => void;
};

export function IntegrationSidebarPanel({ onNavigate }: IntegrationSidebarPanelProps) {
  const {
    integrations,
    setIntegrations,
    branches,
    setBranches,
    selectedBranch,
    setSelectedBranch,
  } = usePlatformStore();

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

  return (
    <div className="space-y-5">
      <div className="atlas-panel atlas-cut p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="micro-label flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-amber-600" /> Integrations
          </h2>

          <button
            onClick={() => load(selectedBranch)}
            className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-1.5 shadow-[2px_2px_0_rgba(30,28,23,0.10)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(30,28,23,0.14)]"
            type="button"
            aria-label="Refresh integrations"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="mb-4">
          <BranchPicker
            label="Branch"
            value={selectedBranch}
            branches={branches}
            onChange={setSelectedBranch}
            compact
          />
        </div>

        {apiError && (
          <div className="mb-3 border border-orange-400/60 bg-orange-300/10 p-3 text-xs text-orange-700 dark:text-orange-300">
            <div className="mb-1 flex items-center gap-1 font-mono font-black uppercase">
              <AlertTriangle className="h-3 w-3" /> Integrations unavailable
            </div>
            {apiError}
          </div>
        )}

        <div className="space-y-3">
          {integrations.length === 0 && !apiError && (
            <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-3 text-sm text-[hsl(var(--muted-ink))]">
              No integrations returned from branch {selectedBranch}.
            </div>
          )}

          {integrations.map((item) => (
            <Link
              key={item.name}
              href={`/integrations/${encodeURIComponent(item.name)}`}
              onClick={onNavigate}
              className="group block border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-3 shadow-[3px_3px_0_rgba(30,28,23,0.07)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--ink))] hover:shadow-[5px_5px_0_rgba(245,158,11,0.45)]"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] font-black text-[hsl(var(--muted-ink))]">
                  {item.namespace}
                </span>
                <span className="status-pill text-teal-700 dark:text-teal-300">
                  {item.phase}
                </span>
              </div>
              <div className="truncate text-sm font-black tracking-tight text-[hsl(var(--ink))]">
                {item.name}
              </div>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-[hsl(var(--muted-ink))]">
                <CircleDot className="h-3 w-3" /> {item.runtimeVersion ?? "camel-k"}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="atlas-panel p-5">
        <h2 className="micro-label mb-4">Platform Actions</h2>
        <div className="grid gap-2">
          <Link className="route-chip" href="/schemas" onClick={onNavigate}>
            Route Schemas
          </Link>
          <Link className="route-chip" href="/karavan" onClick={onNavigate}>
            Karavan
          </Link>
          <Link className="route-chip" href="/swagger" onClick={onNavigate}>
            Swagger Viewer
          </Link>
        </div>
      </div>
    </div>
  );
}
