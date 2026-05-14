import { api } from "./api";
import type { BaseResponse, Order, OrderStatus, Product } from "@/types/api";
import { MOCK_PRODUCTS } from "./mockData";
import { resolvePhotoUrl } from "./image";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/* ============================================================
 * Mock data
 * ============================================================
 * The backend doesn't yet expose order status, estimated delivery, or
 * an "all my orders" endpoint that includes both pending and delivered.
 * So we generate plausible orders here.
 *
 * When the backend adds:
 *   - GET /api/v1/purchase/myOrders
 *   - OrderStatus enum on purchase records
 * we'll switch this to real data.
 */

function makeMockOrder(
  id: number,
  product: Product,
  status: OrderStatus,
  daysAgo: number,
  paidBy: string,
  quantity = 1
): Order {
  const orderDate = new Date(Date.now() - daysAgo * 86400000).toISOString();
  const estDays = status === "DELIVERED" ? -1 : status === "SHIPPED" ? 2 : 5;
  const estDate =
    estDays >= 0
      ? new Date(Date.now() + estDays * 86400000).toISOString()
      : undefined;

  return {
    id,
    reference: `WC-${id}`,
    orderDate,
    status,
    estimatedDelivery: estDate,
    paidBy,
    product: {
      id: product.id,
      title: product.title,
      image: resolvePhotoUrl(product.photo?.[0]?.photo),
      unitPrice: product.price,
    },
    quantity,
    totalAmount: product.price * quantity,
    shippingAddress: {
      label: "Home",
      address: "Street 271, Phnom Penh",
      detail: "Apt 4B, near the park",
    },
    seller: "Local Seller",
  };
}

function generateMockOrders(): Order[] {
  // Safely pick a product by index — wraps around if MOCK_PRODUCTS is short.
  const N = MOCK_PRODUCTS.length;
  if (N === 0) return []; // no products → no mock orders
  const pick = (i: number) => MOCK_PRODUCTS[i % N];

  // Reverse-chronological — newest first.
  return [
    makeMockOrder(10001, pick(2), "PLACED", 0, "cash"),
    makeMockOrder(10002, pick(5), "CONFIRMED", 1, "aba"),
    makeMockOrder(10003, pick(0), "SHIPPED", 3, "online"),
    makeMockOrder(10004, pick(6), "DELIVERED", 9, "card", 2),
    makeMockOrder(10005, pick(10), "DELIVERED", 14, "cash"),
    makeMockOrder(10006, pick(7), "CANCELLED", 21, "online"),
  ];
}

const mockOrders = generateMockOrders();

/* ============================================================
 * API
 * ============================================================ */

/**
 * Backend's closest endpoint is GET /api/v1/item/allItemPurchased which returns
 * purchased products (not full orders). We adapt the response into Order rows.
 * If empty or fails, we serve mock orders.
 */
export async function fetchOrderHistory(): Promise<Order[]> {
  try {
    const res = await api.get<BaseResponse<unknown>>(
      "/item/allItemPurchased",
      { params: { pageNumber: 1, pageSize: 50 } }
    );
    if (res.data.error) throw new Error(res.data.message ?? "load failed");

    const raw = res.data.payload;
    const products: Product[] = Array.isArray(raw)
      ? (raw as Product[])
      : (raw as { content?: Product[] })?.content ?? [];

    if (products.length === 0 && !MOCK_DISABLED) return mockOrders;

    // Transform real purchased products into "delivered" orders.
    return products.map((p, i) =>
      makeMockOrder(20000 + i, p, "DELIVERED", i, "cash")
    );
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[orders] history fetch failed — using mock", err);
    return mockOrders;
  }
}

export async function fetchOrderById(id: number): Promise<Order | null> {
  try {
    // No direct backend endpoint for "order by id" — receipt API needs receiptId
    // not order id. We'd need a backend addition. For now, return mock.
    if (MOCK_DISABLED) {
      throw new Error("Order detail endpoint not implemented on backend yet.");
    }
    return mockOrders.find((o) => o.id === id) ?? null;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn(`[orders] fetch ${id} failed — using mock`, err);
    return mockOrders.find((o) => o.id === id) ?? null;
  }
}

/* ============================================================
 * Status helpers (used by the UI)
 * ============================================================ */

export const STATUS_ORDER: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
];

export function statusLabel(s: OrderStatus): string {
  switch (s) {
    case "PLACED":
      return "Order placed";
    case "CONFIRMED":
      return "Confirmed by seller";
    case "SHIPPED":
      return "On the way";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
  }
}

export function statusColor(s: OrderStatus): string {
  switch (s) {
    case "PLACED":
      return "bg-amber-100 text-amber-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800";
  }
}

/** Index in STATUS_ORDER (or -1 for CANCELLED) — used to compute progress %. */
export function statusIndex(s: OrderStatus): number {
  return STATUS_ORDER.indexOf(s);
}
