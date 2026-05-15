"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="grid size-20 place-items-center rounded-[2rem] bg-indigo-600 text-white shadow-lg shadow-indigo-200">
        <span className="text-4xl font-black">W</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-zinc-950">You&apos;re offline</h1>
      <p className="max-w-xs text-sm font-medium text-zinc-500">
        Check your connection and try again. Pages you&apos;ve visited will load from cache.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
