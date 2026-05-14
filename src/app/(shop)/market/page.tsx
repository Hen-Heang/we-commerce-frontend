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
    <div className="space-y-6">
      <CategoryStrip active={category} onChange={setCategory} />

      {/* Popular strip only on default view */}
      {!search && !category && (
        <PopularStrip
          loading={popularQuery.isLoading}
          products={popularQuery.data ?? []}
        />
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">{heading}</h2>

        {mainQuery.isLoading && <Grid skeletonCount={8} />}

        {mainQuery.isError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn’t load products. Try again later.
          </p>
        )}

        {!mainQuery.isLoading && products.length === 0 && (
          <p className="rounded-lg bg-zinc-100 px-4 py-6 text-center text-sm text-zinc-600">
            No products found.
          </p>
        )}

        {products.length > 0 && (
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
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Popular right now</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-48 w-40 shrink-0 animate-pulse rounded-2xl bg-zinc-200"
              />
            ))
          : products.slice(0, 10).map((p) => (
              <div key={p.id} className="w-40 shrink-0">
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
