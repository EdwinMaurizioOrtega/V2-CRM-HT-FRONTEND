import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card,
    Container,
    Grid,
    IconButton,
    InputAdornment, Link,
    Stack,
    TextField, Typography
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

// ----------------------------------------------------------------------

ValidarEvidenciaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ValidarEvidenciaPage() {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const router = useRouter();

    const [businessPartners, setBusinessPartners] = useState([]);

    const {push} = useRouter();

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get(`/hanadb/api/orders/get_invoices_for_upload_evidencia_by_status?status=23`);

                if (response.status === 200) {
                    console.log(response);
                    const businessPartnersWithId = response.data.orders.map((partner, index) => ({
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

    const handleValidFileChange = async (row) => {

        // Actualizar una orden.
        const response = await axios.put('/hanadb/api/orders/save_status_valid_or_not_evidence', {
            ID_ORDER: Number(row.ID),
            STATUS: Number(1),
            COMMENT: '',

        });

        console.log("Orden actualizada correctamente.");
        console.log("Código de estado:", response.status);

        // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
        if (response.status === 200) {
            router.reload();
        }


    };

    const handleNotValidFileChange = async (row) => {

        const { id } = row;
        const commentInconsistenciaEvidencia = textFieldValues[id] || '';

        // Actualizar una orden.
        const response = await axios.put('/hanadb/api/orders/save_status_valid_or_not_evidence', {
            ID_ORDER: Number(row.ID),
            STATUS: Number(22),
            COMMENT: commentInconsistenciaEvidencia,
        });

        console.log("Orden actualizada correctamente.");
        console.log("Código de estado:", response.status);

        // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
        if (response.status === 200) {
            router.reload();
        }


    };

    // Manejador del cambio del TextField
    const handleTextFieldChange = (id) => (event) => {
        setTextFieldValues((prevValues) => ({
            ...prevValues,
            [id]: event.target.value
        }));
    };

    const [textFieldValues, setTextFieldValues] = useState({});


    const baseColumns = [

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'ID',
            headerName: 'ID_ORDEN',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                const id = params.row.ID; // Accede al ID de la fila
                const path = PATH_DASHBOARD.invoice.view(id);

                return (
                    <Button
                        variant="text"
                        onClick={() => push(path)} // Usa una función anónima para manejar el evento de clic
                        sx={{ color: 'text.disabled', textTransform: 'none' }}
                    >
                        {`INV-${id}`} {/* Muestra el ID con el prefijo */}
                    </Button>
                );
            }
        },
        {
            field: 'CLIENTEID',
            headerName: 'CARD_CODE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'Cliente',
            headerName: 'CLIENTE',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'VENDEDOR',
            headerName: 'VENDEDOR',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'ESTADO',
            headerName: 'ESTADO',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => {
                const { value } = params;
                // Usar switch-case para determinar qué mostrar basado en el valor
                const renderEstado = () => {
                    switch (value) {
                        case 23:
                            return <Typography color="success.main">Pend. Validar Crédito</Typography>;
                        default:
                            return <Typography color="textSecondary">Desconocido</Typography>;
                    }
                };

                return renderEstado();
            },
        },
        {
            field: 'NUMEROGUIA',
            headerName: 'NUMEROGUIA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NUMEROFACTURALIDENAR',
            headerName: 'NUMEROFACTURALIDENAR',
            flex: 1,
            minWidth: 260,
        },
        {
            field: 'FECHAFACTURACION',
            headerName: 'FECHAFACTURACION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'COMENTARIOENTREGA',
            headerName: 'COMENTARIOENTREGA',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'NOMBREUSUARIOENTREGARA',
            headerName: 'ENTREGADO POR',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'URL_INVOICE_SELLER',
            headerName: 'URL_INVOICE_SELLER',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                return (
                    <IconButton
                        component="a"
                        href={params.row.URL_INVOICE_SELLER}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ml: 1}}
                    >
                        <VisibilityIcon/>
                    </IconButton>
                )
            }
        },
        {
            field: 'VÁLIDO',
            headerName: 'VÁLIDO',
            flex: 1,
            minWidth: 360,
            renderCell: (params) => {

                return (

                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon/>}
                        onClick={() => handleValidFileChange(params.row)}
                    >
                        Válido

                    </Button>

                );
            },
        },

        {
            field: 'NO_VÁLIDO',
            headerName: 'NO_VÁLIDO',
            flex: 1,
            minWidth: 360,
            renderCell: (params) => {

                const { id } = params.row; // Obtén el ID de la fila

                return (
                    <TextField
                        name="inconsistenciaEvidencia"
                        label="Comentario"
                        value={textFieldValues[id] || ''} // Valor del TextField desde el estado
                        onChange={handleTextFieldChange(id)} // Actualiza el estado cuando cambia el valor
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Button variant="outlined" size="small"
                                                onClick={() => handleNotValidFileChange(params.row)}
                                        >
                                            No Válido
                                        </Button>
                                    </Stack>
                                </InputAdornment>
                            ),
                        }}
                        sx={{width: 525}} // Establece el ancho del TextField
                    />


                );
            },
        },

    ]

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
                    heading="Crédito Evidencia"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Invoices',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Crédito Evidencia',
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
                                    rowHeight={100} // Define la altura de las filas
                                    pagination
                                    pageSize={10} // Número de filas por página
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