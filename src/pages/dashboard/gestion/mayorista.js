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
    Autocomplete, InputAdornment, IconButton, Grid, Divider, CardActionArea, Chip, CardContent, Tabs, Tab
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
import {fCurrency, fPercent} from "../../../utils/formatNumber";
import axios from "../../../utils/axios";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {useBoolean} from "../../../hooks/use-boolean";
import CustomerQuickManagementForm from "../../../sections/@dashboard/gestion/customer-quick-management-form";
import PreviousClientManagement from "../../../sections/@dashboard/gestion/previous-client-management";
import InvoicedClientOrders from "../../../sections/@dashboard/gestion/invoiced-client-orders";
import {useAuthContext} from "../../../auth/useAuthContext";
import CalendarView from "../../../sections/calendar/view/calendar";
import {AnalyticsWidgetSummary} from "../../../sections/@dashboard/general/analytics";
import {Space_Mono} from "@next/font/google";
import {TIPO_CREDITO} from "../../../utils/constants";
import CustomerData from "../../../sections/@dashboard/gestion/customer-data";
import CustomerLocationMap from "../../../sections/@dashboard/gestion/customer-location-map";
import {Block} from "../../../sections/_examples/Block";

// ----------------------------------------------------------------------

MayoristaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------
export const rangos = [
    {title: "0-15 días", id: "01", icon: "solar:calendar-date-bold"},
    {title: "16-30 días", id: "02", icon: "solar:calendar-bold"},
    {title: "31-60 días", id: "03", icon: "solar:clock-circle-bold"},
    {title: "61-90 días", id: "04", icon: "solar:hourglass-bold"},
    {title: "91-180 días", id: "05", icon: "solar:calendar-add-bold"},
    {title: "180-360 días", id: "06", icon: "solar:calendar-mark-bold"},
    {title: "+360 días", id: "07", icon: "solar:infinity-bold-duotone"},
    // { title: "Nunca", id: "08", icon: "solar:close-circle-bold" },
];

const TABS = [
    {value: 'ultima-factura', label: 'Última Factura'},
    {value: 'medio-de-contacto', label: 'Medio de Contacto'},
    {value: 'otro-criterio', label: 'Otro Criterio'},
];

