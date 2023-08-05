// service-worker.js
import {HOST_API_KEY} from "../src/config-global";

self.addEventListener('fetch', function(event) {

    // Verificar si la URL a excluir está presente en la solicitud
    if (event.request.url.includes(`${HOST_API_KEY}/hanadb/api/orders`) ||
        event.request.url.includes(`${HOST_API_KEY}/hanadb/api/products/price_list_product`) ||
        event.request.url.includes(`${HOST_API_KEY}/hanadb/api/products/stock/` )) {
        // No responder con la caché para esta URL, simplemente realizar una solicitud de red normal.
        event.respondWith(fetch(event.request));
        return; // Salir de la función para evitar el comportamiento predeterminado del evento 'fetch'.
    }

    event.respondWith(
        caches.open('cache-crm').then(function(cache) {
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
