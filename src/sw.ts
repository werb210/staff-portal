/// <reference lib="webworker" />

const APP_SHELL_CACHE = "bf-staff-app-shell-v1";
const OFFLINE_URL = "/offline.html";

const isAppShellRequest = (request: Request) => {
  const destination = request.destination;
  return destination === "document" || destination === "script" || destination === "style";
};

const isApiRequest = (request: Request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api");
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, "/"]).catch(() => undefined)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== APP_SHELL_CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "Offline" }), { status: 503 }))
    );
    return;
  }

  if (isAppShellRequest(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, responseClone));
            return response;
          })
          .catch(async () => {
            if (request.mode === "navigate") {
              const fallback = await caches.match(OFFLINE_URL);
              if (fallback) return fallback;
            }
            return new Response("Offline", { status: 503 });
          });
      })
    );
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "sync-offline-queue") return;
  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => clients.forEach((client) => client.postMessage({ type: "SYNC_OFFLINE_QUEUE" })))
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json() as { title?: string; body?: string };
  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Staff Portal Update", {
      body: payload.body ?? "New notification received.",
      tag: "staff-portal"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});

export {};
