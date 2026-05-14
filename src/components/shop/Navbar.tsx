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
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/market" className="shrink-0 transition-transform hover:scale-105 active:scale-95">
          <Logo className="text-xl" />
        </Link>

        {/* Search — grows on desktop, hidden on mobile */}
        <form
          onSubmit={onSearchSubmit}
          className="ml-6 hidden flex-1 max-w-xl md:flex"
        >
          <div className="relative w-full group">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, sellers..."
              className="w-full rounded-2xl border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:ring-4"
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
      <form onSubmit={onSearchSubmit} className="border-t border-zinc-100 px-4 py-3 md:hidden">
        <div className="relative group">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none focus:border-indigo-600 transition-all"
          />
        </div>
      </form>
    </header>
  );
}
