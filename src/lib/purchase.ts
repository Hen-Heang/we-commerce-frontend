import { api } from "./api";
import type { BaseResponse, PurchaseRequest, Receipt } from "@/types/api";

/**
 * Backend's POST /api/v1/purchase accepts ONE product per request.
 * So when the cart has multiple items, the checkout page fires this
 * function once per item in parallel.
 *
 * This is a mutating call — unlike the read endpoints in this folder,
 * it must never mock-fallback on failure. A fabricated receipt here
 * would tell the user an order succeeded when nothing was purchased.
 */
export async function createPurchase(req: PurchaseRequest): Promise<Receipt> {
  const res = await api.post<BaseResponse<Receipt>>("/purchase", req);
  if (res.data.error || !res.data.payload) {
    throw new Error(res.data.message ?? "purchase failed");
  }
  return res.data.payload;
}
