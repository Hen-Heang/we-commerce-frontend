import { api } from "./api";
import type { Address, AddressFormValues, BaseResponse } from "@/types/api";

const MOCK_DISABLED = process.env.NEXT_PUBLIC_DISABLE_MOCK === "true";

/* ---------------- in-memory mock state ---------------- */
const mockAddresses: Address[] = [
  {
    id: 5001,
    label: "Home",
    contact: "Heang Hen",
    telephone: "+855 12 345 678",
    address: "Street 271, Phnom Penh",
    detail: "Apt 4B, near the park",
  },
];

/* ---------------- API calls ---------------- */

export async function fetchAddresses(): Promise<Address[]> {
  try {
    const res = await api.get<BaseResponse<Address[]>>("/address/listAddressDelivery");
    if (res.data.error) throw new Error(res.data.message ?? "addresses failed");
    const data = res.data.payload ?? [];
    if (data.length === 0 && !MOCK_DISABLED) return mockAddresses;
    return data;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[addresses] fetch failed — using mock", err);
    return mockAddresses;
  }
}

export async function createAddress(input: AddressFormValues): Promise<Address> {
  try {
    const res = await api.post<BaseResponse<Address>>(
      "/address/addAddressDelivery",
      input
    );
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "create failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[addresses] create failed — using mock", err);
    const mock: Address = { id: Date.now(), ...input };
    mockAddresses.unshift(mock);
    return mock;
  }
}

export async function updateAddress(
  id: number,
  input: AddressFormValues
): Promise<Address> {
  try {
    const res = await api.put<BaseResponse<Address>>(
      `/address/editAddressDelivery/${id}`,
      input
    );
    if (res.data.error || !res.data.payload) {
      throw new Error(res.data.message ?? "update failed");
    }
    return res.data.payload;
  } catch (err) {
    if (MOCK_DISABLED) throw err;
    console.warn("[addresses] update failed — using mock", err);
    const idx = mockAddresses.findIndex((a) => a.id === id);
    if (idx >= 0) {
      mockAddresses[idx] = { id, ...input };
      return mockAddresses[idx];
    }
    return { id, ...input };
  }
}

/**
 * Backend has no DELETE endpoint for addresses, so we just remove locally
 * in mock mode and return a soft-success otherwise.
 */
export async function deleteAddress(id: number): Promise<void> {
  if (MOCK_DISABLED) {
    // No backend support — fail explicitly so caller knows.
    throw new Error("Address deletion is not supported by the backend yet.");
  }
  const idx = mockAddresses.findIndex((a) => a.id === id);
  if (idx >= 0) mockAddresses.splice(idx, 1);
}
