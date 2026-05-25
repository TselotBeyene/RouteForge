"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type MobileNavDrawerProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function MobileNavDrawer({
  open,
  title = "Menu",
  onClose,
  children,
}: MobileNavDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] xl:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute left-0 top-0 flex h-full w-full max-w-sm flex-col border-r border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[8px_0_0_rgba(15,23,42,0.95)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-3 sm:gap-3 sm:p-4">
          <h2 className="font-mono text-xs font-black uppercase tracking-[0.1em] text-[hsl(var(--ink))] sm:text-sm sm:tracking-[0.12em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary btn-icon shrink-0"
            aria-label="Close menu"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
      </aside>
    </div>,
    document.body
  );
}
