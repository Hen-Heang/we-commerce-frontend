import { api } from "./api";
import type { BaseResponse, Collection } from "@/types/api";
import { MOCK_PRODUCTS } from "./mockData";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/* ---------------- in-memory mock collections ---------------- */
const mockCollections: Collection[] = [
  {
    id: 1001,
    name: "Wishlist",
    createdDate: "2026-05-01T10:00:00",
    photo: [MOCK_PRODUCTS[0].photo![0].photo, MOCK_PRODUCTS[1].photo![0].photo],
  },
  {
    id: 1002,
    name: "Home Ideas",
    createdDate: "2026-04-20T12:00:00",
    photo: [MOCK_PRODUCTS[0].photo![0].photo, MOCK_PRODUCTS[1].photo![0].photo],
  },
];

/* ---------------- API calls ---------------- */

export async function fetchAllCollections(): Promise<Collection[]> {
  try {
    const res = await api.get<BaseResponse<Collection[]>>("/collection/allCollection");
    if (res.data.error) throw new Error(res.data.message ?? "load failed");
    const data = res.data.payload ?? [];
    if (data.length === 0 && !MOCK_DISABLED) return mockCollections;
    return data;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[collections] fetch failed — using mock", err);
    return mockCollections;
  }
}

export async function createCollection(collectionName: string): Promise<Collection> {
  try {
    const res = await api.post<BaseResponse<Collection>>(
      "/collection/addCollection",
      null,
      { params: { collectionName } }
    );
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "create failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[collections] create failed — using mock", err);
    const newCol: Collection = {
      id: Date.now(),
      name: collectionName,
      createdDate: new Date().toISOString(),
      photo: [],
    };
    mockCollections.unshift(newCol);
    return newCol;
  }
}

export async function deleteCollection(id: number): Promise<void> {
  try {
    const res = await api.delete<BaseResponse<string>>(`/collection/${id}`);
    if (res.data.error) throw new Error(res.data.message ?? "delete failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[collections] delete failed — using mock", err);
    const idx = mockCollections.findIndex((c) => c.id === id);
    if (idx >= 0) mockCollections.splice(idx, 1);
  }
}

export async function renameCollection(id: number, newName: string): Promise<void> {
  try {
    const res = await api.put<BaseResponse<Collection>>(`/collection/${id}`, null, {
      params: { newCollectionName: newName },
    });
    if (res.data.error) throw new Error(res.data.message ?? "rename failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[collections] rename failed — using mock", err);
    const target = mockCollections.find((c) => c.id === id);
    if (target) target.name = newName;
  }
}

/**
 * Add saved bookmarks to a collection.
 * Backend: PUT /api/v1/collection/addBookMark/{id}?bookMarkId=1&bookMarkId=2
 */
export async function addBookmarksToCollection(
  collectionId: number,
  bookmarkIds: number[]
): Promise<void> {
  try {
    const res = await api.put<BaseResponse<string>>(
      `/collection/addBookMark/${collectionId}`,
      null,
      { params: { bookMarkId: bookmarkIds } }
    );
    if (res.data.error) throw new Error(res.data.message ?? "add failed");
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[collections] addBookmarks failed — using mock", err);
    // No-op in mock mode — we don't track per-collection bookmark membership.
  }
}

export async function fetchCollectionById(id: number): Promise<Collection | null> {
  try {
    const res = await api.get<BaseResponse<Collection>>(`/collection/${id}`);
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "not found");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn(`[collections] fetch ${id} failed — using mock`, err);
    return mockCollections.find((c) => c.id === id) ?? null;
  }
}
