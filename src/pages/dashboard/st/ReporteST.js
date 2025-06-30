import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Box, Card, Container, Grid, IconButton, Stack} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

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

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const router = useRouter();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get(`/hanadb/api/technical_service/get_oders_technical_service?status=2, 3, 4&empresa=${user.EMPRESA}`);

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

        {field: 'URL_DROPBOX',
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
                        <VisibilityIcon />
                    </IconButton>
                );
            },
        },
        {
            field: 'NOTA_CREDITO',
            headerName: 'NOTA_CREDITO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NO_APLICA_NOTA_CREDITO',
            headerName: 'NO_APLICA_NOTA_CREDITO',
            flex: 1,
            minWidth: 260,
        },
    ]

    return (
        <>
            <Head>
                <title> Garantías | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reporte Servicio Técnico"
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
                            name: 'Reporte Servicio Técnico',
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