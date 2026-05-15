"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, ShoppingBag, User, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

/**
 * Mobile bottom navigation — iOS 26 "Liquid Glass" floating tab bar.
 *
 * Design notes (matching Apple's iOS 26 / iPadOS 26 spec):
 *   - Floating pill (not edge-to-edge) with safe-area-aware margin
 *   - Heavy backdrop-blur + saturate for the refractive glass feel
 *   - Inner top highlight (white 1px) suggesting a glass edge catching light
 *   - Subtle elevated shadow underneath (the bar appears to hover)
 *   - Active tab gets its own glass-pill that "lifts" with brighter accent
 *   - Selection transition is smooth (300ms) — no harsh state changes
 *
 * Hidden on md+ where the top Navbar handles all destinations.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = useCartStore((s) => s.totalQuantity());

  type NavItem = {
    href: string;
    label: string;
    icon: typeof Home;
    badge?: number;
  };
  const items: NavItem[] = [
    { href: "/market", label: "Home", icon: Home },
    { href: "/saved", label: "Saved", icon: Heart },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    /* Outer positioner — controls margin from screen edges + safe-area bottom inset.
       The actual bar is rendered as a floating pill INSIDE this container. */
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 md:hidden pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 12px)" }}
    >
      <nav
        aria-label="Primary"
        className="
          pointer-events-auto
          mx-auto max-w-md
          relative overflow-hidden
          rounded-[2rem]
          bg-white/55
          backdrop-blur-2xl backdrop-saturate-[1.8]
          ring-1 ring-white/40
          shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15),0_4px_12px_-2px_rgba(0,0,0,0.08)]
        "
      >
        {/* Top inner highlight — the "glass edge catching light" effect */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />
        {/* Subtle vertical tint — makes the glass feel "filled" not transparent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/10"
        />

        <ul className="relative flex items-stretch justify-around px-1.5 py-1.5">
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active =
              pathname === href ||
              (href === "/market" && pathname?.startsWith("/market"));

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-bold tracking-tight transition-all duration-300 ${
                    active ? "text-indigo-700" : "text-zinc-500"
                  }`}
                >
                  {/* Icon container — becomes its own glass-pill when active */}
                  <span
                    className={`relative flex h-9 w-12 items-center justify-center rounded-2xl transition-all duration-300 ease-out ${
                      active
                        ? "bg-white/70 backdrop-blur-xl backdrop-saturate-[1.5] ring-1 ring-white/60 shadow-[0_2px_8px_-2px_rgba(79,70,229,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] scale-110"
                        : ""
                    }`}
                  >
                    <Icon
                      className={`size-[1.125rem] transition-transform duration-300 ${
                        active ? "scale-110" : ""
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {/* Cart count badge */}
                    {label === "Cart" && mounted && (badge ?? 0) > 0 && (
                      <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-0.5 text-[9px] font-black leading-none text-white shadow-md ring-2 ring-white/90">
                        {(badge ?? 0) > 99 ? "99+" : badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={`transition-all duration-300 ${
                      active ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
