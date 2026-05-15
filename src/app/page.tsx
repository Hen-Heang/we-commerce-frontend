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
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 py-16 sm:max-w-2xl">
        <div className="flex flex-col items-center gap-5 text-center">
          <Logo className="scale-125" />
          <div className="space-y-3 max-w-sm sm:max-w-md">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl leading-tight">
              The next generation of{" "}
              <span className="text-indigo-600">local commerce.</span>
            </h1>
            <p className="text-base text-zinc-500 leading-relaxed sm:text-lg">
              Shop, save, and sell — all in one modern marketplace built for your community.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="rounded-2xl bg-indigo-600 px-6 py-4 text-center text-base font-bold text-white shadow-xl shadow-indigo-200/80 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-center text-base font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98]"
          >
            Create an account
          </Link>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Trusted by local sellers
        </p>
      </div>
    </main>
  );
}
