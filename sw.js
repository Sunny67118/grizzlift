/*
 * Service Worker Grizzlift — hors-ligne complet.
 * Stratégie "réseau d'abord" : la dernière version est chargée dès que le réseau répond
 * (en moins de 3 s), sinon la copie en cache prend le relais (salle sans réseau).
 * Les images d'exercice sont toutes mises en cache dès l'installation (liste IMAGES).
 */
const CACHE = 'grizzlift-v19';
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

// Toutes les images d'exercice, téléchargées dès l'installation : la séance marche hors-ligne
// même pour un exo jamais ouvert. À mettre à jour si on ajoute une image dans assets/exercises/.
const IMAGES = [
  'chat_vache.webp',
  'couch_stretch.webp',
  'crunch_swissball.webp',
  'curl_ez.webp',
  'curl_marteau.webp',
  'dev_incline_halteres.webp',
  'dev_militaire_assis.webp',
  'dips_leste.webp',
  'dislocations_epaule.webp',
  'dorsiflexion_cheville.webp',
  'dragon_flag.webp',
  'elevations_laterales.webp',
  'extension_lombaire.webp',
  'extension_thoracique.webp',
  'extension_triceps_corde.webp',
  'face_pull.webp',
  'farmer_carry.webp',
  'fentes_halteres.webp',
  'grenouille.webp',
  'hanche_90_90.webp',
  'hip_thrust.webp',
  'ischio.webp',
  'leg_curl.webp',
  'leg_press.webp',
  'mollets_debout.webp',
  'oiseau_halteres.webp',
  'open_book.webp',
  'pallof_press.webp',
  'pike_swiss_ball.webp',
  'planche.webp',
  'pompes.webp',
  'quad_debout.webp',
  'rameur.webp',
  'releves_jambes_suspendu.webp',
  'rollout.webp',
  'rotation_bassin_swissball.webp',
  'rotation_externe_epaule.webp',
  'rowing_barre.webp',
  'russian_twist.webp',
  'ski_erg.webp',
  'stir_the_pot.webp',
  'tirage_horizontal.webp',
  'toes_to_bar.webp',
  'tractions_lestees.webp',
  'trx_knee_tuck.webp',
  'tuck_lsit.webp',
  'woodchop.webp'
].map((f) => './assets/exercises/' + f);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE)
        // une image manquante ne doit pas bloquer l'installation
        .then(() => Promise.all(IMAGES.map((url) => cache.add(url).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
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
