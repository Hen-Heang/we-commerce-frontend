"use client";

import { CheckCircle2, Clock, Package, Truck, X, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/types/api";
import { statusLabel, statusColor } from "@/lib/orders";

const ICONS: Record<OrderStatus, LucideIcon> = {
  PLACED: Clock,
  CONFIRMED: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: X,
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${statusColor(
        status
      )}`}
    >
      <Icon className="size-3.5" strokeWidth={3} />
      {statusLabel(status)}
    </span>
  );
}
