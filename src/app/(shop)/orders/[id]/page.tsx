"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Receipt, Star, ExternalLink } from "lucide-react";

import { fetchOrderById } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { OrderTimeline } from "@/components/shop/OrderTimeline";

/**
 * Order detail page.
 */
export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const orderId = Number(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !Number.isNaN(orderId),
  });

  // Stub mutation for "Leave a review"
  const review = useMutation({
    mutationFn: async () => {
      toast.message("Reviews feature coming soon", {
        description: "Backend support for reviews is on the roadmap.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-zinc-100" />
        <div className="h-40 rounded-[2.5rem] bg-zinc-50" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-96 rounded-[2.5rem] bg-zinc-50" />
          <div className="h-96 rounded-[2.5rem] bg-zinc-50" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12 text-center">
        <div className="inline-flex size-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-600 mb-4">
          <Receipt className="size-10" />
        </div>
        <h1 className="text-2xl font-black text-zinc-950">Order not found</h1>
        <p className="text-zinc-500 font-medium">We couldn't retrieve the details for this order. It might have been archived or doesn't exist.</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <ArrowLeft className="size-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/orders"
        className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-indigo-50 transition-colors">
          <ArrowLeft className="size-4" />
        </div>
        Back to history
      </Link>

      {/* Header Card */}
      <header className="flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] bg-zinc-950 p-8 shadow-2xl shadow-indigo-200 text-white">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Order Reference
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {data.reference}
          </h1>
          <p className="text-sm font-bold text-zinc-400 italic">
            Placed on {new Date(data.orderDate).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>
        <div className="scale-110">
          <OrderStatusBadge status={data.status} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT column: Logistics */}
        <div className="space-y-8">
          {/* Timeline Section */}
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
            <h2 className="mb-10 text-xl font-black tracking-tight text-zinc-950 flex items-center gap-3">
              Order Progress
              {data.status !== "DELIVERED" && data.status !== "CANCELLED" && (
                <span className="inline-flex size-2 rounded-full bg-indigo-500 animate-ping" />
              )}
            </h2>
            <div className="pl-2">
              <OrderTimeline
                status={data.status}
                orderDate={data.orderDate}
                estimatedDelivery={data.estimatedDelivery}
              />
            </div>
            
            {data.estimatedDelivery && data.status !== "DELIVERED" && data.status !== "CANCELLED" && (
              <div className="mt-10 flex items-center gap-4 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
                <div className="grid size-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <ExternalLink className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Estimated Delivery</p>
                  <p className="text-sm font-bold text-indigo-900">
                    {new Date(data.estimatedDelivery).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Logistics Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Shipping address */}
            {data.shippingAddress && (
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                  <MapPin className="size-4 text-indigo-600" />
                  Shipping
                </h2>
                <div className="space-y-1">
                  <p className="text-base font-black text-zinc-950">
                    {data.shippingAddress.label}
                  </p>
                  <p className="text-sm font-bold text-zinc-500 leading-relaxed">
                    {data.shippingAddress.address}
                  </p>
                  {data.shippingAddress.detail && (
                    <p className="text-xs font-bold text-zinc-400 italic mt-1">
                      {data.shippingAddress.detail}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Payment info */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                <Receipt className="size-4 text-indigo-600" />
                Payment
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Method</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5">
                    {paymentLabel(data.paidBy)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Seller</p>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5">
                    {data.seller ?? "We Commerce"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT column: Item & Summary */}
        <div className="space-y-8">
          {/* Item Card */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50">
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-zinc-400">
              Purchased Item
            </h2>
            <div className="flex gap-4">
              <Link
                href={`/market/product/${data.product.id}`}
                className="size-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/50 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.product.image}
                  alt={data.product.title}
                  className="size-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-center min-w-0">
                <Link
                  href={`/market/product/${data.product.id}`}
                  className="line-clamp-2 text-base font-black tracking-tight text-zinc-950 hover:text-indigo-600 transition-colors"
                >
                  {data.product.title}
                </Link>
                <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-tighter">
                  Qty {data.quantity} <span className="mx-1 opacity-30">×</span> ${data.product.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* Summary Card */}
          <section className="rounded-3xl bg-white p-8 shadow-xl shadow-indigo-50 ring-1 ring-zinc-200/50">
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-zinc-400 text-center">
              Bill Summary
            </h2>
            <dl className="space-y-4">
              <Row
                label="Product Price"
                value={`$${data.totalAmount.toFixed(2)}`}
              />
              <Row label="Express Delivery" value="Free" muted />
              <Row label="Platform Fee" value="—" muted />
            </dl>
            <div className="my-6 h-px bg-zinc-100" />
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-black tracking-tight text-zinc-950">Total Paid</span>
              <span className="text-2xl font-black text-indigo-600">${data.totalAmount.toFixed(2)}</span>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="grid gap-3">
            {data.status === "DELIVERED" && (
              <button
                onClick={() => review.mutate()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Star className="size-4.5" />
                Write Product Review
              </button>
            )}
            <Link
              href={`/market/product/${data.product.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-zinc-100 bg-white px-6 py-4 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-50 hover:border-zinc-200 active:scale-[0.98]"
            >
              Reorder This Item
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`text-sm font-bold ${muted ? "text-zinc-300 italic" : "text-zinc-500"}`}>{label}</span>
      <span className={`text-sm font-black ${muted ? "text-emerald-500 uppercase tracking-widest text-[10px]" : "text-zinc-950"}`}>{value}</span>
    </div>
  );
}

function paymentLabel(paidBy: string): string {
  switch (paidBy.toLowerCase()) {
    case "cash":
      return "Cash on Delivery";
    case "online":
      return "Secure Online Payment";
    case "aba":
      return "ABA Pay";
    case "card":
      return "Credit Card";
    default:
      return paidBy;
  }
}
