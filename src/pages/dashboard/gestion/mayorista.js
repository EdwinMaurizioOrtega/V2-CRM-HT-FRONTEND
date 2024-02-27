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
    Autocomplete, InputAdornment, IconButton, Grid, Divider
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

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const [partner, setPartner] = useState(null);
    const quickEdit = useBoolean();
    const quickPCM = useBoolean();
    const quickICO = useBoolean();

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
                    label="Gestiones Anteriores"
                    onClick={() => handleViewManagementRow(params.row)}
                />,
                <GridActionsCellItem
                    showInMenu
                    icon={<Iconify icon="solar:eye-bold"/>}
                    label="Histórico Órdenes"
                    onClick={() => handleViewOrdersRow(params.row)}
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
            minWidth: 160,
            renderCell: renderDiasColumn, // Usa el renderizador de celdas personalizado
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
        // {
        //     field: 'Celular',
        //     headerName: 'Celular',
        //     flex: 1,
        //     minWidth: 160,
        // },
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
        // {
        //     field: 'Balance',
        //     headerName: 'Cupo utilizado',
        //     flex: 1,
        //     minWidth: 160,
        // },
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
            console.log("Usuario logueado: " + user.DISPLAYNAME)

            try {
                const response = await axios.post('/hanadb/api/customers/BusinessPartnersByRange', {
                    ID_RANGO: value.id,
                    USER_NAME: user.DISPLAYNAME
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

        } catch
            (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    const handleViewRow = useCallback(
        (row) => {
            quickEdit.onTrue();
            console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickEdit]
    );


    const handleViewManagementRow = useCallback(
        (row) => {
            quickPCM.onTrue();
            console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickEdit]
    );


    const handleViewOrdersRow = useCallback(
        (row) => {
            quickICO.onTrue();
            console.log("Cliente a gestionar: " + JSON.stringify(row));
            setPartner(row);

        },
        [quickEdit]
    );


    const [dataContAgenda, setDataContAgenda] = useState(0);
    const [dataContAgendaCErrado, setDataContAgendaCerrado] = useState(0);
    const [dataContAgendaPorCerrar, setDataContAgendaPorCerrar] = useState(0);


    const handleValorCambiado = (nuevoValor) => {
        console.log("Llega el nuevo valor: " + JSON.stringify(nuevoValor));

        setDataContAgenda(nuevoValor.length); // Corregido: asignar la longitud directamente
        const agendaCerrada = nuevoValor.filter((agenda) => agenda.VISITO === false); // Usar filter() para obtener todos los elementos que cumplan con la condición
        setDataContAgendaCerrado(agendaCerrada.length); // Almacenar los elementos que cumplen con la condición

        const agendaPorCerrar = nuevoValor.filter((agenda) => agenda.VISITO === true); // Usar filter() para obtener todos los elementos que cumplan con la condición
        setDataContAgendaPorCerrar(agendaPorCerrar.length); // Almacenar los elementos que cumplen con la condición
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
                                BuscarPorRango(event, value);
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
                    <CustomerQuickManagementForm currentPartner={partner} open={quickEdit.value}
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

                </Card>


                <Card sx={{
                    p: 5
                }}
                >
                    <CalendarView onValorCambiado={handleValorCambiado}/>

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



