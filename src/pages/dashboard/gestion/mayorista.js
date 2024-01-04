// next
import Head from 'next/head';
// @mui
import {alpha} from '@mui/material/styles';
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
import {useSettingsContext} from '../../../components/settings';
import EmptyContent from "../../../components/empty-content";
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
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
import CustomerQuickManagementForm from "./customer-quick-management-form";
import {useBoolean} from "../../../hooks/use-boolean";

// ----------------------------------------------------------------------

MayoristaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------
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

export default function MayoristaPage(callback, deps) {
    const {themeStretch} = useSettingsContext();

    const baseColumns = [
        {
            type: 'actions',
            field: 'actions',
            headerName: ' ',
            align: 'right',
            headerAlign: 'right',
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            getActions: (params) => [

                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:pen-bold"/>}
                    label="Registar Gestión"
                    onClick={() => handleViewRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:eye-bold"/>}
                    label="Gestiones anteriores"
                    onClick={() => handleViewManagementRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:eye-bold"/>}
                    label="Pedidos facturados"
                    onClick={() => handleViewOrdersRow(params.row)}
                />,
            ],
        },

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


    const [businessPartners, setBusinessPartners] = useState([]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get('/hanadb/api/BusinessPartners');
    //
    //             const businessPartnersWithId = response.data.data.map((partner, index) => ({
    //                 ...partner,
    //                 id: index + 1, // Puedes ajustar la lógica según tus necesidades
    //             }));
    //
    //             setBusinessPartners(businessPartnersWithId);
    //             console.log("response.data.data: "+JSON.stringify(response.data.data));
    //             console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));
    //
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };
    //
    //     fetchData();
    // }, []); // The empty dependency array ensures the effect runs once after the initial render

    let counter = 0;
    const getRowId = (row) => {
        counter += 1;
        return counter;
    };


    const BuscarPorRango = async (event, value) => {

        try {

            console.log("ID RANGO: " + value.id); // Log the selected element

            try {
                const response = await axios.post('/hanadb/api/BusinessPartnersByRange', {
                    ID_RANGO: value.id,
                });

                if (response.status === 200) {
                    console.log(response);
                    const businessPartnersWithId = response.data.data.map((partner, index) => ({
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
            ;


        } catch
            (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    const [partner, setPartner] = useState('');
    const quickEdit = useBoolean();

    const handleViewRow = useCallback(
        (row) => {
            quickEdit.onTrue();
            console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickEdit]
    );

    //Ver el registro de gestiones
    const handleViewManagementRow = async (row) => {

        console.log("event: " + JSON.stringify(row.ID));

        try {
            const response = await axios.post('/hanadb/api/BusinessPartners/VisitList', {
                ID_CLIENTE: row.ID,
            });

            if (response.status === 200) {
                console.log("DATA: " + JSON.stringify(response.data));

                //setBusinessPartners(businessPartnersWithId);
                // console.log("response.data.data: " + JSON.stringify(response.data.data));
                // console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
        ;


    };
    //Ver el registro de pedidos
    const handleViewOrdersRow = async (row) => {

        console.log("event: " + JSON.stringify(row.ID));

        try {
            const response = await axios.post('/hanadb/api/BusinessPartners/OrdersList', {
                ID_CLIENTE: row.ID,
            });

            if (response.status === 200) {
                console.log("DATA: " + JSON.stringify(response.data));

                //setBusinessPartners(businessPartnersWithId);
                // console.log("response.data.data: " + JSON.stringify(response.data.data));
                // console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
        ;

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
                    p: 5
                }}
                >
                    <Box
                        rowGap={3}
                        columnGap={2}
                        display="grid"
                        gridTemplateColumns={{
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(2, 1fr)',
                        }}
                    >
                        <Autocomplete
                            fullWidth
                            options={rangos}
                            getOptionLabel={(option) => option.title}
                            onChange={(event, value) => {
                                BuscarPorRango(event, value);
                            }} // Add onChange event handler
                            renderInput={(params) => <TextField {...params} label="Filtrar por rango" margin="none"/>}
                        />

                    </Box>
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


                    <CustomerQuickManagementForm currentPartner={partner} open={quickEdit.value}
                                                 onClose={quickEdit.onFalse}/>

                </Card>

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

// ----------------------------------------------------------------------



