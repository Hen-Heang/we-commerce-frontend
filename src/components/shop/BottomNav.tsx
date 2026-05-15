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
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pt-2 md:hidden pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 12px), 16px)" }}
    >
      <nav
        aria-label="Primary"
        className="
          pointer-events-auto
          mx-auto max-w-lg
          glass squircle-xl
          relative overflow-hidden
          shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]
        "
      >
        {/* Luminous accent — subtle top light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />

        <ul className="relative flex items-stretch justify-around px-2 py-2">
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
                  className={`tap-bounce flex flex-col items-center gap-1 rounded-2xl py-1 text-[10px] font-bold tracking-tight transition-all duration-300 ${
                    active ? "text-primary" : "text-zinc-500"
                  }`}
                >
                  <span
                    className={`relative flex h-10 w-14 items-center justify-center rounded-2xl transition-all duration-300 ease-out ${
                      active
                        ? "bg-primary/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] scale-105"
                        : ""
                    }`}
                  >
                    <Icon
                      className={`size-[1.25rem] transition-all duration-300 ${
                        active ? "scale-110" : ""
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {label === "Cart" && mounted && (badge ?? 0) > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black leading-none text-white shadow-lg ring-2 ring-white">
                        {(badge ?? 0) > 99 ? "99+" : badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={`transition-all duration-400 ${
                      active ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
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
