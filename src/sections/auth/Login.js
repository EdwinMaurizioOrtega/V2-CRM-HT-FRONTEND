// next
import NextLink from 'next/link';
// @mui
import {Alert, Tooltip, Stack, Typography, Link, Box, AlertTitle, Button, CircularProgress} from '@mui/material';
// auth
import {useAuthContext} from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
// routes
import {PATH_AUTH} from '../../routes/paths';
//
import AuthLoginForm from './AuthLoginForm';
import AuthWithSocial from './AuthWithSocial';
import React, {useEffect, useState} from "react";
import Iconify from "../../components/iconify";
import Label from "../../components/label";

// ----------------------------------------------------------------------

export default function Login() {
    const {method} = useAuthContext();

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loading, setLoading] = useState(false); // Estado de carga


    const requestGeolocation = () => {
        setLoading(true); // Mostrar el indicador de carga

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Extraer la latitud y longitud de la posición
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    setError(null); // Limpiar cualquier error anterior
                    setShowLoginForm(true); // Mostrar el formulario de inicio de sesión
                    setLoading(false); // Ocultar el indicador de carga


                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                    setError('Para acceder al contenido, por favor activa la geolocalización.');
                    setLoading(false); // Ocultar el indicador de carga

                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            setError('La geolocalización no es compatible con este navegador.');
            setLoading(false); // Ocultar el indicador de carga

        }
    };

    const handleOpenSettings = () => {
        // Informar al usuario sobre cómo acceder manualmente a la configuración de permisos
        setError('Para activar la geolocalización, por favor ve a la configuración del navegador y habilita los permisos de ubicación.');
    };

    return (
        <LoginLayout>
            <div>
                {error ? (

                    <Stack spacing={2}>

                        <Alert key="error" severity="error">
                            <AlertTitle sx={{textTransform: 'capitalize'}}> Error de Geolocalización </AlertTitle>
                            {error}
                        </Alert>
                        <Button color="info" size="small" variant="soft" onClick={handleOpenSettings}>
                            Instrucciones
                        </Button>
                    </Stack>
                ) : (
                    <div>
                        <Stack spacing={2} sx={{mb: 5, position: 'relative'}}>
                            <Typography variant="h4">Iniciar sesión en Lidenar</Typography>

                            <Stack direction="row" spacing={0.5}>
                                <Typography variant="body2">¿Nuevo usuario?</Typography>

                                <Link component={NextLink} href={PATH_AUTH.register} variant="subtitle2">
                                    Crea una cuenta
                                </Link>
                            </Stack>

                            <Tooltip title={method} placement="left">
                                <Box
                                    component="img"
                                    alt={method}
                                    src={`/assets/icons/auth/ic_${method}.png`}
                                    sx={{width: 32, height: 32, position: 'absolute', right: 0}}
                                />
                            </Tooltip>
                        </Stack>

                        {/* <Alert severity="info" sx={{ mb: 3 }}> */}
                        {/*   Use email : <strong>sistemas@hipertronics.us</strong> / password :<strong> ,2023;MongoDB</strong> */}
                        {/* </Alert> */}

                        {loading ? (
                            <Stack alignItems="center" justifyContent="center" sx={{ height: '100px' }}>
                                <CircularProgress />
                            </Stack>
                        ) : showLoginForm ? (
                            <AuthLoginForm />
                        ) : (
                            <>

                                {latitude && longitude ? (
                                    <Typography variant="body1">
                                        Latitud: {latitude}, Longitud: {longitude}
                                    </Typography>
                                ) : (
                                    <Typography variant="body1">
                                        {error ? error : 'Para iniciar sesión, haga clic en el botón para obtener su ubicación.'}
                                    </Typography>
                                )}
                                {!error && !latitude && !longitude && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={requestGeolocation}
                                        style={{margin: '10px'}}
                                    >
                                        Obtener Ubicación
                                    </Button>
                                )}
                                {error && !latitude && !longitude && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleOpenSettings}
                                    >
                                        ¿Cómo habilitar la geolocalización?
                                    </Button>
                                )}

                            </>

                        )}

                        <AuthWithSocial/>
                        {latitude && longitude ? (
                        <Stack spacing={2} sx={{mb: 5, position: 'relative'}}>
                            <Label variant="filled" color="primary" startIcon={<Iconify icon="eva:info-fill"/>}>
                                {latitude && <p>Latitud: {latitude}</p>}
                            </Label>
                            <Label variant="filled" color="primary" startIcon={<Iconify icon="eva:info-fill"/>}>
                                {longitude && <p>Longitud: {longitude}</p>}
                            </Label>
                        </Stack>
                            ) : null
                        }

                    </div>
                )}
            </div>
        </LoginLayout>
    );
}