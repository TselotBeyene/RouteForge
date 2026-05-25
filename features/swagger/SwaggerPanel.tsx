"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export function SwaggerPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Swagger</h1>
        <p className="section-subtitle">
          OpenAPI docs are loaded through the authenticated Next.js BFF proxy.
        </p>
      </div>

      <div className="atlas-panel overflow-hidden p-4">
        <SwaggerUI url="/api/bff/v3/api-docs" />
      </div>
    </div>
  );
}
