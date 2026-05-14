"use client";

import { CheckCircle2, Circle, Clock, Package, Truck, X, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/types/api";
import { STATUS_ORDER, statusLabel, statusIndex } from "@/lib/orders";

// Only the 4 progressing statuses get an icon — CANCELLED renders its own branch.
type ProgressStatus = Exclude<OrderStatus, "CANCELLED">;

const STEP_ICONS: Record<ProgressStatus, LucideIcon> = {
  PLACED: Clock,
  CONFIRMED: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
};

/**
 * Vertical timeline showing the order's journey.
 * Coupang / Amazon / Naver Shopping all have something like this.
 *
 * Renders 4 steps (PLACED → DELIVERED) — fills in indigo up to current status.
 * If status is CANCELLED, shows a cancelled state instead.
 */
export function OrderTimeline({
  status,
  orderDate,
  estimatedDelivery,
}: {
  status: OrderStatus;
  orderDate: string;
  estimatedDelivery?: string;
}) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-start gap-4 rounded-3xl bg-rose-50 p-6 border border-rose-100 shadow-sm animate-in fade-in slide-in-from-top-2">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <X className="size-6" strokeWidth={3} />
        </span>
        <div className="pt-1">
          <p className="text-lg font-black tracking-tight text-rose-950">Order cancelled</p>
          <p className="text-sm font-bold text-rose-800/60 leading-relaxed mt-1">
            This order was cancelled and won't be processed further.
          </p>
        </div>
      </div>
    );
  }

  const current = statusIndex(status); // 0..3

  return (
    <ol className="relative space-y-10 border-l-2 border-zinc-100 ml-4 pl-10">
      {STATUS_ORDER.map((step, i) => {
        // STATUS_ORDER only contains the 4 progressing statuses by design.
        const Icon = STEP_ICONS[step as ProgressStatus];
        const completed = i <= current;
        const isCurrent = i === current;
        return (
          <li key={step} className="relative group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            {/* node */}
            <span
              className={`absolute -left-[3.45rem] grid size-10 place-items-center rounded-2xl ring-8 ring-white transition-all duration-500 ${
                completed
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110"
                  : "bg-white text-zinc-300 border-2 border-zinc-100"
              }`}
            >
              {completed ? <Icon className="size-5" strokeWidth={2.5} /> : <Circle className="size-3 fill-zinc-100" />}
            </span>

            {/* connector fill — colors the line up to the current step */}
            {i < STATUS_ORDER.length - 1 && (
              <span
                className={`absolute -left-[2.65rem] top-10 h-10 w-0.5 transition-colors duration-1000 ${
                  i < current ? "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]" : "bg-transparent"
                }`}
              />
            )}

            <div className="pt-0.5">
              <div className="flex items-center gap-3">
                <p
                  className={`text-base font-black tracking-tight transition-colors duration-300 ${
                    completed ? "text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  {statusLabel(step)}
                </p>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-zinc-400 mt-1.5 uppercase tracking-tighter">
                {i === 0 && new Date(orderDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                {i === STATUS_ORDER.length - 1 &&
                  estimatedDelivery &&
                  !completed &&
                  `Estimated Delivery: ${new Date(estimatedDelivery).toLocaleDateString(undefined, { dateStyle: 'long' })}`}
                {completed && i > 0 && i < current && "Completed"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
