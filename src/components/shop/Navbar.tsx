"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, Heart, User, Package } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { isAuthenticated } from "@/lib/auth";
import { CartNavLink } from "@/components/shop/CartNavLink";
import { SearchOverlay } from "@/components/shop/SearchOverlay";
import { ProfileMenu } from "@/components/shop/ProfileMenu";

/**
 * Top navigation bar.
 *
 * Modern e-commerce layout (Amazon / Coupang / Nike pattern):
 *
 *   Desktop (md+):
 *     ┌──────────────────────────────────────────────────────────────────┐
 *     │  [Logo]   Discover  Categories  Sell      🔍 ♥ 📦 🛒  │  👤▼     │
 *     └──────────────────────────────────────────────────────────────────┘
 *     Logo on the left, primary nav links centered, action icons on the right.
 *     Profile icon opens a dropdown menu (My Orders / Saved / My listings /
 *     Addresses / Settings / Log out).
 *
 *   Mobile (< md):
 *     ┌────────────────────────────┐
 *     │  [Logo]              🔍 🛒 │
 *     └────────────────────────────┘
 *     Minimal — primary navigation lives in BottomNav.
 */

type CenterLink = { href: string; label: string; matchPrefix?: string };

const CENTER_LINKS: CenterLink[] = [
  { href: "/market", label: "Discover" },
  { href: "/market?cat=Fashion", label: "Categories", matchPrefix: "/market" },
  { href: "/sell", label: "Sell" },
];

export function Navbar() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileAnchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  function isActive(href: string, matchPrefix?: string) {
    const hrefPath = href.split("?")[0];
    if (matchPrefix) {
      return pathname?.startsWith(matchPrefix) && pathname === hrefPath;
    }
    return pathname === hrefPath;
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur-xl shadow-sm shadow-zinc-100/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          {/* LEFT — Brand */}
          <Link
            href="/market"
            className="shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Logo className="text-xl" />
          </Link>

          {/* CENTER — Primary nav menu (desktop only) */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {CENTER_LINKS.map(({ href, label, matchPrefix }) => {
              const active = isActive(href, matchPrefix);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`relative rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "text-indigo-600"
                      : "text-zinc-700 hover:text-indigo-600"
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Action icons */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search trigger (always visible) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="rounded-xl p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-indigo-600"
            >
              <Search className="size-5" />
            </button>

            {/* Desktop-only icons */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/saved"
                aria-label="Saved"
                className="rounded-xl p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-indigo-600"
              >
                <Heart className="size-5" />
              </Link>
              <Link
                href="/orders"
                aria-label="My orders"
                className="rounded-xl p-2.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-indigo-600"
              >
                <Package className="size-5" />
              </Link>
            </div>

            {/* Cart — always visible */}
            <CartNavLink />

            {/* Profile dropdown — desktop only */}
            <div className="relative hidden md:flex md:items-center md:gap-1">
              <span className="mx-1 h-6 w-px bg-zinc-200" aria-hidden />
              {authed ? (
                <button
                  ref={profileAnchorRef}
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className={`rounded-xl p-2.5 transition-colors ${
                    profileMenuOpen
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600"
                  }`}
                >
                  <User className="size-5" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
                >
                  Log in
                </Link>
              )}
              <ProfileMenu
                open={profileMenuOpen}
                onClose={() => setProfileMenuOpen(false)}
                anchorRef={profileAnchorRef}
              />
            </div>

            {/* Mobile login button when unauthenticated */}
            {!authed && (
              <Link
                href="/login"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 md:hidden"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
