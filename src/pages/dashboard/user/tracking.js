// next
import Head from 'next/head';
// @mui
import {alpha, styled} from '@mui/material/styles';
import {
    Container,
    Typography,
    Box,
    Card,
    TextField,
    CardContent, Button, ListItem, ListItemText, List, Grid
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import React, {useEffect, useRef, useState} from "react";
import {
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import _mock from "../../../_mock";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {MAP_API} from "../../../config-global";
import MapMarkersPopups from "../../../sections/_examples/extra/map/MapMarkersPopups";
import {io} from "socket.io-client";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

TrackingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const THEMES = {
    streets: 'mapbox://styles/mapbox/streets-v11',
    outdoors: 'mapbox://styles/mapbox/outdoors-v11',
    light: 'mapbox://styles/mapbox/light-v10',
    dark: 'mapbox://styles/mapbox/dark-v10',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11',
};

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

export default function TrackingPage(callback, deps) {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const [messages, setMessages] = useState([]);
    const [coordinates, setCoordinates] = useState([])

    const [input, setInput] = useState("");
    const [currentRoom, setCurrentRoom] = useState("General");
    const [currentRoomMap, setCurrentRoomMap] = useState("Lidenar");
    const [name, setName] = useState(null);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const onceRef = useRef(false);

    const [countriesData, setCountriesData] = useState([]);

    // useEffect(() => {
    //     setMessages([]);
    //     socket?.emit("join", currentRoom);
    // }, [currentRoom]);
    //
    // useEffect(() => {
    //     if (onceRef.current) {
    //         return;
    //     }
    //
    //     onceRef.current = true;
    //
    //     const socket = io("ws://localhost:80");
    //     //const socket = io("wss://ss.lidenar.com");
    //     setSocket(socket);
    //
    //     // CHAT
    //
    //     socket.on("connect", () => {
    //         console.log("Connected to socket server");
    //         setName(`anon-${socket.id}`);
    //         setConnected(true);
    //         console.log("joining room", currentRoom);
    //
    //         socket.emit("join", currentRoom);
    //     });
    //
    //     socket.on("message", (msg) => {
    //         console.log("Message received AAA", msg);
    //         msg.date = new Date(msg.date);
    //         setMessages((messages) => [...messages, msg]);
    //     });
    //
    //     socket.on("messages", (msgs) => {
    //         console.log("Messages received BBB", msgs);
    //         let messages = msgs.messages.map((msg) => {
    //             msg.date = new Date(msg.date);
    //             return msg;
    //         });
    //         setMessages(messages);
    //
    //     });
    //
    // }, []);
    //
    // const sendMessage = (e) => {
    //     e.preventDefault();
    //     socket?.emit("message", {
    //         text: input,
    //         room: currentRoom,
    //     });
    //     setInput("");
    // };

    useEffect(() => {
        setMessages([]);
        socket?.emit("get_coordinates", currentRoomMap)
    }, [currentRoomMap]);


    useEffect(() => {
        if (onceRef.current) {
            return;
        }

        onceRef.current = true;

        //const socket = io("ws://localhost:80");
        const socket = io("wss://ss.lidenar.com");
        setSocket(socket);

        // MAP
        socket.on("connect", () => {
            console.log("Connected to socket server");
            setName(`anon-${socket.id}`);
            setConnected(true);
            console.log("joining room map ", currentRoomMap);

            socket.emit("get_coordinates", currentRoomMap);


            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        socket?.emit("coordinates", {
                            latitud: latitude.toString(),
                            longitud: longitude.toString(),
                            user_name: user.DISPLAYNAME,
                            room_map: currentRoomMap,
                        });

                    },
                    (error) => {
                        console.error("Error al obtener la posición:", error.message);
                    }
                );
            } else {
                console.error("Geolocalización no está soportada por este navegador");
            }


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

            console.log("messages: "+ JSON.stringify(coordinates));
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
                const { latitud, longitud, date, user_name } = coor

                // Agregar las coordenadas al objeto estático y agregarlo al array
                const country = {
                    ...staticValues,
                    latlng: [latitud, longitud],
                    capital: date.toLocaleString(), //Fecha/Hora
                    name: user_name //Usuario
                };
                objectArray.push(country);
            });

            console.log("Lista de todos los países:", objectArray);

            // Establecer los países como datos
            setCountriesData(objectArray);
        }
    }, [coordinates]);


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
                                    <StyledMapContainer>
                                        <MapMarkersPopups {...baseSettings} data={countriesData}/>
                                    </StyledMapContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                        {/*<Grid item xs={12} md={6}>*/}
                        {/*    <Card>*/}
                        {/*        <div className="h-screen p-4 bg-ctp-crust flex flex-col flex-grow justify-end">*/}
                        {/*            <div style={{maxHeight: '300px', overflowY: 'auto'}}>*/}
                        {/*                <List>*/}
                        {/*                    {messages?.map((msg, index) => (*/}
                        {/*                        <ListItem key={index} alignItems="flex-start">*/}
                        {/*                            <ListItemText*/}
                        {/*                                // primary={msg.user}*/}
                        {/*                                //primary={JSON.parse(msg.text).user}*/}
                        {/*                                primary={msg.user}*/}
                        {/*                                secondary={*/}
                        {/*                                    <>*/}
                        {/*                                        <Typography*/}
                        {/*                                            component="span"*/}
                        {/*                                            variant="body2"*/}
                        {/*                                            color="textPrimary"*/}
                        {/*                                        >*/}
                        {/*                                            {msg.date.toLocaleString()}*/}
                        {/*                                        </Typography>*/}
                        {/*                                        <br/> /!* Agrega un salto de línea *!/*/}
                        {/*                                        <Typography*/}
                        {/*                                            component="span"*/}
                        {/*                                            variant="body1"*/}
                        {/*                                            color="textPrimary"*/}
                        {/*                                        >*/}
                        {/*                                            {msg.text}*/}
                        {/*                                        </Typography>*/}
                        {/*                                    </>*/}
                        {/*                                }*/}
                        {/*                            />*/}
                        {/*                        </ListItem>*/}
                        {/*                    ))}*/}
                        {/*                </List>*/}
                        {/*            </div>*/}
                        {/*            <form className="flex h-11" onSubmit={sendMessage}>*/}
                        {/*                <TextField*/}
                        {/*                    type="text"*/}
                        {/*                    value={input}*/}
                        {/*                    onChange={(e) => setInput(e.target.value)}*/}
                        {/*                    variant="filled"*/}
                        {/*                    fullWidth*/}
                        {/*                    placeholder="Escribe un mensaje..."*/}
                        {/*                />*/}
                        {/*                <Button*/}
                        {/*                    type="submit"*/}
                        {/*                    variant="contained"*/}
                        {/*                    color="primary"*/}
                        {/*                    className="ml-2"*/}
                        {/*                >*/}
                        {/*                    Enviar*/}
                        {/*                </Button>*/}
                        {/*            </form>*/}
                        {/*        </div>*/}
                        {/*    </Card>*/}
                        {/*</Grid>*/}
                    </Grid>
                </div>

            </Container>

        </>
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

