const CACHE_NAME = 'cairn-v1';

const APP_SHELL_URLS = [
  '/',
  '/explore',
  '/board',
  '/trip',
  '/recommend',
  '/dashboard',
];

// Install: precache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  clients.claim();
});

// Fetch: cache-first for static assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Determine if this is a static asset (fonts, images — NOT JS/CSS from _next which may update)
  const isImmutableAsset = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(
    url.pathname
  );
  // _next/static assets with content hashes are safe to cache-first in production
  const isHashedAsset = url.pathname.startsWith('/_next/static/') &&
    /\.[a-f0-9]{8,}\.(js|css)$/i.test(url.pathname);

  if (isImmutableAsset || isHashedAsset) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Cache the new response for future use
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network-first for HTML pages and API routes
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful HTML responses
          if (networkResponse.ok && request.headers.get('accept')?.includes('text/html')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fall back to cache when network fails
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
  }
});
