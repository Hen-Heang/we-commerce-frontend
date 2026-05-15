import type { Product, Category, ShopProfile } from "@/types/api";

/**
 * Mock data for development.
 *
 * Used as a fallback when the backend returns an empty list — so the UI
 * never looks broken during a demo.
 *
 * When the backend's ProductResponse adds seller info, drop the sellerId
 * and sellerName fields and read them from the real response.
 */

/* ---------------- helpers ---------------- */
// Picsum gives stable random images — keyed by seed so they stay consistent.
const img = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;

/* ---------------- mock shops ---------------- */
export const MOCK_SHOPS: ShopProfile[] = [
  {
    id: 101,
    name: "Heang's Vintage",
    bio: "Curated retro finds from Phnom Penh. Every piece hand-picked.",
    joinedAt: "2026-02-15T10:00:00",
    productCount: 12,
    rating: 4.8,
    totalSales: 47,
    location: "Phnom Penh, Cambodia",
  },
  {
    id: 102,
    name: "Beauty by Sokha",
    bio: "Independent beauty brand. Locally sourced ingredients.",
    joinedAt: "2026-03-01T09:00:00",
    productCount: 8,
    rating: 4.9,
    totalSales: 89,
    location: "Siem Reap, Cambodia",
  },
];

/* ---------------- mock products ---------------- */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 9005,
    title: "Pocket Calculator",
    price: 9.5,
    status: "AVAILABLE",
    isSaved: false,
    createdDate: "2026-04-18T16:20:00",
    totalAmount: 1,
    photo: [{ id: 5, photo: img("calc") }],
    sellerId: 101,
    sellerName: "Heang's Vintage",
  },
  {
    id: 9006,
    title: "Designer Lipstick — Crimson",
    price: 22.0,
    status: "AVAILABLE",
    isSaved: true,
    createdDate: "2026-04-17T11:10:00",
    totalAmount: 1,
    photo: [{ id: 6, photo: img("lipstick") }],
    sellerId: 102,
    sellerName: "Beauty by Sokha",
  },
];

/* ---------------- mock categories ---------------- */
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, categoryName: "Home & Living" },
  { id: 2, categoryName: "Fashion" },
  { id: 3, categoryName: "Sports" },
  { id: 4, categoryName: "Electronics" },
  { id: 5, categoryName: "Beauty" },
  { id: 6, categoryName: "Kitchen" },
];

/** "Popular" = first 6 mocked products in our seed. */
export const MOCK_POPULAR: Product[] = MOCK_PRODUCTS.slice(0, 6);
