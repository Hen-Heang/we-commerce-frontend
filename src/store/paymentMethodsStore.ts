"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedPaymentMethod } from "@/types/api";

/**
 * Saved payment methods for the current user, persisted to localStorage.
 *
 * In production this should live on the backend (per-user, encrypted) — but
 * for the portfolio demo it lives in the browser, matching the cart pattern.
 */
interface PaymentMethodsState {
  methods: SavedPaymentMethod[];
  defaultId: string | null;
  add: (m: SavedPaymentMethod) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  clear: () => void;
}

const SAMPLE: SavedPaymentMethod[] = [
  {
    id: "sample-aba",
    type: "aba",
    label: "Main ABA Pay",
    phoneNumber: "+855 12 345 678",
  },
];

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set, get) => ({
      methods: SAMPLE,
      defaultId: SAMPLE[0]?.id ?? null,

      add: (m) =>
        set((state) => {
          // If first method, also set as default
          const next = [...state.methods, m];
          return {
            methods: next,
            defaultId: state.defaultId ?? m.id,
          };
        }),

      remove: (id) =>
        set((state) => {
          const next = state.methods.filter((m) => m.id !== id);
          const wasDefault = state.defaultId === id;
          return {
            methods: next,
            defaultId: wasDefault ? next[0]?.id ?? null : state.defaultId,
          };
        }),

      setDefault: (id) => {
        const exists = get().methods.some((m) => m.id === id);
        if (exists) set({ defaultId: id });
      },

      clear: () => set({ methods: [], defaultId: null }),
    }),
    { name: "ec-pm" }
  )
);

/* ---------------- Helpers used by UI ---------------- */

export function methodSummary(m: SavedPaymentMethod): string {
  switch (m.type) {
    case "card":
      return `${m.brand} •••• ${m.last4}`;
    case "aba":
      return `ABA Pay · ${m.phoneNumber}`;
    case "khqr":
      return `KHQR · ${m.bankName}`;
  }
}

export function methodIconTone(t: SavedPaymentMethod["type"]): string {
  switch (t) {
    case "card":
      return "from-indigo-500 to-indigo-700";
    case "aba":
      return "from-rose-500 to-rose-700";
    case "khqr":
      return "from-emerald-500 to-emerald-700";
  }
}
