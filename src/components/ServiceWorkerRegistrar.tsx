"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Skip in dev: the SW's cache-first handling of /_next/static/ conflicts
    // with Fast Refresh's ever-changing chunk hashes, causing reload loops.
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failure is non-fatal — app works without it.
      });
    }
  }, []);

  return null;
}
