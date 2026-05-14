"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/api";
import { resolvePhotoUrl } from "@/lib/image";

/**
 * Zustand store for the shopping cart.
 *
 * Why Zustand (interview answer):
 *   - 5KB. No reducers, no providers, no boilerplate.
 *   - The `persist` middleware syncs state to localStorage automatically,
 *     so the cart survives page refreshes.
 *
 * Java analogy: a singleton bean holding a List<CartItem> in memory.
 * Difference: each browser tab is its own JVM — state isn't shared
 * across tabs unless we add a broadcast channel (not needed for v1).
 */

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, qty: number) => void;
  clear: () => void;
  totalQuantity: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            productId: product.id,
            title: product.title,
            price: product.price,
            image: resolvePhotoUrl(product.photo?.[0]?.photo),
            quantity: qty,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i
                ),
        })),

      clear: () => set({ items: [] }),

      totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "ec-cart", // localStorage key
      // We could `partialize` to exclude derived methods, but Zustand persist
      // only writes the data fields anyway — methods are recreated on rehydrate.
    }
  )
);
