import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Box, Card, Container, Grid, LinearProgress} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// ----------------------------------------------------------------------
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
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
import Link from "next/link";

// ----------------------------------------------------------------------

ReporteRRhhPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ReporteRRhhPage() {
    const {themeStretch} = useSettingsContext();

    // Estado para almacenar los datos y el estado de carga
    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define las columnas para el DataGrid
    const baseColumns = [
        { field: 'ID', headerName: 'ID', width: 90 },
        { field: 'COMPANY', headerName: 'EMPRESA', width: 100 },
        { field: 'USER_ID', headerName: 'User ID', width: 100 },
        { field: 'MARKED_DATE', headerName: 'Marked Date', width: 100 },
        { field: 'MARKED_TIME', headerName: 'Marked Time', width: 100 },
        { field: 'DISPLAYNAME', headerName: 'Display Name', width: 280 },
        {
            field: 'google_maps',
            headerName: 'Google Maps',
            width: 180,
            renderCell: (params) => {
                const latitude = params.row.LATITUDE;
                const longitude = params.row.LONGITUDE;
                const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

                return (
                    <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        Ver en Google Maps
                    </Link>
                );
            }
        }
    ];

    // Cargar datos del endpoint cuando el componente se monta
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/hanadb/api/rrhh/get_all_registros_reloj_biometrico_online');
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
                <title> RRHH | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reloj Biométrico Online"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'RRHH',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Reporte Marcaciones',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>
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