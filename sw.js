/*
 * Service Worker Grizzlift — hors-ligne complet.
 * Stratégie "réseau d'abord" : la dernière version est chargée dès que le réseau répond
 * (en moins de 3 s), sinon la copie en cache prend le relais (salle sans réseau).
 * Les images d'exercice ajoutées plus tard sont mises en cache dès leur premier affichage.
 */
const CACHE = 'grizzlift-v17';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/plus-jakarta-sans.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = (await cache.match(req, { ignoreSearch: true }))
      || (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);

    const network = fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => null);

    if (!cached) return (await network) || new Response('', { status: 504, statusText: 'Hors ligne' });
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
    const fresh = await Promise.race([network, timeout]);
    if (fresh && fresh.ok) return fresh;
    event.waitUntil(network);
    return cached;
  })());
});
