"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShieldCheck, ArrowRight, Smartphone, Star } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { isAuthenticated } from "@/lib/auth";

/**
 * Landing page (`/`).
 * Updated with a modern, interactive design following the project's iOS 25 aesthetic.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/market");
    }
  }, [router]);

  return (
    <div className="mesh-gradient relative min-h-screen overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* Dynamic Mesh Orbs */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[70%] animate-pulse rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] animate-pulse rounded-full bg-indigo-100/40 blur-[120px]" />
      </div>

      {/* Futuristic Floating Header */}
      <header className="fixed top-[max(env(safe-area-inset-top),1.5rem)] left-1/2 z-50 w-[95%] max-w-7xl -translate-x-1/2">
        <div className="glass-spatial squircle-xl flex items-center justify-between px-6 py-3 shadow-2xl">
          <Logo className="scale-[0.85]" />
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-bold text-zinc-600 transition-all hover:text-zinc-950"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="tap-bounce squircle-lg bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-zinc-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32">
        {/* Hero Section: Spatial Design */}
        <section className="relative px-6 pt-20 pb-24 text-center lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Ultra-Modern Badge */}
            <div className="mx-auto mb-10 flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              iOS 26 Design Preview
            </div>

            <h1 className="text-glow text-5xl font-black tracking-tighter text-zinc-900 sm:text-8xl leading-[0.95]">
              Commerce for the{" "}
              <span className="block bg-gradient-to-b from-indigo-500 to-indigo-700 bg-clip-text text-transparent">
                spatial era.
              </span>
            </h1>
            
            <p className="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-zinc-500/80 font-medium">
              Experience the next evolution of local shopping. Faster, more intuitive, and designed to bring your community closer than ever.
            </p>

            <div className="mt-14 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                href="/register"
                className="tap-bounce group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-zinc-900 px-10 py-6 text-xl font-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                Explore Market
                <ArrowRight className="size-6 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link
                href="/login"
                className="tap-bounce glass-spatial flex w-full items-center justify-center rounded-[24px] px-10 py-6 text-xl font-black text-zinc-900 transition-all sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features: Spatial Grid */}
        <section className="px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {[
                {
                  title: "Spatial Discovery",
                  desc: "Browse products with a new sense of depth and hierarchy.",
                  icon: ShoppingBag,
                  gradient: "from-blue-500/10 to-indigo-500/10"
                },
                {
                  title: "Instant Trust",
                  desc: "Verified profiles with real-time community reputation.",
                  icon: ShieldCheck,
                  gradient: "from-indigo-500/10 to-purple-500/10"
                },
                {
                  title: "Pure Speed",
                  desc: "Zero-latency interactions powered by our spatial engine.",
                  icon: Smartphone,
                  gradient: "from-purple-500/10 to-pink-500/10"
                }
              ].map((f, i) => (
                <div key={i} className="spatial-lift glass-spatial squircle-xl group p-8 text-left">
                  <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-zinc-900 shadow-inner`}>
                    <f.icon className="size-7" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-zinc-900">{f.title}</h3>
                  <p className="mt-4 text-lg font-medium leading-relaxed text-zinc-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spatial Trust Section */}
        <section className="px-6 pb-40">
          <div className="mx-auto max-w-7xl">
            <div className="glass-spatial squircle-xl relative overflow-hidden p-12 lg:p-24">
              <div className="absolute top-[-20%] right-[-10%] h-[80%] w-[80%] bg-indigo-500/5 blur-[100px]" />
              <div className="relative mx-auto max-w-3xl text-center">
                <div className="mb-10 flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                  ))}
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 sm:text-5xl italic leading-tight">
                  &quot;The design of the future is finally here. We Commerce makes local shopping feel like magic.&quot;
                </h2>
                <div className="mt-12 flex items-center justify-center gap-4">
                  <div className="size-14 rounded-full bg-zinc-200 ring-4 ring-white shadow-xl" />
                  <div className="text-left">
                    <p className="text-xl font-black text-zinc-900">Alex Rivers</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Early Adopter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Spatial Footer */}
      <footer className="px-6 pb-20">
        <div className="glass-spatial squircle-xl mx-auto max-w-7xl px-8 py-10">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <Logo className="scale-[0.7] grayscale hover:grayscale-0 transition-all duration-700" />
            <div className="flex gap-10 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Spatial Docs</Link>
            </div>
            <p className="text-xs font-bold text-zinc-400">
              © {new Date().getFullYear()} WE COMMERCE. SPATIAL ERA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
