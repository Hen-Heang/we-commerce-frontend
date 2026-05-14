import type { Product, Category } from "@/types/api";

/**
 * Mock data for development.
 *
 * Used as a fallback when the backend returns an empty list — so the UI
 * never looks broken during a demo.
 *
 * INTERVIEW NOTE: This is a common pattern in real apps too. When a fresh
 * environment has no data yet (e.g., a recruiter clones the repo and runs it),
 * the app still shows a realistic landing experience.
 */

/* ---------------- helpers ---------------- */
// Picsum gives stable random images — keyed by seed so they stay consistent.
const img = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;

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
