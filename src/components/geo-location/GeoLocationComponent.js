import { useEffect } from 'react';
import { io } from "socket.io-client";
import {HOST_SOCKET} from "../../config-global";

const GeoLocationComponent = ({ user }) => {
    useEffect(() => {
        const socket = io(`${HOST_SOCKET}`);

            // Obtener las coordenadas usando la geolocalización del navegador
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        console.log("latitude:" + latitude);
                        console.log("longitude:" + longitude);

                        // Enviar las coordenadas al servidor de socket
                        socket.emit("coordinates", {
                            latitud: latitude.toString(),
                            longitud: longitude.toString(),
                            user_name: user.DISPLAYNAME,
                            user_id: Number(user.ID),
                            room_map: 'Lidenar',
                        });
                    },
                    (error) => {
                        console.error("Error al obtener la posición:", error.message);
                    }
                );
            } else {
                console.error("Geolocalización no está soportada por este navegador");
            }


        // // Llamar a la función para enviar las coordenadas cada 30 segundos
        // const intervalId = setInterval(sendCoordinates, 30000);
        //
        // // Limpiar el intervalo al desmontar el componente
        // return () => clearInterval(intervalId);

        // Limpiar la conexión del socket al desmontar el componente
        return () => {
            socket.disconnect();
        };

    }, [user]);

    return null; // Este componente no renderiza nada visualmente
};

export default GeoLocationComponent;
