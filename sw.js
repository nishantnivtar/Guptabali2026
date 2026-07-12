const CACHE = 'bali-2026-v1';
const PRE_CACHE = [
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// Pre-cache key assets on install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for our page, skip map tiles and fonts
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (
    url.includes('tile.openstreetmap') ||
    url.includes('fonts.googleapis') ||
    url.includes('fonts.gstatic')
  ) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
