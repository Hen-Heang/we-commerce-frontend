/**
 * We Commerce wordmark.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`text-4xl font-black tracking-tighter select-none flex items-center gap-1 ${className}`}
      aria-label="We Commerce"
    >
      <div className="flex items-center justify-center bg-indigo-600 text-white rounded-xl size-10 mr-1 shadow-lg shadow-indigo-200">
        <span className="text-2xl">W</span>
      </div>
      <span className="text-zinc-900">We</span>
      <span className="text-indigo-600">Commerce</span>
    </div>
  );
}
