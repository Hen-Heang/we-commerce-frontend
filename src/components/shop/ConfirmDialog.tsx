"use client";

import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

/**
 * Reusable confirmation modal.
 * Used by: Log out, Delete account, Delete collection, Delete address.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onClose,
  isLoading = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, isLoading]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-md transition-all animate-in fade-in duration-300"
      onClick={isLoading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-100/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-4">
            {danger && (
              <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm shadow-rose-100">
                <AlertTriangle className="size-6" />
              </span>
            )}
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 leading-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {description && (
          <p className="mb-8 text-sm font-medium text-zinc-500 leading-relaxed">{description}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 ${
              danger
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
