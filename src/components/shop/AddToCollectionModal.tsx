"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus, FolderHeart, Check } from "lucide-react";
import {
  fetchAllCollections,
  createCollection,
  addBookmarksToCollection,
} from "@/lib/collections";
import { resolvePhotoUrl } from "@/lib/image";

/**
 * "Add to collection" modal.
 *
 * Takes one or more bookmark IDs, shows the user's collections, lets them
 * pick one (or create a new one inline), then PUTs to the backend.
 *
 * Used from:
 *   - Saved page (per-item folder-plus button)
 *   - Product detail (after saving)
 */
export function AddToCollectionModal({
  open,
  onClose,
  bookmarkIds,
  productTitle,
}: {
  open: boolean;
  onClose: () => void;
  bookmarkIds: number[];
  productTitle?: string;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setCreating(false);
      setNewName("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: fetchAllCollections,
    enabled: open, // don't fetch until modal is open
  });

  const addMutation = useMutation({
    mutationFn: async (collectionId: number) => {
      await addBookmarksToCollection(collectionId, bookmarkIds);
      return collectionId;
    },
    onSuccess: (collectionId) => {
      const target = collectionsQuery.data?.find((c) => c.id === collectionId);
      toast.success(
        `Added ${productTitle ? `"${productTitle}"` : "items"} to ${
          target?.name ?? "collection"
        }`
      );
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not add"),
  });

  const createAndAddMutation = useMutation({
    mutationFn: async (name: string) => {
      const created = await createCollection(name);
      await addBookmarksToCollection(created.id, bookmarkIds);
      return created;
    },
    onSuccess: (created) => {
      toast.success(`Created "${created.name}" and added ${bookmarkIds.length} item${bookmarkIds.length === 1 ? "" : "s"}`);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message ?? "Could not create"),
  });

  if (!open) return null;

  const isWorking = addMutation.isPending || createAndAddMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={isWorking ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-collection-title"
    >
      <div
        className="flex w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-100 p-5">
          <h2 id="add-to-collection-title" className="text-lg font-semibold text-zinc-900">
            Add to collection
          </h2>
          <button
            onClick={onClose}
            disabled={isWorking}
            aria-label="Close"
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {/* Create new inline */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="mb-3 flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-3 text-left text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="size-5" />
              Create new collection
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = newName.trim();
                if (!trimmed) return;
                createAndAddMutation.mutate(trimmed);
              }}
              className="mb-3 space-y-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-3"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                placeholder="Collection name"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                  }}
                  className="flex-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAndAddMutation.isPending || !newName.trim()}
                  className="flex-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {createAndAddMutation.isPending ? "Creating..." : "Create & add"}
                </button>
              </div>
            </form>
          )}

          {/* Existing collections */}
          {collectionsQuery.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-200" />
              ))}
            </div>
          )}

          {collectionsQuery.data && collectionsQuery.data.length === 0 && !creating && (
            <p className="px-1 py-2 text-sm text-zinc-600">
              You don’t have any collections yet. Create one above.
            </p>
          )}

          {collectionsQuery.data && collectionsQuery.data.length > 0 && (
            <ul className="space-y-2">
              {collectionsQuery.data.map((col) => {
                const isSelected = selectedId === col.id;
                const previews = (col.photo ?? []).slice(0, 2);
                return (
                  <li key={col.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(col.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-2 text-left transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      {/* Preview thumbnails or fallback icon */}
                      <span className="grid size-12 shrink-0 grid-cols-2 overflow-hidden rounded-lg bg-zinc-100">
                        {previews.length > 0 ? (
                          previews.map((p, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={i}
                              src={resolvePhotoUrl(p)}
                              alt=""
                              className={`size-full object-cover ${
                                previews.length === 1 ? "col-span-2" : ""
                              }`}
                            />
                          ))
                        ) : (
                          <span className="col-span-2 grid place-items-center text-indigo-600">
                            <FolderHeart className="size-5" />
                          </span>
                        )}
                      </span>

                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-zinc-900">
                          {col.name}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {(col.photo?.length ?? 0)} item
                          {(col.photo?.length ?? 0) === 1 ? "" : "s"}
                        </span>
                      </span>

                      {isSelected && (
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-white">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer className="flex gap-2 border-t border-zinc-100 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedId !== null && addMutation.mutate(selectedId)}
            disabled={selectedId === null || isWorking}
            className="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {addMutation.isPending ? "Adding..." : "Add"}
          </button>
        </footer>
      </div>
    </div>
  );
}
