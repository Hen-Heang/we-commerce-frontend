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
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12 sm:justify-center lg:py-20 animate-in fade-in duration-700">
        <div className="w-full rounded-[2.5rem] bg-white/40 p-1 backdrop-blur-sm sm:shadow-2xl sm:shadow-indigo-100/50">
          <div className="rounded-[2.25rem] bg-white px-8 py-12 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
