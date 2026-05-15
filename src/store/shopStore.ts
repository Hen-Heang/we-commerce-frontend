"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tracks whether the current user has "opened their shop" yet.
 *
 * This is purely a frontend state because the backend has no concept of
 * "is the user a seller?" — every authenticated user can technically post.
 * Storing it locally is enough for UX: it gates the seller dashboard
 * behind a deliberate onboarding moment (à la Etsy / Carousell).
 *
 * If you ever add a `shopName` column to the backend's UserEntity, just
 * derive `isShopOpen` from `!!user.shopName` and delete this store.
 */
interface ShopState {
  isShopOpen: boolean;
  shopName: string | null;
  openedAt: string | null;
  openShop: (name: string) => void;
  closeShop: () => void; // mainly for tests / dev reset
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      isShopOpen: false,
      shopName: null,
      openedAt: null,
      openShop: (name) =>
        set({
          isShopOpen: true,
          shopName: name.trim(),
          openedAt: new Date().toISOString(),
        }),
      closeShop: () =>
        set({ isShopOpen: false, shopName: null, openedAt: null }),
    }),
    { name: "ec-shop" }
  )
);
