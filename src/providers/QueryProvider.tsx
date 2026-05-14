"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * TanStack Query client provider.
 *
 * Why this matters (interview gold):
 *   Server state ≠ client state. Server state has cache invalidation,
 *   refetching, retries, deduplication. TanStack Query handles all of it.
 *
 * Java analogy: this is like Spring's @Cacheable + @Retryable, but for the frontend.
 *
 * Why `useState(() => new QueryClient(...))`:
 *   In React 18+ strict mode, components can re-render. If we did
 *   `const client = new QueryClient()` at module top level, every dev-mode
 *   re-render would discard the cache. Lazy useState gives us one stable client
 *   per component lifecycle.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s — data is considered fresh
            retry: 1, // one retry, then bubble error
            refetchOnWindowFocus: false, // less aggressive than default
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Devtools only render in development by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
