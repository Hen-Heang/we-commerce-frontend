"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, ShoppingBag, User, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

/**
 * Mobile-only bottom navigation bar.
 *
 * Hidden on md+ screens (`md:hidden`) because the top Navbar already has
 * everything visible there. On phones, this matches the Figma mobile pattern
 * and standard shopping app UX (Amazon, Lazada, Shopee all do this).
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
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100/80 bg-white/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)", paddingTop: "6px" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
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
                className={`flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-colors duration-200 ${
                  active ? "text-indigo-600" : "text-zinc-400"
                }`}
              >
                <span
                  className={`relative flex h-8 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                    active ? "bg-indigo-50 scale-105" : ""
                  }`}
                >
                  <Icon
                    className={`size-[1.125rem] transition-all duration-300 ${active ? "scale-110" : ""}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {label === "Cart" && mounted && (badge ?? 0) > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-0.5 text-[9px] font-black leading-none text-white ring-2 ring-white">
                      {(badge ?? 0) > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
