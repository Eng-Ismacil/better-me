const CACHE_NAME = "betterme-v2";
const STATIC_ASSETS = [
  "/",
  "/home",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg",
  "/manifest.json"
];

// Install: cache static shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Cache silently fails on dev — that's fine
      });
    })
  );
});

// Activate: purge old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for navigation + API, cache-fallback for assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Never intercept API calls or non-same-origin
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin)
    return;

  if (event.request.mode === "navigate") {
    // Navigation: network first, fall back to /home shell
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/home").then((r) => r || caches.match("/"))
      )
    );
    return;
  }

  // Assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});
