import DashboardLayout from "../../../layouts/dashboard";
import React from "react";
import Head from "next/head";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {Card, CardContent, CardHeader, Container, Grid, Stack, Typography} from "@mui/material";
import {useSettingsContext} from "../../../components/settings";
import {UploadBox} from "../../../components/upload";
import Iconify from "../../../components/iconify";
import {Label} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {useRouter} from "next/router";

CargarArchivosCreditoPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CargarArchivosCreditoPage() {
    const {themeStretch} = useSettingsContext();

    const router = useRouter();
    const {id} = router.query; // Captura el parámetro "id"

    return (
        <>
            <Head>
                <title> Cargar Archivos | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Cargar Archivos"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {name: 'Crédito', href: PATH_DASHBOARD.blog.root},
                        {name: 'Archivos'},
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>

                            <CardHeader title={'CLIENTE: ' + id}/>

                            <CardContent>
                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Planilla Servicio básico.</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Escritura Constitucion de la Empresa</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>RUC</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Cédula de Identidad</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Estados Fiancieros (Año anterior)</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Nombramiento del Representante Legal</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Declaración de Impuesto a la Renta (Año anterior)</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Certificado Bancario</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Foto del local y georeferencia</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                            </CardContent>

                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}