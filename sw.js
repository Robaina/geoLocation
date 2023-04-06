const staticCacheName = 'site-static-v1';
const assets = [
  // '/',
  'offline.html',
  // 'swipescreen.js',
  // 'leaflet.js',
  // 'script.js',
  'styles.css',
  // 'images/roque_hermanos.jpg',
];
// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});
// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});
// fetch event
self.addEventListener('fetch', evt => {

  evt.respondWith(
      fetch(evt.request)
          .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                  return cache.match('offline.html');
                });
          })
  );
  
  // evt.respondWith(
  //   caches.match(evt.request).then(cacheRes => {
  //     return cacheRes || fetch(evt.request);
  //   })
  // );
});


//
// if (evt.request.mode !== 'navigate') {
//   // Not a page navigation, bail.
//   return;
// }
// evt.respondWith(
//     fetch(evt.request)
//         .catch(() => {
//           return caches.open(CACHE_NAME)
//               .then((cache) => {
//                 return cache.match('offline.html');
//               });
//         })
// );
