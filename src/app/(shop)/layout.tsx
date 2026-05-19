import { Navbar } from "@/components/shop/Navbar";
import { BottomNav } from "@/components/shop/BottomNav";
import { AuthGuard } from "@/components/shop/AuthGuard";

/**
 * Layout for /market and all authenticated shop pages.
 *
 * Auth guard lives in AuthGuard (client component) so this layout
 * stays a Server Component — avoiding the RSC/Suspense hydration
 * mismatch that occurs when a "use client" layout wraps {children}.
 *
 * Responsive layout:
 *   - Mobile: Top nav (compact) + sticky BottomNav with primary destinations
 *   - Desktop (md+): Full top nav with search; BottomNav hidden
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-dvh flex-col bg-white overflow-x-hidden">
        {/* iOS 25 Luminous Background — subtle mesh gradient */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-accent/5 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[110px]" />
        </div>

        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-32 sm:px-6 md:py-10 md:pb-12 lg:px-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
