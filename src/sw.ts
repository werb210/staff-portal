/// <reference lib="webworker" />

const APP_SHELL_CACHE = "bf-staff-app-shell-v1";
const OFFLINE_URL = "/offline.html";
const sw = self as unknown as ServiceWorkerGlobalScope;
type BackgroundSyncEvent = ExtendableEvent & { tag?: string };

const isAppShellRequest = (request: Request) => {
  const destination = request.destination;
  return destination === "document" || destination === "script" || destination === "style";
};

const isApiRequest = (request: Request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith("/api");
};

sw.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, "/", "/manifest.json"]).catch(() => undefined)
    )
  );
  sw.skipWaiting();
});

sw.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== APP_SHELL_CACHE).map((key) => caches.delete(key)))
    )
  );
  sw.clients.claim();
});

sw.addEventListener("fetch", (event: FetchEvent) => {
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

sw.addEventListener("sync", (event) => {
  const syncEvent = event as BackgroundSyncEvent;
  if (syncEvent.tag !== "sync-offline-queue") return;
  syncEvent.waitUntil(
    sw.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => clients.forEach((client) => client.postMessage({ type: "SYNC_OFFLINE_QUEUE" })))
  );
});

sw.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;
  const payload = event.data.json() as { title?: string; body?: string; url?: string };
  event.waitUntil(
    Promise.all([
      (() => {
        const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
          body: payload.body ?? "New notification received.",
          tag: "staff-portal",
          vibrate: [80, 60, 80],
          data: { url: payload.url ?? "/" }
        };
        return sw.registration.showNotification(payload.title ?? "Staff Portal Update", notificationOptions);
      })(),
      sw.clients
        .matchAll({ includeUncontrolled: true, type: "window" })
        .then((clients) =>
          clients.forEach((client) =>
            client.postMessage({ type: "PUSH_NOTIFICATION", payload })
          )
        )
    ])
  );
});

sw.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string } | undefined)?.url ?? "/";
  event.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        const client = clients[0];
        if ("navigate" in client) {
          (client as WindowClient).navigate(targetUrl).catch(() => undefined);
        }
        client.focus();
      } else {
        sw.clients.openWindow(targetUrl);
      }
    })
  );
});

export {};
