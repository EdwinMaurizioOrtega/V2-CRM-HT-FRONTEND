import React, {useEffect, useCallback, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Grid,
    Button,
    Container,
    Stack,
    TextField,
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    IconButton
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// sections
import {useSnackbar} from '../../../components/snackbar';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';



// ----------------------------------------------------------------------

import {HOST_API_KEY} from '../../../config-global';
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import Iconify from "../../../components/iconify";
import {fCurrency} from "../../../utils/formatNumber";
import axios from "../../../utils/axios";
import {fDateCustomDateAndTime} from "../../../utils/formatTime";
import {Upload} from "../../../components/upload";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY
    const [garantia, setGarantia] = useState('');

    const [marca, setMarca] = useState('');

    const {user} = useAuthContext();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get('/hanadb/api/technical_service/get_oders_technical_service');

                if (response.status === 200) {
                    console.log(response);
                    const businessPartnersWithId = response.data.result.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartners(businessPartnersWithId);
                    console.log("response.data.data: " + JSON.stringify(response.data.data));
                    console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }


            } catch (error) {
                console.error('Error fetching data:', error);
            }

        };

        BuscarPorRango()

    }, []);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event, row) => {
        const file = event.target.files[0];
        // setSelectedFile(file);

        if (file) {
            handleFileUpload(file, row);
        }
    };

    const handleFileUpload = (file, row) => {
        // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
        console.log('Archivo seleccionado:', file);
        console.log('Número de orden:', row.ID_ORDEN);

        // Ejemplo de envío a un servidor (reemplaza con tu lógica)
        const formData = new FormData();
        formData.append('file_data', file);
        formData.append('id_order', row.ID_ORDEN);

        fetch(`${HOST_API_KEY}/hanadb/api/technical_service/api_upload_file_to_dropbox`, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor:', data);
            })
            .catch(error => {
                console.error('Error al cargar el archivo:', error);
            });
    };

    const baseColumns = [

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'ID_ORDEN',
            headerName: 'ID_ORDEN',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CREACION',
            headerName: 'FECHA_CREACION',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'IMEI_SERIE',
            headerName: 'IMEI_SERIE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'GARANTIA_FISICA',
            headerName: 'GARANTIA_FISICA',
            flex: 1,
            minWidth: 260,
        },
        {
            field: 'GUIA_SERVIENTREGA',
            headerName: 'GUIA_SERVIENTREGA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'DISPLAYNAME',
            headerName: 'DISPLAYNAME',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'pdf',
            headerName: 'REPORTE TALLER',
            width: 200,
            renderCell: (params) => {
                return (
                    // <Button
                    //     variant="contained"
                    //     onClick={() => handleShowCoordinates(params.row)}
                    // >
                    //    CARGAR PDF
                    // </Button>


                    <CardContent>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon />}
                        >
                            Archivo
                            <input
                                type="file"
                                hidden
                                onChange={(event) => handleFileChange(event, params.row)}
                            />
                        </Button>
                    </CardContent>
                );
            }
        },
        {
            field: 'si',
            headerName: 'APLICA NOTA CRÉDITO',
            width: 250,
            renderCell: (params) => {
                return (
                    <>
                        <Button
                            variant="contained"
                            onClick={() => handleShowCoordinates(params.row)}
                        >
                            SI
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => handleShowCoordinates(params.row)}
                        >
                            NO
                        </Button>
                    </>

                );
            }
        },
        {field: 'URL_DROPBOX',
            headerName: 'URL_DROPBOX',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                if (params.value === null || params.value === undefined) {
                    return null; // Si params.value es null o undefined, no renderizar nada
                }

                const url = params.value;
                const modifiedUrl = url.slice(0, -4) + 'raw=1'; // Reemplaza los últimos 4 caracteres por 'edwin'

                return (
                    <IconButton
                        component="a"
                        href={modifiedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver enlace"
                    >
                        <VisibilityIcon />
                    </IconButton>
                );
            },
        },
        //
    ]

    const handleShowCoordinates = (data) => {
        if (data) {
            console.log("Fila seleccionada:", data);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario

        } else {
            console.log("No se ha seleccionado ningún marcador.");
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
                    heading="Gestión Orden"
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
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>
                                    <DataGrid
                                        rows={businessPartners}
                                        columns={baseColumns}
                                        pagination
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                            noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        }}
                                    />
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
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