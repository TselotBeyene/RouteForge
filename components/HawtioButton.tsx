"use client";

import { ExternalLink } from "lucide-react";

export function HawtioButton() {
  const url = process.env.NEXT_PUBLIC_HAWTIO_URL ?? "https://camel.hawt.io/online/login?redirectUri=http%3A%2F%2Fcamel.hawt.io%2Fonline%2F";
  return (
    <button
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className="btn-primary btn-toolbar"
      aria-label="Open Hawtio"
    >
      <span className="hidden sm:inline">Hawtio</span>
      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
}
export function GrafanaButton() {
  const url =
    process.env.NEXT_PUBLIC_GRAFANA_URL ?? "https://grafana.com";
  
  return (
    <button
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className="btn-primary btn-toolbar"
      aria-label="Open Grafana"
    >
      <span className="hidden sm:inline">Grafana</span>
      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  );
}
