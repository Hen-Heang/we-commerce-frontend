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
      className="tap-bounce relative flex size-10 items-center justify-center rounded-full bg-zinc-100/50 text-zinc-700 transition-colors hover:bg-zinc-200"
    >
      <ShoppingBag className="size-5" strokeWidth={2.5} />
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black leading-none text-white shadow-lg shadow-primary/20 ring-2 ring-white transition-transform animate-in zoom-in">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
