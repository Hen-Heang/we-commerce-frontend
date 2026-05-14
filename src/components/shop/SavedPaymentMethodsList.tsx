"use client";

import { useEffect, useState } from "react";
import { CreditCard, QrCode, Smartphone, Banknote, Trash2, Star, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { usePaymentMethodsStore, methodSummary, methodIconTone } from "@/store/paymentMethodsStore";
import { AddPaymentMethodModal } from "@/components/shop/AddPaymentMethodModal";
import type { SavedPaymentMethod } from "@/types/api";

const ICONS: Record<SavedPaymentMethod["type"], React.ComponentType<{ className?: string }>> = {
  card: CreditCard,
  aba: QrCode,
  khqr: Smartphone,
};

/**
 * Reusable list of saved payment methods.
 *
 * Two modes:
 *   - "manage" (in Profile): no selection, each row has delete + "set default"
 *   - "select" (in Checkout): radio-style selection, plus an always-present
 *      "Cash on delivery" pseudo-option (not stored, always available)
 *
 * Both modes have an "Add new" button.
 */
export function SavedPaymentMethodsList({
  mode,
  selectedId,
  onSelect,
}: {
  mode: "manage" | "select";
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const methods = usePaymentMethodsStore((s) => s.methods);
  const defaultId = usePaymentMethodsStore((s) => s.defaultId);
  const remove = usePaymentMethodsStore((s) => s.remove);
  const setDefault = usePaymentMethodsStore((s) => s.setDefault);

  const [adding, setAdding] = useState(false);

  // SSR-safe rendering — wait until persist hydrates
  if (!mounted) {
    return (
      <div className="space-y-2">
        <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {/* Cash on delivery — pseudo-method, only shown in select mode */}
        {mode === "select" && (
          <CodOption
            checked={selectedId === "cod"}
            onSelect={() => onSelect?.("cod")}
          />
        )}

        {/* Saved methods */}
        {methods.map((m) => {
          const Icon = ICONS[m.type];
          const tone = methodIconTone(m.type);
          const isSelected = mode === "select" && selectedId === m.id;
          const isDefault = defaultId === m.id;

          return (
            <li key={m.id}>
              <div
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100"
                    : "border-zinc-200 bg-white hover:border-indigo-300"
                }`}
              >
                {/* Make whole row clickable in select mode */}
                <label className={mode === "select" ? "flex flex-1 cursor-pointer items-center gap-3" : "flex flex-1 items-center gap-3"}>
                  {mode === "select" && (
                    <input
                      type="radio"
                      name="payment-method"
                      checked={isSelected}
                      onChange={() => onSelect?.(m.id)}
                      className="sr-only"
                    />
                  )}

                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-lg`}
                  >
                    <Icon className="size-6" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-zinc-900">{m.label}</p>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                          <Star className="size-2.5 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="truncate font-mono text-xs text-zinc-500">
                      {methodSummary(m)}
                    </p>
                  </div>

                  {mode === "select" && (
                    <span
                      className={`size-5 shrink-0 rounded-full border-2 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 ring-2 ring-inset ring-white"
                          : "border-zinc-300"
                      }`}
                    />
                  )}
                </label>

                {/* Manage actions */}
                {mode === "manage" && (
                  <div className="flex items-center gap-1">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => {
                          setDefault(m.id);
                          toast.success(`"${m.label}" set as default`);
                        }}
                        aria-label="Set as default"
                        title="Set as default"
                        className="rounded-lg p-2 text-zinc-500 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Star className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirm(`Delete "${m.label}"?`)) return;
                        remove(m.id);
                        toast.success("Payment method removed");
                      }}
                      aria-label="Delete"
                      className="rounded-lg p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty state */}
      {methods.length === 0 && mode === "manage" && (
        <p className="rounded-xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-600">
          No payment methods saved yet. Add one to speed up checkout.
        </p>
      )}

      {/* Add new button */}
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
      >
        <Plus className="size-4" />
        Add payment method
      </button>

      <AddPaymentMethodModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}

/* ---------------- Cash on Delivery option ---------------- */
function CodOption({
  checked,
  onSelect,
}: {
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition ${
          checked
            ? "border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100"
            : "border-zinc-200 bg-white hover:border-indigo-300"
        }`}
      >
        <input
          type="radio"
          name="payment-method"
          checked={checked}
          onChange={onSelect}
          className="sr-only"
        />
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg">
          <Banknote className="size-6" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-zinc-900">Cash on delivery</p>
          <p className="text-xs text-zinc-500">Pay in cash when your order arrives</p>
        </div>
        <span
          className={`size-5 shrink-0 rounded-full border-2 ${
            checked
              ? "border-indigo-600 bg-indigo-600 ring-2 ring-inset ring-white"
              : "border-zinc-300"
          }`}
        >
          {checked && (
            <Check className="size-3 text-white" style={{ margin: "1.5px" }} />
          )}
        </span>
      </label>
    </li>
  );
}
