"use client";

import { ExternalLink } from "lucide-react";

export default function KaravanPage() {
  const url = process.env.NEXT_PUBLIC_KARAVAN_URL || "http://localhost:8081";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Karavan</h1>
          <p className="section-subtitle">
            Open Apache Camel Karavan from the Atlas workspace. Configure the target with NEXT_PUBLIC_KARAVAN_URL.
          </p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="btn-secondary">
          <ExternalLink className="h-4 w-4" /> Open Karavan
        </a>
      </div>

      <div className="atlas-panel overflow-hidden p-4">
        <iframe
          title="Apache Camel Karavan"
          src={url}
          className="h-[760px] w-full border border-[hsl(var(--line))] bg-white"
        />
      </div>
    </div>
  );
}
