"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export function SwaggerPanel() {
  const [url, setUrl] = useState("/v3/api-docs");
  const [activeUrl, setActiveUrl] = useState(url);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">OpenAPI Decoder</h1>
        <p className="section-subtitle">Load, inspect and test integration contracts without leaving the command surface.</p>
      </div>
      <div className="atlas-panel p-4">
        <div className="mb-4 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-clean w-full" />
          <button onClick={() => setActiveUrl(url)} className="btn-primary"><RefreshCw className="h-4 w-4" />Load</button>
        </div>
        <div className="border border-[hsl(var(--line))] bg-white p-4 text-slate-900 shadow-[5px_5px_0_rgba(30,28,23,0.12)]">
          <SwaggerUI url={activeUrl} />
        </div>
      </div>
    </div>
  );
}
