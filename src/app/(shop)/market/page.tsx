"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { CategoryStrip } from "@/components/shop/CategoryStrip";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  fetchAllProducts,
  fetchPopularProducts,
  fetchProductsByCategory,
  searchProductsByTitle,
} from "@/lib/products";
import type { Product } from "@/types/api";

/**
 * Marketplace page (home for logged-in users).
 *
 * Three view modes driven by URL params:
 *   - default        → grid of all products, plus a "Popular" strip on top
 *   - ?q=phrase      → search results
 *   - ?cat=name      → category-filtered grid
 */
export default function MarketPage() {
  return (
    <Suspense fallback={<MarketSkeleton />}>
      <MarketPageInner />
    </Suspense>
  );
}

function MarketSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full animate-pulse rounded-2xl bg-zinc-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200" />
        ))}
      </div>
    </div>
  );
}

function MarketPageInner() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  const [category, setCategory] = useState<string | null>(searchParams.get("cat"));

  /* ---------------- Popular strip (always shown on default view) ---------------- */
  const popularQuery = useQuery({
    queryKey: ["popular-products"],
    queryFn: fetchPopularProducts,
    enabled: !search && !category, // skip when filtered
  });

  /* ---------------- Main product list — switches source by mode ---------------- */
  const mainQuery = useQuery({
    queryKey: ["products", { search, category }],
    queryFn: () => {
      if (search) return searchProductsByTitle(search);
      if (category) return fetchProductsByCategory(category);
      return fetchAllProducts(1, 20);
    },
  });

  /* The "all" and "by category" endpoints return Page<T>; "search" too.
     They all have a `.content` array. */
  const products = useMemo<Product[]>(() => {
    const payload = mainQuery.data;
    if (!payload) return [];
    return payload.content ?? [];
  }, [mainQuery.data]);

  /* ---------------- Heading text reflects the current mode ---------------- */
  const heading = search
    ? `Results for "${search}"`
    : category
    ? category
    : "Discover";

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <CategoryStrip active={category} onChange={setCategory} />

        {/* Popular strip only on default view */}
        {!search && !category && (
          <PopularStrip
            loading={popularQuery.isLoading}
            products={popularQuery.data ?? []}
          />
        )}
      </div>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-3xl font-black tracking-tight text-zinc-950">{heading}</h2>
          {!search && !category && (
            <span className="text-sm font-semibold text-primary">See all</span>
          )}
        </div>

        {mainQuery.isLoading && <Grid skeletonCount={8} />}

        {mainQuery.isError && (
          <div className="squircle-lg bg-red-50/50 p-8 text-center ring-1 ring-red-100">
            <p className="text-sm font-medium text-red-800">
              Couldn’t load products. Try again later.
            </p>
          </div>
        )}

        {!mainQuery.isLoading && products.length === 0 && (
          <div className="squircle-lg bg-zinc-50/50 p-12 text-center ring-1 ring-zinc-100">
            <p className="text-sm font-medium text-zinc-500">
              No products found.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </section>
    </div>
  );
}

/* ---------------- Sub-components, local to this page ---------------- */

function PopularStrip({
  loading,
  products,
}: {
  loading: boolean;
  products: Product[];
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="-mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-2xl font-black tracking-tight text-zinc-950">Popular</h2>
        <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-600 uppercase tracking-wider">🔥 Trending</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-fade-x">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-64 w-48 shrink-0 animate-pulse squircle-lg bg-zinc-200"
              />
            ))
          : products.slice(0, 10).map((p) => (
              <div key={p.id} className="w-48 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}

function Grid({ skeletonCount }: { skeletonCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-2xl bg-zinc-200"
        />
      ))}
    </div>
  );
}