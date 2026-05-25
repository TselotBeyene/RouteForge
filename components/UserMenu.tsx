"use client";

import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);

  if (status !== "authenticated") {
    return null;
  }

  const displayName =
    session.user?.name || session.user?.email || "Signed in";

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-2.5 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.1em] text-[hsl(var(--muted-ink))] lg:flex lg:items-center lg:gap-2 lg:px-3 lg:py-2 lg:text-[11px] lg:tracking-[0.12em]">
          <User className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
          {displayName}
        </div>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="btn-secondary btn-toolbar"
          aria-label="Logout"
        >
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <LogoutConfirmModal
        open={logoutOpen}
        displayName={displayName}
        onClose={() => setLogoutOpen(false)}
      />
    </>
  );
}
