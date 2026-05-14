/**
 * Payment method tokens used across the app.
 *
 * Maps to backend's PurchaseRequest.paidBy field (which is a free-form string today).
 * If/when backend adds an enum, this stays the same.
 */
export type PaymentMethodId = "aba" | "card" | "khqr" | "cod";

export function paymentMethodLabel(id: PaymentMethodId): string {
  switch (id) {
    case "aba":
      return "ABA Pay";
    case "card":
      return "Credit / Debit Card";
    case "khqr":
      return "KHQR";
    case "cod":
      return "Cash on delivery";
  }
}

/**
 * For a given method, does the user need to complete an inline payment sheet
 * before "Place order" finalizes?
 *
 * - cod  → no extra step
 * - others → show a sheet (KHQR scan, card form) to simulate payment.
 */
export function requiresPaymentSheet(id: PaymentMethodId): boolean {
  return id !== "cod";
}

/**
 * Backend's PurchaseRequest.paymentMethod is a Boolean ("paid online or not").
 * We translate the granular frontend method into that boolean for now.
 */
export function isOnlinePayment(id: PaymentMethodId): boolean {
  return id !== "cod";
}
