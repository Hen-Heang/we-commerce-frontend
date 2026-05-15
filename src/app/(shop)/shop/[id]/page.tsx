"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Package, Calendar, MapPin, Store } from "lucide-react";

import { fetchShopById, fetchProductsByShop } from "@/lib/shops";
import { ProductCard } from "@/components/shop/ProductCard";

/**
 * Public shop detail page.
 *
 * Pattern: Etsy `etsy.com/shop/{name}` / Carousell user profile / eBay seller hub.
 * Shows the seller's storefront — name, bio, stats, and their product grid.
 *
 * Route: /shop/[id]
 */
export default function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const shopId = Number(id);

  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => fetchShopById(shopId),
    enabled: !Number.isNaN(shopId),
  });

  const productsQuery = useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: () => fetchProductsByShop(shopId),
    enabled: !Number.isNaN(shopId),
  });

  if (shopQuery.isLoading) return <ShopSkeleton />;

  if (shopQuery.isError || !shopQuery.data) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12 text-center">
        <div className="inline-flex size-20 items-center justify-center rounded-[2rem] bg-zinc-50 text-zinc-300 mb-4">
          <Store className="size-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-zinc-950">Shop not found</h1>
        <p className="text-zinc-500">
          This shop doesn't exist or has been removed.
        </p>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
        >
          <ArrowLeft className="size-4" />
          Back to marketplace
        </Link>
      </div>
    );
  }

  const shop = shopQuery.data;
  const products = productsQuery.data ?? [];
  const joined = new Date(shop.joinedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/market"
        className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-indigo-50 transition-colors">
          <ArrowLeft className="size-4" />
        </div>
        Back to marketplace
      </Link>

      {/* Shop header card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white shadow-2xl shadow-indigo-200 sm:p-10">
        {/* Decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-indigo-300/20 blur-3xl"
        />

        <div className="relative flex flex-wrap items-start gap-6">
          {/* Shop avatar — initials */}
          <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-white/15 text-3xl font-black ring-1 ring-white/30 backdrop-blur-sm sm:size-24 sm:text-4xl">
            {initials(shop.name)}
          </span>

          {/* Shop meta */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200">
              <Store className="size-3" />
              Shop
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {shop.name}
            </h1>
            {shop.bio && (
              <p className="max-w-2xl text-sm text-indigo-100/90 sm:text-base">
                {shop.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-semibold text-indigo-100/80">
              {shop.rating != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-300 text-amber-300" />
                  <span className="font-black text-white">
                    {shop.rating.toFixed(1)}
                  </span>
                  rating
                </span>
              )}
              {shop.totalSales != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Package className="size-3.5" />
                  <span className="font-black text-white">{shop.totalSales}</span>{" "}
                  sales
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Joined {joined}
              </span>
              {shop.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {shop.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-black tracking-tight text-zinc-950">
            All products
          </h2>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        {productsQuery.isLoading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-zinc-50 px-6 py-16 text-center border-2 border-dashed border-zinc-200">
            <Store className="mx-auto mb-3 size-10 text-zinc-300" />
            <p className="text-sm text-zinc-500">
              This shop hasn't listed any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------- helpers ---------------- */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ShopSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 w-32 rounded-xl bg-zinc-100" />
      <div className="h-48 rounded-3xl bg-zinc-100" />
      <ProductGridSkeleton />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200"
        />
      ))}
    </div>
  );
}
