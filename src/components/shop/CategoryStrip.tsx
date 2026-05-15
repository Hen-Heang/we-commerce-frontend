"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllCategories } from "@/lib/products";

/**
 * Horizontal pill list of categories.
 * Clicking one navigates to /market?cat=NAME.
 */
export function CategoryStrip({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (next: string | null) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
  });

  if (isLoading) {
    // Skeleton: 6 grey pills
    return (
      <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-zinc-100"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) return null;

  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
      <div className="flex gap-2.5 py-3 w-max">
        <button
          onClick={() => onChange(null)}
          className={`tap-bounce shrink-0 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all ${
            active === null
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-white text-zinc-600 ring-1 ring-zinc-200/60 hover:text-primary"
          }`}
        >
          All
        </button>
        {data.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.categoryName)}
            className={`tap-bounce shrink-0 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all ${
              active === cat.categoryName
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200/60 hover:text-primary"
            }`}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>
    </div>
  );
}
