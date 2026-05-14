import { api } from "./api";
import type { BaseResponse, Bookmark } from "@/types/api";
import { MOCK_PRODUCTS } from "./mockData";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/* ---------------- in-memory mock state ----------------
 * When the API isn't available, we keep saved-product-ids in memory
 * so the UI feels real (clicking heart toggles state, /saved page reflects it).
 * Persists for the page session.
 */
const mockSavedIds = new Set<number>([9001, 9002, 9006]); // pre-seeded

function mockBookmarkFromProductId(productId: number, bmId: number): Bookmark {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0];
  return {
    id: bmId,
    product,
    status: "ACTIVE",
    createdDate: new Date().toISOString(),
  };
}

/* ---------------- API calls ---------------- */

export async function saveBookmark(productId: number): Promise<void> {
  try {
    const res = await api.post<BaseResponse<string>>("/bookmark/saved", null, {
      params: { productId },
    });
    if (res.data.error) throw new Error(res.data.message ?? "save failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[bookmarks] save failed — using mock", err);
    mockSavedIds.add(productId);
  }
}

export async function unsaveBookmark(productId: number): Promise<void> {
  try {
    const res = await api.delete<BaseResponse<string>>("/bookmark/unsaved", {
      params: { productId },
    });
    if (res.data.error) throw new Error(res.data.message ?? "unsave failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[bookmarks] unsave failed — using mock", err);
    mockSavedIds.delete(productId);
  }
}

/**
 * Backend only exposes /bookmark/allSaved/{title} — a search by title.
 * We pass " " (space) to mean "all". If that fails, fall back to mock.
 */
export async function fetchSavedBookmarks(titleFilter = ""): Promise<Bookmark[]> {
  const path = titleFilter.trim()
    ? `/bookmark/allSaved/${encodeURIComponent(titleFilter)}`
    : `/bookmark/allSaved/${encodeURIComponent(" ")}`;
  try {
    const res = await api.get<BaseResponse<Bookmark[]>>(path);
    if (res.data.error) throw new Error(res.data.message ?? "load failed");
    const data = res.data.payload ?? [];
    if (data.length === 0 && !MOCK_DISABLED) return getMockBookmarks(titleFilter);
    return data;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[bookmarks] fetch failed — using mock", err);
    return getMockBookmarks(titleFilter);
  }
}

function getMockBookmarks(titleFilter: string): Bookmark[] {
  const q = titleFilter.trim().toLowerCase();
  const ids = Array.from(mockSavedIds);
  let bookmarks = ids.map((pid, i) => mockBookmarkFromProductId(pid, 7000 + i));
  if (q) {
    bookmarks = bookmarks.filter((b) => b.product.title.toLowerCase().includes(q));
  }
  return bookmarks;
}

/** For the heart toggle to know whether a given product is currently saved. */
export function isProductSavedLocally(productId: number): boolean {
  return mockSavedIds.has(productId);
}
