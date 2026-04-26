const CACHE_VERSION = 'v2';
const CACHE_NAME = `main-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './index.js',
  './iconx/android-chrome-192x192.png',
  './assets/favicon.png',
  './offline.html'
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
  console.log('SW Activated');
});

// FETCH STRATEGY
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // HTML → Network First
  if (req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./offline.html')))
    );
    return;
  }

  // JS & CSS → Stale While Revalidate
  if (req.destination === 'script' || req.destination === 'style') {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // IMAGE → Cache First
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
          return res;
        });
      })
    );
    return;
  }
});

// LISTEN SKIP WAITING
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// BROADCAST UPDATE (optional)
function notifyClients() {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ command: 'UPDATE_FOUND' });
    });
  });
}
