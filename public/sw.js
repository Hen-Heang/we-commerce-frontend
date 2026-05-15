const CACHE = "wc-v1";

const PRECACHE = [
  "/",
  "/market",
  "/offline",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests for same-origin or CDN assets.
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Let API calls go straight to network — never cache them.
  if (url.pathname.startsWith("/api/") || url.hostname !== self.location.hostname && !url.pathname.startsWith("/_next/static/")) {
    return;
  }

  // Static Next.js assets → cache-first (immutable hashed filenames).
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit ?? fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // Pages → network-first, fallback to cache, then /offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(
          (hit) => hit ?? caches.match("/offline")
        )
      )
  );
});
