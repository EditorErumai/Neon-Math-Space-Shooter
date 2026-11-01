
"use strict";

/* ============================================================
   NEON MATH SPACE SHOOTER
   Service Worker
   ============================================================ */

const CACHE_NAME = "neon-math-space-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./Rolex Bgm Remix.mp3"
];

/* ------------------------------------------------------------
   INSTALL
   Cache the game files.
   ------------------------------------------------------------ */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // Cache files individually so one missing optional file
        // does not prevent the whole service worker installing.
        for (const file of APP_FILES) {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn(
              "Could not cache:",
              file,
              error
            );
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

/* ------------------------------------------------------------
   ACTIVATE
   Remove old versions of this game's cache.
   ------------------------------------------------------------ */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name.startsWith("neon-math-space-") &&
                name !== CACHE_NAME
              );
            })
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/* ------------------------------------------------------------
   FETCH
   - Only handle same-origin GET requests.
   - Never intercept Supabase or other external services.
   - Use network-first for page navigation.
   - Use cache-first for local static files.
   ------------------------------------------------------------ */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  let url;

  try {
    url = new URL(request.url);
  } catch (_) {
    return;
  }

  // Do not intercept external requests, including Supabase.
  if (url.origin !== self.location.origin) return;

  // Do not intercept browser extension or unusual schemes.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // Navigation: try the network first to get the latest page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => cache.put("./index.html", copy))
              .catch(() => {});
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match("./index.html")
          ) || new Response(
            "The game is currently unavailable offline.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  // Static assets: use cache first, then network.
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            if (
              response &&
              response.ok &&
              response.type === "basic"
            ) {
              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .catch(() => {});
            }

            return response;
          });
      })
  );
});
