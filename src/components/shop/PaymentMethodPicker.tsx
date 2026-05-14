"use client";

import { Banknote, CreditCard, QrCode, Smartphone } from "lucide-react";
import type { PaymentMethodId } from "@/lib/payment";

const METHODS: {
  id: PaymentMethodId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  // Marketing tag (e.g. "Popular", "Instant")
  tag?: string;
}[] = [
  {
    id: "aba",
    label: "ABA Pay",
    hint: "Scan KHQR with the ABA Mobile app",
    icon: QrCode,
    accent: "from-rose-500 to-rose-700",
    tag: "Popular",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    hint: "Visa, Mastercard — secure checkout",
    icon: CreditCard,
    accent: "from-indigo-500 to-indigo-700",
  },
  {
    id: "khqr",
    label: "Other KHQR",
    hint: "Pay with any bank app that supports KHQR",
    icon: Smartphone,
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    id: "cod",
    label: "Cash on delivery",
    hint: "Pay in cash when your order arrives",
    icon: Banknote,
    accent: "from-amber-500 to-amber-700",
  },
];

/**
 * Coupang / Amazon style payment method picker.
 * Renders as full-width cards on mobile, 2-col grid on tablet+.
 */
export function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentMethodId;
  onChange: (next: PaymentMethodId) => void;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {METHODS.map((m) => {
        const selected = value === m.id;
        const Icon = m.icon;
        return (
          <li key={m.id} className="h-full">
            <label
              className={`relative block h-full cursor-pointer rounded-3xl border-2 p-5 transition-all duration-300 ${
                selected
                  ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100 ring-1 ring-indigo-600"
                  : "border-zinc-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-zinc-100 hover:scale-[1.02]"
              } active:scale-[0.98]`}
            >
              <input
                type="radio"
                name="payment"
                value={m.id}
                checked={selected}
                onChange={() => onChange(m.id)}
                className="sr-only"
              />
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${m.accent} text-white shadow-lg transition-transform duration-300 ${selected ? "scale-110" : ""}`}
                >
                  <Icon className="size-7" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-black tracking-tight text-zinc-950 leading-none">{m.label}</p>
                    {m.tag && (
                      <span className="rounded-lg bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-zinc-400 leading-relaxed">{m.hint}</p>
                </div>
                <div
                  className={`mt-1 size-6 shrink-0 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 shadow-sm"
                      : "border-zinc-200"
                  }`}
                >
                  {selected && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
                </div>
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
