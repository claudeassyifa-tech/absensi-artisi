// Service worker sederhana: membuat situs bisa dipasang sebagai aplikasi.
// Halaman selalu diambil dari internet (supaya data & jam tidak basi); cache hanya cadangan saat offline.
const CACHE = "absensi-v1";
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // data Apps Script tidak di-cache
  e.respondWith(fetch(r).then(function (res) {
    const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copy); });
    return res;
  }).catch(function () { return caches.match(r); }));
});
