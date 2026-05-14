import { api } from "./api";
import type { BaseResponse, PurchaseRequest, Receipt } from "@/types/api";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/**
 * Backend's POST /api/v1/purchase accepts ONE product per request.
 * So when the cart has multiple items, the checkout page fires this
 * function once per item in parallel.
 */
export async function createPurchase(req: PurchaseRequest): Promise<Receipt> {
  try {
    const res = await api.post<BaseResponse<Receipt>>("/purchase", req);
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "purchase failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[purchase] failed — returning mock receipt", err);
    return {
      id: Math.floor(Math.random() * 100_000) + 10_000,
      totalPrice: 0,
      createdDate: new Date().toISOString(),
    };
  }
}
