"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import { fetchProductById } from "@/lib/products";
import { resolvePhotoUrl } from "@/lib/image";
import { useCartStore } from "@/store/cartStore";
import { useToggleBookmark } from "@/hooks/useToggleBookmark";

/**
 * Product detail page. Minimal v1 — image, title, price, status.
 * Wire up add-to-cart and bookmark in the next phase.
 *
 * Next.js 15+ passes route params as a Promise — we `use()` to unwrap it.
 */
export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const productId = Number(id);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleBookmark = useToggleBookmark();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: !Number.isNaN(productId),
  });

  function handleBuyNow() {
    if (!data) return;
    addItem(data, 1);
    router.push("/cart");
  }

  function handleAddToCart() {
    if (!data) return;
    addItem(data, 1);
    toast.success(`Added "${data.title}" to cart`);
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/market"
        className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-indigo-50 transition-colors">
          <ArrowLeft className="size-4" />
        </div>
        Back to marketplace
      </Link>

      {isLoading && (
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-zinc-200" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-zinc-200" />
            <div className="h-12 w-1/3 animate-pulse rounded-xl bg-zinc-200" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-zinc-200" />
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-3xl bg-red-50 p-8 text-center border border-red-100">
          <p className="text-lg font-bold text-red-600">
            Couldn’t load this product.
          </p>
          <Link href="/market" className="mt-4 inline-block font-bold text-red-700 underline">Return home</Link>
        </div>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 shadow-xl shadow-indigo-100/40 ring-1 ring-zinc-200/50 sm:aspect-square sm:rounded-[2.5rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvePhotoUrl(data.photo?.[0]?.photo)}
              alt={data.title}
              className="size-full object-cover transition-transform duration-700 hover:scale-110"
            />
          </div>

          <div className="flex flex-col justify-center space-y-5 lg:space-y-8 lg:py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {data.status && (
                  <span className="inline-block rounded-lg bg-zinc-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    {data.status}
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authentic Product</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl leading-tight">
                {data.title}
              </h1>
              <p className="text-3xl font-black text-indigo-600 sm:text-4xl">
                ${data.price?.toFixed(2) ?? "—"}
              </p>
            </div>

            <div className="h-px bg-zinc-100" />

            <p className="text-sm font-medium text-zinc-500 leading-relaxed">
              Experience premium quality with this {data.title}. Designed for those who value both style and functionality in their daily lives.
            </p>

            {/* Mobile-optimised CTA stack */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-2xl bg-zinc-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Buy Now
                </button>
                <button
                  onClick={() =>
                    toggleBookmark.mutate({
                      productId: data.id,
                      currentlySaved: !!data.isSaved,
                    })
                  }
                  aria-label={data.isSaved ? "Unsave" : "Save"}
                  className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-4 text-zinc-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-[0.98]"
                >
                  <Heart
                    className={`size-5 transition-colors ${
                      data.isSaved ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-6 py-4 text-base font-bold text-zinc-950 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98]"
              >
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Shipping</p>
                <p className="text-sm font-bold text-zinc-900">Free Express</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3.5 border border-zinc-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Returns</p>
                <p className="text-sm font-bold text-zinc-900">30-Day Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
