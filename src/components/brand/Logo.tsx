/**
 * We Commerce brand logo.
 * Refined with an iOS 25 aesthetic: squircles, vibrant gradients, and premium typography.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`group flex select-none items-center gap-2.5 ${className}`}
      aria-label="We Commerce"
    >
      {/* Icon Container */}
      <div className="relative">
        <div className="squircle-lg flex size-11 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-200/50 transition-transform duration-500 group-hover:scale-105">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <span className="text-2xl font-black tracking-tighter text-white drop-shadow-sm">
            W
          </span>
          
          {/* Status/Verified Dot */}
          <div className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col -space-y-1.5">
        <div className="text-[26px] font-black tracking-tighter leading-none">
          <span className="text-zinc-900">We</span>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Commerce
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 pl-0.5">
          Local Marketplace
        </span>
      </div>
    </div>
  );
}
