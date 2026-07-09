"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User as UserIcon,
  Package,
  Heart,
  Store,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";

/**
 * Profile dropdown menu — opens from the profile icon in the Navbar.
 *
 * Coupang / Naver / Amazon pattern: clicking the avatar exposes a small
 * floating panel with the user's key destinations rather than going
 * straight to one giant profile page.
 *
 * Sections:
 *   Top:    avatar + name (links to /profile for full account view)
 *   Middle: Orders · Saved · My listings · Addresses
 *   Bottom: Settings · Log out (destructive at the end)
 */
export function ProfileMenu({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);
  const panelRef = useRef<HTMLDivElement>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose, anchorRef]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleLogout() {
    await logout();
    clearCart();
    queryClient.clear();
    onClose();
    toast.success("Logged out");
    router.push("/login");
  }

  if (!open) return null;

  const items = [
    { href: "/orders", icon: Package, label: "My orders", hint: "Track and review" },
    { href: "/saved", icon: Heart, label: "Saved", hint: "Wishlist items" },
    { href: "/sell", icon: Store, label: "My listings", hint: "Sell on the marketplace" },
    { href: "/profile", icon: MapPin, label: "Addresses", hint: "Delivery details" },
  ];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200/80 animate-in fade-in slide-in-from-top-2 duration-150"
      role="menu"
    >
      {/* Header: account summary */}
      <Link
        href="/profile"
        onClick={onClose}
        className="flex items-center gap-3 border-b border-zinc-100 bg-gradient-to-br from-indigo-50 to-white px-5 py-4 hover:bg-indigo-50"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md">
          <UserIcon className="size-5" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-zinc-950">
            {authed ? "My account" : "Welcome"}
          </p>
          <p className="text-xs text-zinc-500">
            {authed ? "View full profile" : "Sign in to continue"}
          </p>
        </div>
        <ChevronRight className="size-4 text-zinc-400" />
      </Link>

      {/* Items */}
      <nav className="py-2" role="none">
        {items.map(({ href, icon: Icon, label, hint }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-zinc-50"
            role="menuitem"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <Icon className="size-4" strokeWidth={2.25} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900">{label}</p>
              <p className="text-[11px] text-zinc-500">{hint}</p>
            </div>
            <ChevronRight className="size-4 text-zinc-300" />
          </Link>
        ))}
      </nav>

      {/* Footer: settings + logout */}
      <div className="border-t border-zinc-100 py-2">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-zinc-50"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
            <Settings className="size-4" strokeWidth={2.25} />
          </span>
          <p className="text-sm font-bold text-zinc-900">Settings</p>
        </Link>

        {authed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-rose-50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-rose-100 text-rose-600">
              <LogOut className="size-4" strokeWidth={2.25} />
            </span>
            <p className="text-sm font-bold text-rose-600">Log out</p>
          </button>
        )}
      </div>
    </div>
  );
}
