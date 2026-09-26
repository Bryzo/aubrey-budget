const CACHE_NAME = "aubrey-budget-v2";

const FILES_TO_CACHE = [
    "./",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Install new service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    // Activate the new version immediately
    self.skipWaiting();
});

// Remove old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

// Network first, cache fallback
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {

                const copy = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, copy);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
