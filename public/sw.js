const CACHE_VERSION = "v2025-11-02-1";
const CACHE_NAME = `friendex-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `friendex-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `friendex-dynamic-${CACHE_VERSION}`;

// Assets to cache for offline functionality
const STATIC_ASSETS = [
    // Keep only stable, non-hashed assets
    "/manifest.json",
    "/fonts/gaegu.css",
    "/fonts/gaegu-regular.woff2",
    "/fonts/gaegu-bold.woff2",
    "/icons/16x16.png",
    "/icons/favicon-32x32.png",
    "/icons/favicon96x96.png",
    "/icons/android-chrome192x192.png",
    "/icons/android-chrome512x512.png",
    "/browserconfig.xml",
];

// Fonts to cache - local font files
const FONT_ASSETS = [
    "/fonts/gaegu.css",
    "/fonts/gaegu-regular.ttf",
    "/fonts/gaegu-bold.ttf",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...");

    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log("Service Worker: Caching static assets");
                return cache.addAll(STATIC_ASSETS).catch((error) => {
                    console.log(
                        "Service Worker: Some static assets failed to cache:",
                        error
                    );
                    return Promise.resolve();
                });
            }),
            // Cache fonts
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log("Service Worker: Caching fonts");
                return cache.addAll(FONT_ASSETS).catch((error) => {
                    console.log(
                        "Service Worker: Some fonts failed to cache:",
                        error
                    );
                    return Promise.resolve();
                });
            }),
        ]).then(() => {
            console.log("Service Worker: Installation complete");
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...");

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (
                            cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME
                        ) {
                            console.log(
                                "Service Worker: Deleting old cache:",
                                cacheName
                            );
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log("Service Worker: Activation complete");
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith("http")) {
        return;
    }

    event.respondWith(
        (async () => {
            // Always bypass caching for JS, CSS, and icons (avoid hashed filename churn issues and icon cache problems)
            if (
                request.destination === "script" ||
                request.destination === "style" ||
                request.url.includes("/assets/") ||
                request.url.endsWith(".js") ||
                request.url.endsWith(".css") ||
                request.url.includes("/icons/")
            ) {
                // Use no-cache to force fresh fetch for icons
                return fetch(request, { cache: "no-cache" });
            }

            // Network-first for HTML documents with no-store; fallback to SPA index.html on 404
            if (request.destination === "document") {
                try {
                    const fresh = await fetch(
                        new Request(request, { cache: "no-store" })
                    );
                    if (fresh && fresh.ok) {
                        return fresh;
                    }

                    // Some hosts 404 on client routes; fallback to root index.html
                    const rootIndex = await fetch(
                        new Request("/", { cache: "no-store" })
                    );
                    if (rootIndex && rootIndex.ok) {
                        return rootIndex;
                    }
                } catch (_) {
                    // ignore and try cache fallback below
                }

                const cached = await caches.match("/index.html");
                if (cached) return cached;
                return new Response("Offline", { status: 503 });
            }

            // Cache-first for static assets we explicitly cached (images, fonts, manifest)
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(request);
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    networkResponse.type === "basic" &&
                    (request.destination === "image" ||
                        request.destination === "font")
                ) {
                    const cache = await caches.open(DYNAMIC_CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (_) {
                return new Response("Offline", { status: 503 });
            }
        })()
    );
});

// Handle background sync for offline data
self.addEventListener("sync", (event) => {
    console.log("Service Worker: Background sync triggered");

    if (event.tag === "background-sync") {
        event.waitUntil(
            // Handle any pending offline operations here
            // For now, just log that sync occurred
            Promise.resolve().then(() => {
                console.log("Service Worker: Background sync completed");
            })
        );
    }
});

// Handle push notifications (for future features)
self.addEventListener("push", (event) => {
    console.log("Service Worker: Push notification received");

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: "/icons/android-chrome192x192.png",
            badge: "/icons/favicon-32x32.png",
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey,
            },
            actions: [
                {
                    action: "explore",
                    title: "Open Friendex",
                    icon: "/icons/favicon-32x32.png",
                },
                {
                    action: "close",
                    title: "Close",
                    icon: "/icons/favicon-32x32.png",
                },
            ],
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    console.log("Service Worker: Notification clicked");

    event.notification.close();

    if (event.action === "explore") {
        event.waitUntil(clients.openWindow("/"));
    }
});
