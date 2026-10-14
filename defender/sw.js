// Why, Dad? Defender: offline first. Everything the game needs is cached on first visit,
// so it opens with no signal. Bump CACHE when the build changes.
const CACHE = 'whydad-defender-b18';
const CORE = ['./', './index.html', './manifest.json',
  './assets/mascot_wave.png', './assets/mascot_pointing.png', './assets/mascot_amazed.png', './assets/mascot_talking.png', './assets/webster.png',
  './assets/icon-192.png', './assets/icon-512.png',
  // the generated drop-ins (see ART.md)
  './assets/pet_webster.png', './assets/pet_sparky.png', './assets/pet_hopper.png', './assets/pet_puddles.png', './assets/pet_dusty.png', './assets/pet_pip.png', './assets/pet_scuttle.png', './assets/pet_nilla.png', './assets/pet_luna.png', './assets/kid.png',
  './assets/arena_1.png', './assets/arena_2.png', './assets/arena_3.png', './assets/arena_4.png', './assets/arena_5.png', './assets/arena_6.png', './assets/arena_7.png', './assets/arena_8.png',
  './assets/map_1.png', './assets/map_2.png', './assets/map_3.png', './assets/map_4.png', './assets/map_5.png', './assets/map_6.png', './assets/map_7.png', './assets/map_8.png',
  // the 3D sprite sheets
  './assets/3d/dad.json', './assets/3d/dad_idle.png', './assets/3d/dad_throw.png', './assets/3d/dad_walk.png', './assets/3d/dusty.json', './assets/3d/dusty_idle.png', './assets/3d/hopper.json', './assets/3d/hopper_idle.png', './assets/3d/kid.json', './assets/3d/kid_idle.png', './assets/3d/kid_walk.png', './assets/3d/luna.json', './assets/3d/luna_idle.png', './assets/3d/nilla.json', './assets/3d/nilla_idle.png', './assets/3d/pip.json', './assets/3d/pip_idle.png', './assets/3d/puddles.json', './assets/3d/puddles_idle.png', './assets/3d/scuttle.json', './assets/3d/scuttle_idle.png', './assets/3d/sparky.json', './assets/3d/sparky_idle.png', './assets/3d/webster.json', './assets/3d/webster_idle.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  // the page itself: network first so a new build shows up, cache when offline
  if (req.mode === 'navigate' || req.url.endsWith('/index.html')) { e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))); return; }
  // everything else (art, fonts, optional PNG drop-ins): cache first, then network, and remember what came back
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit)));
});