export default function MayoristaPage(callback, deps) {

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const [selected, setSelected] = useState(null);

    const [currentTab, setCurrentTab] = useState('one');


    const [partner, setPartner] = useState(null);
    const quickEdit = useBoolean();
    const quickPCM = useBoolean();
    const quickICO = useBoolean();
    const quickDC = useBoolean();
    const quickCLM = useBoolean();

    // Define el renderizador de celdas personalizado para la columna "DIAS_DIFFERENCE"
    const renderDiasColumn = (params) => {
        const diasDifference = params.value; // Obtén el valor de la celda
        if (diasDifference === null) {
            return '∞ días'; // Devuelve '...' si el valor es null
        } else {
            return `${diasDifference} días`; // Concatena "días" al valor y devuelve el resultado
        }
    };

    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {mx: '8px !important'},
    };

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
                    icon={<Iconify icon="solar:pen-broken"/>}
                    label="Registar Gestión"
                    onClick={() => handleViewRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:eye-broken"/>}
                    label="Gestiones Anteriores"
                    onClick={() => handleViewManagementRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:paperclip-rounded-outline"/>}
                    label="Histórico Órdenes"
                    onClick={() => handleViewOrdersRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:maximize-square-3-linear"/>}
                    label="Datos del Cliente"
                    onClick={() => handleViewDataCustomerRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:map-point-favourite-linear"/>}
                    label="Google Maps"
                    onClick={() => handleViewCustomerLocationMapRow(params.row)}
                />,
            ],
        },

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'DIAS_DIFFERENCE',
            headerName: 'ÚLTIMA GESTIÓN',
            flex: 1,
            minWidth: 100,
            renderCell: renderDiasColumn, // Usa el renderizador de celdas personalizado
        },
        {
            field: 'Cliente',
            headerName: 'CLIENTE',
            flex: 1,
            minWidth: 300,
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
            field: 'CreditLine',
            headerName: 'Límte de Crédito',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => fCurrency(params.value),
        },
        {
            field: 'Balance',
            headerName: 'Saldo Deuda',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => fCurrency(params.value),
        },
        {
            headerName: 'Cupo Disponible',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                const creditLine = params.row.CreditLine || 0; // Valor predeterminado de CreditLine si es null o undefined
                const balance = params.row.Balance || 0; // Valor predeterminado de Balance si es null o undefined
                return fCurrency(creditLine - balance);
            },
        },
        {
            field: 'U_SYP_CREDITO',
            headerName: 'Tipo Crédito',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => tipoCredito(params.value)
        },
        // {
        //     field: 'Endeudamiento',
        //     headerName: 'Endeudamiento',
        //     flex: 1,
        //     minWidth: 160,
        // },
        // {
        //     field: 'GLN',
        //     headerName: 'Tipo crédito',
        //     flex: 1,
        //     minWidth: 160,
        // },
        // {
        //     field: 'ValidComm',
        //     headerName: 'Crédito aprobado',
        //     flex: 1,
        //     minWidth: 160,
        // },
        {
            field: 'PADRE',
            headerName: 'PADRE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NOM_PADRE',
            headerName: 'NOM_PADRE',
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
    //             //console.log("response.data.data: "+JSON.stringify(response.data.data));
    //             //console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));
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

    const BuscarPorRango = async (event, value, tipo_gestion) => {

        try {

            //console.log("ID RANGO: " + value.id); // Log the selected element
            //console.log("Usuario logueado: " + user.DISPLAYNAME)

            try {
                const response = await axios.post('/hanadb/api/customers/BusinessPartnersByRange', {
                    ID_RANGO: value.id,
                    USER_NAME: user.DISPLAYNAME,
                    TIPO_GESTION: tipo_gestion,
                });

                if (response.status === 200) {
                    //console.log(response);
                    const businessPartnersWithId = response.data.data.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartners(businessPartnersWithId);
                    console.log("response.data.data: " + JSON.stringify(response.data.data));
                    //console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }


            } catch (error) {
                console.error('Error fetching data:', error);
            }

        } catch
            (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    const handleViewRow = useCallback(
        (row) => {
            quickEdit.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickEdit]
    );


    const handleViewManagementRow = useCallback(
        (row) => {
            quickPCM.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickPCM]
    );


    const handleViewOrdersRow = useCallback(
        (row) => {
            quickICO.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickICO]
    );

    const [dataCliente, setDataCliente] = useState(null);

    const handleViewDataCustomerRow = useCallback(
        async (row) => {
            quickDC.onTrue();

            //console.log("ID: " + row?.ID);
            //console.log('USER: ', user.ID);

            let currentPartner = row?.ID.replace(/CL/g, "");
            //console.log('Cliente: ', currentPartner); // Output: "Mi nombre es ara y vivo en oud ity."

            // Crear un cliente.
            const response = await axios.post('/hanadb/api/customers/BusinessPartners/ByRucCI', {
                CI_RUC: currentPartner,
                USUARIO_ID: user.ID,

            });

            if (response.status === 200) {
                //console.log("DATA: " + JSON.stringify(response.data.data));
                // La solicitud PUT se realizó correctamente
                setDataCliente(response.data.data);
            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }

        },
        [quickDC]
    );


    const handleViewCustomerLocationMapRow = useCallback(
        (row) => {
            quickCLM.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickCLM]
    );


    const [dataContAgenda, setDataContAgenda] = useState(0);
    const [dataContAgendaCErrado, setDataContAgendaCerrado] = useState(0);
    const [dataContAgendaPorCerrar, setDataContAgendaPorCerrar] = useState(0);


    const handleValorCambiado = (nuevoValor) => {
        //console.log("Llega el nuevo valor: " + JSON.stringify(nuevoValor));

        setDataContAgenda(nuevoValor.length); // Corregido: asignar la longitud directamente
        const agendaCerrada = nuevoValor.filter((agenda) => agenda.VISITO === false); // Usar filter() para obtener todos los elementos que cumplan con la condición
        setDataContAgendaCerrado(agendaCerrada.length); // Almacenar los elementos que cumplen con la condición

        const agendaPorCerrar = nuevoValor.filter((agenda) => agenda.VISITO === true); // Usar filter() para obtener todos los elementos que cumplan con la condición
        setDataContAgendaPorCerrar(agendaPorCerrar.length); // Almacenar los elementos que cumplen con la condición
    };


    const handleClick = async (event, rango, tipo_gestion) => {
        setSelected(rango.id);
        await BuscarPorRango(event, rango, tipo_gestion);
    };

    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'xl'}>
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

                <Card
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                        background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    }}
                >


                    <Block title="Gestión por:" sx={style}>
                        <Stack spacing={2} sx={{width: 1}}>
                            <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
                                {TABS.slice(0, 3).map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label}/>
                                ))}
                            </Tabs>

                            {TABS.slice(0, 3).map(
                                (tab) =>
                                    tab.value === currentTab && (
                                        <Box
                                            key={tab.value}
                                            sx={{p: 2, borderRadius: 1, bgcolor: 'background.neutral'}}
                                        >
                                            {(() => {
                                                switch (currentTab) {
                                                    case 'ultima-factura':
                                                        return <div>
                                                            {/* Filtros tipo Airbnb */}
                                                            <Grid
                                                                container
                                                                spacing={2}
                                                                sx={{
                                                                    mb: 4,
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                {rangos.map((rango) => (
                                                                    <Grid item key={rango.id}>
                                                                        <Chip
                                                                            onClick={(e) => handleClick(e, rango, 1)}
                                                                            label={
                                                                                <Stack direction="row" alignItems="center"
                                                                                       spacing={1}>
                                                                                    <Iconify
                                                                                        icon={rango.icon}
                                                                                        width={18}
                                                                                        height={18}
                                                                                        style={{
                                                                                            color: selected === rango.id ? "white" : "#000000",
                                                                                        }}
                                                                                    />
                                                                                    <span>{rango.title}</span>
                                                                                </Stack>
                                                                            }
                                                                            variant={selected === rango.id ? "filled" : "outlined"}
                                                                            color={selected === rango.id ? "primary" : "default"}
                                                                            sx={{
                                                                                px: 2.5,
                                                                                py: 1.2,
                                                                                borderRadius: "24px",
                                                                                fontWeight: 600,
                                                                                fontSize: "0.9rem",
                                                                                bgcolor:
                                                                                    selected === rango.id ? "primary.main" : "background.paper",
                                                                                color:
                                                                                    selected === rango.id
                                                                                        ? "primary.contrastText"
                                                                                        : "text.primary",
                                                                                boxShadow: selected === rango.id ? 3 : 1,
                                                                                transition: "all 0.25s ease",
                                                                                "&:hover": {
                                                                                    boxShadow: 4,
                                                                                    transform: "translateY(-2px)",
                                                                                },
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                ))}
                                                            </Grid>

                                                            {/* Métricas tipo dashboard */}
                                                            <Grid container spacing={3}>
                                                                <Grid item xs={12} sm={6} md={3}>
                                                                    <StatCard
                                                                        title="Por Gestionar"
                                                                        total={
                                                                            businessPartners && businessPartners.length
                                                                                ? businessPartners.length
                                                                                : 0
                                                                        }
                                                                        color="info"
                                                                        icon={
                                                                            <img
                                                                                alt="icon"
                                                                                src="/assets/icons/glass/ic_glass_users.png"
                                                                                width={28}
                                                                            />
                                                                        }
                                                                    />
                                                                </Grid>
                                                            </Grid>

                                                            <Card sx={{
                                                                p: 5
                                                            }}
                                                            >
                                                                <DataGrid
                                                                    rows={businessPartners}
                                                                    columns={baseColumns}
                                                                    pagination
                                                                    slots={{
                                                                        toolbar: CustomToolbar,
                                                                        noRowsOverlay: () => <EmptyContent
                                                                            title="No Data"/>,
                                                                        noResultsOverlay: () => <EmptyContent
                                                                            title="No results found"/>,
                                                                    }}
                                                                />

                                                                {user && partner && (
                                                                    <CustomerQuickManagementForm
                                                                        currentPartner={partner}
                                                                        open={quickEdit.value}
                                                                        onClose={quickEdit.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <PreviousClientManagement
                                                                        userID={user.ID}
                                                                        currentPartner={partner}
                                                                        open={quickPCM.value}
                                                                        onClose={quickPCM.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <InvoicedClientOrders
                                                                        userID={user.ID}
                                                                        currentPartner={partner}
                                                                        open={quickICO.value}
                                                                        onClose={quickICO.onFalse}/>
                                                                )}

                                                                {user && dataCliente && (
                                                                    <CustomerData
                                                                        userID={user.ID}
                                                                        currentPartner={dataCliente}
                                                                        open={quickDC.value}
                                                                        onClose={quickDC.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <CustomerLocationMap
                                                                        currentPartner={partner}
                                                                        open={quickCLM.value}
                                                                        onClose={quickCLM.onFalse}/>
                                                                )}

                                                            </Card>


                                                        </div>;
                                                    case 'medio-de-contacto':
                                                        return <div>

                                                            <Card sx={{
                                                                p: 5
                                                            }}
                                                            >


                                                                <Grid item xs={12} md={12} lg={8} padding={2}>
                                                                    {/*<Box*/}
                                                                    {/*    rowGap={3}*/}
                                                                    {/*    columnGap={2}*/}
                                                                    {/*    display="grid"*/}
                                                                    {/*    gridTemplateColumns={{*/}
                                                                    {/*        xs: 'repeat(1, 1fr)',*/}
                                                                    {/*        sm: 'repeat(2, 1fr)',*/}
                                                                    {/*    }}*/}
                                                                    {/*>*/}
                                                                    <Autocomplete
                                                                        fullWidth
                                                                        options={rangos}
                                                                        getOptionLabel={(option) => option.title}
                                                                        onChange={(event, value) => {
                                                                            handleClick(event, value, 0);
                                                                        }} // Add onChange event handler
                                                                        renderInput={(params) => <TextField {...params} label="Filtrar por rango"
                                                                                                            margin="none"/>}
                                                                    />


                                                                    {/*<TextField*/}
                                                                    {/*    fullWidth*/}
                                                                    {/*    type="text"*/}
                                                                    {/*    label="Nombre / Razon Social"*/}
                                                                    {/*    InputProps={{*/}
                                                                    {/*        endAdornment: (*/}
                                                                    {/*            <InputAdornment position="end">*/}
                                                                    {/*                <IconButton*/}
                                                                    {/*                    edge="end"*/}
                                                                    {/*                >*/}
                                                                    {/*                    <Iconify icon="eva:search-fill" width={24}/>*/}

                                                                    {/*                </IconButton>*/}
                                                                    {/*            </InputAdornment>*/}
                                                                    {/*        ),*/}
                                                                    {/*    }}*/}
                                                                    {/*/>*/}

                                                                    {/*<TextField*/}
                                                                    {/*    fullWidth*/}
                                                                    {/*    type="text"*/}
                                                                    {/*    label="Cédula/RUC"*/}
                                                                    {/*    InputProps={{*/}
                                                                    {/*        endAdornment: (*/}
                                                                    {/*            <InputAdornment position="end">*/}
                                                                    {/*                <IconButton*/}
                                                                    {/*                    edge="end"*/}
                                                                    {/*                >*/}
                                                                    {/*                    <Iconify icon="eva:search-fill" width={24}/>*/}

                                                                    {/*                </IconButton>*/}
                                                                    {/*            </InputAdornment>*/}
                                                                    {/*        ),*/}
                                                                    {/*    }}*/}
                                                                    {/*/>*/}

                                                                    {/*<TextField*/}
                                                                    {/*    fullWidth*/}
                                                                    {/*    type="text"*/}
                                                                    {/*    label="Nombre Producto"*/}
                                                                    {/*    InputProps={{*/}
                                                                    {/*        endAdornment: (*/}
                                                                    {/*            <InputAdornment position="end">*/}
                                                                    {/*                <IconButton*/}
                                                                    {/*                    edge="end"*/}
                                                                    {/*                >*/}
                                                                    {/*                    <Iconify icon="eva:search-fill" width={24}/>*/}

                                                                    {/*                </IconButton>*/}
                                                                    {/*            </InputAdornment>*/}
                                                                    {/*        ),*/}
                                                                    {/*    }}*/}
                                                                    {/*/>*/}

                                                                    {/*<TextField*/}
                                                                    {/*    fullWidth*/}
                                                                    {/*    type="text"*/}
                                                                    {/*    label="Código Producto"*/}
                                                                    {/*    InputProps={{*/}
                                                                    {/*        endAdornment: (*/}
                                                                    {/*            <InputAdornment position="end">*/}
                                                                    {/*                <IconButton*/}
                                                                    {/*                    edge="end"*/}
                                                                    {/*                >*/}
                                                                    {/*                    <Iconify icon="eva:search-fill" width={24}/>*/}

                                                                    {/*                </IconButton>*/}
                                                                    {/*            </InputAdornment>*/}
                                                                    {/*        ),*/}
                                                                    {/*    }}*/}
                                                                    {/*/>*/}


                                                                    {/*</Box>*/}
                                                                </Grid>


                                                                <Grid container spacing={3}>

                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <AnalyticsWidgetSummary
                                                                            title="Por Gestionar"
                                                                            total={
                                                                                businessPartners && businessPartners.length ? businessPartners.length : 0
                                                                            }
                                                                            color="info"
                                                                            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png"/>}
                                                                        />
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <AnalyticsWidgetSummary
                                                                            title="Total Agenda"
                                                                            total={dataContAgenda}
                                                                            color="warning"
                                                                            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png"/>}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <AnalyticsWidgetSummary
                                                                            title="Agenda Cerrados"
                                                                            total={dataContAgendaPorCerrar}
                                                                            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png"/>}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <AnalyticsWidgetSummary
                                                                            title="Agenda Abiertos"
                                                                            total={dataContAgendaCErrado}
                                                                            color="error"
                                                                            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png"/>}
                                                                        />
                                                                    </Grid>
                                                                </Grid>

                                                            </Card>

                                                            <Card sx={{
                                                                p: 5
                                                            }}
                                                            >
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

                                                                {user && partner && (
                                                                    <CustomerQuickManagementForm
                                                                        currentPartner={partner}
                                                                        open={quickEdit.value}
                                                                        onClose={quickEdit.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <PreviousClientManagement
                                                                        userID={user.ID}
                                                                        currentPartner={partner}
                                                                        open={quickPCM.value}
                                                                        onClose={quickPCM.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <InvoicedClientOrders
                                                                        userID={user.ID}
                                                                        currentPartner={partner}
                                                                        open={quickICO.value}
                                                                        onClose={quickICO.onFalse}/>
                                                                )}

                                                                {user && dataCliente && (
                                                                    <CustomerData
                                                                        userID={user.ID}
                                                                        currentPartner={dataCliente}
                                                                        open={quickDC.value}
                                                                        onClose={quickDC.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <CustomerLocationMap
                                                                        currentPartner={partner}
                                                                        open={quickCLM.value}
                                                                        onClose={quickCLM.onFalse}/>
                                                                )}

                                                            </Card>






                                                            <Card sx={{
                                                                p: 5
                                                            }}
                                                            >
                                                                <CalendarView onValorCambiado={handleValorCambiado}/>

                                                            </Card>
                                                        </div>;
                                                    case 'otro-criterio':
                                                        return <div>Otro criterio</div>;
                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </Box>
                                    )
                            )}
                        </Stack>
                    </Block>


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


const StatCard = ({title, total, color, icon}) => {
    return (
        <Card
            sx={{
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: '0.3s',
                background: `linear-gradient(135deg, ${color}.100, ${color}.50)`,
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                },
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                    {/* Icono circular con fondo sutil */}
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            backgroundColor: `${color}.200`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1.5,
                        }}
                    >
                        {icon}
                    </Box>

                    {/* Texto */}
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {total}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
