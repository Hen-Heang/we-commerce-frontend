"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  fetchCollectionById,
  deleteCollection,
  renameCollection,
} from "@/lib/collections";
import { resolvePhotoUrl } from "@/lib/image";

/**
 * Collection detail page.
 * Shows the collection name, its preview photos, and rename / delete actions.
 *
 * NOTE: The backend's CollectionResponse doesn't expose the full bookmark list
 * per collection (it's commented out in CollectionResponse.java). For now we
 * just show the `photo` previews. To get full products we'd need a backend tweak.
 */
export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const collectionId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => fetchCollectionById(collectionId),
    enabled: !Number.isNaN(collectionId),
  });

  const rename = useMutation({
    mutationFn: (newName: string) => renameCollection(collectionId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const del = useMutation({
    mutationFn: () => deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      router.push("/collections");
    },
  });

  function handleRename() {
    const next = prompt("Rename collection", data?.name ?? "");
    if (next && next.trim() && next !== data?.name) {
      rename.mutate(next.trim());
    }
  }

  function handleDelete() {
    if (confirm(`Delete "${data?.name}"? This can't be undone.`)) {
      del.mutate();
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to collections
      </Link>

      {isLoading && (
        <>
          <div className="h-8 w-1/2 animate-pulse rounded bg-zinc-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-zinc-200" />
            ))}
          </div>
        </>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn’t load this collection.
        </p>
      )}

      {data && (
        <>
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{data.name}</h1>
              <p className="text-sm text-zinc-600">
                {data.photo?.length ?? 0} item
                {(data.photo?.length ?? 0) === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRename}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <Pencil className="size-4" />
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </header>

          {(data.photo?.length ?? 0) === 0 ? (
            <div className="rounded-2xl bg-zinc-100 px-6 py-12 text-center">
              <p className="text-sm text-zinc-700">
                No items in this collection yet.
              </p>
              <Link
                href="/saved"
                className="mt-3 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Go to saved
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.photo!.map((p, idx) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvePhotoUrl(p)}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
