"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

/**
 * Cart icon for the top nav, with item-count badge.
 *
 * The badge only renders after hydration to avoid a SSR/client mismatch
 * (zustand-persist reads localStorage which doesn't exist on the server).
 */
export function CartNavLink() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = useCartStore((s) => s.totalQuantity());

  return (
    <Link
      href="/cart"
      aria-label={`Cart${mounted && count > 0 ? `, ${count} items` : ""}`}
      className="relative inline-flex rounded-xl p-2.5 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 transition-all active:scale-95"
    >
      <ShoppingBag className="size-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-black leading-none text-white shadow-sm ring-2 ring-white transition-transform animate-in zoom-in">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
