"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { demoOpenApiSpec } from "@/lib/demo-openapi";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export function SwaggerPanel() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Swagger</h1>
        <p className="section-subtitle">
          {demoMode
            ? "Demo OpenAPI docs for the RouteForge integration API."
            : "OpenAPI docs are loaded through the authenticated Next.js BFF proxy."}
        </p>
      </div>

      <div className="atlas-panel overflow-hidden p-4">
        {demoMode ? (
          <SwaggerUI spec={demoOpenApiSpec} />
        ) : (
          <SwaggerUI url="/api/bff/v3/api-docs" />
        )}
      </div>
    </div>
  );
}
