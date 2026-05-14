"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, FolderPlus, Heart } from "lucide-react";
import { fetchSavedBookmarks } from "@/lib/bookmarks";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCollectionModal } from "@/components/shop/AddToCollectionModal";
import type { Bookmark } from "@/types/api";

/**
 * Saved page — all products the user has bookmarked.
 * Each tile has a "folder-plus" overlay to add to a collection.
 */
export default function SavedPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce the search input — same idea as your habit/debouncing analogy.
  function onSearchChange(v: string) {
    setSearch(v);
    if (debounceRef !== null) clearTimeout(debounceRef);
    debounceRef = setTimeout(() => setDebounced(v.trim()), 300);
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["saved-bookmarks", debounced],
    queryFn: () => fetchSavedBookmarks(debounced),
  });

  // State for the Add-to-Collection modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBookmark, setPickerBookmark] = useState<Bookmark | null>(null);

  function openPickerFor(bm: Bookmark) {
    setPickerBookmark(bm);
    setPickerOpen(true);
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-zinc-950">Wishlist</h1>
          <p className="text-base font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
            {data ? `${data.length} curated items` : "Your favorite finds"}
          </p>
        </div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
        >
          <FolderPlus className="size-4.5" />
          Manage Collections
        </Link>
      </header>

      {/* Search */}
      <div className="relative group max-w-2xl">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your saved items..."
          className="w-full rounded-[2rem] border border-zinc-200 bg-white px-14 py-4.5 text-base text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/10 transition-all focus:border-indigo-600 focus:ring-[12px] shadow-sm"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-zinc-100" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl bg-red-50 p-8 text-center border border-red-100 max-w-md mx-auto">
          <p className="text-lg font-bold text-red-600">Couldn’t load your wishlist.</p>
          <button onClick={() => window.location.reload()} className="mt-4 font-bold text-red-700 underline">Try again</button>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="rounded-[3rem] bg-zinc-50 px-8 py-20 text-center border-2 border-dashed border-zinc-200 max-w-2xl mx-auto">
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-[2.5rem] bg-white text-zinc-300 shadow-sm">
            <Heart className="size-12" />
          </div>
          <h2 className="text-2xl font-black text-zinc-950 mb-2">No saved items yet</h2>
          <p className="text-base font-medium text-zinc-500 mb-8 max-w-sm mx-auto">
            Explore the marketplace and tap the heart icon on products you love.
          </p>
          <Link
            href="/market"
            className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            Start Exploring
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.map((bm) => (
            <div key={bm.id} className="group relative">
              <ProductCard product={{ ...bm.product, isSaved: true }} />

              {/* Folder-plus overlay button — bottom-left, only on hover (desktop)
                  and always visible on mobile so it's tappable */}
              <button
                onClick={() => openPickerFor(bm)}
                aria-label={`Add ${bm.product.title} to a collection`}
                className="absolute bottom-[6.5rem] left-4 rounded-xl bg-white/95 p-2.5 text-zinc-500 shadow-xl backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-600 hover:scale-110 active:scale-90 md:opacity-0 md:group-hover:opacity-100 border border-zinc-100"
              >
                <FolderPlus className="size-5" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add-to-collection modal */}
      <AddToCollectionModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bookmarkIds={pickerBookmark ? [pickerBookmark.id] : []}
        productTitle={pickerBookmark?.product.title}
      />
    </div>
  );
}

// Module-level debounce timer (avoids re-creating on each render).
let debounceRef: ReturnType<typeof setTimeout> | null = null;
