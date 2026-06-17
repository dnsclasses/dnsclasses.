const CACHE_NAME = "dns-classes-v3";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always fetch fresh, fall back to cache only if offline
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh response
        var clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request)
          .then(cached => cached || caches.match("./index.html"));
      })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: "window", includeUncontrolled: true}).then(clientList => {
      for (var client of clientList) {
        if (client.url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});

self.addEventListener("push", event => {
  var data = event.data ? event.data.json() : {title:"\ud83d\udd14 DNS Classes", body:"Check pending fees"};
  event.waitUntil(
    self.registration.showNotification(data.title || "\ud83d\udd14 DNS Classes", {
      body: data.body || "Check pending fees",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: "dns-push",
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [{action: "view", title: "\ud83d\udccb Open App"}]
    })
  );
});
