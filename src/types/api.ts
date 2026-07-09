/**
 * Backend has two wrapper shapes — BaseResponse (auth) and ApiResponse (everything else).
 * They share the same useful fields. We model one unified envelope:
 *   { payload, message, code, error, date? }
 *
 * `code` is sometimes a string ("401") and sometimes a number (200) on the backend —
 * we accept both.
 */
export interface BaseResponse<T> {
  payload: T | null;
  message: string | null;
  code: string | number | null;
  error: boolean;
  date?: string;
}

/* ---------------- Auth ---------------- */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address?: string;
  photoProfile?: string;
  googleLink?: string;
  maplink?: string;
}

/* ---------------- Products & categories ---------------- */
export interface Photo {
  id: number;
  photo: string; // either a full URL or a relative path served by /api/v1/fileView/...
}

/** Mirrors backend ProductResponse.java */
export interface Product {
  id: number;
  title: string;
  price: number;
  status: string | null;
  isSaved: boolean | null;
  createdDate: string;
  totalAmount: number | null;
  photo: Photo[] | null;
  /**
   * Frontend-only enrichment fields used until the backend's ProductResponse
   * exposes seller info. Populated from MOCK_PRODUCTS for the demo.
   */
  sellerId?: number;
  sellerName?: string;
}

/* ---------------- Shops (frontend-only for now) ---------------- */
export interface ShopProfile {
  id: number;
  name: string;
  bio?: string;
  joinedAt: string;
  productCount: number;
  rating?: number;
  totalSales?: number;
  location?: string;
}

/** Mirrors backend CategoryResponse.java */
export interface Category {
  id: number;
  categoryName: string;
  product?: Product[];
}

/** Paginated list shape used by /item/all */
export interface PagedItems<T> {
  // Backend often returns { content, totalElements, totalPages, ... } — but since
  // the actual shape comes from Spring's Page<T>, we model the common subset.
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number; // current page index
  size?: number;
}

/* ---------------- Bookmarks & collections ---------------- */
/** Mirrors backend BookMarkResponse.java */
export interface Bookmark {
  id: number;
  product: Product;
  status: string | null;
  createdDate: string;
}

/** Mirrors backend CollectionResponse.java */
export interface Collection {
  id: number;
  name: string;
  createdDate: string;
  photo: string[] | null; // preview photos of items in collection
}

/* ---------------- Addresses ---------------- */
/** Mirrors backend AddressEntity (fields exposed in JSON). */
export interface Address {
  id: number;
  label: string;
  contact: string;
  telephone: string;
  address: string;
  detail: string;
}

export interface AddressFormValues {
  label: string;
  contact: string;
  telephone: string;
  address: string;
  detail: string;
}

/* ---------------- Purchase ---------------- */
/** Mirrors backend PurchaseRequest.java. One product per request. */
export interface PurchaseRequest {
  addressDeliveryId: number;
  productId: number;
  paymentMethod: boolean; // true = paid online, false = cash on delivery (best guess)
  remark: string;
  refernce: string; // NB: backend typo — matches Java field name
  paidBy: string;
}

/** Receipt shape returned by /purchase POST and /purchase/receipt/{id}. */
export interface Receipt {
  id: number;
  totalPrice?: number;
  createdDate?: string;
  // Backend doesn't have a clear DTO; we accept extra props.
  [extra: string]: unknown;
}

/* ---------------- Frontend-only cart ---------------- */
export interface CartItem {
  productId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

/* ---------------- User profile ---------------- */
/**
 * Returned by GET /api/v1/user/userprofile.
 * Backend's UserInfoResponse only declares 7 fields, but in practice the
 * service returns the full UserEntity. We model the union loosely.
 */
export interface UserProfile {
  id?: number;
  userName?: string;
  name?: string; // some endpoints use "name"
  email?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  shopAdress?: string; // backend typo
  address?: string;
  googleLink?: string;
  maplink?: string;
  status?: boolean;
  createdAt?: string;
  createDate?: string;
  role?: string;
  // Tolerate any other fields the backend tacks on.
  [extra: string]: unknown;
}

/** Mirrors backend UserInfoRequest.java (used for PUT /user/edit). */
export interface UserProfileUpdate {
  userName: string;
  phoneNumber: string;
  address: string;
  photoProfile: string;
  maplink: string;
}

/* ---------------- Saved payment methods (frontend-only) ----------------
 * Backend currently has no saved-payment-method endpoint, so we persist
 * these in localStorage via Zustand. When the backend adds endpoints
 * (e.g. /api/v1/paymentMethod), swap the store for API calls — the
 * SavedPaymentMethod shape stays.
 *
 * Card storage matches PCI-DSS practice: brand + last4 + expiry only.
 * Real cards in production must be tokenized by Stripe/ABA — never store
 * the full PAN or CVC, even in dev.
 */
export type SavedPaymentMethod =
  | {
      id: string;
      type: "card";
      label: string;
      brand: "VISA" | "MASTERCARD" | "OTHER";
      last4: string; // exactly 4 digits
      expMonth: number; // 1–12
      expYear: number; // 4-digit
    }
  | {
      id: string;
      type: "aba";
      label: string;
      phoneNumber: string; // contact on file for the ABA Pay account
    }
  | {
      id: string;
      type: "khqr";
      label: string;
      bankName: string;
    };

/* ---------------- Product create ---------------- */
export interface ProductCreateRequest {
  title: string;
  description?: string;
  price: number;
  discountValues?: number;
  discountType?: boolean;
  codition?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: string;
  size?: string;
  type?: string;
  photo?: { id: number; photo: string }[];
}

/* ---------------- Orders ---------------- */
/**
 * Order status timeline (frontend-only for now — backend has no status field).
 * Linear progression: PLACED → CONFIRMED → SHIPPED → DELIVERED (or CANCELLED).
 */
export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

/**
 * Frontend Order model. Each backend purchase = one Order (one product per purchase
 * in the current backend design — see PurchaseController). When backend supports
 * multi-item orders we'll group by `reference`.
 */
export interface Order {
  id: number;
  reference: string;
  orderDate: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  paidBy: string; // "cash", "online", "aba", "card"
  product: {
    id: number;
    title: string;
    image: string;
    unitPrice: number;
  };
  quantity: number;
  totalAmount: number;
  shippingAddress?: {
    label: string;
    address: string;
    detail: string;
  };
  seller?: string;
}
