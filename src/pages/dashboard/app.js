// next
import Head from 'next/head';
// @mui
import {useTheme} from '@mui/material/styles';
import {
    Container,
    Grid,
    Stack,
    Button,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel, Typography, Box
} from '@mui/material';
// auth
import {useAuthContext} from '../../auth/useAuthContext';
// layouts
import DashboardLayout from '../../layouts/dashboard';
// _mock_
import {
    _appFeatured,
    _appAuthors,
    _appInstalled,
    _appRelated,
    _appInvoices,
} from '../../_mock/arrays';
// components
import {useSettingsContext} from '../../components/settings';
// sections
import {
    AppWidget,
    AppWelcome,
    AppFeatured,
    AppNewInvoice,
    AppTopAuthors,
    AppTopRelated,
    AppAreaInstalled,
    AppWidgetSummary,
    AppCurrentDownload,
    AppTopInstalledCountries,
} from '../../sections/@dashboard/general/app';
// assets
import {SeoIllustration} from '../../assets/illustrations';
import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {io} from "socket.io-client";
import {Block} from "../../sections/_examples/Block";

import React from 'react';

// ----------------------------------------------------------------------

GeneralAppPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GeneralAppPage() {

    const {user, updateUser} = useAuthContext();

    const theme = useTheme();

    const {themeStretch} = useSettingsContext();

    const [selectedValue, setSelectedValue] = useState(''); // Estado inicial sin valor

    // Sincroniza el estado con el valor de EMPRESA del contexto
    useEffect(() => {
        if (user?.EMPRESA) {
            setSelectedValue(user.EMPRESA);
        }
    }, [user]);

    // Maneja el cambio de selección en el RadioGroup
    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);

        // Lógica para cambiar EMPRESA basado en la selección
        updateUser({EMPRESA: newValue});
    };

    return (
        <>
            <Head>
                <title> General: App | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                {/*<span>{ JSON.stringify(user)}</span>*/}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <AppWelcome
                            title={`¡Bienvenido de nuevo! \n ${user?.DISPLAYNAME}`}
                            description="¡Hola a todos!

¡Estamos emocionados de anunciar que hemos lanzado nuestro nuevo sistema! 🚀💥 Con características mejoradas y una experiencia de usuario mejorada, ¡es hora de explorar todas las novedades que hemos preparado para ustedes!"
                            img={
                                <SeoIllustration
                                    sx={{
                                        p: 3,
                                        width: 360,
                                        margin: {xs: 'auto', md: 'inherit'},
                                    }}
                                />
                            }
                            action={


                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        mx: 'auto', // Center horizontally
                                        my: 2, // Add margin top and bottom
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >

                                            <Typography variant="h4" component="h4" gutterBottom>
                                                <Box component="span" sx={{color: 'red', fontWeight: 'bold'}}>
                                                    ¡ALERTA!
                                                </Box>
                                                {' '}
                                                SELECCIONE UNA EMPRESA
                                            </Typography>

                                            <FormControl component="fieldset" sx={{mb: 2}}>
                                                <RadioGroup row value={selectedValue} onChange={handleChange}>

                                                    {user?.COMPANY === 'HT' || user?.COMPANY === 'INFINIX' || user?.COMPANY === 'TOMEBAMBA' ? (
                                                        <FormControlLabel
                                                            value="0992537442001"
                                                            control={<Radio/>}
                                                            label="HIPERTRONICS"
                                                        />
                                                    ) : null}

                                                    {user?.COMPANY === 'ALPHACELL' ? (
                                                        <FormControlLabel
                                                            value="0992264373001"
                                                            control={<Radio size="small"/>}
                                                            label="ALPHACELL"
                                                        />
                                                    ) : null}
                                                </RadioGroup>
                                            </FormControl>

                                            <Typography variant="h5" component="h5" gutterBottom>
                                                ¡EMPRESA EN LA QUE VAS A TRABAJAR!
                                            </Typography>
                                            <Typography component="span">
                                                RUC: {`${user?.EMPRESA || 'Ninguno'}`}
                                            </Typography>

                                    {user?.EMPRESA && (
                                        <Button href="/dashboard/e-commerce/list/" variant="contained" sx={{mt: 2}}>
                                            TIENDA
                                        </Button>
                                    )}

                                </Box>

                            }
                        />


                    </Grid>

                    {/*   <Grid item xs={12} md={4}> */}
                    {/*     <AppFeatured list={_appFeatured} /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={4}> */}
                    {/*     <AppWidgetSummary */}
                    {/*       title="Total Active Users" */}
                    {/*       percent={2.6} */}
                    {/*       total={18765} */}
                    {/*       chart={{ */}
                    {/*         colors: [theme.palette.primary.main], */}
                    {/*         series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20], */}
                    {/*       }} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={4}> */}
                    {/*     <AppWidgetSummary */}
                    {/*       title="Total Installed" */}
                    {/*       percent={0.2} */}
                    {/*       total={4876} */}
                    {/*       chart={{ */}
                    {/*         colors: [theme.palette.info.main], */}
                    {/*         series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26], */}
                    {/*       }} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={4}> */}
                    {/*     <AppWidgetSummary */}
                    {/*       title="Total Downloads" */}
                    {/*       percent={-0.1} */}
                    {/*       total={678} */}
                    {/*       chart={{ */}
                    {/*         colors: [theme.palette.warning.main], */}
                    {/*         series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31], */}
                    {/*       }} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={4}> */}
                    {/*     <AppCurrentDownload */}
                    {/*       title="Current Download" */}
                    {/*       chart={{ */}
                    {/*         colors: [ */}
                    {/*           theme.palette.primary.main, */}
                    {/*           theme.palette.info.main, */}
                    {/*           theme.palette.error.main, */}
                    {/*           theme.palette.warning.main, */}
                    {/*         ], */}
                    {/*         series: [ */}
                    {/*           { label: 'Mac', value: 12244 }, */}
                    {/*           { label: 'Window', value: 53345 }, */}
                    {/*           { label: 'iOS', value: 44313 }, */}
                    {/*           { label: 'Android', value: 78343 }, */}
                    {/*         ], */}
                    {/*       }} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={8}> */}
                    {/*     <AppAreaInstalled */}
                    {/*       title="Area Installed" */}
                    {/*       subheader="(+43%) than last year" */}
                    {/*       chart={{ */}
                    {/*         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], */}
                    {/*         series: [ */}
                    {/*           { */}
                    {/*             year: '2019', */}
                    {/*             data: [ */}
                    {/*               { name: 'Asia', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] }, */}
                    {/*               { name: 'America', data: [10, 34, 13, 56, 77, 88, 99, 77, 45] }, */}
                    {/*             ], */}
                    {/*           }, */}
                    {/*           { */}
                    {/*             year: '2020', */}
                    {/*             data: [ */}
                    {/*               { name: 'Asia', data: [148, 91, 69, 62, 49, 51, 35, 41, 10] }, */}
                    {/*               { name: 'America', data: [45, 77, 99, 88, 77, 56, 13, 34, 10] }, */}
                    {/*             ], */}
                    {/*           }, */}
                    {/*         ], */}
                    {/*       }} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} lg={8}> */}
                    {/*     <AppNewInvoice */}
                    {/*       title="New Invoice" */}
                    {/*       tableData={_appInvoices} */}
                    {/*       tableLabels={[ */}
                    {/*         { id: 'id', label: 'Invoice ID' }, */}
                    {/*         { id: 'category', label: 'Category' }, */}
                    {/*         { id: 'price', label: 'Price' }, */}
                    {/*         { id: 'status', label: 'Status' }, */}
                    {/*         { id: '' }, */}
                    {/*       ]} */}
                    {/*     /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={4}> */}
                    {/*     <AppTopRelated title="Top Related Applications" list={_appRelated} /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={4}> */}
                    {/*     <AppTopInstalledCountries title="Top Installed Countries" list={_appInstalled} /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={4}> */}
                    {/*     <AppTopAuthors title="Top Authors" list={_appAuthors} /> */}
                    {/*   </Grid> */}

                    {/*   <Grid item xs={12} md={6} lg={4}> */}
                    {/*     <Stack spacing={3}> */}
                    {/*       <AppWidget */}
                    {/*         title="Conversion" */}
                    {/*         total={38566} */}
                    {/*         icon="eva:person-fill" */}
                    {/*         chart={{ */}
                    {/*           series: 48, */}
                    {/*         }} */}
                    {/*       /> */}

                    {/*       <AppWidget */}
                    {/*         title="Applications" */}
                    {/*         total={55566} */}
                    {/*         icon="eva:email-fill" */}
                    {/*         color="info" */}
                    {/*         chart={{ */}
                    {/*           series: 75, */}
                    {/*         }} */}
                    {/*       /> */}
                    {/*     </Stack> */}
                    {/*   </Grid> */}
                </Grid>
            </Container>
        </>
    );
}