// Nombre de la caché
const CACHE_NAME = 'guardias-alsi-v3.0';
const urlsToCache = [
  '/Guardias/',
  '/Guardias/index.html',
  '/Guardias/admin.html',
  '/Guardias/manifest.json',
  '/Guardias/icon-72.png',
  '/Guardias/icon-96.png',
  '/Guardias/icon-128.png',
  '/Guardias/icon-144.png',
  '/Guardias/icon-152.png',
  '/Guardias/icon-192.png',
  '/Guardias/icon-384.png',
  '/Guardias/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker y limpiar cachés viejas
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activación completada');
      return self.clients.claim();
    })
  );
});

// Estrategia: Cache First, then Network
self.addEventListener('fetch', event => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;
  
  // Excluir chrome-extension
  if (event.request.url.indexOf('chrome-extension') > -1) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en caché, buscar en la red
        return fetch(event.request)
          .then(networkResponse => {
            // Solo cachear si la respuesta es válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clonar la respuesta para guardarla en caché
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // Si falla la red y es una página HTML, mostrar página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/Guardias/index.html');
            }
          });
      })
  );
});

// Manejar mensajes desde la página
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});















































































