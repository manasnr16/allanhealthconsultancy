/* Service worker: offline shell for the mobile web app. Bump VERSION to refresh caches. */
const VERSION = 'ahc-v1';
const SHELL = ["./", "index.html", "about-us.html", "services.html", "health-packages.html", "gift-of-health-coupons.html", "hospitals.html", "blog.html", "faqs.html", "contact-us.html", "assets/css/styles.css", "assets/js/main.js", "assets/img/favicon.svg", "manifest.webmanifest"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; }).catch(() => hit); return hit || net; }));
});
