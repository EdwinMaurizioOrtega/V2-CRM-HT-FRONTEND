import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Stack, Switch,
    TextField
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
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import {useRouter} from "next/router";
import {Label} from "@mui/icons-material";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY
    const [garantia, setGarantia] = useState('');

    const [marca, setMarca] = useState('');

    const {user} = useAuthContext();

    const router = useRouter();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get(`/hanadb/api/technical_service/get_oders_technical_service?status=0&empresa=${user.EMPRESA}`);

                if (response.status === 200) {
                    //console.log(response);
                    const businessPartnersWithId = response.data.result.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartners(businessPartnersWithId);
                    //console.log("response.data.data: " + JSON.stringify(response.data.data));
                    //console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

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
        //console.log('Archivo seleccionado:', file);
        //console.log('Número de orden:', row.ID_ORDEN);

        // Ejemplo de envío a un servidor (reemplaza con tu lógica)
        const formData = new FormData();
        formData.append('file', file);

        fetch(`https://imagen.hipertronics.us/ht/cloud/upload_web_files`, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();  // Convertir la respuesta a JSON si el estado es 200
                } else {
                    throw new Error('Failed to upload file');  // Lanzar un error si el estado no es 200
                }
            })
            .then(async data => {
                if (data.status === 'success') {
                    //console.log('Archivo subido con éxito. Enlace:', data.link);

                    // Actualizar una orden.
                    const response = await axios.put('/hanadb/api/technical_service/api_save_url_file', {
                        ID_ORDER: Number(row.ID_ORDEN),
                        URL: data.link,
                        empresa: user.EMPRESA,
                    });

                    //console.log("Orden actualizada correctamente.");
                    //console.log("Código de estado:", response.status);

                    // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
                    if (response.status === 200) {
                        router.reload();
                    }


                } else {
                    console.error('Error en la respuesta del servidor:', data);
                }
            })
            .catch(error => {
                console.error('Error al cargar el archivo:', error);
            });


    };

    const [textFieldValues, setTextFieldValues] = useState({});

    // Manejador del cambio del TextField
    const handleTextFieldChange = (id) => (event) => {
        setTextFieldValues((prevValues) => ({
            ...prevValues,
            [id]: event.target.value
        }));
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
            field: 'CARD_CODE',
            headerName: 'CARD_CODE',
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
            minWidth: 460,
            // renderCell: (params) => {
            //     return (
            //         <>
            //
            //             {params.row.GUIA_SERVIENTREGA}
            //
            //             <Button
            //                 variant="contained"
            //                 onClick={() => handleShowActualizarGuiaReparacionEnTaller(params.row.ID_ORDEN)}
            //             >
            //                 Actualizar
            //             </Button>
            //         </>
            //
            //     );
            // }

            renderCell: (params) => {

                const {id} = params.row; // Obtén el ID de la fila

                return (
                    <>
                        {params.row.GUIA_SERVIENTREGA}

                        <TextField
                            name="precioProducto"
                            label="Guia (Nueve dígitos)"
                            value={textFieldValues[id] || ''} // Valor del TextField desde el estado
                            onChange={handleTextFieldChange(id)} // Actualiza el estado cuando cambia el valor
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Button variant="outlined" size="small"
                                                    onClick={() => handleShowActualizarGuiaReparacionEnTaller(params.row)}
                                            >
                                                Actualizar Guia
                                            </Button>
                                        </Stack>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{width: 325}} // Establece el ancho del TextField
                        />

                    </>

                );
            }
        },
        {
            field: 'NAME_EMPLEADO_X_FACTURACION',
            headerName: 'EMPLEADO_X_FACTURACION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'USUARIO_CREACION_ORDEN',
            headerName: 'USUARIO_CREACION_ORDEN',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'pdf',
            headerName: 'REPORTE TALLER',
            width: 200,
            renderCell: (params) => {

                if (params.row.URL_DROPBOX !== null) {
                    return 'Archivo cargado.'; // o algún otro contenido si lo deseas
                } else {

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
                                startIcon={<CloudUploadIcon/>}
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
                            onClick={() => handleShowSiAplicaNotaCredito(params.row)}
                        >
                            SI
                        </Button>
                    </>

                );
            }
        },
        {
            field: 'no',
            headerName: 'NO APLICA NOTA CRÉDITO',
            width: 550,
            renderCell: (params) => {
                return (
                    <>
                        <Button
                            variant="contained"
                            onClick={() => handleShowFueraDeGarantia(params.row)}
                        >
                            FUERA DE GARANTÍA
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => handleShowReparacionEnTaller(params.row)}
                        >
                            REPARACIÓN EN TALLER
                        </Button>
                    </>

                );
            }
        },
        {
            field: 'URL_DROPBOX',
            headerName: 'URL_DROPBOX',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                if (params.value === null || params.value === undefined) {
                    return null; // Si params.value es null o undefined, no renderizar nada
                }

                //const modifiedUrl = url.slice(0, -4) + 'raw=1'; // Reemplaza los últimos 4 caracteres por 'edwin'
                const modifiedUrl = params.value; // Reemplaza los últimos 4 caracteres por 'edwin'

                return (
                    <IconButton
                        component="a"
                        href={modifiedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver enlace"
                    >
                        <VisibilityIcon/>
                    </IconButton>
                );
            },
        },
        {
            field: 'OBS_VENDEDOR',
            headerName: 'OBS_VENDEDOR',
            flex: 1,
            minWidth: 550,

        },
    ]

    const handleShowSiAplicaNotaCredito = async (data) => {
        //Enviar a la páguina de creación de la nota de credito
        if (data) {
            //console.log("Fila seleccionada:", data);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario

            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/technical_service/update_status_order_technical', {
                ID_ORDER: Number(data.ID_ORDEN),
                empresa: user.EMPRESA,
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }


        } else {
            //console.log("No se ha seleccionado ningún marcador.");
        }
    };

    const handleShowFueraDeGarantia = async (data) => {
        //Enviar un correo electrónico.
        if (data) {
            //console.log("Fila seleccionada:", data);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario

            // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
            //console.log('Número de orden:', data.ID_ORDEN);

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/technical_service/imei_fuera_de_garantia', {
                ID_ORDER: Number(data.ID_ORDEN),
                IMEI: data.IMEI_SERIE,
                EMAIL_EMPLEADO_X_FACTURACION: data.EMAIL_EMPLEADO_X_FACTURACION,
                URL_DROPBOX: data.URL_DROPBOX,
                empresa: user.EMPRESA,
            });

            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                //console.log("Orden actualizada correctamente.");
                router.reload();
            }


        } else {
            //console.log("No se ha seleccionado ningún marcador.");
        }
    };

    const handleShowReparacionEnTaller = async (data) => {
        //Enviar un correo electrónico.
        if (data) {
            //console.log("Fila seleccionada:", data);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario

            // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
            //console.log('Número de orden:', data.ID_ORDEN);

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/technical_service/imei_reparacion_en_taller', {
                ID_ORDER: Number(data.ID_ORDEN),
                IMEI: data.IMEI_SERIE,
                EMAIL_EMPLEADO_X_FACTURACION: data.EMAIL_EMPLEADO_X_FACTURACION,
                URL_DROPBOX: data.URL_DROPBOX,
                empresa: user.EMPRESA,
            });

            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                //console.log("Orden actualizada correctamente.");
                router.reload();
            }


        } else {
            //console.log("No se ha seleccionado ningún marcador.");
        }
    }

    const handleShowActualizarGuiaReparacionEnTaller = async (row) => {
        const {id} = row;
        const nuevaGuiaServientrega = textFieldValues[id] || '';
        if (row && nuevaGuiaServientrega) {
            //console.log("Fila seleccionada:", row);

            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/technical_service/update_new_guia_order_technical', {
                ID_ORDER: Number(row.ID_ORDEN),
                COMMENT: nuevaGuiaServientrega,
                empresa: user.EMPRESA,
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } else {
            //console.log("No se ha detectado ningun dato");
        }
    }

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