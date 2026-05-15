"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Store, X, Sparkles } from "lucide-react";

import { updateUserProfile } from "@/lib/user";
import { useShopStore } from "@/store/shopStore";
import type { UserProfile } from "@/types/api";

/**
 * One-step "Open your shop" onboarding.
 *
 * Asks for a shop name. On confirm:
 *   - Saves shop state locally via useShopStore
 *   - Best-effort updates the user's name via PUT /api/v1/user/edit
 *     (so the shop name doubles as the user's display name on listings).
 *   - Closes the modal and lets the parent re-render with the seller dashboard.
 */
export function OpenShopModal({
  open,
  onClose,
  currentProfile,
}: {
  open: boolean;
  onClose: () => void;
  currentProfile?: UserProfile;
}) {
  const [shopName, setShopName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const openShop = useShopStore((s) => s.openShop);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setShopName(currentProfile?.userName ?? currentProfile?.name ?? "");
      setErr(null);
    }
  }, [open, currentProfile]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const save = useMutation({
    mutationFn: async (name: string) => {
      // Best-effort sync to backend — if it fails, we still open the shop locally.
      // The shop name is the user-visible seller identity for all listings.
      try {
        await updateUserProfile({
          userName: name,
          phoneNumber: currentProfile?.phoneNumber ?? "",
          address: currentProfile?.address ?? currentProfile?.shopAdress ?? "",
          photoProfile: currentProfile?.profilePhoto ?? "",
          maplink: currentProfile?.maplink ?? "",
        });
      } catch (e) {
        console.warn("[shop] backend updateUserProfile failed — continuing locally", e);
      }
      openShop(name);
    },
    onSuccess: () => {
      toast.success("🎉 Your shop is open!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      onClose();
    },
    onError: () => {
      toast.error("Could not open shop — please try again");
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = shopName.trim();
    if (trimmed.length < 2) {
      setErr("Shop name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 40) {
      setErr("Shop name must be at most 40 characters");
      return;
    }
    save.mutate(trimmed);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={save.isPending ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 px-6 py-8 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-indigo-300/20 blur-2xl"
          />

          <button
            onClick={onClose}
            disabled={save.isPending}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
          >
            <X className="size-5" />
          </button>

          <span className="relative grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
            <Store className="size-7" strokeWidth={2.25} />
          </span>
          <h2 className="relative mt-4 text-2xl font-black tracking-tight">
            Open your shop
          </h2>
          <p className="relative mt-1 text-sm text-indigo-100/90">
            Choose a name buyers will see on every product you list.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-6">
          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
              Shop name *
            </span>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Heang's Vintage"
              autoFocus
              maxLength={40}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base font-semibold text-zinc-950 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
            />
            <span className="text-xs text-zinc-400">
              You can change this later. {40 - shopName.length} characters left.
            </span>
          </label>

          {/* Preview card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 ring-1 ring-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              <Sparkles className="mr-1 inline size-3" />
              Preview
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              Your products will show as{" "}
              <span className="font-black text-indigo-700">
                {shopName.trim() || "Your shop"}
              </span>{" "}
              on the marketplace.
            </p>
          </div>

          {err && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {err}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={save.isPending}
              className="flex-1 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Not yet
            </button>
            <button
              type="submit"
              disabled={save.isPending || shopName.trim().length < 2}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Store className="size-4" />
              {save.isPending ? "Opening..." : "Open my shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
