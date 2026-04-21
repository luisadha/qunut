const CACHE_NAME = "drawercli-v3";
const FILES_TO_CACHE = [
  "/drawercli-aurora/",
  "/drawercli-aurora/index.html",
  "/drawercli-aurora/index.js",
  "/drawercli-aurora/assets/js/btn-share.js",
  "/drawercli-aurora/assets/css/style.css",
];

// install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// fetch: offline-first + background update
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => cachedResponse);
      return cachedResponse || networkFetch;
    })
  );
});
