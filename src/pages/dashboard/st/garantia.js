import {useEffect, useCallback, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Grid, Button, Container, Stack, TextField} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// sections
import {useSnackbar} from '../../../components/snackbar';

// ----------------------------------------------------------------------

import { HOST_API_KEY } from '../../../config-global';
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY
    const [garantia, setGarantia] = useState('');

    const [marca, setMarca] = useState('');

    const {user} = useAuthContext();

    // const showImei = async enteredName => {
    //
    //     if (enteredName.length === 15) {
    //         console.log("IMEI A CONSULTAR: " + enteredName);
    //         //PAC
    //         console.log("Buscando en el sistema Facturacion PAC")
    //         const responseFull = await fetch(`${HOST_API_KEY}/api/crm-ht/garantia_imei_pac_sap?id=${enteredName}`);
    //         console.log(responseFull)
    //         console.log("Status 200: " + responseFull.status)
    //         let jsonFull = await responseFull.json();
    //
    //         //Retornamos el objeto
    //         setGarantia(jsonFull.message);
    //         setMarca(jsonFull.marca);
    //
    //     } else {
    //         // toast.current.show({severity: 'error', summary: 'Mensaje de error', detail: 'El IMEI debe tener 15 dígitos.', life: 3000});
    //         onSnackbarAction('El IMEI debe tener 15 dígitos.', 'default', {
    //             vertical: 'top',
    //             horizontal: 'center',
    //         })
    //     }
    //
    // }

    const showImei = async (enteredName) => {
        if (enteredName.length === 15) {
            try {
                console.log(`IMEI A CONSULTAR: ${enteredName}`);
                console.log("Buscando en el sistema Facturacion PAC");

                const responseFull = await fetch(`${HOST_API_KEY}/api/crm-ht/garantia_imei_pac_sap?id=${enteredName}&empresa=${user.EMPRESA}`);
                console.log(" responseFull: "+ JSON.stringify( responseFull));

                if (responseFull.status === 200) {
                    const { garantia, marca } = await responseFull.json();
                    setGarantia(garantia);
                    setMarca(marca);
                } else {
                    console.log(`Status ${responseFull.status}: Hubo un problema en la consulta.`);
                    setGarantia("NO FACTURADO EN LIDENAR");
                }
            } catch (error) {
                console.error("Error en la consulta:", error);
            }
        } else {
            onSnackbarAction('El IMEI debe tener 15 dígitos.', 'default', {
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
                    heading="Validar Garantía Lidenar - Hipertronics"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Servicio Técnico',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Garantía',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <div className="grid">

                        <div className="col-12 md:col-12">
                            <div className="card p-fluid">

                                 <div className="App" style={{display: "contents"}}>

                                <div className="input-wrapper input-wrapper-inline input-wrapper-round">
                                    <TextField type="text" className="form-control email" name="email" id="email2"
                                               placeholder="IMEI here..." required

                                               onChange={e => {
                                                   setEnteredName(e.currentTarget.value);
                                               }}
                                    />
                                    <Button className="btn btn-dark"

                                            onClick={() => {
                                                showImei(enteredName)
                                            }}
                                    >BUSCAR</Button>
                                </div>
                                <h5>{garantia}</h5>

                                {
                                    marca && marca == 'SAMSUNG' ? (
                                        <div className="align-content-center">

                                            <h2>Brand Image Telecomunicaciones</h2>
                                            <br></br>
                                            <span>
                                    Teléfonos de contacto: +593 99 110 5322  / +593 98 119 3615</span> <br></br>
                                            <span>
                                Cuenca
                                Luis Cordero 10-32 y Gran Colombia,
                                Guayaquil.
                                Francisco de Orellana y A. Bordes Najera.
                            </span>

                                        </div>
                                    ) : null
                                }


                                {

                                    marca && marca != 'SAMSUNG' ? (

                                        <div className="align-content-center">


                                            <h2>Otras marcas</h2>


                                            <br></br>
                                            <span>
                                    Teléfonos de contacto: +593 99 110 5322  / +593 98 119 3615</span> <br></br>
                                            <span>
                                Cuenca
                                Luis Cordero 10-32 y Gran Colombia,
                                Guayaquil.
                                Francisco de Orellana y A. Bordes Najera.
                            </span>

                                        </div>


                                    ) : null


                                }

                            </div>

                            </div>

                        </div>

                    </div>

                </Grid>
            </Container>
        </>
    );
}

// ----------------------------------------------------------------------
