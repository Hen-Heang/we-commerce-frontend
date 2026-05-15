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
      <div className="flex gap-2 overflow-x-auto py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) return null;

  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
      <div className="flex gap-2 py-3 w-max sm:w-auto">
        <button
          onClick={() => onChange(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
            active === null
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-indigo-300 hover:text-indigo-600"
          }`}
        >
          All
        </button>
        {data.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.categoryName)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
              active === cat.categoryName
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-indigo-300 hover:text-indigo-600"
            }`}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>
    </div>
  );
}
