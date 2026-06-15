"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IntegrationSidebar } from "@/components/IntegrationSidebar";
import { IntegrationSidebarPanel } from "@/components/IntegrationSidebarPanel";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { AppNavLinks } from "@/components/AppNavLinks";
import { TopNavbar } from "@/components/TopNavbar";
import { useMediaQuery } from "@/lib/use-media-query";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthScreen = pathname === "/login" || pathname === "/logout";
  const [menuOpen, setMenuOpen] = useState(false);
  const isLgUp = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (isAuthScreen) {
    return <>{children}</>;
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen">
      <TopNavbar onMenuOpen={() => setMenuOpen(true)} />

      <MobileNavDrawer open={menuOpen} onClose={closeMenu}>
        <div className="space-y-6">
          <section>
            <h3 className="micro-label mb-3">Navigation</h3>
            <AppNavLinks layout="vertical" onNavigate={closeMenu} />
          </section>

          {!isLgUp && (
            <section>
              <h3 className="micro-label mb-3">Integrations</h3>
              <IntegrationSidebarPanel onNavigate={closeMenu} />
            </section>
          )}
        </div>
      </MobileNavDrawer>

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <IntegrationSidebar />
        <main className="atlas-panel atlas-cut min-h-[calc(100vh-3.5rem)] p-4 sm:min-h-[calc(100vh-4rem)] sm:p-6 xl:min-h-[calc(100vh-5rem)] xl:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
