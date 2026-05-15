import type { Product, ShopProfile } from "@/types/api";
import { MOCK_PRODUCTS, MOCK_SHOPS } from "./mockData";

/**
 * Shop data fetchers (frontend-only for now).
 *
 * Backend has no public shop endpoints yet — when those land, this file
 * becomes a thin axios wrapper. For the demo, everything is mock-served.
 */

export async function fetchShopById(id: number): Promise<ShopProfile | null> {
  return MOCK_SHOPS.find((s) => s.id === id) ?? null;
}

export async function fetchProductsByShop(id: number): Promise<Product[]> {
  return MOCK_PRODUCTS.filter((p) => p.sellerId === id);
}

export async function fetchAllShops(): Promise<ShopProfile[]> {
  return MOCK_SHOPS;
}
