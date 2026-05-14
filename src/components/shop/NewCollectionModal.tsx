"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { createCollection } from "@/lib/collections";

/**
 * Modal for creating a new collection.
 *
 * Uses React's <dialog> element semantics + Tailwind for styling.
 * Closes on Escape and on backdrop click.
 */
export function NewCollectionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const create = useMutation({
    mutationFn: (collectionName: string) => createCollection(collectionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setName("");
      onClose();
    },
    onError: (e: Error) => setErr(e.message ?? "Could not create collection"),
  });

  if (!open) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setErr("Name is required");
      return;
    }
    create.mutate(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-collection-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-100/50 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="new-collection-title" className="text-2xl font-black tracking-tight text-zinc-950">
            New collection
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="cname" className="mb-2 block text-sm font-bold text-zinc-900 ml-1">
              Collection name
            </label>
            <input
              id="cname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. Wishlist"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4"
            />
          </div>

          {err && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100 animate-in slide-in-from-top-2">
              {err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60"
            >
              {create.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
