// next
import Head from 'next/head';
// @mui
import {styled} from '@mui/material/styles';
import {
    Container,
    Card,
    CardContent, Grid, TextField
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import React, {useEffect, useRef, useState} from "react";
import _mock from "../../../_mock";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {HOST_API_KEY, HOST_SOCKET, MAP_API} from "../../../config-global";
// import MapMarkersPopups from "../../../sections/_examples/extra/map/MapMarkersPopups";
import {io} from "socket.io-client";
import {useAuthContext} from "../../../auth/useAuthContext";
import {GoogleMap, useJsApiLoader, Marker, InfoWindow} from "@react-google-maps/api";

// ----------------------------------------------------------------------

TrackingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

// const baseSettings = {
//     mapboxAccessToken: MAP_API,
//     minZoom: 1,
// };
//
// const StyledMapContainer = styled('div')(({theme}) => ({
//     zIndex: 0,
//     height: 560,
//     overflow: 'hidden',
//     position: 'relative',
//     borderRadius: theme.shape.borderRadius,
//     '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
//         display: 'none',
//     },
// }));

export default function TrackingPage(callback, deps) {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const [coordinates, setCoordinates] = useState([])
    const [currentRoomMap, setCurrentRoomMap] = useState("Lidenar");
    const [name, setName] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const onceRef = useRef(false);
    const [countriesData, setCountriesData] = useState([]);
    const [filterUserName, setFilterUserName] = useState('');

    useEffect(() => {
        setCoordinates([]);
        socket?.emit("get_coordinates", currentRoomMap)
    }, [currentRoomMap]);

    useEffect(() => {
        if (onceRef.current) {
            return;
        }

        onceRef.current = true;

        const socket = io(`${HOST_SOCKET}`);
        setSocket(socket);

        // MAP
        socket.on("connect", () => {
            console.log("Connected to socket server");
            setName(`anon-${socket.id}`);
            setConnected(true);
            console.log("joining room map ", currentRoomMap);

            socket.emit("get_coordinates", currentRoomMap);

        });

        // Agregar un manejador de eventos para el evento "coordinates"
        socket.on("coordinates", (data) => {
            console.log("Coordenadas recibidas: ", data);
            setCoordinates((coord) => [...coord, data])
        });

        socket.on("list_coordinates", (msgs) => {
            console.log("Lista Coordenadas Recibidas: ", msgs);
            let messages = msgs.coordinates.map((msg) => {
                msg.date = new Date(msg.date);
                return msg;
            });
            setCoordinates(messages);

        });

    }, []);

    useEffect(() => {
        if (coordinates.length > 0) {

            console.log("messages: " + JSON.stringify(coordinates));
            const objectArray = [];

            // Definir los valores estáticos para todos los países
            const staticValues = {
                timezones: ['América/Guayaquil'],
                // name: 'Fatima Campos',
                country_code: 'Lidenar',
                //capital: 'Mayoristas',
                photo: _mock.image.cover(1),
            };

            // Iterar sobre todos los mensajes y obtener las coordenadas de cada uno
            coordinates.forEach((coor) => {
                // Convertir el texto del mensaje a JSON y obtener las coordenadas
                const {latitud, longitud, date, user_name, user_id} = coor

                // Agregar las coordenadas al objeto estático y agregarlo al array
                if (filterUserName === '' ||
                    user_name.toLowerCase().includes(filterUserName.toLowerCase()) ||
                    user_name.split(" ").some(word => word.toLowerCase().includes(filterUserName.toLowerCase()))) {
                    const country = {
                        ...staticValues,
                        // latlng: [latitud, longitud],

                        position: { lat: Number(latitud), lng: Number(longitud) },
                        date_time: date.toString(),
                        name: user_id + " "+ user_name
                    };
                    objectArray.push(country);
                }
            });

            console.log("Lista de todos los países:", objectArray);

            // Establecer los países como datos
            setCountriesData(objectArray);
        }
    }, [coordinates, filterUserName]);

    const handleFilterChange = (event) => {
        setFilterUserName(event.target.value);
    };

    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Tracking Usuario"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'User',
                            href: PATH_DASHBOARD.user.tracking,
                        },
                        {
                            name: 'Tracking',
                        },
                    ]}
                />

                <div className="flex">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12}>
                            <Card>
                                <CardContent>
                                    <TextField
                                        label="Filtrar por nombre de usuario"
                                        variant="outlined"
                                        value={filterUserName}
                                        onChange={handleFilterChange}
                                        fullWidth
                                        margin="normal"
                                    />

                                    <MapComponent markers={countriesData} />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>
            </Container>

        </>
    );
}


const center = { lat: -1.8312, lng: -78.1834 };

const mapContainerStyle = {
    width: '100%',
    height: '800px',
};

// URL de tu imagen personalizada para el marcador
// const customMarkerIcon = 'URL_DE_TU_IMAGEN';

function MapComponent({ markers }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyARV9G0tkya9zgXXlVNmx8U5ep7mg8XdHI',
    });

    const [selectedMarker, setSelectedMarker] = useState(null);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={8}
        >
            {/* Renderizar marcadores */}
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    // icon={customMarkerIcon} // Usar icono personalizado
                    onClick={() => handleMarkerClick(marker)}
                />
            ))}

            {/* Ventana de información para el marcador seleccionado */}
            {selectedMarker && (
                <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={handleInfoWindowClose}
                >
                    <div>
                        <p>Nombre: {selectedMarker.name}</p>
                        <p>Fecha y Hora: {selectedMarker.date_time}</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    ) : (
        <></>
    );
}