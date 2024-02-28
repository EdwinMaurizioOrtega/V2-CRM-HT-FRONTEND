// Escuchar mensajes del hilo principal
self.onmessage = function (e) {
    if (e.data === 'start') {
        // Solicitar acceso a la geolocalización al hilo principal
        self.postMessage('requestLocation');
    }
};

// Escuchar mensajes del hilo principal para recibir las coordenadas
self.onmessage = function (e) {
    if (e.data.type === 'location') {
        const latitude = e.data.latitude;
        const longitude = e.data.longitude;

        // Aquí puedes realizar cualquier operación necesaria con las coordenadas
        console.log("latitude: " + latitude);
        console.log("longitude: " + longitude);
    }
};
