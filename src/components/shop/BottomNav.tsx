"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, ShoppingBag, User, Package, Store } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useShopStore } from "@/store/shopStore";

/**
 * Mobile bottom navigation — Telegram-iOS / iOS 26 hybrid.
 *
 * Design rationale (matching Telegram and Apple's first-party apps):
 *   - Floating glass pill (preserved from iOS 26 Liquid Glass spec)
 *   - Active tab is signalled ONLY by color and weight, not by a colored
 *     background pill. Stacking color + pill + shadow + scale fights the
 *     glass effect and looks "too much".
 *   - One emerald micro-dot indicates "shop active" — small and clean.
 *   - Cart count badge is a flat color chip with no thick ring.
 *
 * Hidden on md+ where the top Navbar handles all destinations.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = useCartStore((s) => s.totalQuantity());
  const isShopOpen = useShopStore((s) => s.isShopOpen);

  type NavItem = {
    href: string;
    label: string;
    icon: typeof Home;
    badge?: number;
    accent?: boolean;
  };

  /**
   * Tab set adapts to seller state:
   *   - Default: Home · Saved · Cart · Orders · Profile
   *   - Shop open: Home · Saved · Cart · Shop   · Profile
   * Wait for hydration so SSR + initial render match.
   */
  const items: NavItem[] = mounted && isShopOpen
    ? [
        { href: "/market", label: "Home", icon: Home },
        { href: "/saved", label: "Saved", icon: Heart },
        { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
        { href: "/sell", label: "Shop", icon: Store, accent: true },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [
        { href: "/market", label: "Home", icon: Home },
        { href: "/saved", label: "Saved", icon: Heart },
        { href: "/cart", label: "Cart", icon: ShoppingBag, badge: cartCount },
        { href: "/orders", label: "Orders", icon: Package },
        { href: "/profile", label: "Profile", icon: User },
      ];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pt-2 md:hidden pointer-events-none"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 12px), 20px)" }}
    >
      <nav
        aria-label="Primary"
        className="
          pointer-events-auto
          mx-auto max-w-lg
          glass-spatial squircle-xl
          relative
          shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]
        "
      >
        <ul className="relative flex items-stretch justify-around px-2 py-2">
          {items.map(({ href, label, icon: Icon, badge, accent }) => {
            const active =
              pathname === href ||
              (href === "/market" && pathname?.startsWith("/market")) ||
              (href === "/sell" && pathname?.startsWith("/sell"));

            // Single color decision — applied to icon + label.
            const color = active
              ? "text-primary"
              : accent
              ? "text-zinc-700"
              : "text-zinc-400";

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={`tap-bounce relative flex flex-col items-center gap-1.5 rounded-2xl px-1 py-1 transition-all duration-300 ${color}`}
                >
                  {active && (
                    <span className="absolute -top-1 size-1 rounded-full bg-primary shadow-[0_0_8px_rgba(0,122,255,0.6)]" />
                  )}
                  <span className="relative flex h-7 items-center justify-center">
                    <Icon
                      className={`size-[1.45rem] transition-transform duration-300 ${active ? "scale-110" : ""}`}
                      strokeWidth={active ? 2.6 : 2}
                    />
                    {/* Cart count badge — flat, no fat ring */}
                    {label === "Cart" && mounted && (badge ?? 0) > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                        {(badge ?? 0) > 99 ? "99+" : badge}
                      </span>
                    )}
                    {/* Shop-active dot — tiny, only when shop tab is NOT current */}
                    {accent && !active && (
                      <span
                        aria-hidden
                        className="absolute -right-1.5 -top-0.5 size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                      />
                    )}
                  </span>
                  <span
                    className={`text-[10px] tracking-tight transition-all duration-300 ${
                      active ? "font-bold" : "font-medium"
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
