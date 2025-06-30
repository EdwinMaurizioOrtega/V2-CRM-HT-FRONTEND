import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Button, Card, CircularProgress, Container, Grid} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
//
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// utils
import axios from "../../../utils/axios";


// ----------------------------------------------------------------------

MarcarPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------






export default function MarcarPage() {
    const { themeStretch } = useSettingsContext();
    const { user } = useAuthContext();

    const [dateTime, setDateTime] = useState(new Date());
    const [coordinates, setCoordinates] = useState(null);
    const [markedDate, setMarkedDate] = useState(null);
    const [markedTime, setMarkedTime] = useState(null);
    const [dataValid, setDataValid] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime24 = (date) => {
        return date.toLocaleTimeString("es-ES", { hour12: false });
    };

    const handleMark = () => {
        setLoading(true); // Desactivar botón y mostrar loading
        const now = new Date();
        setMarkedDate(now.toLocaleDateString());
        setMarkedTime(formatTime24(now));

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ latitude, longitude });
                    setDataValid(true);
                    //console.log("Fecha de la marca:", now.toLocaleDateString());
                    //console.log("Hora de la marca:", formatTime24(now));
                    //console.log("Coordenadas:", `Lat: ${latitude}, Lng: ${longitude}`);

                    // Enviar datos a la API
                    sendToAPI(latitude, longitude);
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    setDataValid(false);
                    setLoading(false); // Ocultar loading si hay error
                }
            );
        } else {
            console.error("Geolocalización no soportada en este navegador");
            setDataValid(false);
            setLoading(false);
        }
    };

    const sendToAPI = async (latitude, longitude) => {
        try {
            const response = await axios.post('/hanadb/api/rrhh/crear_registro_reloj_biometrico_online', {
                user_id: user.ID,
                latitude: latitude,
                longitude: longitude,
            });

            //console.log('Status crear registro:', response.status);
            if (response.status === 200) {
                //console.log('Gracias');
            } else {
                //console.log('La solicitud no devolvió un estado 200.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false); // Ocultar loading después de enviar los datos
        }
    };

    return (
        <>
            <Head>
                <title> RRHH | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reloj Biométrico Online"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'RRHH', href: PATH_DASHBOARD.blog.root },
                        { name: 'Reloj Biométrico' },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{ p: 3, textAlign: "center" }}>
                            <h2>Reloj Biométrico Lidenar</h2>
                            <p>Fecha y Hora actual: {dateTime.toLocaleString("es-ES")}</p>

                            {/* Botón MARCAR o Loading */}
                            {loading ? (
                                <CircularProgress color="primary" />
                            ) : (
                                !coordinates && ( // Ocultar botón después de marcar
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleMark}
                                        disabled={loading} // Deshabilitar mientras carga
                                    >
                                        MARCAR
                                    </Button>
                                )
                            )}

                            {coordinates && <p>Usuario: {user.DISPLAYNAME}</p>}
                            {markedDate && markedTime && (
                                <p>Fecha de la marca: {markedDate} <br /> Hora de la marca: {markedTime}</p>
                            )}
                            {coordinates && (
                                <p>
                                    Coordenadas: Lat: {coordinates.latitude}, Lng: {coordinates.longitude}
                                    <br />
                                    <a
                                        href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver en Google Maps
                                    </a>
                                </p>
                            )}
                            <div style={{ marginTop: "10px" }}>
                                {dataValid ? (
                                    <CheckCircleIcon style={{ color: "green", fontSize: 40 }} />
                                ) : (
                                    <CancelIcon style={{ color: "red", fontSize: 40 }} />
                                )}
                            </div>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
