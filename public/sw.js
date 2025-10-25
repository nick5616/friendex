const CACHE_NAME = "friendex-v1.0.1";
const STATIC_CACHE_NAME = "friendex-static-v1.0.1";
const DYNAMIC_CACHE_NAME = "friendex-dynamic-v1.0.1";

// Assets to cache for offline functionality
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/vite.svg",
    "/fonts/gaegu.css",
    "/fonts/gaegu-regular.woff2",
    "/fonts/gaegu-bold.woff2",
    "/icons/favicon-32x32.png",
    "/icons/android-chrome-192x192.png",
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
        // For development, use network-first strategy for JS/CSS files
        (async () => {
            const isDevFile =
                request.url.includes("/src/") ||
                request.url.includes(".js") ||
                request.url.includes(".css") ||
                request.url.includes("vite") ||
                request.url.includes("@vite");

            if (isDevFile) {
                try {
                    // Try network first for development files
                    const networkResponse = await fetch(request);
                    if (networkResponse.ok) {
                        console.log(
                            "Service Worker: Serving from network (dev file):",
                            request.url
                        );
                        return networkResponse;
                    }
                } catch (error) {
                    console.log(
                        "Service Worker: Network failed for dev file, trying cache:",
                        request.url
                    );
                }

                // Fallback to cache for dev files
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    console.log(
                        "Service Worker: Serving dev file from cache:",
                        request.url
                    );
                    return cachedResponse;
                }
            }

            // For other files, use cache-first strategy
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log("Service Worker: Serving from cache:", request.url);
                return cachedResponse;
            }

            // Otherwise, fetch from network
            try {
                const networkResponse = await fetch(request);

                // Don't cache non-successful responses
                if (
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type !== "basic"
                ) {
                    return networkResponse;
                }

                // Clone the response for caching
                const responseToCache = networkResponse.clone();

                // Cache dynamic content (JS, CSS, images, etc.)
                const cache = await caches.open(DYNAMIC_CACHE_NAME);
                await cache.put(request, responseToCache);

                console.log(
                    "Service Worker: Serving from network and caching:",
                    request.url
                );
                return networkResponse;
            } catch (error) {
                console.log(
                    "Service Worker: Network request failed:",
                    request.url,
                    error
                );

                // Return offline page for navigation requests
                if (request.destination === "document") {
                    return caches.match("/index.html");
                }

                // For asset requests, try to serve from static cache
                if (
                    request.destination === "script" ||
                    request.destination === "style" ||
                    request.destination === "image" ||
                    request.destination === "font"
                ) {
                    return caches.match(request);
                }

                // Return a generic offline response for other requests
                return new Response("Offline", {
                    status: 503,
                    statusText: "Service Unavailable",
                    headers: new Headers({
                        "Content-Type": "text/plain",
                    }),
                });
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
            icon: "/icons/android-chrome-192x192.png",
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
