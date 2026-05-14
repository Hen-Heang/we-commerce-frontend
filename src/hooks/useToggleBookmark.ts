"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveBookmark, unsaveBookmark } from "@/lib/bookmarks";
import type { Bookmark, PagedItems, Product } from "@/types/api";

/**
 * Optimistic bookmark toggle.
 *
 * THE pattern interviewers love:
 *   1. onMutate fires BEFORE the API call.
 *   2. We snapshot the current cache, then immediately patch it as if the
 *      mutation already succeeded — UI updates with zero latency.
 *   3. If the API actually fails, onError rolls the cache back.
 *   4. onSettled refetches to reconcile with server truth.
 *
 * The end result: heart icon flips INSTANTLY when clicked, even on slow networks.
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      currentlySaved,
    }: {
      productId: number;
      currentlySaved: boolean;
    }) => {
      if (currentlySaved) {
        await unsaveBookmark(productId);
      } else {
        await saveBookmark(productId);
      }
      return { productId, nowSaved: !currentlySaved };
    },

    /* ---------- Optimistic update ---------- */
    onMutate: async ({ productId, currentlySaved }) => {
      // Cancel any in-flight queries that might overwrite our optimistic update.
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["popular-products"] });
      await queryClient.cancelQueries({ queryKey: ["saved-bookmarks"] });

      // Snapshot previous values so we can roll back on error.
      const snapshots = {
        products: queryClient.getQueriesData({ queryKey: ["products"] }),
        popular: queryClient.getQueryData<Product[]>(["popular-products"]),
        saved: queryClient.getQueryData<Bookmark[]>(["saved-bookmarks"]),
        productDetail: queryClient.getQueryData<Product>(["product", productId]),
      };

      const nowSaved = !currentlySaved;

      // Patch every cached product list to flip `isSaved` for this productId.
      queryClient.setQueriesData<PagedItems<Product>>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((p) =>
              p.id === productId ? { ...p, isSaved: nowSaved } : p
            ),
          };
        }
      );

      queryClient.setQueryData<Product[]>(["popular-products"], (old) =>
        old?.map((p) => (p.id === productId ? { ...p, isSaved: nowSaved } : p))
      );

      queryClient.setQueryData<Product>(["product", productId], (old) =>
        old ? { ...old, isSaved: nowSaved } : old
      );

      // Pass snapshots forward to onError for rollback.
      return snapshots;
    },

    onError: (_err, _vars, snapshots) => {
      if (!snapshots) return;
      // Restore every cache we touched.
      snapshots.products.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      queryClient.setQueryData(["popular-products"], snapshots.popular);
      queryClient.setQueryData(["saved-bookmarks"], snapshots.saved);
      if (snapshots.productDetail) {
        queryClient.setQueryData(
          ["product", snapshots.productDetail.id],
          snapshots.productDetail
        );
      }
    },

    onSettled: () => {
      // Refetch the saved list (it's the most likely to drift from optimistic state).
      queryClient.invalidateQueries({ queryKey: ["saved-bookmarks"] });
    },
  });
}
