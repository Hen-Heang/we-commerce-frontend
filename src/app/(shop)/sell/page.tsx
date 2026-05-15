"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Package,
  Tag,
  TrendingUp,
  ImageIcon,
  X,
  Store,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { fetchAllCategories, createProduct } from "@/lib/products";
import { fetchUserProfile } from "@/lib/user";
import { resolvePhotoUrl } from "@/lib/image";
import type { ProductCreateRequest, Product } from "@/types/api";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useShopStore } from "@/store/shopStore";
import { OpenShopModal } from "@/components/shop/OpenShopModal";

/**
 * Seller Dashboard.
 *
 * Coupang / Naver / Amazon "Seller Center" pattern:
 *   - KPI strip at top (Active / Sold / Drafts) — even if static for now
 *   - Big "List new product" CTA
 *   - Grid of my current listings
 *   - Modal form for creating a product
 *
 * Backend: POST /api/v1/item/postProduct?categoryName=
 */

export default function SellDashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openShopOpen, setOpenShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isShopOpen = useShopStore((s) => s.isShopOpen);
  const shopName = useShopStore((s) => s.shopName);

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  // Wait until Zustand persist hydrates before deciding what to render.
  // Otherwise the dashboard would briefly flash before the onboarding card.
  if (!mounted) return null;

  // First-time experience: user hasn't opened their shop yet.
  if (!isShopOpen) {
    return (
      <>
        <OnboardingHero onOpen={() => setOpenShopOpen(true)} />
        <OpenShopModal
          open={openShopOpen}
          onClose={() => setOpenShopOpen(false)}
          currentProfile={profileQuery.data}
        />
      </>
    );
  }

  // For the demo, "my listings" reuses MOCK_PRODUCTS as the seller's
  // hypothetical inventory. In production this hits /item/allItemSelling.
  const mine: Product[] = MOCK_PRODUCTS.slice(0, 6);

  const stats = [
    { label: "Active", value: mine.length, icon: Tag, tone: "from-indigo-500 to-indigo-700" },
    { label: "Sold", value: 12, icon: TrendingUp, tone: "from-emerald-500 to-emerald-700" },
    { label: "Drafts", value: 0, icon: Package, tone: "from-amber-500 to-amber-700" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500">
            <Store className="size-3.5" strokeWidth={3} />
            Your shop
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-950">
            {shopName ?? "Seller Center"}
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            Manage your listings, track sales, post new products.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2.5} />
          List New Product
        </button>
      </header>

      {/* KPI strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50"
          >
            <div className="flex items-center gap-4">
              <span
                className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}
              >
                <Icon className="size-6" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-3xl font-black tracking-tight text-zinc-950">
                  {value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* My listings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-zinc-950">
            My listings
          </h2>
          <Link
            href="/orders"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View orders →
          </Link>
        </div>

        {mine.length === 0 ? (
          <div className="rounded-3xl bg-zinc-50 px-6 py-16 text-center border-2 border-dashed border-zinc-200">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white text-zinc-300 shadow-sm">
              <Package className="size-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-zinc-950 mb-1">
              No listings yet
            </h3>
            <p className="text-sm text-zinc-500 mb-5">
              Add your first product to start selling.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              List New Product
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/market/product/${p.id}`}
                  className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/50 transition-all hover:shadow-xl hover:ring-indigo-200 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePhotoUrl(p.photo?.[0]?.photo)}
                      alt={p.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="line-clamp-1 text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-zinc-950">
                        ${p.price?.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Active
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreateProductModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

/* ============================================================
 * Onboarding hero — first-time experience before opening a shop
 * ============================================================ */
function OnboardingHero({ onOpen }: { onOpen: () => void }) {
  const benefits = [
    "Reach buyers across the marketplace",
    "Track active listings and sales in one place",
    "Set your own price, condition, and shipping",
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 text-white shadow-2xl shadow-indigo-200 sm:p-12">
        {/* Decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-indigo-300/20 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-white/30 backdrop-blur-sm">
            <Sparkles className="size-3" />
            Become a seller
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Start selling on We&nbsp;Commerce
          </h1>
          <p className="mt-3 text-base text-indigo-100/90 sm:text-lg">
            Open your shop in 30 seconds. Pick a name, then list your first product.
          </p>

          <ul className="mt-6 space-y-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-sm font-medium text-indigo-50"
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">
                  <span className="size-2 rounded-full bg-white" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <button
            onClick={onOpen}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-indigo-700 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Store className="size-5" strokeWidth={2.5} />
            Open my shop
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      {/* Secondary card explaining what happens after */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Tag, title: "1. Open your shop", text: "Pick a name buyers will see." },
          { icon: Plus, title: "2. List a product", text: "Title, price, photo, category." },
          { icon: TrendingUp, title: "3. Start selling", text: "Buyers can order right away." },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/50"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="size-5" strokeWidth={2.25} />
            </span>
            <p className="mt-3 text-sm font-black text-zinc-950">{title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ============================================================
 * Create-product modal
 * ============================================================ */
function CreateProductModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const emptyForm: ProductCreateRequest = {
    title: "",
    price: 0,
    description: "",
    codition: "",
    brand: "",
    photo: [],
    // Backend's ProductServiceImp does `discountValues < 0` and
    // `discountType == true` without null checks → NPE if these are missing.
    // Send safe defaults so the request succeeds.
    discountValues: 0,
    discountType: false,
  };

  const [form, setForm] = useState<ProductCreateRequest>(emptyForm);
  const [category, setCategory] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
    enabled: open,
  });

  const submit = useMutation({
    mutationFn: () => {
      const photos = photoUrl.trim() ? [{ id: 0, photo: photoUrl.trim() }] : [];
      return createProduct({ ...form, photo: photos }, category);
    },
    onSuccess: () => {
      toast.success("Product listed!");
      setForm(emptyForm);
      setPhotoUrl("");
      setCategory("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message ?? "Failed to create product"),
  });

  function set<K extends keyof ProductCreateRequest>(
    k: K,
    v: ProductCreateRequest[K]
  ) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black tracking-tight text-zinc-950">
              List a new product
            </h2>
            <p className="text-xs text-zinc-500">
              Make it visible to all buyers on the marketplace.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="size-5" />
          </button>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
        >
          <Field
            label="Title *"
            value={form.title}
            onChange={(v) => set("title", v)}
            placeholder="What are you selling?"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Price (USD) *
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ""}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
                placeholder="0.00"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Category *
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
              >
                <option value="">Select a category</option>
                {(categoriesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Condition"
              value={form.codition ?? ""}
              onChange={(v) => set("codition", v)}
              placeholder="New / Used / Refurbished"
            />
            <Field
              label="Brand"
              value={form.brand ?? ""}
              onChange={(v) => set("brand", v)}
              placeholder="Brand name"
            />
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
              Photo URL
            </span>
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-zinc-300 bg-white pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
              Description
            </span>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 resize-none"
              placeholder="Tell buyers about your product..."
            />
          </label>
        </form>

        <footer className="flex gap-3 border-t border-zinc-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => submit.mutate()}
            disabled={submit.isPending || !form.title || !form.price || !category}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            <Package className="size-4" />
            {submit.isPending ? "Listing..." : "List product"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20"
      />
    </label>
  );
}
