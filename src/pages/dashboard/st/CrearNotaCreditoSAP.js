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
    Stack,
    TextField, Tooltip
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
import Iconify from "../../../components/iconify";
import {RHFTextField} from "../../../components/hook-form";
import {InfoIcon} from "../../../theme/overrides/CustomIcons";

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
                const response = await axios.get('/hanadb/api/technical_service/get_oders_technical_service?status=1');

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


    const handleShowCrearNotaCredito = async (row) => {

        // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
        console.log('Número de orden:', row.ID_ORDEN);
        console.log(precioProducto); // Imprime el valor del TextField

        if (precioProducto) {

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/technical_service/create_nota_credito_warranty_sap', {
                ID_ORDER: Number(row.ID_ORDEN),
                IMEI: row.IMEI_SERIE,
                PRICE_EXCL_IVA: precioProducto,
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            // if (response.status === 200) {
            //     router.reload();
            // } else {
                alert(JSON.stringify(response.data))
            //}

        } else {
            alert("Por favor ingrese un precio para la nota de crédito válido.")
        }

        //Limpiamos este campo.
        setPrecioProducto('')
    };

    // Estado para el valor del TextField
    const [precioProducto, setPrecioProducto] = useState('');

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
            minWidth: 160,
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
            field: 'si',
            headerName: 'APLICA NOTA CRÉDITO',
            width: 450,
            renderCell: (params) => {
                return (
                    <>
                        {/* <Button */}
                        {/*     variant="contained" */}
                        {/*     onClick={() => handleShowCrearNotaCredito(params.row)} */}
                        {/* > */}
                        {/*     Crear NC */}
                        {/* </Button> */}

                        <TextField
                            name="precioProducto"
                            label="Precio Producto Excluido IVA (126.00)"
                            value={precioProducto} // Valor del TextField desde el estado
                            onChange={(e) => setPrecioProducto(e.target.value)} // Actualiza el estado cuando cambia el valor
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Button variant="outlined" size="small"
                                                    onClick={() => handleShowCrearNotaCredito(params.row)}
                                            >
                                                Crear NC
                                            </Button>
                                        </Stack>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{width: 385}} // Establece el ancho del TextField
                        />

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
        //
    ]

    const handleShowSiAplicaNotaCredito = (data) => {
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
                    heading="Crear Nota Crédito SAP"
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
                            name: 'Nota Crédito SAP',
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
                                    rowHeight={100} // Define la altura de las filas
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