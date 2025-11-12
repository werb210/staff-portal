const CACHE_NAME = 'staff-portal-cache-v2';
const API_CACHE = 'staff-portal-api-v1';
const OFFLINE_URLS = ['/', '/applications', '/pipeline', '/notifications', '/crm'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) =>
        fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached ||
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match('/'))
    )
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Staff Portal', body: 'New notification' };
  void self.registration.showNotification(data.title, {
    body: data.body,
  });
});
