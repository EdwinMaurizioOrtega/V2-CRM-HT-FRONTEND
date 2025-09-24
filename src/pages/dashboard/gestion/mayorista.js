// next
import Head from 'next/head';
// @mui
import {alpha, useTheme} from '@mui/material/styles';
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CustomerReasignarCliente from 'src/sections/@dashboard/gestion/customer-reasignar-cliente';
import CustomerPagosEfectuados from 'src/sections/@dashboard/gestion/customer-pagos-efectuados';
import SearchNotFound from "../../../components/search-not-found";
import {CustomTextField} from "../../../components/custom-input";

import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import {createBilling, nextStep} from "../../../redux/slices/product";
import {dispatch} from "../../../redux/store";
import {useRouter} from "next/router";
import CustomerUltimaVentaPorMarca from "../../../sections/@dashboard/gestion/ultima-venta-por-marca";

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
    {value: 'crear-orden', label: 'Crear Orden'},
    {value: 'ultima-factura', label: 'Última Factura'},
    {value: 'medio-de-contacto', label: 'Socios de Negocio'},
    {value: 'otro-criterio', label: 'Otro'},
];

function CountdownCell({value}) {
    const [timeLeft, setTimeLeft] = useState("");
    const [color, setColor] = useState("default");
    const [icon, setIcon] = useState(null);

    useEffect(() => {
        if (!value) {
            setTimeLeft("Aún no carga el pagaré");
            setColor("default");
            setIcon(<HourglassEmptyIcon/>);
            return;
        }

        const target = new Date(value);

        const tick = () => {
            if (isNaN(target.getTime())) {
                setTimeLeft("Fecha inválida");
                setColor("default");
                setIcon(<HelpOutlineIcon/>);
                return;
            }

            const diff = target.getTime() - Date.now();

            if (diff <= 0) {
                setTimeLeft("Vencido - Reportado a gerencia");
                setColor("error"); // rojo oscuro
                setIcon(<CancelIcon/>);
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const formatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            // Condiciones según días restantes
            if (days > 45) {
                setTimeLeft(formatted);
                setColor("success"); // verde
                setIcon(<CheckCircleIcon/>);
            } else if (days > 30) {
                setTimeLeft(`${formatted} - Próximo a vencer`);
                setColor("warning"); // amarillo/dorado
                setIcon(<WarningAmberIcon/>);
            } else if (days > 15) {
                setTimeLeft(`${formatted} - Notificación a gerencia`);
                setColor("warning"); // naranja
                setIcon(<MailOutlineIcon/>);
            } else if (days > 0) {
                setTimeLeft(`${formatted} - Cliente será reasignado`);
                setColor("error"); // rojo
                setIcon(<AutorenewIcon/>);
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [value]);

    return <Chip label={timeLeft} color={color} variant="outlined" icon={icon}/>;
}

export default function MayoristaPage(callback, deps) {

    const {user} = useAuthContext();

    const router = useRouter();

    const {themeStretch} = useSettingsContext();

    const theme = useTheme();

    const [selected, setSelected] = useState(null);

    const [currentTab, setCurrentTab] = useState('ultima-factura');


    const [partner, setPartner] = useState(null);
    const quickEdit = useBoolean();
    const quickPCM = useBoolean();
    const quickICO = useBoolean();
    const quickDC = useBoolean();
    const quickCLM = useBoolean();
    const quickRC = useBoolean();
    const quickPE = useBoolean();
    const quickUVPM = useBoolean();

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
                    label="Registrar Gestión"
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
                    icon={<Iconify icon="solar:user-linear"/>}
                    label="Datos del Cliente"
                    onClick={() => handleViewDataCustomerRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:map-point-favourite-linear"/>}
                    label="Google Maps"
                    onClick={() => handleViewCustomerLocationMapRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:repeat-outline"/>}
                    label="Reasignar Cliente"
                    onClick={() => handleViewCustomerReasignarCliente(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:wallet-linear"/>}
                    label="Pagos / Abonos"
                    onClick={() => handleViewCustomerPagosEfectuados(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:chart-square-linear"/>}
                    label="Última Venta Por Marca"
                    onClick={() => handleViewCustomerUltimaVentaPorMarca(params.row)}
                />,

            ],
        },

        // {
        //     field: 'id',
        //     hide: true,
        // },
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
        // {
        //     field: 'U_LS_LIM_CRE_LID',
        //     headerName: 'U_LS_LIM_CRE_LID',
        //     flex: 1,
        //     minWidth: 160,
        // },
        // {
        //     field: 'U_LS_EXT_CUP_1',
        //     headerName: 'U_LS_EXT_CUP_1',
        //     flex: 1,
        //     minWidth: 160,
        // },
        // {
        //     field: 'U_LS_EXT_CUP_2',
        //     headerName: 'U_LS_EXT_CUP_2',
        //     flex: 1,
        //     minWidth: 160,
        // },

        // {
        //     field: 'Balance',
        //     headerName: 'Balance',
        //     flex: 1,
        //     minWidth: 160,
        // },

        {
            headerName: "Límite de Crédito",
            flex: 1,
            minWidth: 280,
            renderCell: (params) => {
                const U_LS_LIM_CRE_LID = parseFloat(params.row.U_LS_LIM_CRE_LID || 0);
                const U_LS_EXT_CUP_1 = parseFloat(params.row.U_LS_EXT_CUP_1 || 0);
                const U_LS_EXT_CUP_2 = parseFloat(params.row.U_LS_EXT_CUP_2 || 0);
                const Balance = parseFloat(params.row.Balance || 0);

                const totalCredito = U_LS_LIM_CRE_LID + U_LS_EXT_CUP_1 + U_LS_EXT_CUP_2;
                const disponible = totalCredito - Balance;

                const porcentajeDisponible = totalCredito > 0 ? (disponible / totalCredito) * 100 : 0;
                const porcentajeConsumido = totalCredito > 0 ? (Balance / totalCredito) * 100 : 0;

                // 🔥 Función de formateo
                const formatNumber = (value) =>
                    parseFloat(value).toLocaleString("es-EC", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    });

                return (
                    <Box sx={{width: "100%"}}>
                        <Typography variant="body2">
                            Disponible: {formatNumber(disponible)} ({porcentajeDisponible.toFixed(2)}%)
                        </Typography>
                        <Typography variant="body2">
                            Consumido: {formatNumber(Balance)} ({porcentajeConsumido.toFixed(2)}%)
                        </Typography>

                        {/* Barra combinada */}
                        <Box sx={{display: "flex", height: 8, borderRadius: 5, overflow: "hidden", mt: 0.5}}>
                            {/* Barra de consumido */}
                            <Box sx={{width: `${porcentajeConsumido}%`, backgroundColor: "#f44336"}}/>
                            {/* Barra de disponible */}
                            <Box sx={{width: `${porcentajeDisponible}%`, backgroundColor: "#4caf50"}}/>
                        </Box>
                    </Box>
                );
            },
        },


        // {
        //     headerName: "Cupo Disponible3",
        //     flex: 1,
        //     minWidth: 220,
        //     renderCell: (params) => {
        //         const creditLine = params.row.CreditLine || 0;
        //         const balance = params.row.Balance || 0;

        //         const disponible = creditLine - balance;
        //         const porcentaje = creditLine > 0 ? (disponible / creditLine) * 100 : 0;

        //         return (
        //             <Box sx={{ width: "100%" }}>
        //                 <Typography variant="body2">
        //                     {fCurrency(disponible)} ({porcentaje.toFixed(1)}%)
        //                 </Typography>
        //                 <LinearProgress
        //                     variant="determinate"
        //                     value={porcentaje}
        //                     sx={{
        //                         height: 8,
        //                         borderRadius: 5,
        //                         mt: 0.5,
        //                         backgroundColor: "#eee",
        //                         "& .MuiLinearProgress-bar": {
        //                             backgroundColor: porcentaje > 50 ? "#4caf50" : "#f44336", // Verde si >50%, rojo si <=50%
        //                         },
        //                     }}
        //                 />
        //             </Box>
        //         );
        //     },
        // },

        // {
        //     field: 'U_SYP_CREDITO',
        //     headerName: 'Tipo Crédito',
        //     flex: 1,
        //     minWidth: 160,
        //     renderCell: (params) => tipoCredito(params.value)
        // },
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
        // {
        //     field: 'PADRE',
        //     headerName: 'PADRE',
        //     flex: 1,
        //     minWidth: 160,
        // },
        // {
        //     field: 'NOM_PADRE',
        //     headerName: 'NOM_PADRE',
        //     flex: 1,
        //     minWidth: 160,
        // },
        {
            field: "U_LS_Vencimiento_Pagare",
            headerName: "Vencimiento",
            flex: 1,
            minWidth: 400,
            renderCell: (params) => <CountdownCell value={params.value}/>,

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
                    EMPRESA: user.EMPRESA,
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

    const handleViewCustomerReasignarCliente = useCallback(
        (row) => {
            quickRC.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickRC]
    );

    const handleViewCustomerPagosEfectuados = useCallback(
        (row) => {
            quickPE.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickPE]
    );

    const handleViewCustomerUltimaVentaPorMarca = useCallback(
        (row) => {
            quickUVPM.onTrue();
            //console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickUVPM]
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


    const [searchProducts, setSearchProducts] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {
                const response = await axios.get('/hanadb/api/customers/search', {
                    params: {query: value, empresa: user.EMPRESA},
                });

                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            handleGotoProduct(searchProducts);
        }
    };

    const handleCreateBilling = async (address) => {
        await dispatch(createBilling(address));
        await router.push('/dashboard/e-commerce/list/'); // Cambia '/ruta-destino' por la página a la que quieras ir
    };

    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={false} sx={{ 
                py: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
                minHeight: '100vh'
            }}>
                <CustomBreadcrumbs
                    heading="🏢 Gestión Mayoristas"
                    links={[
                        {
                            name: '🏠 Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: '⚙️ Gestión',
                            href: PATH_DASHBOARD.gestion.mayorista,
                        },
                        {
                            name: '🏪 Mayoristas',
                        },
                    ]}
                    sx={{
                        mb: 4,
                        '& .MuiBreadcrumbs-separator': {
                            color: theme.palette.primary.main,
                            fontSize: '1.2rem',
                        },
                        '& .MuiTypography-h4': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800,
                            fontSize: '2rem',
                        }
                    }}
                />

                <Card
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        boxShadow: theme.customShadows?.z24 || "0 24px 48px rgba(0,0,0,0.12)",
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.lighter || theme.palette.primary.light, 0.03)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
                        }
                    }}
                >


                    <Block 
                        title="🎯 Gestión por:" 
                        sx={{
                            ...style,
                            mb: 3,
                            '& .MuiTypography-h6': {
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }
                        }}
                    >
                        <Stack spacing={3} sx={{width: 1}}>
                            <Tabs 
                                value={currentTab} 
                                onChange={(event, newValue) => setCurrentTab(newValue)}
                                sx={{
                                    '& .MuiTabs-flexContainer': {
                                        gap: 1,
                                    },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        borderRadius: 2,
                                        minHeight: 48,
                                        color: theme.palette.text.secondary,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                            color: theme.palette.primary.main,
                                        },
                                        '&.Mui-selected': {
                                            color: theme.palette.primary.main,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                            fontWeight: 700,
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        borderRadius: 1.5,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    }
                                }}
                            >
                                {TABS.slice(0, 4).map((tab) => (
                                    <Tab 
                                        key={tab.value} 
                                        value={tab.value} 
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Iconify 
                                                    icon={
                                                        tab.value === 'crear-orden' ? 'eva:plus-circle-outline' :
                                                        tab.value === 'ultima-factura' ? 'eva:file-text-outline' :
                                                        tab.value === 'medio-de-contacto' ? 'eva:people-outline' :
                                                        'eva:options-outline'
                                                    } 
                                                    width={20} 
                                                />
                                                {tab.label}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>

                            {TABS.slice(0, 4).map(
                                (tab) =>
                                    tab.value === currentTab && (
                                        <Box
                                            key={tab.value}
                                            sx={{
                                                p: 3, 
                                                borderRadius: 2, 
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.neutral || theme.palette.grey[50], 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                backdropFilter: 'blur(10px)',
                                                minHeight: '400px'
                                            }}
                                        >
                                            {(() => {
                                                switch (currentTab) {
                                                    case 'crear-orden':
                                                        return <div>

                                                            <Autocomplete
                                                                size="small"
                                                                autoHighlight
                                                                popupIcon={null}
                                                                options={searchResults}
                                                                onInputChange={(event, value) => handleChangeSearch(value)}
                                                                getOptionLabel={(product) => product.Cliente}
                                                                noOptionsText={<SearchNotFound query={searchProducts}/>}
                                                                isOptionEqualToValue={(option, value) => option.ID === value.ID}
                                                                componentsProps={{
                                                                    paper: {
                                                                        sx: {
                                                                            '& .MuiAutocomplete-option': {
                                                                                px: `8px !important`,
                                                                            },
                                                                        },
                                                                    },
                                                                }}
                                                                renderInput={(params) => (
                                                                    <CustomTextField
                                                                        {...params}

                                                                        placeholder="Buscar..."
                                                                        onKeyUp={handleKeyUp}
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            startAdornment: (
                                                                                <InputAdornment position="start">
                                                                                    <Iconify icon="eva:search-fill" sx={{
                                                                                        ml: 1,
                                                                                        color: 'text.disabled'
                                                                                    }}/>
                                                                                </InputAdornment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                )}
                                                                renderOption={(props, product, {inputValue}) => {
                                                                    const {ID, Cliente} = product;
                                                                    const matches = match(Cliente, inputValue);
                                                                    const parts = parse(Cliente, matches);

                                                                    return (
                                                                        <li {...props}>


                                                                            <AddressItem
                                                                                key={ID}
                                                                                address={product}
                                                                                onCreateBilling={() => handleCreateBilling(product)}
                                                                            >
                                                                                {parts.map((part, index) => (
                                                                                    <Typography
                                                                                        key={index}
                                                                                        component="span"
                                                                                        variant="subtitle2"
                                                                                        color={part.highlight ? 'primary' : 'textPrimary'}
                                                                                    >
                                                                                        {part.text}
                                                                                    </Typography>
                                                                                ))}

                                                                            </AddressItem>

                                                                        </li>
                                                                    );
                                                                }}
                                                            />


                                                        </div>;
                                                    case 'ultima-factura':
                                                        return <div>
                                                            <Card sx={{p: 3}}>
                                                                <Grid container spacing={3} alignItems="center">
                                                                    {/* Chips principales */}
                                                                    <Grid item xs={12} md={10}>
                                                                        <Grid
                                                                            container
                                                                            spacing={2}
                                                                            sx={{
                                                                                mb: 4,
                                                                                justifyContent: "center", // centra horizontalmente
                                                                                flexWrap: "wrap",
                                                                                gap: 1,
                                                                            }}
                                                                        >
                                                                            {rangos.map((rango) => (
                                                                                <Grid
                                                                                    item
                                                                                    key={rango.id}
                                                                                    sx={{
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                    }}
                                                                                >
                                                                                    <Chip
                                                                                        onClick={(e) => handleClick(e, rango, 1)}
                                                                                        label={
                                                                                            <Stack direction="row"
                                                                                                   alignItems="center"
                                                                                                   spacing={1.5}>
                                                                                                <Iconify
                                                                                                    icon={rango.icon}
                                                                                                    width={20}
                                                                                                    height={20}
                                                                                                    sx={{
                                                                                                        color: selected === rango.id ? 'white' : theme.palette.primary.main,
                                                                                                        transition: 'all 0.2s ease'
                                                                                                    }}
                                                                                                />
                                                                                                <Box component="span" sx={{ fontWeight: 600 }}>
                                                                                                    {rango.title}
                                                                                                </Box>
                                                                                            </Stack>
                                                                                        }
                                                                                        variant={selected === rango.id ? "filled" : "outlined"}
                                                                                        color={selected === rango.id ? "primary" : "default"}
                                                                                        sx={{
                                                                                            px: 3,
                                                                                            py: 1.5,
                                                                                            borderRadius: 3,
                                                                                            fontWeight: 600,
                                                                                            fontSize: "0.875rem",
                                                                                            minHeight: 44,
                                                                                            cursor: 'pointer',
                                                                                            background: selected === rango.id 
                                                                                                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                                                                                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.lighter || theme.palette.primary.light, 0.1)} 100%)`,
                                                                                            border: selected === rango.id 
                                                                                                ? 'none' 
                                                                                                : `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                                                            color: selected === rango.id ? "white" : theme.palette.text.primary,
                                                                                            boxShadow: selected === rango.id 
                                                                                                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                                                                                                : `0 4px 12px ${alpha(theme.palette.grey[500], 0.15)}`,
                                                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                                            "&:hover": {
                                                                                                transform: "translateY(-4px) scale(1.02)",
                                                                                                boxShadow: selected === rango.id 
                                                                                                    ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`
                                                                                                    : `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                                                                                                background: selected === rango.id 
                                                                                                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                                                                                                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                                                                                            },
                                                                                            "&:active": {
                                                                                                transform: "translateY(-2px) scale(0.98)",
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>
                                                                    </Grid>

                                                                    {/* Box de prospectos */}
                                                                    <Grid item xs={12} md={2}>
                                                                        <Box sx={{
                                                                            p: 2,
                                                                            borderRadius: 2,
                                                                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.lighter || theme.palette.info.light, 0.05)} 100%)`,
                                                                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                                                            transition: 'all 0.3s ease',
                                                                            '&:hover': {
                                                                                transform: 'translateY(-4px)',
                                                                                boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.25)}`,
                                                                            }
                                                                        }}>
                                                                            <AnalyticsWidgetSummary
                                                                                title="📊 Prospectos gestionar:"
                                                                                total={
                                                                                    businessPartners?.length || 0
                                                                                }
                                                                                color="info"
                                                                                icon={<img alt="icon"
                                                                                           src="/assets/icons/glass/ic_glass_users.png"/>}
                                                                            />
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </Card>


                                                            <Divider 
                                                                sx={{
                                                                    my: 4,
                                                                    border: 'none',
                                                                    height: '2px',
                                                                    background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
                                                                    borderRadius: 1
                                                                }}
                                                            />

                                                            <Card sx={{
                                                                p: 4,
                                                                borderRadius: 3,
                                                                boxShadow: theme.customShadows?.z16 || "0 16px 32px rgba(0,0,0,0.08)",
                                                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.3)} 100%)`,
                                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '3px',
                                                                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main}, ${theme.palette.warning.main})`,
                                                                }
                                                            }}
                                                            >
                                                                <Box sx={{ mt: 2, mb: 3 }}>
                                                                    <DataGrid
                                                                        rows={businessPartners}
                                                                        columns={baseColumns}
                                                                        pagination
                                                                        autoHeight
                                                                        disableRowSelectionOnClick
                                                                        slots={{
                                                                            toolbar: CustomToolbar,
                                                                            noRowsOverlay: () => <EmptyContent title="📋 No hay datos disponibles" sx={{ py: 6 }} />,
                                                                            noResultsOverlay: () => <EmptyContent title="🔍 No se encontraron resultados" sx={{ py: 6 }} />,
                                                                        }}
                                                                        sx={{
                                                                            border: 'none',
                                                                            borderRadius: 2,
                                                                            boxShadow: theme.customShadows?.card || '0px 4px 20px rgba(0, 0, 0, 0.08)',
                                                                            backgroundColor: theme.palette.background.paper,
                                                                            '& .MuiDataGrid-main': {
                                                                                borderRadius: 2,
                                                                            },
                                                                            '& .MuiDataGrid-columnHeaders': {
                                                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                                                                borderBottom: `2px solid ${theme.palette.divider}`,
                                                                                borderRadius: '8px 8px 0 0',
                                                                                fontWeight: 700,
                                                                                fontSize: '0.875rem',
                                                                                color: theme.palette.text.primary,
                                                                                minHeight: '56px !important',
                                                                                '& .MuiDataGrid-columnHeader': {
                                                                                    padding: '12px 16px',
                                                                                    '&:focus': {
                                                                                        outline: 'none',
                                                                                    },
                                                                                    '&:focus-within': {
                                                                                        outline: `2px solid ${theme.palette.primary.main}`,
                                                                                        outlineOffset: '-2px',
                                                                                    },
                                                                                },
                                                                                '& .MuiDataGrid-columnHeaderTitle': {
                                                                                    fontWeight: 700,
                                                                                    fontSize: '0.875rem',
                                                                                    color: theme.palette.text.primary,
                                                                                },
                                                                            },
                                                                            '& .MuiDataGrid-cell': {
                                                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                                                                padding: '12px 16px',
                                                                                fontSize: '0.875rem',
                                                                                color: theme.palette.text.primary,
                                                                            },
                                                                            '& .MuiDataGrid-row': {
                                                                                transition: 'all 0.2s ease-in-out',
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                                                                    transform: 'translateY(-1px)',
                                                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                                                                                },
                                                                            },
                                                                            '& .MuiDataGrid-footerContainer': {
                                                                                borderTop: `2px solid ${theme.palette.divider}`,
                                                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                                                padding: '8px 16px',
                                                                                borderRadius: '0 0 8px 8px',
                                                                            },
                                                                            '& .MuiDataGrid-toolbar': {
                                                                                padding: '16px',
                                                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                                                '& .MuiButton-root': {
                                                                                    color: theme.palette.text.secondary,
                                                                                    fontSize: '0.875rem',
                                                                                    fontWeight: 500,
                                                                                    textTransform: 'none',
                                                                                    padding: '6px 12px',
                                                                                    borderRadius: 1.5,
                                                                                    '&:hover': {
                                                                                        backgroundColor: theme.palette.action.hover,
                                                                                        color: theme.palette.primary.main,
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                        initialState={{
                                                                            pagination: {
                                                                                paginationModel: { pageSize: 10 },
                                                                            },
                                                                        }}
                                                                        pageSizeOptions={[5, 10, 25, 50]}
                                                                    />
                                                                </Box>

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

                                                                {user && partner && (
                                                                    <CustomerReasignarCliente
                                                                        currentPartner={partner}
                                                                        open={quickRC.value}
                                                                        onClose={quickRC.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <CustomerPagosEfectuados
                                                                        currentPartner={partner}
                                                                        open={quickPE.value}
                                                                        onClose={quickPE.onFalse}/>
                                                                )}

                                                                {user && partner && (
                                                                    <CustomerUltimaVentaPorMarca
                                                                        currentPartner={partner}
                                                                        open={quickUVPM.value}
                                                                        onClose={quickUVPM.onFalse}/>
                                                                )}

                                                            </Card>


                                                        </div>;
                                                    case 'medio-de-contacto':
                                                        return <div>

                                                            <Card sx={{
                                                                p: 4,
                                                                borderRadius: 3,
                                                                boxShadow: theme.customShadows?.z16 || "0 16px 32px rgba(0,0,0,0.08)",
                                                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.lighter || theme.palette.secondary.light, 0.03)} 100%)`,
                                                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '3px',
                                                                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main}, ${theme.palette.warning.main})`,
                                                                }
                                                            }}
                                                            >


                                                                <Grid

                                                                    container
                                                                    spacing={2}
                                                                    sx={{
                                                                        mb: 4,
                                                                        display: "flex",
                                                                        flexWrap: "wrap",
                                                                        gap: 1,
                                                                        justifyContent: "center", // centra los chips horizontalmente
                                                                    }}
                                                                >


                                                                    {rangos.map((rango) => (
                                                                        <Grid item key={rango.id}
                                                                              sx={{
                                                                                  display: "flex",
                                                                                  justifyContent: "center", // asegura que cada chip también esté centrado
                                                                                  alignItems: "center",
                                                                              }}
                                                                        >
                                                                            <Chip
                                                                                onClick={(e) => handleClick(e, rango, 1)}
                                                                                label={
                                                                                    <Stack direction="row"
                                                                                           alignItems="center"
                                                                                           spacing={1.5}>
                                                                                        <Iconify
                                                                                            icon={rango.icon}
                                                                                            width={20}
                                                                                            height={20}
                                                                                            sx={{
                                                                                                color: selected === rango.id ? 'white' : theme.palette.secondary.main,
                                                                                                transition: 'all 0.2s ease'
                                                                                            }}
                                                                                        />
                                                                                        <Box component="span" sx={{ fontWeight: 600 }}>
                                                                                            {rango.title}
                                                                                        </Box>
                                                                                    </Stack>
                                                                                }
                                                                                variant={selected === rango.id ? "filled" : "outlined"}
                                                                                color={selected === rango.id ? "secondary" : "default"}
                                                                                sx={{
                                                                                    px: 3,
                                                                                    py: 1.5,
                                                                                    borderRadius: 3,
                                                                                    fontWeight: 600,
                                                                                    fontSize: "0.875rem",
                                                                                    minHeight: 44,
                                                                                    cursor: 'pointer',
                                                                                    background: selected === rango.id 
                                                                                        ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                                                                                        : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.lighter || theme.palette.secondary.light, 0.1)} 100%)`,
                                                                                    border: selected === rango.id 
                                                                                        ? 'none' 
                                                                                        : `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                                                                    color: selected === rango.id ? "white" : theme.palette.text.primary,
                                                                                    boxShadow: selected === rango.id 
                                                                                        ? `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`
                                                                                        : `0 4px 12px ${alpha(theme.palette.grey[500], 0.15)}`,
                                                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                                    "&:hover": {
                                                                                        transform: "translateY(-4px) scale(1.02)",
                                                                                        boxShadow: selected === rango.id 
                                                                                            ? `0 12px 32px ${alpha(theme.palette.secondary.main, 0.5)}`
                                                                                            : `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
                                                                                        background: selected === rango.id 
                                                                                            ? `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                                                                                            : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                                                                                    },
                                                                                    "&:active": {
                                                                                        transform: "translateY(-2px) scale(0.98)",
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </Grid>
                                                                    ))}


                                                                </Grid>


                                                                <Grid container spacing={3}>
                                                                    {/* Columna izquierda: Analytics */}
                                                                    <Grid item xs={12} md={1}>
                                                                        <Stack spacing={3}>
                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRadius: 2,
                                                                                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.lighter || theme.palette.info.light, 0.05)} 100%)`,
                                                                                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'translateY(-2px)',
                                                                                    boxShadow: `0 8px 16px ${alpha(theme.palette.info.main, 0.2)}`,
                                                                                }
                                                                            }}>
                                                                                <AnalyticsWidgetSummary
                                                                                    title="🔄 Por Gestionar"
                                                                                    total={
                                                                                        businessPartners && businessPartners.length ? businessPartners.length : 0
                                                                                    }
                                                                                    color="info"
                                                                                    icon={<img alt="icon"
                                                                                               src="/assets/icons/glass/ic_glass_users.png"/>}
                                                                                />
                                                                            </Box>

                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRadius: 2,
                                                                                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.lighter || theme.palette.warning.light, 0.05)} 100%)`,
                                                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'translateY(-2px)',
                                                                                    boxShadow: `0 8px 16px ${alpha(theme.palette.warning.main, 0.2)}`,
                                                                                }
                                                                            }}>
                                                                                <AnalyticsWidgetSummary
                                                                                    title="📅 Total Agenda"
                                                                                    total={dataContAgenda}
                                                                                    color="warning"
                                                                                    icon={<img alt="icon"
                                                                                               src="/assets/icons/glass/ic_glass_buy.png"/>}
                                                                                />
                                                                            </Box>

                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRadius: 2,
                                                                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.lighter || theme.palette.success.light, 0.05)} 100%)`,
                                                                                border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'translateY(-2px)',
                                                                                    boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.2)}`,
                                                                                }
                                                                            }}>
                                                                                <AnalyticsWidgetSummary
                                                                                    title="✅ Agenda Cerrados"
                                                                                    total={dataContAgendaPorCerrar}
                                                                                    color="success"
                                                                                    icon={<img alt="icon"
                                                                                               src="/assets/icons/glass/ic_glass_bag.png"/>}
                                                                                />
                                                                            </Box>

                                                                            <Box sx={{
                                                                                p: 2,
                                                                                borderRadius: 2,
                                                                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.lighter || theme.palette.error.light, 0.05)} 100%)`,
                                                                                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    transform: 'translateY(-2px)',
                                                                                    boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.2)}`,
                                                                                }
                                                                            }}>
                                                                                <AnalyticsWidgetSummary
                                                                                    title="⏳ Agenda Abiertos"
                                                                                    total={dataContAgendaCErrado}
                                                                                    color="error"
                                                                                    icon={<img alt="icon"
                                                                                               src="/assets/icons/glass/ic_glass_message.png"/>}
                                                                                />
                                                                            </Box>
                                                                        </Stack>
                                                                    </Grid>


                                                                    {/* Columna derecha: DataGrid */}
                                                                    <Grid item xs={12} md={11}>

                                                                        <Card sx={{
                                                                            p: 4,
                                                                            borderRadius: 3,
                                                                            boxShadow: theme.customShadows?.z16 || "0 16px 32px rgba(0,0,0,0.08)",
                                                                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.3)} 100%)`,
                                                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                                            position: 'relative',
                                                                            overflow: 'hidden',
                                                                            '&::before': {
                                                                                content: '""',
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                height: '3px',
                                                                                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                                                                            }
                                                                        }}
                                                                        >
                                                                            <Box sx={{ mt: 2, mb: 3 }}>
                                                                                <DataGrid
                                                                                    rows={businessPartners}
                                                                                    columns={baseColumns}
                                                                                    pagination
                                                                                    autoHeight
                                                                                    disableRowSelectionOnClick
                                                                                    slots={{
                                                                                        toolbar: CustomToolbar,
                                                                                        noRowsOverlay: () => <EmptyContent title="📋 No hay datos disponibles" sx={{ py: 6 }} />,
                                                                                        noResultsOverlay: () => <EmptyContent title="🔍 No se encontraron resultados" sx={{ py: 6 }} />,
                                                                                    }}
                                                                                    sx={{
                                                                                        border: 'none',
                                                                                        borderRadius: 2,
                                                                                        boxShadow: theme.customShadows?.card || '0px 4px 20px rgba(0, 0, 0, 0.08)',
                                                                                        backgroundColor: theme.palette.background.paper,
                                                                                        '& .MuiDataGrid-main': {
                                                                                            borderRadius: 2,
                                                                                        },
                                                                                        '& .MuiDataGrid-columnHeaders': {
                                                                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                                                                            borderBottom: `2px solid ${theme.palette.divider}`,
                                                                                            borderRadius: '8px 8px 0 0',
                                                                                            fontWeight: 700,
                                                                                            fontSize: '0.875rem',
                                                                                            color: theme.palette.text.primary,
                                                                                            minHeight: '56px !important',
                                                                                        },
                                                                                        '& .MuiDataGrid-cell': {
                                                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                                                            padding: '12px 16px',
                                                                                            fontSize: '0.875rem',
                                                                                            color: theme.palette.text.primary,
                                                                                        },
                                                                                        '& .MuiDataGrid-row': {
                                                                                            transition: 'all 0.2s ease-in-out',
                                                                                            '&:hover': {
                                                                                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                                                                                transform: 'translateY(-1px)',
                                                                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
                                                                                            },
                                                                                        },
                                                                                        '& .MuiDataGrid-footerContainer': {
                                                                                            borderTop: `2px solid ${theme.palette.divider}`,
                                                                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                                                            padding: '8px 16px',
                                                                                            borderRadius: '0 0 8px 8px',
                                                                                        },
                                                                                        '& .MuiDataGrid-toolbar': {
                                                                                            padding: '16px',
                                                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                                                                                            '& .MuiButton-root': {
                                                                                                color: theme.palette.text.secondary,
                                                                                                fontSize: '0.875rem',
                                                                                                fontWeight: 500,
                                                                                                textTransform: 'none',
                                                                                                padding: '6px 12px',
                                                                                                borderRadius: 1.5,
                                                                                                '&:hover': {
                                                                                                    backgroundColor: theme.palette.action.hover,
                                                                                                    color: theme.palette.primary.main,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    }}
                                                                                    initialState={{
                                                                                        pagination: {
                                                                                            paginationModel: { pageSize: 10 },
                                                                                        },
                                                                                    }}
                                                                                    pageSizeOptions={[5, 10, 25, 50]}
                                                                                />
                                                                            </Box>

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

                                                                            {user && partner && (
                                                                                <CustomerReasignarCliente
                                                                                    currentPartner={partner}
                                                                                    open={quickRC.value}
                                                                                    onClose={quickRC.onFalse}/>
                                                                            )}
                                                                            {user && partner && (
                                                                                <CustomerPagosEfectuados
                                                                                    currentPartner={partner}
                                                                                    open={quickPE.value}
                                                                                    onClose={quickPE.onFalse}/>
                                                                            )}

                                                                            {user && partner && (
                                                                                <CustomerUltimaVentaPorMarca
                                                                                    currentPartner={partner}
                                                                                    open={quickUVPM.value}
                                                                                    onClose={quickUVPM.onFalse}/>
                                                                            )}

                                                                        </Card>


                                                                    </Grid>
                                                                </Grid>

                                                            </Card>
                                                            <Card sx={{
                                                                p: 4,
                                                                mt: 3,
                                                                borderRadius: 3,
                                                                boxShadow: theme.customShadows?.z16 || "0 16px 32px rgba(0,0,0,0.08)",
                                                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.info.lighter || theme.palette.info.light, 0.05)} 100%)`,
                                                                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '3px',
                                                                    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main}, ${theme.palette.warning.main})`,
                                                                }
                                                            }}
                                                            >
                                                                <CalendarView onValorCambiado={handleValorCambiado}/>

                                                            </Card>
                                                        </div>
                                                            ;
                                                    case 'otro-criterio':
                                                        return
                                                        <div>
                                                            Otro
                                                        </div>
                                                        ;
                                                    default:
                                                        return null;
                                                }
                                            })()}
                                        </Box>
                                    )
                            )
                            }
                        </Stack>
                    </Block>


                </Card>

            </Container>

        </>
    )
        ;
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


// ----------------------------------------------------------------------

AddressItem.propTypes = {
    address: PropTypes.object,
    onCreateBilling: PropTypes.func,
};

function AddressItem({address, onCreateBilling}) {
    // const {Cliente, Direccion, Celular, receiver, fullAddress, addressType, phoneNumber, isDefault} = address;
    const {Cliente, Direccion, Celular, ID, Tipo, U_SYP_CREDITO, CreditLine, Balance} = address;
    const receiver = Cliente;
    const tipo = Tipo;
    const id = ID;
    const tipo_credito = U_SYP_CREDITO;
    const credit_line = CreditLine;
    const balance_a = Balance;


    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    return (
        <Card onClick={onCreateBilling}
              sx={{
                  p: 3,
                  mb: 3,
                  width: '100%', // Hacer que el card ocupe todo el ancho disponible

              }}
        >
            <Stack
                spacing={2}
                alignItems={{
                    md: 'flex-end',
                }}
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
            >
                <Stack flexGrow={1} spacing={1}>
                    <Stack direction="row" alignItems="center">
                        <Typography variant="subtitle1">
                            {receiver}
                            <Box component="span" sx={{ml: 0.5, typography: 'body2', color: 'text.secondary'}}>
                                ({id + " | " + tipo})
                            </Box>
                        </Typography>

                        {/* {isDefault && ( */}
                        {/*     <Label color="info" sx={{ml: 1}}> */}
                        {/*         Default */}
                        {/*     </Label> */}
                        {/* )} */}
                    </Stack>

                    {/*<Typography variant="body2">{tipo + " " +id}</Typography>*/}

                    {/*<Typography variant="body2" sx={{color: 'text.secondary'}}>*/}
                    {/*    {id}*/}
                    {/*</Typography>*/}
                    <Label color="success" sx={{ml: 1}}>
                        Cupo Otorgado: {fCurrency(credit_line)}
                    </Label>

                    <Label color="warning" sx={{ml: 1}}>
                        Cupo Disponible: {fCurrency(credit_line - balance_a)}
                    </Label>

                    <Label color="info" sx={{ml: 1}}>
                        Tipo de Crédito: {tipoCredito(tipo_credito)}
                    </Label>
                </Stack>

                {/* <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}> */}
                {/*     /!* {!isDefault && ( *!/ */}
                {/*     /!*     <Button variant="outlined" size="small" color="inherit" sx={{mr: 1}}> *!/ */}
                {/*     /!*         Borrar *!/ */}
                {/*     /!*     </Button> *!/ */}
                {/*     /!* )} *!/ */}

                {/*     <Button variant="outlined" size="small" onClick={onCreateBilling}> */}
                {/*         Entregar a esta dirección */}
                {/*     </Button> */}
                {/* </Stack> */}
            </Stack>
        </Card>
    );
}
