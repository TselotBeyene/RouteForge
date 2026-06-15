"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNav } from "@/lib/app-nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClassName(active: boolean, layout: "horizontal" | "vertical") {
  const base =
    layout === "vertical"
      ? "block border px-3 py-3 font-mono text-[11px] font-black uppercase tracking-[0.15em] transition"
      : "border px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.15em] transition";

  if (active) {
    return `${base} border-[hsl(var(--ink))] bg-[hsl(var(--panel))] text-[hsl(var(--ink))] shadow-[3px_3px_0_rgba(245,158,11,0.45)]`;
  }

  return `${base} border-transparent text-[hsl(var(--muted-ink))] hover:border-[hsl(var(--line))] hover:bg-[hsl(var(--panel))] hover:text-[hsl(var(--ink))] hover:shadow-[3px_3px_0_rgba(30,28,23,0.10)]`;
}

export type AppNavLinksProps = {
  layout?: "horizontal" | "vertical";
  onNavigate?: () => void;
};

export function AppNavLinks({
  layout = "horizontal",
  onNavigate,
}: AppNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        layout === "vertical"
          ? "flex flex-col gap-2"
          : "flex items-center gap-2"
      }
    >
      {appNav.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={linkClassName(isActive(pathname, href), layout)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
