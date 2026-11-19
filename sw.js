// ============================================================
//  Macaco Espacial — Service Worker
//  >>> A CADA NOVA VERSÃO, AUMENTE O NÚMERO ABAIXO <<<
// ============================================================
const VERSION = '2.0.0';

const CACHE = 'macaco-espacial-' + VERSION;
const FILES = [
  './',
  './index.html',
  './style.css',
  './js/data.js',
  './js/game.js',
  './js/ui.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('macaco-espacial-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'GET_VERSION' && e.source) e.source.postMessage({ version: VERSION });
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = (await cache.match(req, { ignoreSearch: true })) ||
                (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return Response.error();
    }
  }));
});
