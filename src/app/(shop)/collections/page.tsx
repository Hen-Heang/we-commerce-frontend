"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { fetchAllCollections, deleteCollection } from "@/lib/collections";
import { resolvePhotoUrl } from "@/lib/image";
import { NewCollectionModal } from "@/components/shop/NewCollectionModal";

/**
 * Collections list page.
 * Each collection shows a 2x2 photo grid preview + name + delete button.
 */
export default function CollectionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchAllCollections,
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteCollection(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Collections</h1>
          <p className="text-sm text-zinc-600">
            Group your saved products into themed boards.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          New collection
        </button>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn’t load collections.
        </p>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="rounded-2xl bg-zinc-100 px-6 py-12 text-center">
          <p className="text-sm text-zinc-700">No collections yet.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 inline-block rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Create your first collection
          </button>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <article
              key={c.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:shadow-md"
            >
              <Link href={`/collections/${c.id}`} className="block">
                <CollectionPhotoGrid photos={c.photo ?? []} />
                <div className="space-y-1 p-4">
                  <h3 className="line-clamp-1 font-semibold text-zinc-900">{c.name}</h3>
                  <p className="text-xs text-zinc-500">
                    {(c.photo?.length ?? 0)} item
                    {(c.photo?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id);
                }}
                aria-label="Delete collection"
                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-zinc-500 opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-rose-600"
              >
                <Trash2 className="size-4" />
              </button>
            </article>
          ))}
        </div>
      )}

      <NewCollectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

/* 2x2 preview grid — adapts to 0, 1, 2, 3, or 4+ photos */
function CollectionPhotoGrid({ photos }: { photos: string[] }) {
  const slots = photos.slice(0, 4);
  while (slots.length < 4) slots.push(""); // pad to 4 placeholders

  return (
    <div className="grid aspect-[5/3] grid-cols-2 grid-rows-2 gap-px bg-zinc-100">
      {slots.map((p, i) => (
        <div key={i} className="overflow-hidden bg-zinc-200">
          {p ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvePhotoUrl(p)} alt="" className="size-full object-cover" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
