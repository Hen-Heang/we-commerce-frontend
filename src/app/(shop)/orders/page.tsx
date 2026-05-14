"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";

import { fetchOrderHistory } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import type { Order, OrderStatus } from "@/types/api";

const FILTERS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Orders" },
  { value: "PLACED", label: "To Pay" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

/**
 * Orders list page — matches the "Your Orders" / "My Orders" pattern.
 */
export default function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrderHistory,
  });

  const filtered = !data
    ? []
    : filter === "ALL"
    ? data
    : data.filter((o) => o.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-zinc-950">Purchase History</h1>
        <p className="text-base font-medium text-zinc-400 uppercase tracking-widest text-[10px]">
          Track and manage your community marketplace orders
        </p>
      </header>

      {/* Status tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar">
        {FILTERS.map((f) => {
          const count =
            f.value === "ALL"
              ? data?.length ?? 0
              : data?.filter((o) => o.status === f.value).length ?? 0;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-2xl px-6 py-3 text-sm font-black transition-all duration-300 ${
                active
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105"
                  : "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:ring-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={`ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-lg px-1.5 text-[10px] font-black ${
                    active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[2.5rem] bg-zinc-50" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl bg-red-50 p-10 text-center border border-red-100 max-w-md mx-auto">
          <p className="text-lg font-bold text-red-600">Couldn't load your order history.</p>
          <button onClick={() => window.location.reload()} className="mt-4 font-bold text-red-700 underline">Refresh page</button>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState filter={filter} />
      )}

      {filtered.length > 0 && (
        <ul className="space-y-6">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function OrderRow({ order }: { order: Order }) {
  return (
    <li>
      <Link
        href={`/orders/${order.id}`}
        className="group block overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-zinc-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-50 hover:ring-indigo-200 hover:-translate-y-1"
      >
        {/* Top strip: reference + status */}
        <div className="flex items-center justify-between border-b border-zinc-50 bg-zinc-50/30 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
              Ref: <span className="text-zinc-950">{order.reference}</span>
              <span className="mx-3 opacity-20">|</span>
              {new Date(order.orderDate).toLocaleDateString(undefined, {
                dateStyle: 'medium'
              })}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Body */}
        <div className="flex gap-6 p-8">
          <div className="size-24 shrink-0 overflow-hidden rounded-[2rem] bg-zinc-100 ring-1 ring-zinc-200/50 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.product.image}
              alt={order.product.title}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          <div className="flex flex-1 flex-col justify-center min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="line-clamp-1 text-xl font-black tracking-tight text-zinc-950 group-hover:text-indigo-600 transition-colors">
                {order.product.title}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Quantity: <span className="text-zinc-900 ml-1">{order.quantity}</span>
              </p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Method: <span className="text-zinc-900 ml-1 italic">{paymentLabel(order.paidBy)}</span>
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <p className="text-2xl font-black text-indigo-600">
                ${order.totalAmount.toFixed(2)}
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-600 transition-colors">
                Details
                <div className="flex size-6 items-center justify-center rounded-lg bg-zinc-50 group-hover:bg-indigo-50 transition-colors">
                   →
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ filter }: { filter: OrderStatus | "ALL" }) {
  const message =
    filter === "ALL"
      ? "You haven't placed any orders yet. Start your shopping journey today!"
      : `We couldn't find any orders matching the selected status.`;
  return (
    <div className="rounded-[3rem] bg-zinc-50 p-16 text-center border-2 border-dashed border-zinc-200 max-w-2xl mx-auto animate-in fade-in zoom-in-95">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[2rem] bg-white text-zinc-300 shadow-sm">
        <Package className="size-10" strokeWidth={1.5} />
      </div>
      <p className="mb-8 text-base font-medium text-zinc-500 leading-relaxed max-w-sm mx-auto">{message}</p>
      <Link
        href="/market"
        className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
      >
        Discover Marketplace
      </Link>
    </div>
  );
}

function paymentLabel(paidBy: string): string {
  switch (paidBy.toLowerCase()) {
    case "cash":
      return "Cash on delivery";
    case "online":
      return "Online payment";
    case "aba":
      return "ABA Pay";
    case "card":
      return "Credit Card";
    default:
      return paidBy;
  }
}
