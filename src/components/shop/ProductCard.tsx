"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Store } from "lucide-react";
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
  const router = useRouter();
  const firstPhoto = product.photo?.[0]?.photo;
  const imageUrl = resolvePhotoUrl(firstPhoto);
  const isSoldOut =
    product.status?.toLowerCase() === "soldout" ||
    product.status?.toLowerCase() === "sold_out";

  const toggle = useToggleBookmark();
  const saved = !!product.isSaved;

  function goToShop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.sellerId) router.push(`/shop/${product.sellerId}`);
  }

  return (
    <Link
      href={`/market/product/${product.id}`}
      className="tap-bounce group block squircle-lg bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/50 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-zinc-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
          className="absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-400 shadow-sm ring-1 ring-white/50 transition-all hover:bg-white hover:text-rose-500 active:scale-90"
        >
          <Heart
            className={`size-4.5 transition-colors ${
              saved ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {isSoldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            Sold out
          </span>
        )}

        {!isSoldOut && (
          <AddToCartButton
            product={product}
            variant="icon"
            className="absolute bottom-3 right-3 shadow-lg transition-all duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          />
        )}
      </div>

      <div className="space-y-1.5 px-1 py-3">
        <h3 className="line-clamp-1 text-[14px] font-medium text-zinc-800 transition-colors group-hover:text-primary">
          {product.title}
        </h3>

        {/* Seller line — clickable to /shop/[id] without nesting <Link> */}
        {product.sellerName && (
          <button
            type="button"
            onClick={goToShop}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-primary transition-colors"
          >
            <Store className="size-3" strokeWidth={2.5} />
            <span className="truncate">by {product.sellerName}</span>
          </button>
        )}

        <div className="flex items-center justify-between gap-1">
          <p className="text-[17px] font-bold tracking-tight text-zinc-950">
            ${product.price?.toFixed(2) ?? "—"}
          </p>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">New</span>
        </div>
      </div>
    </Link>
  );
}
