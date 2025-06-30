import React, {useEffect, useCallback, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Grid, Button, Container, Stack, TextField, Card} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// sections
import {useSnackbar} from '../../../components/snackbar';

// ----------------------------------------------------------------------

import {HOST_API_KEY} from '../../../config-global';
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY

    const [isLoading, setIsLoading] = useState(false);

    const showImei = async (guia) => {
        if (guia.length === 9) {
            try {

                setIsLoading(true); // Set loading to true when starting the fetch

                //console.log("Guia: " + guia);
                var dataToSend = {
                    num_guia: guia
                };

                ////console.log("dataToSend: "+JSON.stringify(dataToSend));

                // URL del servidor al que deseas enviar los datos
                const url = `${HOST_API_KEY}/hanadb/api/orders/order/ServiEntrega/GuiasWeb`;

                // Configuración de la solicitud
                const requestOptions = {
                    method: "POST", // Método de la solicitud (POST en este caso)
                    headers: {
                        "Content-Type": "application/json", // Tipo de contenido de los datos enviados (JSON en este caso)
                    },
                    body: JSON.stringify(dataToSend), // Convertir el objeto en una cadena JSON y usarlo como cuerpo de la solicitud
                };

                // Realizar la solicitud Fetch
                fetch(url, requestOptions)
                    .then((response) => response.json()) // Convertir la respuesta en formato JSON
                    .then((data) => {
                        // Aquí puedes manejar la respuesta del servidor (data)
                        //console.log("Respuesta del servidor:", data);

                        var pdfDecode = data.base64File;

                        const byteCharacters = atob(pdfDecode);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const pdfBlob = new Blob([byteArray], {type: 'application/pdf'});
                        const pdfUrl = URL.createObjectURL(pdfBlob);
                        window.open(pdfUrl, '_blank');


                    })
                    .catch((error) => {
                        // Aquí puedes manejar errores en la solicitud
                        console.error("Error en la solicitud:", error);
                    })
                    .finally(() => {
                        setIsLoading(false); // Set loading to false regardless of success or error
                    });
            } catch (error) {
                console.error("Error en la consulta:", error);
            }
        } else {
            onSnackbarAction('El IMEI debe tener 9 dígitos.', 'default', {
                vertical: 'top',
                horizontal: 'center',
            });
        }
    };


    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const onSnackbarAction = (data, color, anchor) => {
        enqueueSnackbar(`${data}`, {
            variant: color,
            anchorOrigin: anchor,
            action: (key) => (
                <>
                    <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>
                        Cerrar
                    </Button>
                </>
            ),
        });
    };


    return (
        <>
            <Head>
                <title> Garantías | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reimprimir Guia Servientrega"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Servientrega',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Guia Servientrega',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>

                                <TextField type="text" className="form-control email"
                                           name="email" id="email2"
                                           placeholder="NUM. GUIA" required

                                           onChange={e => {
                                               setEnteredName(e.currentTarget.value.toUpperCase());
                                           }}
                                />
                                <Button variant="contained"
                                        disabled={isLoading} // Disable the button while loading
                                        onClick={() => {
                                    showImei(enteredName)
                                }}>

                                    {isLoading ? 'Cargando...' : 'BUSCAR'}
                                </Button>

                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

            </Container>
        </>
    );
}

// ----------------------------------------------------------------------
