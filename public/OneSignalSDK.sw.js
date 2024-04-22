// Opcional: Evento 'install' del Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker instalado');
});

// Opcional: Evento 'activate' del Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker activado');
});

// Evento 'push' del Service Worker para recibir notificaciones push de OneSignal
self.addEventListener('push', event => {
    const notificationData = event.data.json();
    console.log('Notificación recibida:', notificationData);

    // Opcional: Mostrar la notificación al usuario
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon
        })
    );
});

// Evento 'notificationclick' del Service Worker para manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
    console.log('Notificación clicada');

    // Opcional: Abrir una URL al hacer clic en la notificación
    event.notification.close();
    event.waitUntil(clients.openWindow('URL_DE_DESTINO'));
});
