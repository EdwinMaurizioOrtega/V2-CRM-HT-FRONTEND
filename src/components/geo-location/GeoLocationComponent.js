import { useEffect } from 'react';
import { io } from "socket.io-client";

const GeoLocationComponent = ({ user }) => {
    //Geolocalizar V1
    useEffect(() => {
        // Establecer la conexión del socket
        //const socket = io("ws://localhost:80");
        const socket = io("wss://ss.lidenar.com");

        // Obtener las coordenadas usando la geolocalización del navegador
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    console.log("latitude:" + latitude)
                    console.log("latitude:" + longitude)

                    // Enviar las coordenadas al servidor de socket
                    socket.emit("coordinates", {
                        latitud: latitude.toString(),
                        longitud: longitude.toString(),
                        // Asegúrate de reemplazar 'user.DISPLAYNAME' con el nombre de usuario adecuado
                        user_name: user.DISPLAYNAME,
                        room_map: 'Lidenar', // O la habitación adecuada
                    });
                },
                (error) => {
                    console.error("Error al obtener la posición:", error.message);
                }
            );
        } else {
            console.error("Geolocalización no está soportada por este navegador");
        }

        // Limpiar la conexión del socket al desmontar el componente
        return () => {
            socket.disconnect();
        }; //disconnect
    }, [user]);

    return null; // Este componente no renderiza nada visualmente
};

export default GeoLocationComponent;
