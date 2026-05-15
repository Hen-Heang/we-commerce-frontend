"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

/**
 * Cart page.
 *
 * Zustand hydrates from localStorage after the first render. We track `mounted`
 * to avoid showing the "empty cart" state during SSR/before hydration.
 */
export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalQty = useCartStore((s) => s.totalQuantity());

  if (!mounted) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-12 text-center shadow-xl shadow-indigo-50 ring-1 ring-zinc-200 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
          <ShoppingBag className="size-10" strokeWidth={1.5} />
        </div>
        <h1 className="mb-2 text-2xl font-black tracking-tight text-zinc-950">Your cart is empty</h1>
        <p className="mb-8 text-base font-medium text-zinc-500 leading-relaxed">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/market"
          className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">My Cart</h1>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {totalQty} {totalQty === 1 ? "Product" : "Products"} selected
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="group flex gap-4 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-zinc-200/80 transition-all hover:shadow-lg hover:shadow-indigo-50/80 hover:ring-indigo-200/60"
            >
              <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/50 sm:size-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div className="flex flex-1 flex-col py-1">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/market/product/${item.productId}`}
                    className="line-clamp-2 text-base font-bold text-zinc-950 hover:text-indigo-600 transition-colors sm:text-lg"
                  >
                    {item.title}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove from cart"
                    className="rounded-xl p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
                
                <p className="mt-0.5 text-lg font-black text-indigo-600 sm:text-xl">
                  ${item.price.toFixed(2)}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="rounded-xl p-2 text-zinc-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="size-4" strokeWidth={3} />
                    </button>
                    <span className="min-w-[2.5rem] text-center text-sm font-black text-zinc-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="rounded-xl p-2 text-zinc-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90"
                    >
                      <Plus className="size-4" strokeWidth={3} />
                    </button>
                  </div>
                  
                  <p className="text-sm font-bold text-zinc-400 italic">
                    Total: <span className="text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-zinc-950 p-8 shadow-2xl shadow-indigo-200 text-white animate-in slide-in-from-right-4 duration-700">
            <h2 className="mb-6 text-xl font-black tracking-tight">Order Summary</h2>

            <div className="space-y-4">
              <SummaryRow label="Subtotal" value={`$${totalPrice.toFixed(2)}`} />
              <SummaryRow label="Shipping" value="Calculated at next step" muted />
              <SummaryRow label="Discount" value="—" muted />
            </div>

            <div className="my-8 h-px bg-white/10" />
            <SummaryRow label="Total" value={`$${totalPrice.toFixed(2)}`} bold />

            <Link
              href="/checkout"
              className="mt-8 block rounded-2xl bg-white px-6 py-4 text-center text-lg font-black text-zinc-950 shadow-xl transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              Secure Checkout
            </Link>

            <Link
              href="/market"
              className="mt-4 block text-center text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  muted = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-baseline ${bold ? "text-2xl font-black text-white" : "text-sm"} ${muted ? "text-zinc-500" : "text-zinc-300 font-bold"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
        ))}
      </div>
    </div>
  );
}
