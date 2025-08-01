import DashboardLayout from "../../../layouts/dashboard";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    LinearProgress
} from "@mui/material";
import {useSettingsContext} from "../../../components/settings";
import {useRouter} from "next/router";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";

CargarArchivosCreditoPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CargarArchivosCreditoPage() {
    const {themeStretch} = useSettingsContext();

    const router = useRouter();
    // const {id} = router.query; // Captura el parámetro "id"

    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define las columnas para el DataGrid
    const baseColumns = [
        {field: 'id', headerName: 'ID', width: 90},
        {field: 'RUC', headerName: 'RUC', width: 120},
        {field: 'NOMBRE', headerName: 'NOMBRE', width: 250},
        {field: 'TIPO_PERSONA', headerName: 'T_P', width: 100},
        {
            field: 'VER INFORMACIÓN',
            headerName: 'VER INFORMACIÓN',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerInformacionCliente(params);
                        }}
                    >
                        VER INFORMACIÓN
                    </Button>
                );
            },
        },
        // {
        //     field: 'CREAR DOCUMENTOS',
        //     headerName: 'CREAR DOCUMENTOS',
        //     flex: 1,
        //     minWidth: 180,
        //     renderCell: (params) => {
        //         return (
        //             <Button
        //                 component="label"
        //                 variant="outlined"
        //                 onClick={() => {
        //                     VerInformacionCliente(params);
        //                 }}
        //             >
        //                 CREAR DOCUMENTOS
        //             </Button>
        //         );
        //     },
        // },
        {
            field: 'VER EN UANATAC',
            headerName: 'VER EN UANATAC',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerInformacionUanataca(params);
                        }}
                    >
                        VER EN UANATAC
                    </Button>
                );
            },
        },
        {
            field: 'VER FIRMA',
            headerName: 'VER FIRMA',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerFirmaUanataca(params);
                        }}
                    >
                        VER FIRMA
                    </Button>
                );
            },
        },


    ];

    const VerInformacionCliente = (row) => {
        //console.log(row.row);
        const url = `/credito/${row.row.TIPO_PERSONA === 'N' ? 'natural' : 'juridica'}/actualizar/?id=${row.row.RUC}`; // Asegúrate de que el ID esté disponible
        window.open(url, "_blank");

    }

    const VerInformacionUanataca = (row) => {
        //console.log(row.row);
        const url = `https://console.nexxit.dev/#login`; // Asegúrate de que el ID esté disponible
        window.open(url, "_blank");

    }


    const VerFirmaUanataca = (row) => {
        //console.log(row.row);
        const url = `https://hypertronics.nexxit.dev/#sso/${row.row.SOO}`; // Asegúrate de que el ID esté disponible
        window.open(url, "_blank");

    }

    // Cargar datos del endpoint cuando el componente se monta
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/hanadb/api/customers/lista_validar_info_prospecto_cartera');
                setBusinessPartners(response.data);  // Suponiendo que el response.data contiene los registros
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false); // Deja de mostrar el loading cuando termine
            }
        };

        fetchData();
    }, []); // Se ejecuta solo una vez al montar el componente

    return (
        <>
            <Head>
                <title> Validar Información | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Validar Información"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {name: 'Crédito', href: PATH_DASHBOARD.blog.root},
                        {name: 'Validar Información'},
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>

                            <CardContent>

                                <DataGrid
                                    rows={businessPartners?.map((partner, index) => ({
                                        ...partner,
                                        id: partner.ID || index + 1, // Usa el ID real si existe, de lo contrario, el índice
                                    })) || []}
                                    columns={baseColumns}
                                    rowHeight={100} // Define la altura de las filas
                                    pagination
                                    pageSize={10} // Número de filas por página
                                    slots={{
                                        toolbar: CustomToolbar,
                                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        loadingOverlay: LinearProgress, // Usa LinearProgress como indicador de carga

                                    }}
                                    loading={loading} // Activa el loading
                                />
                            </CardContent>

                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

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