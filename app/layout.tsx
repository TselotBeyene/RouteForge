import type { Metadata } from "next";
import "./globals.css";
import { TopNavbar } from "@/components/TopNavbar";
import { IntegrationSidebar } from "@/components/IntegrationSidebar";

export const metadata: Metadata = {
  title: "studio",
  description: " Itas-studio integrations and route schemas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="min-h-screen">
          <TopNavbar />
          <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
            <IntegrationSidebar />
            <main className="atlas-panel atlas-cut min-h-[calc(100vh-104px)] p-5 sm:p-7 lg:p-9">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
