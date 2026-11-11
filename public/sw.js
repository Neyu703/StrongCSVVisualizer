const CACHE = "strong-pro-v2";
const SHELL = ["./", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/splash-1284x2778-light.png", "icons/splash-1284x2778-dark.png"];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

const fromNetwork = (request) =>
    Promise.race([
        fetch(request, { cache: "no-cache" }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS)),
    ]);

// Network first so a deploy shows up on the next open; the cache is the offline and slow-network fallback
self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE);
            try {
                const response = await fromNetwork(request);
                if (response.ok) {
                    cache.put(request, response.clone());
                }
                return response;
            } catch {
                return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match("./")) ?? Response.error();
            }
        })(),
    );
});
