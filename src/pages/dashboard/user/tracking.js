// next
import Head from 'next/head';
// @mui
import {styled} from '@mui/material/styles';
import {
    Container,
    Card,
    CardContent, Grid, TextField, Box, Button
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
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import Iconify from "../../../components/iconify";

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

export default function TrackingPage() {
    const {themeStretch} = useSettingsContext();

    const [coordinates, setCoordinates] = useState([])
    const [currentRoomMap, setCurrentRoomMap] = useState("Lidenar");
    const [name, setName] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const onceRef = useRef(false);
    const [countriesData, setCountriesData] = useState([]);

    const [selectedCoordinates, setSelectedCoordinates] = useState(null);

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
            data.date = new Date(data.date);
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
            coordinates.forEach((coor, index) => {
                // Convertir el texto del mensaje a JSON y obtener las coordenadas
                const {latitud, longitud, date, user_name, user_id} = coor

                    const country = {
                        ...staticValues,
                        // latlng: [latitud, longitud],

                        position: {lat: Number(latitud), lng: Number(longitud)},
                        date_time: date.toString(),
                        name: user_name  + " (" +  user_id+ ")",
                        id: index + 1
                    };
                    objectArray.push(country);

            });

            console.log("Lista de todos los países:", objectArray);

            // Establecer los países como datos
            setCountriesData(objectArray);
        }
    }, [coordinates]);

    const handleFilterChange = (event) => {
        setFilterUserName(event.target.value);
    };

    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'name',
            headerName: 'Usuario',
            flex: true,
        },
        { field: 'date_time',
            headerName: 'Fecha',
            width: 400, // Ancho específico en píxeles
        },

        { field: 'position',
            headerName: 'Position',
            flex: true,
            renderCell: (params) => {
                return (
                    <Button
                        variant="contained"
                        onClick={() => handleShowCoordinates(params.row)}
                    >
                        Mostrar Ubicación
                    </Button>
                );
            }
        }
    ]

    const handleShowCoordinates = (position) => {
        if (position) {
            console.log("Coordenadas seleccionadas:", position);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario
            setSelectedCoordinates(position);

        } else {
            console.log("No se ha seleccionado ningún marcador.");
        }
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
                                    <MapComponent markers={countriesData} selectedCoordinates={selectedCoordinates}/>

                                    <DataGrid
                                        rows={countriesData}
                                        columns={baseColumns}
                                        pagination
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                            noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        }}
                                    />

                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </div>
            </Container>

        </>
    );
}



const mapContainerStyle = {
    width: '100%',
    height: '800px',
};

const defaultCuencaCoordinates = {lat: -2.90055, lng: -79.00453}; // Coordenadas de Cuenca, Ecuador

const selectedMarkerIcon = {
    url: 'data:image/svg+xml;base64,' + btoa('<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 395.71 395.71" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738 c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388 C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191 c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z"></path> </g> </g></svg>'),
    scaledSize: { width: 60, height: 60 }, // Tamaño del icono
};


function MapComponent({markers, selectedCoordinates}) {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [zoom, setZoom] = useState(100); // Estado para el zoom del mapa

    const center = selectedCoordinates?.position || defaultCuencaCoordinates;

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyARV9G0tkya9zgXXlVNmx8U5ep7mg8XdHI',
    });

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setZoom(12); // Ajusta el zoom al hacer clic en un marcador
    };

    const handleInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom} // Usa el estado de zoom aquí
        >
            {/* Renderizar marcadores */}
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    onClick={() => handleMarkerClick(marker)}
                />
            ))}

            {/* Mostrar marcador de la coordenada seleccionada */}
            {selectedMarker?.position && (
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

            {/* Renderizar marcador de coordenada seleccionada */}
            {selectedCoordinates?.position && (
                <Marker
                    icon={selectedMarkerIcon}
                    position={selectedCoordinates.position}
                    onClick={() => handleMarkerClick(selectedCoordinates)}
                />
            )}
        </GoogleMap>
    ) : (
        <></>
    );
}

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter/>
            <Box sx={{flexGrow: 1}}/>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}

// ----------------------------------------------------------------------