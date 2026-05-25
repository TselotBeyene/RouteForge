"use client";

import { IntegrationSidebarPanel } from "@/components/IntegrationSidebarPanel";

export function IntegrationSidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24">
        <IntegrationSidebarPanel />
      </div>
    </aside>
  );
}
