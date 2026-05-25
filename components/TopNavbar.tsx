"use client";

import Link from "next/link";
import { Boxes, Menu } from "lucide-react";
import { GrafanaButton, HawtioButton } from "@/components/HawtioButton";
import { StudioNavLinks } from "@/components/StudioNavLinks";
import { UserMenu } from "@/components/UserMenu";

export type TopNavbarProps = {
  onMenuOpen: () => void;
};

export function TopNavbar({ onMenuOpen }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(var(--line))] bg-[hsl(var(--paper))]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1680px] items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 xl:h-20 xl:px-8">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="btn-secondary btn-icon shrink-0 xl:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-[hsl(var(--ink))] bg-[hsl(var(--amber))] shadow-[3px_3px_0_rgba(15,23,42,0.95)] sm:h-10 sm:w-10 xl:h-12 xl:w-12 xl:shadow-[4px_4px_0_rgba(15,23,42,0.95)]">
              <Boxes className="h-4 w-4 text-slate-950 sm:h-[1.125rem] sm:w-[1.125rem] xl:h-5 xl:w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs font-black uppercase tracking-[-0.02em] sm:text-sm">
                Studio
              </div>
              <div className="micro-label hidden md:block">
                integration management
              </div>
            </div>
          </Link>
        </div>

        <div className="hidden xl:block">
          <StudioNavLinks />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 xl:gap-4">
          <GrafanaButton />
          <HawtioButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
