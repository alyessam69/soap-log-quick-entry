/* تسجيل أوزان سريع - offline cache */
const CACHE = 'quickentry-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname.includes('firebasedatabase')) return;              /* the cloud is always online */
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'reload' }).then(r => {
    const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
