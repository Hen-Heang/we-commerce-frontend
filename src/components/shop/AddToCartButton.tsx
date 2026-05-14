"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/api";

/**
 * "Add to cart" button. Reusable on cards and detail pages.
 *
 * Renders one of two visual styles via `variant`:
 *   - "pill"  → full pill button (used on detail page)
 *   - "icon"  → small icon-only button (used inside ProductCard hover state)
 */
export function AddToCartButton({
  product,
  variant = "pill",
  className = "",
}: {
  product: Product;
  variant?: "pill" | "icon";
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`Added "${product.title}" to cart`);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label="Add to cart"
        className={`rounded-xl bg-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-110 active:scale-90 ${className}`}
      >
        <ShoppingBag className="size-4.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <ShoppingBag className="size-5.5" />
      Add to cart
    </button>
  );
}
