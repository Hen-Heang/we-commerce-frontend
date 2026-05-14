"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { fetchAddresses, createAddress } from "@/lib/addresses";
import { createPurchase } from "@/lib/purchase";
import { usePaymentMethodsStore } from "@/store/paymentMethodsStore";
import { SavedPaymentMethodsList } from "@/components/shop/SavedPaymentMethodsList";
import { KhqrSheet } from "@/components/shop/KhqrSheet";
import { CardPaymentSheet } from "@/components/shop/CardPaymentSheet";
import type { Address, AddressFormValues } from "@/types/api";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Redirect to /cart if the cart is empty (after hydration).
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/cart");
    }
  }, [mounted, items.length, router]);

  /* ---------------- Addresses ---------------- */
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  useEffect(() => {
    if (!selectedAddressId && addressesQuery.data && addressesQuery.data.length > 0) {
      setSelectedAddressId(addressesQuery.data[0].id);
    }
  }, [addressesQuery.data, selectedAddressId]);

  const [showNewAddress, setShowNewAddress] = useState(false);

  /* ---------------- Payment method ---------------- */
  /**
   * `selectedMethodId` is either:
   *   - "cod" (Cash on delivery — pseudo-method, always available)
   *   - The id of a saved payment method from paymentMethodsStore
   */
  const savedMethods = usePaymentMethodsStore((s) => s.methods);
  const defaultMethodId = usePaymentMethodsStore((s) => s.defaultId);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("cod");

  // After hydration, prefer the user's default saved method when available.
  useEffect(() => {
    if (mounted && defaultMethodId) {
      setSelectedMethodId(defaultMethodId);
    }
  }, [mounted, defaultMethodId]);

  // Look up the full method object (or undefined if "cod")
  const selectedMethod = savedMethods.find((m) => m.id === selectedMethodId);
  const methodType = selectedMethod?.type ?? "cod";

  /* Payment sheet state */
  const [sheetOpen, setSheetOpen] = useState<"none" | "khqr" | "aba" | "card">("none");
  // Stable reference for the whole cart checkout — used in payment sheets.
  const [paymentRef] = useState(
    () => `WC-${Date.now().toString(36).toUpperCase()}`
  );

  /* ---------------- Place order ---------------- */
  const placeOrder = useMutation({
    mutationFn: async () => {
      if (selectedAddressId === null) {
        throw new Error("Please pick a delivery address.");
      }

      // Backend accepts ONE product per request → fire one per cart item.
      const isOnline = methodType !== "cod";
      const receipts = await Promise.all(
        items.flatMap((item) =>
          // Repeat once per quantity unit (backend has no quantity field).
          Array.from({ length: item.quantity }).map(() =>
            createPurchase({
              addressDeliveryId: selectedAddressId,
              productId: item.productId,
              paymentMethod: isOnline,
              remark: "",
              refernce: paymentRef,
              paidBy: methodType,
            })
          )
        )
      );
      return receipts;
    },
    onSuccess: () => {
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?ref=${paymentRef}`);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to place order");
    },
  });

  /**
   * Place-order entrypoint. If the method needs a sheet (ABA/KHQR/card),
   * we open it first. On payment confirmation we run the real mutation.
   * For COD, we run it immediately.
   */
  function handlePlaceOrder() {
    if (selectedAddressId === null) {
      toast.error("Please pick a delivery address.");
      return;
    }
    if (methodType === "cod") {
      placeOrder.mutate();
      return;
    }
    if (methodType === "card") setSheetOpen("card");
    else if (methodType === "aba") setSheetOpen("aba");
    else if (methodType === "khqr") setSheetOpen("khqr");
  }

  function onSheetPaid() {
    setSheetOpen("none");
    placeOrder.mutate();
  }

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/cart"
        className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-indigo-50 transition-colors">
          <ArrowLeft className="size-4" />
        </div>
        Back to cart
      </Link>

      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-zinc-950">Checkout</h1>
        <p className="text-base font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
          Review your items and complete your purchase
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          {/* Address selection */}
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-zinc-950">Delivery Address</h2>
              <button
                onClick={() => setShowNewAddress((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="size-4" />
                {showNewAddress ? "Cancel" : "Add New"}
              </button>
            </div>

            {addressesQuery.isLoading && (
              <div className="space-y-4">
                <div className="h-24 animate-pulse rounded-2xl bg-zinc-50" />
                <div className="h-24 animate-pulse rounded-2xl bg-zinc-50" />
              </div>
            )}

            {addressesQuery.data && (
              <ul className="space-y-4">
                {addressesQuery.data.map((addr) => (
                  <AddressOption
                    key={addr.id}
                    address={addr}
                    checked={selectedAddressId === addr.id}
                    onSelect={() => setSelectedAddressId(addr.id)}
                  />
                ))}
              </ul>
            )}

            {showNewAddress && (
              <div className="mt-8 pt-8 border-t border-zinc-100 animate-in slide-in-from-top-4 duration-300">
                <AddressForm
                  onSaved={(addr) => {
                    queryClient.invalidateQueries({ queryKey: ["addresses"] });
                    setSelectedAddressId(addr.id);
                    setShowNewAddress(false);
                  }}
                />
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-zinc-950">Payment Method</h2>
              <Link
                href="/profile"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Manage in profile →
              </Link>
            </div>
            <SavedPaymentMethodsList
              mode="select"
              selectedId={selectedMethodId}
              onSelect={setSelectedMethodId}
            />
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200/50">
                <span className="text-[10px] font-black">?</span>
              </div>
              <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider pt-0.5">
                Note: ABA Pay & KHQR are simulated for this demo. Card payments are securely processed but not charged.
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-zinc-950 p-8 shadow-2xl shadow-indigo-200 text-white animate-in slide-in-from-right-4 duration-700">
            <h2 className="mb-6 text-xl font-black tracking-tight">Purchase Summary</h2>

            <ul className="mb-8 space-y-4 text-sm">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between items-baseline gap-4">
                  <span className="line-clamp-1 flex-1 font-bold text-zinc-400 italic">
                    {item.title} <span className="not-italic text-zinc-500 ml-1">× {item.quantity}</span>
                  </span>
                  <span className="font-black text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="h-px bg-white/10 mb-6" />
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-400 italic">Estimated Shipping</span>
                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest text-[10px]">Free</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black tracking-tight">Total</span>
                <span className="text-3xl font-black text-indigo-400">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending || selectedAddressId === null}
              className="w-full rounded-2xl bg-white px-6 py-5 text-lg font-black text-zinc-950 shadow-xl transition-all hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
            >
              {placeOrder.isPending ? "Confirming..." : "Confirm & Pay Now"}
            </button>
            
            <p className="mt-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              Secure SSL Encryption Active
            </p>
          </div>
        </aside>
      </div>

      {/* Sheets (simulated) */}
      {sheetOpen === "khqr" && (
        <KhqrSheet
          open
          onClose={() => setSheetOpen("none")}
          amount={totalPrice}
          reference={paymentRef}
          onPaid={onSheetPaid}
        />
      )}
      {sheetOpen === "aba" && (
        <KhqrSheet
          open
          method="aba"
          onClose={() => setSheetOpen("none")}
          amount={totalPrice}
          reference={paymentRef}
          onPaid={onSheetPaid}
        />
      )}
      {sheetOpen === "card" && (
        <CardPaymentSheet
          open
          onClose={() => setSheetOpen("none")}
          amount={totalPrice}
          reference={paymentRef}
          onPaid={onSheetPaid}
        />
      )}
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function AddressOption({
  address,
  checked,
  onSelect,
}: {
  address: Address;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <label
        className={`relative block cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
          checked 
            ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100 ring-1 ring-indigo-600" 
            : "border-zinc-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-zinc-50 hover:scale-[1.01]"
        } active:scale-[0.99]`}
      >
        <input
          type="radio"
          name="address"
          checked={checked}
          onChange={onSelect}
          className="sr-only"
        />
        <div className="flex items-start gap-4">
          <div
            className={`mt-1 size-6 shrink-0 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              checked
                ? "border-indigo-600 bg-indigo-600 shadow-sm"
                : "border-zinc-200"
            }`}
          >
            {checked && <div className="size-2 rounded-full bg-white animate-in zoom-in" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black tracking-tight text-zinc-950">
              {address.label} · <span className="font-bold text-zinc-500 italic ml-1">{address.contact}</span>
            </p>
            <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-tighter">{address.telephone}</p>
            <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
              {address.address}
              {address.detail ? <span className="text-zinc-400 ml-1 italic">— {address.detail}</span> : ""}
            </p>
          </div>
        </div>
      </label>
    </li>
  );
}

function AddressForm({ onSaved }: { onSaved: (addr: Address) => void }) {
  const [values, setValues] = useState<AddressFormValues>({
    label: "Home",
    contact: "",
    telephone: "",
    address: "",
    detail: "",
  });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (v: AddressFormValues) => createAddress(v),
    onSuccess: (addr) => onSaved(addr),
    onError: (e: Error) => setErr(e.message ?? "Could not save address"),
  });

  function set<K extends keyof AddressFormValues>(key: K, val: AddressFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!values.contact || !values.telephone || !values.address) {
      setErr("Contact name, telephone, and address are required fields.");
      return;
    }
    save.mutate(values);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Label"
          value={values.label}
          onChange={(v) => set("label", v)}
          placeholder="e.g. Home, Office"
        />
        <Field
          label="Contact Name"
          value={values.contact}
          onChange={(v) => set("contact", v)}
          placeholder="Recipient's full name"
        />
        <Field
          label="Telephone"
          value={values.telephone}
          onChange={(v) => set("telephone", v)}
          placeholder="+855 12 345 678"
        />
        <Field
          label="Delivery Address"
          value={values.address}
          onChange={(v) => set("address", v)}
          placeholder="Street name, City"
        />
      </div>
      <Field
        label="Delivery Details"
        value={values.detail}
        onChange={(v) => set("detail", v)}
        placeholder="Apt, Floor, landmark (optional)"
      />

      {err && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 border border-red-100 animate-in slide-in-from-top-2">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={save.isPending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
      >
        {save.isPending ? "Saving..." : "Save Delivery Address"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-zinc-900 ml-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4"
      />
    </label>
  );
}
