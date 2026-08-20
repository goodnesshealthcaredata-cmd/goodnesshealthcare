const CACHE_NAME = "goodness-cache-v14";

const urlsToCache = [
  "/goodnesshealthcare/",
  "/goodnesshealthcare/index.html"
];


// ============================================================
// ONESIGNAL SERVICE WORKER
// ============================================================

importScripts(
  "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js"
);


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );

  self.skipWaiting();

});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", event => {

  event.waitUntil(
    clients.claim()
  );

});


// ============================================================
// FETCH / PWA CACHE
// ============================================================

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

      })

  );

});
