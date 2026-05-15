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
      <header className="sticky top-0 z-40 glass border-b-0 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
          {/* LEFT — Brand */}
          <Link
            href="/market"
            className="tap-bounce shrink-0 transition-transform"
          >
            <Logo className="text-2xl font-black tracking-tight" />
          </Link>

          {/* CENTER — Primary nav menu (desktop only) */}
          <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
            {CENTER_LINKS.map(({ href, label, matchPrefix }) => {
              const active = isActive(href, matchPrefix);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`relative rounded-full px-5 py-2 text-[15px] font-bold transition-all ${
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — Action icons */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Search trigger (always visible) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="tap-bounce flex size-10 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-700 transition-colors hover:bg-zinc-200"
            >
              <Search className="size-5" strokeWidth={2.5} />
            </button>

            {/* Desktop-only icons */}
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/saved"
                aria-label="Saved"
                className="tap-bounce flex size-10 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                <Heart className="size-5" strokeWidth={2.5} />
              </Link>
              <Link
                href="/orders"
                aria-label="My orders"
                className="tap-bounce flex size-10 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-700 transition-colors hover:bg-zinc-200"
              >
                <Package className="size-5" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Cart — always visible */}
            <div className="tap-bounce">
              <CartNavLink />
            </div>

            {/* Profile dropdown — desktop only */}
            <div className="relative hidden md:flex md:items-center md:gap-1.5">
              <span className="mx-1 h-8 w-px bg-zinc-200" aria-hidden />
              {authed ? (
                <button
                  ref={profileAnchorRef}
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  aria-label="Open profile menu"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className={`tap-bounce flex size-10 items-center justify-center rounded-full transition-all ${
                    profileMenuOpen
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-zinc-100/50 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  <User className="size-5" strokeWidth={2.5} />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="tap-bounce rounded-full bg-primary px-6 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
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
                className="tap-bounce ml-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 md:hidden"
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
