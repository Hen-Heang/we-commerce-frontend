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
      className="group block overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-zinc-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:ring-indigo-500/30 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
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
          className="absolute right-3 top-3 rounded-xl bg-white/95 p-2 text-zinc-500 shadow-md transition-all hover:bg-white hover:text-rose-500 active:scale-90"
        >
          <Heart
            className={`size-4.5 transition-colors ${
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
            className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          />
        )}
      </div>

      <div className="space-y-1.5 px-2 py-3">
        <h3 className="line-clamp-1 text-sm font-bold text-zinc-950 transition-colors group-hover:text-indigo-600">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-zinc-900">
            ${product.price?.toFixed(2) ?? "—"}
          </p>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">New arrival</span>
        </div>
      </div>
    </Link>
  );
}
