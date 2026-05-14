"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shop/Navbar";
import { BottomNav } from "@/components/shop/BottomNav";
import { isAuthenticated } from "@/lib/auth";

/**
 * Layout for /market and all authenticated shop pages.
 *
 * Auth guard:
 *   If no token in localStorage → bounce to /login.
 *   Client-side only — for production add server-side middleware.ts.
 *
 * Responsive layout:
 *   - Mobile: Top nav (compact) + sticky BottomNav with primary destinations
 *   - Desktop (md+): Full top nav with search; BottomNav hidden
 *
 * Bottom padding on <main> reserves space so the BottomNav never covers content.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50/50">
      <Navbar />
      <main
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-32 sm:px-6 md:py-12 md:pb-12 lg:px-8"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
