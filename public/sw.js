const CACHE_NAME = 'reiki-sage-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Install cache assets (fail-safe for offline checks)
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Pass-through network-first strategy to prevent stale caches during development
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || caches.match('/');
      });
    })
  );
});
