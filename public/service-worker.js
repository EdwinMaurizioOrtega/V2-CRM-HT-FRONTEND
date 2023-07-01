// service-worker.js
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open('my-cache').then(function(cache) {
            return cache.match(event.request).then(function(response) {
                var fetchPromise = fetch(event.request).then(function(networkResponse) {
                    cache.put(event.request, networkResponse.clone()); // Actualizar la caché con la respuesta del servidor
                    return networkResponse; // Retornar la respuesta del servidor
                });

                return response || fetchPromise; // Retornar la respuesta almacenada en caché o la respuesta del servidor
            });
        })
    );
});
