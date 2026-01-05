const CACHE_NAME="guardias-pro-cache-v3";
const urlsToCache=["/index.html","/manifest.json","icon-192.png","icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)));
});

self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(resp=>resp||fetch(e.request)));
});


