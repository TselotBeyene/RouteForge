"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmActionItem = {
  label: string;
  value: string | number | boolean | null | undefined;
  tone?: "default" | "warning" | "danger" | "success";
};

export type ConfirmActionModalProps = {
  open: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  items?: ConfirmActionItem[];
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "primary" | "danger";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function itemToneClass(tone: ConfirmActionItem["tone"] = "default") {
  if (tone === "warning") return "text-orange-700 dark:text-orange-300";
  if (tone === "danger") return "text-red-700 dark:text-red-300";
  if (tone === "success") return "text-teal-700 dark:text-teal-300";
  return "text-[hsl(var(--ink))]";
}

export function ConfirmActionModal({
  open,
  eyebrow = "Confirm action",
  title,
  description,
  items = [],
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "primary",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
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

  const confirmClass =
    confirmTone === "danger"
      ? "border border-red-700 bg-red-700 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[4px_4px_0_rgba(30,28,23,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      : "btn-primary disabled:cursor-not-allowed disabled:opacity-60";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6"
      onClick={onCancel}
    >
      <div
        className="my-auto w-full max-w-2xl border border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[8px_8px_0_rgba(15,23,42,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-5">
          <div className="min-w-0">
            <div className="micro-label flex items-center gap-2">
              {confirmTone === "danger" ? (
                <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              )}
              {eyebrow}
            </div>
            <h2
              id="confirm-action-title"
              className="mt-2 font-mono text-2xl font-black uppercase tracking-[-0.05em] text-[hsl(var(--ink))]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-ink))]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary shrink-0"
            disabled={loading}
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        {items.length > 0 && (
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.label}
                className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-3 shadow-[3px_3px_0_rgba(30,28,23,0.10)]"
              >
                <div className="micro-label">{item.label}</div>
                <div
                  className={`mt-2 break-words font-mono text-sm font-black ${itemToneClass(item.tone)}`}
                >
                  {item.value === null ||
                  item.value === undefined ||
                  item.value === ""
                    ? "-"
                    : String(item.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-5">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmClass}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
