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
        className={`tap-bounce rounded-full bg-primary p-2.5 text-white shadow-lg shadow-primary/20 transition-all ${className}`}
      >
        <ShoppingBag className="size-4.5" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`tap-bounce inline-flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-4.5 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all ${className}`}
    >
      <ShoppingBag className="size-5.5" strokeWidth={2.5} />
      Add to cart
    </button>
  );
}
