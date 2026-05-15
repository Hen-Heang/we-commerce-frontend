"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp } from "lucide-react";

/**
 * Full-width search overlay that slides down from the top nav.
 *
 * Triggered by clicking the search icon in Navbar.
 * Features:
 *   - Auto-focus the input on open
 *   - Recent searches (localStorage)
 *   - Trending suggestions (static for now)
 *   - Submit → /market?q=...
 *   - Esc / backdrop click closes
 */

const RECENT_KEY = "ec-recent-searches";
const TRENDING = ["Leather cap", "Basketball", "Moka pot", "Chair", "Lipstick"];

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined") return;
  const trimmed = q.trim();
  if (!trimmed) return;
  const current = getRecent().filter((r) => r.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...current].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset & load recents on open; auto-focus input
  useEffect(() => {
    if (open) {
      setQuery("");
      setRecent(getRecent());
      // Small delay so the input is mounted before focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    router.push(`/market?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="mt-0 w-full max-w-3xl bg-white shadow-2xl sm:mt-20 sm:rounded-3xl animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
          className="flex items-center gap-3 border-b border-zinc-100 px-6 py-5"
        >
          <Search className="size-5 shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="flex-1 bg-transparent text-base font-medium text-zinc-950 placeholder:text-zinc-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200"
          >
            Esc
          </button>
        </form>

        {/* Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {/* Recent */}
          {recent.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                <Clock className="size-3.5" />
                Recent
              </h3>
              <ul className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      type="button"
                      onClick={() => submit(r)}
                      className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Trending */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              <TrendingUp className="size-3.5" />
              Trending
            </h3>
            <ul className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => submit(t)}
                    className="rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:from-indigo-100 hover:to-purple-100"
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Empty hint */}
          {recent.length === 0 && (
            <p className="mt-6 text-center text-sm text-zinc-400">
              Try searching by product name, category, or seller.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
