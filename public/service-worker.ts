/// <reference lib="webworker" />

const CACHE_NAME = "votre-guide-v1";
const CACHE_URLS = [
  "/",
  "/index.html"
];

const ASSET_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

declare const self: ServiceWorkerGlobalScope;

// Install event - cache essential files
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS).catch(() => {
        // Fail silently if offline during install
        console.log("Cache add failed, offline install");
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache images and videos
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Cache images and videos
  if (
    request.url.includes(".jpg") ||
    request.url.includes(".jpeg") ||
    request.url.includes(".png") ||
    request.url.includes(".gif") ||
    request.url.includes(".webp") ||
    request.url.includes(".mp4") ||
    request.url.includes(".webm") ||
    request.url.includes("supabase") // Supabase storage
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Return cached version if offline
            return cache.match(request) || new Response("Offline - not cached", { status: 503 });
          });
        });
      })
    );
  }
});
