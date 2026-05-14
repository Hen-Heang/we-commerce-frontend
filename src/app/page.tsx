"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { isAuthenticated } from "@/lib/auth";

/**
 * Landing page (`/`).
 *
 * Behavior:
 *   - If already logged in → bounce to /market
 *   - Otherwise → show welcome + Log in / Register buttons
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/market");
    }
  }, [router]);

  return (
    <main className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-zinc-50">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 py-12">
        <Logo className="scale-125 mb-4" />
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            The next generation of <span className="text-indigo-600">local commerce.</span>
          </h1>
          <p className="text-lg text-zinc-600">
            Shop, save, and sell — all in one modern marketplace designed for your community.
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-indigo-600 px-6 py-4 text-center text-lg font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-center text-lg font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300"
          >
            Create an account
          </Link>
        </div>
        
        <div className="mt-12 flex items-center gap-8 opacity-50 grayscale contrast-125">
          {/* Mock partners/trust badges */}
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Trusted by local sellers</div>
        </div>
      </div>
    </main>
  );
}
