import Link from "next/link";
import { ArrowUpRight, Clock, Server, Workflow } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { IntegrationSummary } from "@/types/platform";

function phaseClass(phase: string) {
  if (phase === "Running") return "text-teal-700 dark:text-teal-300";
  if (phase === "Error") return "text-orange-700 dark:text-orange-300";
  return "text-amber-800 dark:text-amber-300";
}

export function IntegrationCard({ integration }: { integration: IntegrationSummary }) {
  return (
    <Link href={`/integrations/${encodeURIComponent(integration.name)}`} className="topology-card atlas-cut group block p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center border border-slate-950 bg-amber-300 shadow-[3px_3px_0_rgba(30,28,23,0.22)]">
          <Workflow className="h-5 w-5 text-slate-950" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-[hsl(var(--muted-ink))] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[hsl(var(--ink))]" />
      </div>

      <div className="min-w-0">
        <div className="micro-label">{APP_NAME}</div>
        <h3 className="mt-2 truncate font-mono text-lg font-black uppercase tracking-[-0.06em] text-[hsl(var(--ink))]">{integration.name}</h3>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className={`status-pill ${phaseClass(integration.phase)}`}>{integration.phase}</span>
        <span className="status-pill text-[hsl(var(--muted-ink))]">{integration.namespace}</span>
      </div>

      <div className="mt-5 grid gap-3 border-t border-[hsl(var(--line))] pt-4 font-mono text-xs text-[hsl(var(--muted-ink))]">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          runtime::{integration.runtimeVersion ?? "unknown"}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          created::{integration.createdAt ? new Date(integration.createdAt).toLocaleDateString() : "recent"}
        </div>
      </div>
    </Link>
  );
}
