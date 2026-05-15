"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, MapPin, Plus, Trash2, LogOut, ShieldAlert, Save, User as UserIcon, Package, Wallet } from "lucide-react";

import { fetchUserProfile, updateUserProfile, deleteUserAccount } from "@/lib/user";
import { fetchAddresses, deleteAddress } from "@/lib/addresses";
import { fetchAllCategories, createProduct } from "@/lib/products";
import { useCartStore } from "@/store/cartStore";
import { clearTokens } from "@/lib/auth";
import { ConfirmDialog } from "@/components/shop/ConfirmDialog";
import { SavedPaymentMethodsList } from "@/components/shop/SavedPaymentMethodsList";
import type { UserProfile, UserProfileUpdate, ProductCreateRequest } from "@/types/api";

/**
 * Profile page — three sections:
 *   1. Account info (view + inline edit)
 *   2. Addresses (list, view, delete)
 *   3. Danger zone (logout, delete account)
 */
export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  /* ---------------- Logout ---------------- */
  const [logoutOpen, setLogoutOpen] = useState(false);
  function handleLogout() {
    clearTokens();
    clearCart();
    queryClient.clear();
    toast.success("Logged out");
    router.push("/login");
  }

  /* ---------------- Delete account ---------------- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteAcct = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      clearTokens();
      clearCart();
      queryClient.clear();
      toast.success("Account deleted");
      router.push("/");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Could not delete account");
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-zinc-950">Settings</h1>
        <p className="text-base font-medium text-zinc-400 uppercase tracking-widest text-[10px]">
          Personalize your marketplace experience
        </p>
      </header>

      <div className="space-y-8">
        <AccountSection
          profile={profileQuery.data}
          loading={profileQuery.isLoading}
        />

        <AddressesSection
          addresses={addressesQuery.data}
          loading={addressesQuery.isLoading}
          onDelete={(id) => {
            if (!confirm("Delete this address?")) return;
            deleteAddress(id)
              .then(() => {
                toast.success("Address removed");
                queryClient.invalidateQueries({ queryKey: ["addresses"] });
              })
              .catch((e: Error) => toast.error(e.message));
          }}
        />

        <PaymentMethodsSection />

        {/* Danger zone */}
        <section className="rounded-3xl border border-rose-100 bg-rose-50/20 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-rose-600">
              <ShieldAlert className="size-6" strokeWidth={2.5} />
              Security & Privacy
            </h2>
            <p className="text-sm font-medium text-rose-900/60 leading-relaxed">
              Managing these settings will affect your account access and data permanence.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setLogoutOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="size-4.5" />
              Sign Out
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Trash2 className="size-4.5" />
              Deactivate Account
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        description="You'll need to sign in again to access your saved items and cart."
        confirmLabel="Log out"
        onConfirm={() => {
          setLogoutOpen(false);
          handleLogout();
        }}
        onClose={() => setLogoutOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        description="This permanently removes your account, products, bookmarks, and order history. This cannot be undone."
        confirmLabel="Yes, delete my account"
        danger
        isLoading={deleteAcct.isPending}
        onConfirm={() => deleteAcct.mutate()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

/* ============================================================
 * Account info section — view + inline edit
 * ============================================================ */
function AccountSection({
  profile,
  loading,
}: {
  profile: UserProfile | undefined;
  loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  if (loading) {
    return <SectionSkeleton title="Profile Information" />;
  }
  if (!profile) {
    return (
      <Section title="Profile Information">
        <p className="text-sm font-medium text-zinc-500">Couldn't load your profile.</p>
      </Section>
    );
  }

  const displayName = profile.userName || profile.name || "—";
  const phone = profile.phoneNumber || "—";
  const address = profile.address || profile.shopAdress || "—";
  const email = profile.email || "—";

  if (editing) {
    return (
      <AccountEditForm
        profile={profile}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        }}
      />
    );
  }

  return (
    <Section
      title="Profile Information"
      action={
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Pencil className="size-3.5" />
          Edit Profile
        </button>
      }
    >
      <div className="flex items-center gap-6">
        <Avatar src={profile.profilePhoto ?? ""} name={displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-black tracking-tight text-zinc-950">
            {displayName}
          </p>
          <p className="truncate text-sm font-bold text-zinc-400">{email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Detail label="Phone" value={phone} />
        <Detail label="Location" value={address} />
        <Detail label="External Link" value={profile.maplink || "—"} isLink />
        <Detail label="Member Since" value={fmtDate(profile.createDate ?? profile.createdAt)} />
      </div>
    </Section>
  );
}

function AccountEditForm({
  profile,
  onCancel,
  onSaved,
}: {
  profile: UserProfile;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<UserProfileUpdate>({
    userName: profile.userName ?? profile.name ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    address: profile.address ?? profile.shopAdress ?? "",
    photoProfile: profile.profilePhoto ?? "",
    maplink: profile.maplink ?? "",
  });

  const save = useMutation({
    mutationFn: (v: UserProfileUpdate) => updateUserProfile(v),
    onSuccess: () => {
      toast.success("Profile updated");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message ?? "Update failed"),
  });

  function set<K extends keyof UserProfileUpdate>(k: K, v: UserProfileUpdate[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate(values);
  }

  return (
    <Section title="Update Information">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full Name"
            value={values.userName}
            onChange={(v) => set("userName", v)}
          />
          <Field
            label="Phone Number"
            value={values.phoneNumber}
            onChange={(v) => set("phoneNumber", v)}
          />
          <Field
            label="Residential Address"
            value={values.address}
            onChange={(v) => set("address", v)}
          />
          <Field
            label="Profile Photo URL"
            value={values.photoProfile}
            onChange={(v) => set("photoProfile", v)}
            placeholder="https://..."
          />
        </div>
        <Field
          label="Map / Location URL"
          value={values.maplink}
          onChange={(v) => set("maplink", v)}
          placeholder="https://maps.google.com/..."
        />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
          >
            <Save className="size-4.5" />
            {save.isPending ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </form>
    </Section>
  );
}

/* ============================================================
 * Addresses section
 * ============================================================ */
function AddressesSection({
  addresses,
  loading,
  onDelete,
}: {
  addresses: { id: number; label: string; contact: string; telephone: string; address: string; detail: string }[] | undefined;
  loading: boolean;
  onDelete: (id: number) => void;
}) {
  if (loading) return <SectionSkeleton title="Delivery addresses" />;

  return (
    <Section
      title="Delivery addresses"
      action={
        <a
          href="/checkout"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <Plus className="size-3.5" />
          Add New
        </a>
      }
    >
      {!addresses || addresses.length === 0 ? (
        <p className="text-sm font-medium text-zinc-500">
          You haven't added any addresses yet. Add one during checkout.
        </p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50"
            >
              <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <MapPin className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-950">
                  {addr.label} · {addr.contact}
                </p>
                <p className="text-xs font-bold text-zinc-400 mt-0.5">{addr.telephone}</p>
                <p className="text-xs font-medium text-zinc-600 mt-1">
                  {addr.address}
                  {addr.detail ? ` — ${addr.detail}` : ""}
                </p>
              </div>
              <button
                onClick={() => onDelete(addr.id)}
                aria-label="Delete address"
                className="rounded-xl p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
              >
                <Trash2 className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ============================================================
 * My Products section — list + create form
 * ============================================================ */
function MyProductsSection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchAllCategories,
  });

  const empty: ProductCreateRequest = {
    title: "",
    price: 0,
    description: "",
    codition: "",
    brand: "",
    photo: [],
  };
  const [form, setForm] = useState<ProductCreateRequest>(empty);
  const [category, setCategory] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const submit = useMutation({
    mutationFn: () => {
      const photos = photoUrl.trim()
        ? [{ id: 0, photo: photoUrl.trim() }]
        : [];
      return createProduct({ ...form, photo: photos }, category);
    },
    onSuccess: () => {
      toast.success("Product listed!");
      setForm(empty);
      setPhotoUrl("");
      setCategory("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Failed to create product"),
  });

  function set<K extends keyof ProductCreateRequest>(k: K, v: ProductCreateRequest[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  return (
    <Section
      title="My Products"
      action={
        !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="size-3.5" />
            Create New Product
          </button>
        ) : undefined
      }
    >
      {!showForm ? (
        <p className="text-sm font-medium text-zinc-500">
          Click <span className="font-bold text-zinc-800">Create New Product</span> to list an item for sale.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Title *"
              value={form.title}
              onChange={(v) => set("title", v)}
              placeholder="What are you selling?"
            />
            <label className="block space-y-2">
              <span className="text-sm font-bold text-zinc-900 ml-1">Price (USD) *</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price || ""}
                onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4"
                placeholder="0.00"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-zinc-900 ml-1">Category *</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4"
              >
                <option value="">Select a category</option>
                {(categoriesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.categoryName}>{c.categoryName}</option>
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
            <Field
              label="Photo URL"
              value={photoUrl}
              onChange={setPhotoUrl}
              placeholder="https://..."
            />
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-zinc-900 ml-1">Description</span>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 resize-none"
              placeholder="Describe your product…"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submit.isPending || !form.title || !form.price || !category}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
            >
              <Package className="size-4.5" />
              {submit.isPending ? "Listing…" : "List Product"}
            </button>
          </div>
        </form>
      )}
    </Section>
  );
}

/* ============================================================
 * Tiny helpers (local)
 * ============================================================ */
function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-zinc-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-zinc-950">{title}</h2>
      </div>
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-50" />
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-50" />
      </div>
    </section>
  );
}

/* ============================================================
 * Payment methods section
 * ============================================================ */
function PaymentMethodsSection() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200/50">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-zinc-950">
          <Wallet className="size-5 text-indigo-600" />
          Payment methods
        </h2>
      </div>
      <p className="mb-5 text-sm text-zinc-500">
        Manage your saved payment methods. The default one is pre-selected at checkout.
      </p>
      <SavedPaymentMethodsList mode="manage" />
      <p className="mt-4 text-[11px] font-medium text-zinc-400">
        🔒 Card numbers are never stored — we keep only the brand and last 4 digits.
      </p>
    </section>
  );
}

function Detail({ label, value, isLink = false }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="space-y-1">
      <dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</dt>
      <dd className={`text-sm font-bold ${isLink ? "text-indigo-600 underline underline-offset-4" : "text-zinc-950"}`}>
        {value}
      </dd>
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
      <span className="text-sm font-bold text-zinc-900 ml-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-950 placeholder:text-zinc-400 outline-none ring-indigo-500/20 transition-all focus:border-indigo-600 focus:bg-white focus:ring-4"
      />
    </label>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src && (src.startsWith("http") || src.startsWith("data:"))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="size-20 shrink-0 rounded-[2rem] object-cover ring-4 ring-indigo-50 shadow-lg shadow-indigo-100"
      />
    );
  }
  return (
    <span className="grid size-20 shrink-0 place-items-center rounded-[2rem] bg-indigo-600 text-white shadow-lg shadow-indigo-200">
      {initials ? (
        <span className="text-2xl font-black">{initials}</span>
      ) : (
        <UserIcon className="size-8" strokeWidth={2.5} />
      )}
    </span>
  );
}

function fmtDate(s: string | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
