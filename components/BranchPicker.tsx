"use client";

import { Check, ChevronDown, GitBranch } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type BranchPickerProps = {
  label?: string;
  value: string;
  branches: string[];
  onChange: (branch: string) => void;
  compact?: boolean;
  helperText?: string;
};

export function BranchPicker({
  label,
  value,
  branches,
  onChange,
  compact = false,
  helperText,
}: BranchPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const options = branches.length ? branches : value ? [value] : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full">
      {label && (
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[hsl(var(--muted-ink))]">
          <GitBranch className="h-3.5 w-3.5 text-orange-600" />
          {label}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 border border-[hsl(var(--line))] bg-[hsl(var(--paper))] font-mono text-[hsl(var(--ink))] outline-none shadow-[3px_3px_0_rgba(30,28,23,0.14)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(30,28,23,0.16)] focus:border-[hsl(var(--ink))] ${
          compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-base"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <GitBranch className="h-4 w-4 shrink-0 text-orange-600" />
          <span className="truncate font-black">{value || "Select branch"}</span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {helperText && !open && (
        <p className="mt-2 text-xs text-[hsl(var(--muted-ink))]">{helperText}</p>
      )}

      {open && (
        <div className="mt-2 w-full border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-2 shadow-[5px_5px_0_rgba(30,28,23,0.16)]">
          <div className="mb-2 border-b border-[hsl(var(--line))] px-2 pb-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[hsl(var(--muted-ink))]">
            Available branches
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {options.length === 0 ? (
              <div className="border border-dashed border-[hsl(var(--line))] px-3 py-2 font-mono text-xs text-[hsl(var(--muted-ink))]">
                No branches loaded
              </div>
            ) : (
              options.map((branch) => {
                const active = branch === value;

                return (
                  <button
                    key={branch}
                    type="button"
                    onClick={() => {
                      onChange(branch);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-left font-mono text-sm transition ${
                      active
                        ? "border-slate-950 bg-amber-300 text-slate-950 shadow-[3px_3px_0_rgba(30,28,23,0.18)]"
                        : "border-transparent bg-transparent text-[hsl(var(--ink))] hover:border-[hsl(var(--line))] hover:bg-[hsl(var(--paper))]"
                    }`}
                  >
                    <span className="truncate">{branch}</span>
                    {active && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
