const CACHE_NAME = 'guardias-alsi-v1.3';
const urlsToCache = [
  '/Guardias/',
  '/Guardias/index.html',
  '/Guardias/admin.html',
  '/Guardias/manifest.json',
  '/Guardias/browserconfig.xml',
  '/Guardias/icon-72.png',
  '/Guardias/icon-152.png',
  '/Guardias/icon-192.png',
  '/Guardias/icon-310.png',
  '/Guardias/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando v1.2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando recursos');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Error cacheando algunos recursos:', error);
        });
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Solo manejar peticiones HTTP/HTTPS y GET
  if (!url.protocol.startsWith('http') || event.request.method !== 'GET') {
    return;
  }
  
  // Para archivos HTML, usar estrategia Network First
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cachear la nueva respuesta
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => {
          // Si falla la red, servir desde cache
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('/Guardias/index.html'));
        })
    );
    return;
  }
  
  // Para otros recursos, usar Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Sirviendo desde cache:', url.pathname);
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Service Worker: Error de red:', error);
            // Para imágenes, puedes devolver un icono por defecto
            if (event.request.destination === 'image') {
              return caches.match('/Guardias/icon-192.png');
            }
            return new Response('Error de conexión', { 
              status: 503, 
              statusText: 'Service Unavailable' 
            });
          });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Saltando espera por actualización');
    self.skipWaiting();
  }
});



















































































