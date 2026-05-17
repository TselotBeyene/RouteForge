import Link from "next/link";
import { Boxes } from "lucide-react";
import { GrafanaButton, HawtioButton } from "@/components/HawtioButton";

const nav = [
  ["Integrations", "/integrations"],
  ["Schemas", "/schemas"],
  ["Karavan", "/karavan"],
  ["Swagger", "/swagger"]
];

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(var(--line))] bg-[hsl(var(--paper))]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1680px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center border border-[hsl(var(--ink))] bg-[hsl(var(--amber))] shadow-[4px_4px_0_rgba(15,23,42,0.95)]">
            <Boxes className="h-5 w-5 text-slate-950" />
          </span>
          <div>
            <div className="font-mono text-sm font-black uppercase tracking-[-0.02em]">Studio</div>
            <div className="micro-label hidden sm:block">integration management</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 xl:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="border border-transparent px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-ink))] transition hover:border-[hsl(var(--line))] hover:bg-[hsl(var(--panel))] hover:text-[hsl(var(--ink))] hover:shadow-[3px_3px_0_rgba(30,28,23,0.10)]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
        <GrafanaButton />
        <HawtioButton />
        </div>
      </div>
    </header>
  );
}
