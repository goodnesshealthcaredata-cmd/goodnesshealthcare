const CACHE_NAME = "goodness-pwa-v1";

const APP_SHELL = [
  "/goodnesshealthcare/",
  "/goodnesshealthcare/index.html"
];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", event => {

  event.waitUntil(

    Promise.all([

      self.clients.claim(),

      caches.keys().then(cacheNames => {

        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );

      })

    ])

  );

});


// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", event => {

  const request = event.request;

  // Only GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);


  // ----------------------------------------------------------
  // NEVER INTERCEPT EXTERNAL / LIVE DATA
  // ----------------------------------------------------------

  if (url.origin !== self.location.origin) {
    return;
  }


  // ----------------------------------------------------------
  // HTML / JS / CSS
  //
  // ALWAYS NETWORK FIRST.
  //
  // This is important because your application changes
  // frequently and stale JS can cause buttons to stop working.
  // ----------------------------------------------------------

  const isAppFile =
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style";


  if (isAppFile) {

    event.respondWith(

      fetch(request)
        .then(response => {

          if (response.ok) {

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, copy);
              });

          }

          return response;

        })
        .catch(() => {

          return caches.match(request);

        })

    );

    return;
  }


  // ----------------------------------------------------------
  // OTHER SAME-ORIGIN STATIC FILES
  // ----------------------------------------------------------

  event.respondWith(

    caches.match(request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request);

      })

  );

});
