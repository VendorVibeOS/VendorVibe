const CACHE = 'portfolio-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/vendorvibe/', '/vendorvibe/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      return caches.open(CACHE).then((c) => { c.put(e.request, res.clone()); return res; });
    }).catch(() => caches.match('/index.html')))
  );
});