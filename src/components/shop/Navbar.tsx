"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Heart, User, Package } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { isAuthenticated } from "@/lib/auth";
import { CartNavLink } from "@/components/shop/CartNavLink";

/**
 * Top navigation bar for all authenticated shop pages.
 *
 * Responsive strategy:
 *   - Mobile (< md):  logo + search-row underneath. Icons live in BottomNav.
 *   - Desktop (md+):  logo + inline search + right-side icons (saved, cart, profile).
 *                     BottomNav is hidden — top nav is the only nav.
 */
export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/market?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur-xl shadow-sm shadow-zinc-100/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/market" className="shrink-0 transition-transform hover:scale-105 active:scale-95">
          <Logo className="text-xl" />
        </Link>

        {/* Search — grows on desktop, hidden on mobile */}
        <form
          onSubmit={onSearchSubmit}
          className="ml-4 hidden flex-1 max-w-xl md:flex"
        >
          <div className="relative w-full group">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, sellers..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </form>

        {/* Right side — desktop only. Mobile uses BottomNav. */}
        <nav className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            href="/saved"
            aria-label="Saved"
            className="rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/orders"
            aria-label="My orders"
            className="rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
          >
            <Package className="size-5" />
          </Link>
          <CartNavLink />

          <div className="mx-2 h-6 w-px bg-zinc-200" />

          {authed ? (
            <Link
              href="/profile"
              aria-label="Profile"
              className="rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
            >
              <User className="size-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              Log in
            </Link>
          )}
        </nav>

        {/* Mobile: just keep the cart visible at the top too, so badge is glanceable
            while scrolling. Profile/Saved live in BottomNav. */}
        <div className="ml-auto md:hidden">
          {authed ? (
            <CartNavLink />
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <form onSubmit={onSearchSubmit} className="border-t border-zinc-100 px-4 py-2.5 md:hidden">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </form>
    </header>
  );
}
