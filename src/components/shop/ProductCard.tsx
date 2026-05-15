"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types/api";
import { resolvePhotoUrl } from "@/lib/image";
import { useToggleBookmark } from "@/hooks/useToggleBookmark";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

/**
 * Single product tile.
 * Heart button is wired to /api/v1/bookmark via useToggleBookmark
 * with optimistic UI updates.
 */
export function ProductCard({ product }: { product: Product }) {
  const firstPhoto = product.photo?.[0]?.photo;
  const imageUrl = resolvePhotoUrl(firstPhoto);
  const isSoldOut =
    product.status?.toLowerCase() === "soldout" ||
    product.status?.toLowerCase() === "sold_out";

  const toggle = useToggleBookmark();
  const saved = !!product.isSaved;

  return (
    <Link
      href={`/market/product/${product.id}`}
      className="group block overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100/60 hover:ring-indigo-400/40 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <button
          type="button"
          aria-label={saved ? "Unsave" : "Save"}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle.mutate({ productId: product.id, currentlySaved: saved });
          }}
          className="absolute right-2.5 top-2.5 rounded-xl bg-white/95 p-2.5 text-zinc-400 shadow-md ring-1 ring-zinc-100 transition-all hover:bg-white hover:text-rose-500 active:scale-90"
        >
          <Heart
            className={`size-4 transition-colors ${
              saved ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {isSoldOut && (
          <span className="absolute left-3 top-3 rounded-lg bg-zinc-900/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            Sold out
          </span>
        )}

        {!isSoldOut && (
          <AddToCartButton
            product={product}
            variant="icon"
            className="absolute bottom-3 right-3 transition-all duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          />
        )}
      </div>

      <div className="space-y-1 px-2 py-2.5">
        <h3 className="line-clamp-1 text-[13px] font-semibold text-zinc-800 transition-colors group-hover:text-indigo-600">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-1">
          <p className="text-base font-black text-zinc-950">
            ${product.price?.toFixed(2) ?? "—"}
          </p>
          <span className="shrink-0 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wide">New</span>
        </div>
      </div>
    </Link>
  );
}
