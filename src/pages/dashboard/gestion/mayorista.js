// next
import Head from 'next/head';
// @mui
import { alpha } from '@mui/material/styles';
import {
    Container,
    Typography,
    Box,
    Rating,
    Stack,
    Avatar,
    LinearProgress,
    Card,
    TextField,
    Autocomplete
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import EmptyContent from "../../../components/empty-content";
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {
    DataGrid, GridActionsCellItem, GridToolbar,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import PropTypes from "prop-types";
import _mock from "../../../_mock";
import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import {fPercent} from "../../../utils/formatNumber";
import axios from "../../../utils/axios";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {top100Films} from "../../../sections/@dashboard/invoice/details";

// ----------------------------------------------------------------------

MayoristaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const baseColumns = [

    {
        field: 'id',
        hide: true,
    },
    {
        field: 'Cliente',
        headerName: 'CLIENTE',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'ID',
        headerName: 'ID',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Tipo',
        headerName: 'Tipo',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Celular',
        headerName: 'Celular',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Ciudad',
        headerName: 'Ciudad',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Direccion',
        headerName: 'Direccion',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Cupo',
        headerName: 'Cupo',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Score',
        headerName: 'Score',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Capacidad de Pago',
        headerName: 'Capacidad de Pago',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Endeudamiento',
        headerName: 'Endeudamiento',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'GLN',
        headerName: 'GLN',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'ValidComm',
        headerName: 'ValidComm',
        flex: 1,
        minWidth: 160,
    },
    {
        field: 'Balance',
        headerName: 'Balance',
        flex: 1,
        minWidth: 160,
    },

]

export const rangos = [
    {title: '0-15 dias', id: "01"},
    {title: '16-30 dias', id: "02"},
    {title: '31-60 dias', id: "03"},
    {title: '61-90 dias', id: "04"},
    {title: '91-180 dias', id: "05"},
    {title: '180-360 dias', id: "06"},
    {title: '+360 dias', id: "07"},
    {title: 'Nunca', id: "08"}
]

export default function MayoristaPage() {
    const { themeStretch } = useSettingsContext();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/hanadb/api/BusinessPartners');

                const businessPartnersWithId = response.data.data.map((partner, index) => ({
                    ...partner,
                    id: index + 1, // Puedes ajustar la lógica según tus necesidades
                }));

                setBusinessPartners(businessPartnersWithId);
                console.log("response.data.data: "+JSON.stringify(response.data.data));
                console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []); // The empty dependency array ensures the effect runs once after the initial render

    let counter = 0;
    const getRowId = (row) => {
        counter += 1;
        return counter;
    };



    const BuscarPorRango = async (event, value) => {

        try {

            console.log("ID RANGO: "+value.id); // Log the selected element
            //console.log(ID); // Log ID de la orden

            // // Actualizar una orden.
            // const response = await axios.put('/hanadb/api/orders/order/change_warehouse', {
            //     ID_ORDER: ID,
            //     NEW_WAREHOUSE: value.id,
            //     ID_USER: user.ID,
            //
            // });
            //
            // console.log("Orden actualizada correctamente.");
            // console.log("Código de estado:", response.status);
            //
            // // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            // if (response.status === 200) {
            //     router.reload();
            // }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Gestión Mayoristas"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Gestión',
                            href: PATH_DASHBOARD.gestion.mayorista,
                        },
                        {
                            name: 'Mayoristas',
                        },
                    ]}
                />

                <Card sx={{
                    mb: {xs: 3, md: 5},
                }}
                >
                    <Autocomplete
                        fullWidth
                        options={rangos}
                        getOptionLabel={(option) => option.title}
                        onChange={(event, value) => {
                            BuscarPorRango(event, value);
                        }} // Add onChange event handler
                        renderInput={(params) => <TextField {...params} label="..." margin="none"/>}
                    />
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
                </Card>

            </Container>

        </>
    );
}

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter />
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

// ----------------------------------------------------------------------



