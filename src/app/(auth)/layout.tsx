/**
 * Layout for all (auth) routes: /login, /register.
 *
 * The parentheses around (auth) make this a Next.js "route group" —
 * it organizes files without adding a URL segment. So /login stays /login,
 * not /auth/login.
 *
 * Design choices vs. mobile Figma:
 *  - Same purple gradient background
 *  - On desktop, content is centered in a card (max-w-md)
 *  - On mobile (< 640px), card stretches edge-to-edge like the Figma
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-zinc-50">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8 sm:justify-center sm:px-6 sm:py-12 lg:py-20 animate-in fade-in duration-500">
        <div className="w-full rounded-3xl bg-white/50 p-1 backdrop-blur-sm sm:shadow-2xl sm:shadow-indigo-100/60">
          <div className="rounded-[1.4rem] bg-white px-6 py-10 shadow-sm sm:px-8 sm:py-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
