// next
import Head from 'next/head';
// @mui
import {styled} from '@mui/material/styles';
import {
    Container,
    Card,
    CardContent,
    Grid,
    TextField,
    Box,
    Button,
    CardHeader,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions, Slide
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import React, {forwardRef, useEffect, useRef, useState} from "react";
import _mock from "../../../_mock";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {HOST_API_KEY, HOST_SOCKET, MAP_API} from "../../../config-global";
// import MapMarkersPopups from "../../../sections/_examples/extra/map/MapMarkersPopups";
import {io} from "socket.io-client";
import {useAuthContext} from "../../../auth/useAuthContext";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    InfoWindow,
    LoadScript,
    DirectionsRenderer,
    DirectionsService
} from "@react-google-maps/api";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import Iconify from "../../../components/iconify";
import {fDate, fDateCustom, fDateCustomDateAndTime} from "../../../utils/formatTime";
import TransitionsDialogs from "../../../sections/_examples/mui/dialog/TransitionsDialogs";

// ----------------------------------------------------------------------

TrackingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const baseSettings = {
    mapboxAccessToken: MAP_API,
    minZoom: 1,
};

const StyledMapContainer = styled('div')(({theme}) => ({
    zIndex: 0,
    height: 560,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
        display: 'none',
    },
}));

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

    const [coordinatesCustomers, setCoordinatesCustomers] = useState([]);

    useEffect(() => {
        async function fetchData() {
                try {
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/customers/all_coordinates`);
                    if (response.status === 200) {


                    } else {

                    }
                    const data = await response.json();
                    console.log("coordinatesCustomers: "+JSON.stringify(data.data));

                    const objectArray = [];

                    // Iterar sobre todos los mensajes y obtener las coordenadas de cada uno
                    data.data.forEach((coor, index) => {
                        // Convertir el texto del mensaje a JSON y obtener las coordenadas
                        const {U_LS_LATITUD, U_LS_LONGITUD, CLIENTE, NOMBRE_VENDEDOR} = coor

                        const country = {
                            position: {lat: Number(U_LS_LATITUD), lng: Number(U_LS_LONGITUD)},
                            name: CLIENTE,
                            date_time: NOMBRE_VENDEDOR,
                            id: index + 1
                        };
                        objectArray.push(country);

                    });

                    setCoordinatesCustomers(objectArray);

                } catch (error) {
                    console.error('Error fetching data:', error);

                }

        }

        // Call the async function immediately
        fetchData();

    }, []);







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
            width: 200, // Ancho específico en píxeles
        },
        // { field: 'date_time',
        //     headerName: 'Fecha',
        //     width: 400, // Ancho específico en píxeles
        // },

        { field: 'position',
            headerName: 'Position',
            width: 400,
            renderCell: (params) => {
                return (
                    <Button
                        variant="contained"
                        onClick={() => handleShowCoordinates(params.row)}
                    >
                        {fDateCustomDateAndTime(params.row.date_time) }
                    </Button>
                );
            }
        },

        { field: 'position_v2',
            headerName: 'Position V2',
            width: 400,
            renderCell: (params) => {
                return (
                    <TransitionsDialogsEd gps_coordinates={params.row} />
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
                                <CardHeader title="Logs Usuarios" />

                                <CardContent>
                                    <Box sx={{ height: 490 }}>
                                    <DataGrid
                                        rows={countriesData}
                                        columns={baseColumns}
                                        disableRowSelectionOnClick
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                            noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        }}
                                    />
                                    </Box>
                                </CardContent>

                                <CardHeader title="Clientes + Usuarios" />
                                <CardContent>
                                    <MapComponent markers={countriesData} selectedCoordinates={selectedCoordinates} coordinatesCustomersA={coordinatesCustomers}/>
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
    height: '2000px',
};

const defaultCuencaCoordinates = {lat: -2.90055, lng: -79.00453}; // Coordenadas de Cuenca, Ecuador

const selectedMarkerIconClientes =  '/ub-2.png';
const selectedMarkerIconClienteSelected =  '/ub-3.png';
const selectedMarkerIconLocal =  '/ub-1.png';

function MapComponent({markers, selectedCoordinates, coordinatesCustomersA}) {
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

    const handleRegistrarGestion = (data) => {
       console.log("Data para gestionar: "+ JSON.stringify( data));
    };

    const handleGestionesAnteriores = (data) => {
        console.log("Gestiones anteriores: "+ JSON.stringify( data));
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
                    icon={selectedMarkerIconClientes}
                    key={index}
                    position={marker.position}
                    onClick={() => handleMarkerClick(marker)}
                />
            ))}

            {coordinatesCustomersA.map((marker, index) => (
                <Marker
                    icon={selectedMarkerIconLocal}
                    key={index}
                    // icon={{
                    //     url: markerImage,
                    //     scaledSize: new window.google.maps.Size(40, 40) // Ajusta el tamaño según tus necesidades
                    // }}
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
                        <p>1. {selectedMarker.name}</p>
                        <p>2. {selectedMarker.date_time}</p>
                        <Button variant="contained" onClick={() => handleRegistrarGestion(selectedMarker)}>
                            Registrar Gestión.
                        </Button>
                        <Button variant="contained" onClick={() => handleGestionesAnteriores(selectedMarker)}>
                            Gestiones Anteriores.
                        </Button>
                    </div>
                </InfoWindow>
            )}

            {/* Renderizar marcador de coordenada seleccionada */}
            {selectedCoordinates?.position && (
                <Marker
                    icon={selectedMarkerIconClienteSelected}
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

// function MapWithRoute() {
//     const [directions, setDirections] = useState(null);
//     const [waypointsLoaded, setWaypointsLoaded] = useState(false);
//
//     const onLoad = (map) => {
//         console.log('Mapa cargado:', map);
//     };
//
//     const onDirectionsLoad = (directionsResult) => {
//         console.log('Direcciones cargadas:', directionsResult);
//         if (!directions) {
//             setDirections(directionsResult);
//         }
//     };
//
//     useEffect(() => {
//         // Verificar si todos los waypoints se han cargado
//         const allWaypointsLoaded = directions?.routes[0]?.waypoint_order?.length === waypoints.length;
//         setWaypointsLoaded(allWaypointsLoaded);
//     }, [directions]);
//
//     // Define un array de waypoints
//     const waypoints = [
//         { location: { lat: -1.2603505817446543, lng: -78.6140073979747}, stopover: true }, // Coordenada intermedia 1
//         { location: { lat: -1.3257909202554965, lng: -78.53405119529798}, stopover: true }, // Coordenada intermedia 2
//         { location: { lat: -1.3257909202554965, lng: -78.53405119529798}, stopover: true }, // Coordenada intermedia 3
//         // Agrega más coordenadas intermedias si es necesario
//     ];
//
//     return (
//         <LoadScript
//             googleMapsApiKey="AIzaSyARV9G0tkya9zgXXlVNmx8U5ep7mg8XdHI"
//             libraries={["places"]}
//             onLoad={() => console.log('Biblioteca de Google Maps cargada correctamente')}
//         >
//             <GoogleMap
//                 mapContainerStyle={{ width: '100%', height: '400px' }}
//                 center={{ lat: -2.0516452963522567, lng: -78.73670863937744 }}
//                 zoom={15}
//                 onLoad={onLoad}
//             >
//                 {waypointsLoaded && directions && <DirectionsRenderer directions={directions} />}
//                 {window.google && <DirectionsService
//                     options={{
//                         origin: { lat: -1.252271306227923, lng: -78.61434820904819 },
//                         destination: { lat: -2.8811718051221376, lng: -79.064459790521 },
//                         travelMode: "WALKING",
//                         waypoints: waypoints // Utiliza el array de waypoints aquí
//                     }}
//                     callback={onDirectionsLoad}
//                 />}
//             </GoogleMap>
//         </LoadScript>
//     );
// }

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function TransitionsDialogsEd() {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" color="success" onClick={handleClickOpen}>
                GPS
            </Button>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-dialog-slide-title">{`Use Google's location service?`}</DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        Let Google help apps determine location. This means sending anonymous location data to
                        Google, even when no apps are running.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button color="inherit" onClick={handleClose}>
                        Disagree
                    </Button>

                    <Button variant="contained" onClick={handleClose}>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

