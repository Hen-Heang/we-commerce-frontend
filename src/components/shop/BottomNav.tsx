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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-100 bg-white/80 backdrop-blur-lg md:hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]"
      // safe-area padding for iPhone home indicator area
      style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)", paddingTop: "8px" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href ||
            (href === "/market" && pathname?.startsWith("/market"));

          return (
            <li key={href} className="flex-1 px-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 ${
                  active ? "text-indigo-600 bg-indigo-50/50" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <span className="relative">
                  <Icon className={`size-5 transition-transform duration-300 ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
                  {label === "Cart" && mounted && (badge ?? 0) > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-black leading-none text-white shadow-sm ring-2 ring-white">
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
