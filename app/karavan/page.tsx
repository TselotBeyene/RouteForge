"use client";

import { ExternalLink } from "lucide-react";

const DEMO_KARAVAN_URL = "https://karavan.space/";

export default function KaravanPage() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const url =
    process.env.NEXT_PUBLIC_KARAVAN_URL ||
    (demoMode ? DEMO_KARAVAN_URL : "http://localhost:8081");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Karavan</h1>
          <p className="section-subtitle">
            {demoMode
              ? "Apache Camel Karavan online designer (embedded from karavan.space in demo mode)."
              : "Open Apache Camel Karavan from the workspace. Configure the target with NEXT_PUBLIC_KARAVAN_URL."}
          </p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="btn-secondary">
          <ExternalLink className="h-4 w-4" /> Open Karavan
        </a>
      </div>

      {demoMode ? (
        <p className="text-sm text-[hsl(var(--muted-ink))]">
          If the designer does not load below, use <strong>Open Karavan</strong> — some browsers block embedded third-party apps.
        </p>
      ) : null}

      <div className="atlas-panel overflow-hidden p-4">
        <iframe
          title="Apache Camel Karavan"
          src={url}
          className="h-[760px] w-full border border-[hsl(var(--line))] bg-white"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
