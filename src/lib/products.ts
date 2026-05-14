import { api } from "./api";
import type { BaseResponse, Product, PagedItems, Category, ProductCreateRequest } from "@/types/api";
import { MOCK_PRODUCTS, MOCK_POPULAR, MOCK_CATEGORIES } from "./mockData";

/**
 * Fetcher functions for products and categories.
 *
 * Each function:
 *   - Hits one backend endpoint
 *   - Unwraps the BaseResponse / ApiResponse envelope
 *   - Normalizes either a raw array or a Spring Page<T> into PagedItems<T>
 *   - Falls back to mock data if the API returns empty / fails — so the
 *     UI is demo-able even on a freshly cloned, empty database.
 *
 * To force-disable the mock fallback (e.g., for real prod), set
 *   NEXT_PUBLIC_DISABLE_MOCK=true
 * in .env.local.
 */

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/** Some endpoints return `Page<T>` (has `.content`); others just return `T[]`. Normalize. */
function toPaged<T>(raw: unknown): PagedItems<T> {
  if (Array.isArray(raw)) return { content: raw as T[] };
  if (raw && typeof raw === "object" && "content" in raw) {
    return raw as PagedItems<T>;
  }
  return { content: [] };
}

/* ---------------- Products ---------------- */

export async function fetchAllProducts(
  pageNumber = 1,
  pageSize = 20
): Promise<PagedItems<Product>> {
  try {
    const res = await api.get<BaseResponse<unknown>>("/item/all", {
      params: { pageNumber, pageSize },
    });
    if (res.data.error) throw new Error(res.data.message ?? "load failed");

    const paged = toPaged<Product>(res.data.payload);
    if (paged.content.length === 0 && !MOCK_DISABLED) {
      return { content: MOCK_PRODUCTS };
    }
    return paged;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[products] /item/all failed — using mock data", err);
    return { content: MOCK_PRODUCTS };
  }
}

export async function fetchPopularProducts(): Promise<Product[]> {
  try {
    const res = await api.get<BaseResponse<Product[]>>("/item/popular");
    if (res.data.error) throw new Error(res.data.message ?? "popular failed");
    const data = res.data.payload ?? [];
    if (data.length === 0 && !MOCK_DISABLED) return MOCK_POPULAR;
    return data;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[products] /item/popular failed — using mock data", err);
    return MOCK_POPULAR;
  }
}

export async function fetchProductById(id: number): Promise<Product> {
  try {
    const res = await api.get<BaseResponse<Product>>(`/item/${id}`);
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "Product not found");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    const mock = MOCK_PRODUCTS.find((p) => p.id === id);
    if (mock) {
      console.warn(`[products] /item/${id} failed — using mock data`, err);
      return mock;
    }
    throw err;
  }
}

export async function searchProductsByTitle(
  title: string,
  pageNumber = 1,
  pageSize = 20
): Promise<PagedItems<Product>> {
  try {
    const res = await api.get<BaseResponse<unknown>>(
      // Backend has a typo "pageNumer" — we match it exactly.
      `/item/title/${encodeURIComponent(title)}`,
      { params: { pageNumer: pageNumber, pageSize } }
    );
    if (res.data.error) throw new Error(res.data.message ?? "search failed");

    const paged = toPaged<Product>(res.data.payload);
    if (paged.content.length === 0 && !MOCK_DISABLED) {
      // Mock fallback: case-insensitive title contains.
      const q = title.toLowerCase();
      const matches = MOCK_PRODUCTS.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
      return { content: matches };
    }
    return paged;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    const q = title.toLowerCase();
    const matches = MOCK_PRODUCTS.filter((p) =>
      p.title.toLowerCase().includes(q)
    );
    console.warn(`[products] /item/title/${title} failed — using mock`, err);
    return { content: matches };
  }
}

export async function fetchProductsByCategory(
  categoryName: string,
  pageNumber = 1,
  pageSize = 20
): Promise<PagedItems<Product>> {
  try {
    const res = await api.get<BaseResponse<unknown>>(
      `/item/categoryName/${encodeURIComponent(categoryName)}`,
      { params: { pageNumer: pageNumber, pageSize } }
    );
    if (res.data.error) throw new Error(res.data.message ?? "category failed");

    const paged = toPaged<Product>(res.data.payload);
    if (paged.content.length === 0 && !MOCK_DISABLED) {
      // Mock fallback: return all products (mock data isn't categorized).
      return { content: MOCK_PRODUCTS };
    }
    return paged;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn(
      `[products] /item/categoryName/${categoryName} failed — using mock`,
      err
    );
    return { content: MOCK_PRODUCTS };
  }
}

export async function createProduct(
  data: ProductCreateRequest,
  categoryName: string
): Promise<Product> {
  const res = await api.post<BaseResponse<Product>>(
    "/item/postProduct",
    data,
    { params: { categoryName } }
  );
  if (res.data.error || !res.data.payload) {
    throw new Error(res.data.message ?? "Failed to create product");
  }
  return res.data.payload;
}

/* ---------------- Categories ---------------- */

export async function fetchAllCategories(): Promise<Category[]> {
  try {
    const res = await api.get<BaseResponse<Category[]>>("/category/all");
    if (res.data.error) throw new Error(res.data.message ?? "categories failed");
    const data = res.data.payload ?? [];
    if (data.length === 0 && !MOCK_DISABLED) return MOCK_CATEGORIES;
    return data;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[categories] /category/all failed — using mock", err);
    return MOCK_CATEGORIES;
  }
}
