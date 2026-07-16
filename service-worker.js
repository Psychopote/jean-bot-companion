const CACHE_NAME = 'jean-bot-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './commandes.html',
  './manifest.json',
  './favicon.png'
];

// Installation : Mise en cache des fichiers de base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage automatique des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie "Network-First" (Réseau d'abord, Cache en secours)
self.addEventListener('fetch', (e) => {
  // On ne gère que les requêtes locales (pas les vidéos externes GitHub)
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Si le réseau répond, on met à jour le cache et on renvoie la page fraîche
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si pas de réseau (hors-ligne), on charge la version du cache
          return caches.match(e.request);
        })
    );
  }
});