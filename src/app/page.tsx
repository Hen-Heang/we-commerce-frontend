"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<string>("(not called yet)");
  const [loading, setLoading] = useState(false);

  async function testConnection() {
    setLoading(true);
    setResult("calling...");
    try {
      // Hits POST /api/v1/auth/loginPhoneNumber/0000
      // We expect an error response from backend — that's fine,
      // it proves frontend → backend connectivity + CORS works.
      const res = await api.post("/auth/loginPhoneNumber/0000");
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err: unknown) {
      // Even errors are good — we just want to see a response.
      const message = err instanceof Error ? err.message : String(err);
      setResult(`ERROR: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">EasyCart — Connection Test</h1>
      <p className="text-sm text-zinc-500">
        API base: {process.env.NEXT_PUBLIC_API_URL}
      </p>

      <button
        onClick={testConnection}
        disabled={loading}
        className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "Testing..." : "Test backend connection"}
      </button>

      <pre className="max-w-xl whitespace-pre-wrap break-words rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
        {result}
      </pre>
    </main>
  );
}
