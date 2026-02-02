const CACHE_VERSION = "v3";
const RUNTIME_CACHE = `staff-portal-static-${CACHE_VERSION}`;

const isCacheableRequest = (request) => {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) return false;
  if (url.pathname.startsWith("/_") || url.pathname.startsWith("/sockjs-node")) return false;
  if (!url.pathname.endsWith(".js") && !url.pathname.endsWith(".css") && !url.pathname.endsWith(".mjs")) {
    return false;
  }
  return true;
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== RUNTIME_CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      clients.forEach((client) => client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION }));
    })()
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || !event.data.type) return;
  if (event.data.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
  if (event.data.type === "CLEAR_CACHES" || event.data.type === "AUTH_CHANGED") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      })()
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) return;

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return fetch(request);
      }
    })()
  );
});
