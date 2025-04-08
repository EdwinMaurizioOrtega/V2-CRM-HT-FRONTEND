import React, {useEffect, useState} from 'react';
import sumBy from 'lodash/sumBy';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {alpha, useTheme} from '@mui/material/styles';
import {
    Tab,
    Tabs,
    Card,
    Table,
    Stack,
    Button,
    Tooltip,
    Divider,
    TableBody,
    Container,
    IconButton,
    TableContainer, FormControlLabel, Switch,
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// utils
import {fDate, fDateCustom} from '../../../utils/formatTime';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import {useSettingsContext} from '../../../components/settings';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableEmptyRows,
    TableHeadCustom,
    TablePaginationCustom,
} from '../../../components/table';
// sections
import InvoiceAnalytic from '../../../sections/@dashboard/invoice/InvoiceAnalytic';
import {InvoiceTableRow, InvoiceTableToolbar} from '../../../sections/@dashboard/invoice/list';
import {useDispatch} from "../../../redux/store";
import {useAuthContext} from "../../../auth/useAuthContext";
import {HOST_API_KEY} from "../../../config-global";
import CustomDateRangePicker, {useDateRangePicker} from 'src/components/custom-date-range-picker';
import {AppCompanyWork} from "../../../sections/@dashboard/general/app";

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
    'Todos',
    'Pendiente de aprobar',
    'Pendiente de facturar',
    'Facturado',
    'Anulado',
];

const TABLE_HEAD = [
    {id: 'detalle', label: 'Detalle', align: 'left'},
    {id: 'ID', label: 'Orden', align: 'left'},
    {id: 'NUMEROFACTURAE4', label: 'NOTA', align: 'left'},
    {id: 'ESTADO', label: 'Estado', align: 'left'},
    // {id: 'BODEGA', label: 'Bodega', align: 'left'},
    // {id: 'FORMADEPAGO', label: 'FPago', align: 'left'},
    {id: 'CLIENTEID', label: 'CI/RUC', align: 'left'},
    {id: 'Cliente', label: 'R.Social', align: 'center', width: 140},
    {id: 'Celular', label: 'Celular', align: 'center', width: 140},
    // {id: 'Tipo', label: 'Tipo Cliente', align: 'left'},
    {id: 'Ciudad', label: 'Ciudad Cliente', align: 'left'},
    {id: 'CITY', label: 'Ciudad Vendedor', align: 'left'},
    {id: 'NUMEROGUIA', label: 'Servientrega', align: 'left'},
    // {id: 'NOMBREUSUARIOENTREGARA', label: 'ENTREGAR', align: 'left'},
    // {id: 'DOCNUM', label: 'OV SAP', align: 'left'},
    {id: 'FECHACREACION', label: 'Creación', align: 'left'},
    {id: 'FECHAAPROBO', label: 'Aprobación', align: 'left'},
    {id: 'FECHAFACTURACION', label: 'Facturación', align: 'left'},
    {id: 'NUMEROFACTURALIDENAR', label: 'Nro. Factura', align: 'left'},
];
// ----------------------------------------------------------------------

InvoiceListPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceListPage() {

    const router = useRouter();

    const rangeInputPicker = useDateRangePicker(new Date(), new Date());

    const {user} = useAuthContext();

    const theme = useTheme();

    const dispatch = useDispatch();

    //const { orders, isLoading } = useSelector((state) => state.orders_status);
    const [orders, setOrders] = useState([]);

    const {themeStretch} = useSettingsContext();

    const {push} = useRouter();

    const {
        dense,
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        //
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        //
        onSort,
        onChangeDense,
        onChangePage,
        onChangeRowsPerPage,
    } = useTable({defaultOrderBy: 'invoiceNumber'});

    const [tableData, setTableData] = useState([]);

    const [filterName, setFilterName] = useState('');

    const [openConfirm, setOpenConfirm] = useState(false);

    const [filterStatus, setFilterStatus] = useState('all');

    const [filterService, setFilterService] = useState('all');

    const [filterEndDate, setFilterEndDate] = useState(null);

    const [filterStartDate, setFilterStartDate] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);

    //Para la sección de la Fecha de Creación y Fecha de Facturación
    const [isChecked, setIsChecked] = useState(false);

    const handleSwitchChange = (event) => {
        setIsChecked(event.target.checked);
        console.log(event.target.checked ? 'Activo' : 'Inactivo');
    };

    // Filtrar la tabla según el rol del usuario
    const filteredTableHead = [
        ...TABLE_HEAD.slice(0, 4), // Incluye las primeras 4 columnas
        ...(user && user.ROLE !== '31' ? [
            {id: 'BODEGA', label: 'Bodega', align: 'left'}, // Incluir "Bodega" si el rol no es '31'
            {id: 'FORMADEPAGO', label: 'FPago', align: 'left'} // Incluir "FPago" si el rol no es '31'
        ] : []),
        ...TABLE_HEAD.slice(4, 7), // Incluye las columnas desde el índice 4 hasta el 7 (que incluye 'CLIENTEID', 'Cliente', 'Celular')
        ...(user && user.ROLE !== '31' ? [{id: 'Tipo', label: 'Tipo Cliente', align: 'left'}] : []), // Incluir "Tipo" si el rol no es '31'
        ...TABLE_HEAD.slice(7, 10), // Incluye las columnas desde el índice 7 hasta el 10 (que incluye 'Ciudad', 'CITY', 'NUMEROGUIA')
        ...(user && user.ROLE !== '31' ? [
            {id: 'NOMBREUSUARIOENTREGARA', label: 'ENTREGAR', align: 'left'},
            {id: 'DOCNUM', label: 'OV SAP', align: 'left'},
        ] : []), // Incluir "ENTREGAR" y "OV SAP" si el rol no es '31'
        ...TABLE_HEAD.slice(10) // Incluye el resto de las columnas
    ];

    // useEffect(async () => {
    //
    //   console.log(user.DISPLAYNAME);
    //   console.log(user.ROLE);
    //
    //   // Perfil vendedor
    //   if (user.ROLE === "7") {
    //     const idVendedor = user.ID;
    //     // Mostramos todos los estados para el rol del vendedor
    //     //dispatch(getOrdersAllStatusByVendedor(idVendedor));
    //
    //     try {
    //       const response = await fetch(`https://crm.lidenar.com/hanadb/api/orders/vendedor?ven=${idVendedor}`);
    //
    //       const data = await response.json();
    //       setOrders(data.data.orders);
    //       console.log(orders);
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //       setOrders([]);
    //     }
    //
    //
    //   };
    //
    //   // Perfil aprobacion
    //
    //   if (user.ROLE === "9") {
    //     // Enviar el estado 6 para consultar las ordenes pendientes de factuaración.
    //     //dispatch(getOrders(6));
    //
    //     try {
    //       const response = await fetch(`https://crm.lidenar.com/hanadb/api/orders?estado=6`);
    //
    //       const data = await response.json();
    //       setOrders(data.orders);
    //       console.log(orders);
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //       setOrders([]);
    //     }
    //
    //   };
    //
    //   // Perfil bodega
    //
    //   if (user.ROLE === "8") {
    //     console.log(user.WAREHOUSE);
    //     const bodegaSAP = user.WAREHOUSE;
    //
    //     dispatch(getOrdersByBodega(bodegaSAP));
    //
    //     try {
    //       const response = await fetch(`https://crm.lidenar.com/hanadb/api/orders/bodega?bod=${bodegaSAP}`);
    //
    //       const data = await response.json();
    //       setOrders(data.data.orders);
    //       console.log(orders);
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //       setOrders([]);
    //     }
    //
    //   };
    //
    //
    // }, []);

    useEffect(() => {
        async function fetchData() {
            console.log(user.DISPLAYNAME);
            console.log(user.ROLE);

            setCurrentUser(user);

            try {
                let data = [];

                if (user.ROLE === "10") {
                    //10 => Admin
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/admin?empresa=${user.EMPRESA}&fecha_inicio=${fDateCustom(rangeInputPicker.startDate)}&fecha_fin=${fDateCustom(rangeInputPicker.endDate)}&switch_dates=${isChecked}`);
                    data = await response.json();
                } else if (user.ROLE === "7" || user.ROLE === "5") {
                    //7 => Vendedor 5 => Infinix
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/vendedor?ven=${user.ID}&empresa=${user.EMPRESA}`);
                    data = await response.json();
                } else if (user.ROLE === "9") {
                    //9 => Credito
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/credit?empresa=${user.EMPRESA}`);
                    data = await response.json();
                } else if (user.ROLE === "8") {
                    //8 => Bodega
                    //console.log(user.WAREHOUSE);
                    const bodegaSAP = user.WAREHOUSE;
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/bodega?bod=${bodegaSAP}&empresa=${user.EMPRESA}`);
                    data = await response.json();
                } else if (user.ROLE === "0") {
                    //0 => Tomebamba: Vendedor
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/vendedor?ven=${user.ID}&empresa=${user.EMPRESA}`);
                    data = await response.json();
                } else if (user.ROLE === "2" || user.ROLE === "1") {
                    //2 => Tomebamba: Ejecutivo Soporte 1 => Compras
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/tomebamba_credit?empresa=${user.EMPRESA}&status=10, 13, 6, 0, 1, 8`);
                    data = await response.json();
                } else if (user.ROLE === "31") {
                    //31 => Cliente Mayorista
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/cliente?cli_id=${user.CARD_CODE}`);
                    data = await response.json();
                }

                setOrders(data.orders);
                console.log("data.orders: " + JSON.stringify(data.orders));
            } catch (error) {
                console.error('Error fetching data:', error);
                setOrders([]);
            }
        }

        fetchData();
    }, [user, orders]);


    useEffect(() => {
        if (orders.length) {
            setTableData(orders);
        }
    }, [orders])

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(order, orderBy),
        filterName,
        // filterService,
        filterStatus,
        currentUser,
        // filterStartDate,
        // filterEndDate,
    });

    // const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const denseHeight = dense ? 56 : 76;

    const isFiltered =
            filterStatus !== 'all' ||
            filterName !== ''
        // filterService !== 'all' ||
        // (!!filterStartDate && !!filterEndDate)
    ;

    const isNotFound =
            (!dataFiltered.length && !!filterName) ||
            (!dataFiltered.length && !!filterStatus)
        // (!dataFiltered.length && !!filterService) ||
        // (!dataFiltered.length && !!filterEndDate) ||
        // (!dataFiltered.length && !!filterStartDate)
    ;

    const getLengthByStatus = (status) => tableData.filter((item) => item.ESTADO === status).length;

    const getTotalPriceByStatus = (status) =>
        sumBy(
            tableData.filter((item) => item.ESTADO === status),
            (item) => parseFloat(item.SUBTOTAL)  // Convertir SUBTOTAL a número

        );

    const getPercentByStatus = (status) => (getLengthByStatus(status) / tableData.length) * 100;

    // const TABS = [
    //     {value: 'all', label: 'Total', color: 'info', count: tableData.length},
    //     {value: 6, label: 'Pendiente de aprobar', color: 'success', count: getLengthByStatus(6)},
    //     {value: 0, label: 'Pendiente de Facturar', color: 'warning', count: getLengthByStatus(0)},
    //     {value: 22, label: 'Pend. Cargar Evidencia', color: 'info', count: getLengthByStatus(22)},
    //     {value: 23, label: 'Pend. Validar Cartera', color: 'info', count: getLengthByStatus(23)},
    //     {value: 1, label: 'Facturado', color: 'error', count: getLengthByStatus(1)},
    //     {value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8)},
    // ];

    // Obtener las pestañas basadas en el usuario
    const TABS = getTabs(user, tableData, getLengthByStatus);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleFilterStatus = (event, newValue) => {
        setPage(0);
        setFilterStatus(newValue);
    };

    const handleFilterName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    const handleFilterService = (event) => {
        setPage(0);
        setFilterService(event.target.value);
    };

    const handleDeleteRow = (id) => {
        const deleteRow = tableData.filter((row) => row.id !== id);
        setSelected([]);
        setTableData(deleteRow);

        if (page > 0) {
            if (dataInPage.length < 2) {
                setPage(page - 1);
            }
        }
    };

    // const handleDeleteRows = (selectedRows) => {
    //     const deleteRows = tableData.filter((row) => !selectedRows.includes(row.id));
    //     setSelected([]);
    //     setTableData(deleteRows);
    //
    //     if (page > 0) {
    //         if (selectedRows.length === dataInPage.length) {
    //             setPage(page - 1);
    //         } else if (selectedRows.length === dataFiltered.length) {
    //             setPage(0);
    //         } else if (selectedRows.length > dataInPage.length) {
    //             const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
    //             setPage(newPage);
    //         }
    //     }
    // };

    const handleEditRow = (id) => {
        push(PATH_DASHBOARD.invoice.edit(id));
    };

    const handleViewRow = (id) => {
        push(PATH_DASHBOARD.invoice.view(id));
        //window.open(PATH_DASHBOARD.invoice.view(id), '_blank', 'noopener,noreferrer');
    };

    const handleResetFilter = () => {
        setFilterName('');
        setFilterStatus('all');
        // setFilterService('all');
        // setFilterEndDate(null);
        // setFilterStartDate(null);
    };

    const downloadFile = ({data, fileName, fileType}) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], {type: fileType})
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
    }
    const exportJsonToCSV = e => {
        e.preventDefault()
        // Convierte el JSON a CSV de manera simple
        const csvData = Object.keys(dataFiltered[0]).join(';') + '\n' +
            dataFiltered.map(row => Object.values(row).join(';')).join('\n');

        // Descarga el archivo CSV
        downloadFile({
            data: csvData,
            fileName: 'invoices.csv',
            fileType: 'text/csv',
        });
    }

    const {
        startDate,
        endDate,
        onChangeStartDate,
        onChangeEndDate,
        open: openPicker,
        onOpen: onOpenPicker,
        onClose: onClosePicker,
        isSelected: isSelectedValuePicker,
        isError,
        shortLabel,
    } = useDateRangePicker(new Date(), new Date());

    const [total, setTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${HOST_API_KEY}/hanadb/api/orders/nro_camiones_servientrega?empresa=${user.EMPRESA}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const result = await response.json();
                setTotal(result.total);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.EMPRESA]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <>
        <Head>
            <title> Invoice: List | HT</title>
        </Head>

        <Container maxWidth={themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading="Lista Ordenes"
                links={[
                    {
                        name: 'Dashboard',
                        href: PATH_DASHBOARD.root,
                    },
                    {
                        name: 'Invoices',
                        href: PATH_DASHBOARD.invoice.root,
                    },
                    {
                        name: 'Lista',
                    },
                ]}
                action={
                    // <Button
                    //   component={NextLink}
                    //   href={PATH_DASHBOARD.invoice.new}
                    //   variant="contained"
                    //   startIcon={<Iconify icon="eva:plus-fill" />}
                    // >
                    //   New Invoice
                    // </Button>
                    <>
                        {user.ROLE === "10" && (
                            <>
                                <FormControlLabel
                                    control={<Switch checked={isChecked} onChange={handleSwitchChange}/>}
                                    label="Fact."/>
                                <Button variant="contained" onClick={rangeInputPicker.onOpen}>
                                    Rango
                                </Button>
                            </>
                        )
                        }
                        <CustomDateRangePicker
                            open={rangeInputPicker.open}
                            startDate={rangeInputPicker.startDate}
                            endDate={rangeInputPicker.endDate}
                            onChangeStartDate={rangeInputPicker.onChangeStartDate}
                            onChangeEndDate={rangeInputPicker.onChangeEndDate}
                            onClose={rangeInputPicker.onClose}
                            error={rangeInputPicker.error}
                        />
                    </>


                }
            />

            <Card sx={{
                mb: {xs: 3, md: 5},
            }}
            >

                {/* <AppCompanyWork/> */}

                {user.ROLE === "10" &&
                    <Stack sx={{typography: 'body2', mt: 3}} alignItems="center">
                        <div>
                            <strong>Inicio: </strong> {fDate(rangeInputPicker.startDate)}
                            {' - '}
                            <strong>Fin: </strong> {fDate(rangeInputPicker.endDate)}
                        </div>
                    </Stack>
                }
                <Scrollbar>
                    <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem sx={{borderStyle: 'dashed'}}/>}
                        sx={{py: 2}}
                    >
                        <InvoiceAnalytic
                            title="Total"
                            total={tableData.length}
                            percent={100}
                            //price={user.COMPANY !== 'TOMEBAMBA' && sumBy(tableData, (item) => Number(item.SUBTOTAL))}
                            price={user.COMPANY !== 'TOMEBAMBA' && sumBy(
                                tableData.filter((item) => item.ESTADO === 6 || item.ESTADO === 1 || item.ESTADO === 0 || item.ESTADO === 22),
                                (item) => Number(item.SUBTOTAL))}
                            icon="solar:bill-list-bold-duotone"
                            color={theme.palette.info.main}
                        />

                        <InvoiceAnalytic
                            title="Por Aprobar Vendedor"
                            total={getLengthByStatus(15)}
                            percent={getPercentByStatus(15)}
                            price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(15)}
                            icon="solar:file-check-bold-duotone"
                            color={theme.palette.success.main}
                        />

                        <InvoiceAnalytic
                            title="Por Aprobar Crédito"
                            total={getLengthByStatus(6)}
                            percent={getPercentByStatus(6)}
                            price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(6)}
                            icon="solar:file-check-bold-duotone"
                            color={theme.palette.success.main}
                        />

                        <InvoiceAnalytic
                            title="Por Facturar"
                            total={getLengthByStatus(0)}
                            percent={getPercentByStatus(0)}
                            price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(0)}
                            icon="solar:sort-by-time-bold-duotone"
                            color={theme.palette.warning.main}
                        />

                        {user.COMPANY === 'HT' && user.ROLE !== '31' && <InvoiceAnalytic
                            title="F/Pend.Cargar Evidencia."
                            total={getLengthByStatus(22)}
                            percent={getPercentByStatus(22)}
                            price={getTotalPriceByStatus(22)}
                            icon="solar:bell-bing-bold-duotone"
                            color={theme.palette.error.main}
                        />
                        }

                        <InvoiceAnalytic
                            title="Fact/Entreg."
                            total={getLengthByStatus(1)}
                            percent={getPercentByStatus(1)}
                            price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(1)}
                            icon="solar:bell-bing-bold-duotone"
                            color={theme.palette.error.main}
                        />

                        <InvoiceAnalytic
                            title="Anulado"
                            total={getLengthByStatus(8)}
                            percent={getPercentByStatus(8)}
                            price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(8)}
                            icon="solar:file-corrupted-bold-duotone"
                            color={theme.palette.text.secondary}
                        />
                    </Stack>
                </Scrollbar>
            </Card>

            {(user.ROLE === '8' || user.ROLE === '10') && (
                <div style={{ textAlign: 'center' }}>
                    <p>
                        Total Para Servientrega: <strong>
                        ${Number(total).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                    </strong>
                    </p>
                </div>
            )}

        <Card>
            <Tabs
                value={filterStatus}
                onChange={handleFilterStatus}
                sx={{
                    px: 2.5,
                    boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
            >
                {TABS.map((tab) => (
                    <Tab
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        iconPosition="end"
                        icon={
                            <Label
                                variant={
                                    ((tab.value === 'all' || tab.value === filterStatus) && 'filled') || 'soft'
                                }
                                color={tab.color}>
                                {tab.count}
                            </Label>
                        }
                    />
                ))}
            </Tabs>

            <Divider/>

            <InvoiceTableToolbar
                isFiltered={isFiltered}
                filterName={filterName}
                // filterService={filterService}
                // filterEndDate={filterEndDate}
                onFilterName={handleFilterName}
                optionsService={SERVICE_OPTIONS}
                onResetFilter={handleResetFilter}
                // filterStartDate={filterStartDate}
                onFilterService={handleFilterService}
                // onFilterStartDate={(newValue) => {
                //     setFilterStartDate(newValue);
                // }}
                // onFilterEndDate={(newValue) => {
                //     setFilterEndDate(newValue);
                // }}
            />

            <TableContainer sx={{position: 'relative', overflow: 'unset'}}>
                {/* <TableSelectedAction */}
                {/*     dense={dense} */}
                {/*     numSelected={selected.length} */}
                {/*     rowCount={tableData.length} */}
                {/*     onSelectAllRows={(checked) => */}
                {/*         onSelectAllRows( */}
                {/*             checked, */}
                {/*             tableData.map((row) => row.id) */}
                {/*         ) */}
                {/*     } */}
                {/*     action={ */}
                {/*         <Stack direction="row"> */}
                {/*             <Tooltip title="Sent"> */}
                {/*                 <IconButton color="primary"> */}
                {/*                     <Iconify icon="ic:round-send"/> */}
                {/*                 </IconButton> */}
                {/*             </Tooltip> */}

                {/*             <Tooltip title="Download"> */}
                {/*                 <IconButton color="primary"> */}
                {/*                     <Iconify icon="eva:download-outline"/> */}
                {/*                 </IconButton> */}
                {/*             </Tooltip> */}

                {/*             <Tooltip title="Print"> */}
                {/*                 <IconButton color="primary"> */}
                {/*                     <Iconify icon="eva:printer-fill"/> */}
                {/*                 </IconButton> */}
                {/*             </Tooltip> */}

                {/*             <Tooltip title="Delete"> */}
                {/*                 <IconButton color="primary" onClick={handleOpenConfirm}> */}
                {/*                     <Iconify icon="eva:trash-2-outline"/> */}
                {/*                 </IconButton> */}
                {/*             </Tooltip> */}
                {/*         </Stack> */}
                {/*     } */}
                {/* /> */}

                <Scrollbar>
                    <Table size={dense ? 'small' : 'medium'} sx={{minWidth: 800}}>
                        <TableHeadCustom
                            order={order}
                            orderBy={orderBy}
                            headLabel={filteredTableHead}
                            rowCount={tableData.length}
                            // numSelected={selected.length}
                            // onSort={onSort}
                            {...(user.ROLE !== '8' && { onSort })}
                            // onSelectAllRows={(checked) =>
                            //     onSelectAllRows(
                            //         checked,
                            //         tableData.map((row) => row.id)
                            //     )
                            // }
                        />

                        <TableBody>
                            {dataFiltered
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <InvoiceTableRow
                                        key={row.ID}
                                        row={row}
                                        // selected={selected.includes(row.ID)}
                                        // onSelectRow={() => onSelectRow(row.ID)}
                                        onViewRow={() => handleViewRow(row.ID)}
                                        // onAnularRow={() => handleAnularRow(row.ID)}
                                        // onEditRow={() => handleEditRow(row.ID)}
                                        // onDeleteRow={() => handleDeleteRow(row.ID)}
                                    />
                                ))}

                            <TableEmptyRows
                                height={denseHeight}
                                emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                            />

                            <TableNoData isNotFound={isNotFound}/>
                        </TableBody>
                    </Table>

                </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
                count={dataFiltered.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
                //
                dense={dense}
                onChangeDense={onChangeDense}
            />

            <Tooltip title="Descargar">
                <IconButton onClick={exportJsonToCSV}
                >
                    <Iconify icon="eva:download-fill"/>
                </IconButton>
            </Tooltip>
        </Card>
        </Container>

{/* <ConfirmDialog */
}
{/*     open={openConfirm} */
}
{/*     onClose={handleCloseConfirm} */
}
{/*     title="Delete" */
}
{/*     content={ */
}
{/*         <> */
}
{/*             Are you sure want to delete <strong> {selected.length} </strong> items? */
}
{/*         </> */
}
{/*     } */
}
{/*     action={ */
}
{/*         <Button */
}
{/*             variant="contained" */
}
{/*             color="error" */
}
{/*             onClick={() => { */
}
{/*                 handleDeleteRows(selected); */
}
{/*                 handleCloseConfirm(); */
}
{/*             }} */
}
{/*         > */
}
{/*             Delete */
}
{/*         </Button> */
}
{/*     } */
}
{/* /> */
}
</>
)
    ;
}

// ----------------------------------------------------------------------

function applyFilter({
                         inputData,
                         comparator,
                         filterName,
                         filterStatus,
                         currentUser,
                         // filterService,
                         // filterStartDate,
                         // filterEndDate,
                     }) {
    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
        inputData = inputData.filter(
            (invoice) =>
                String(invoice.ID).toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
                invoice.Cliente.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
                invoice.VENDEDOR.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
                invoice.BODEGA.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        );
    }


    console.log("user_user:" + currentUser)

    if (filterStatus !== 'all') {

        //console.log("user_user:"+ user)

        if (currentUser.ROLE === "8") {

            //CDHT
            if (currentUser.WAREHOUSE === "019") {

                if (filterStatus === 0) {
                    inputData = inputData.slice(0, 6); // Return only the first two items
                }

            }

            //Cuenca
            if (currentUser.WAREHOUSE === "002") {

                if (filterStatus === 0) {
                    inputData = inputData.slice(0, 3); // Return only the first two items
                }

            }

            //Colon
            if (currentUser.WAREHOUSE === "030") {

                if (filterStatus === 0) {
                    inputData = inputData.slice(0, 1); // Return only the first two items
                }

            }

            // Manta
            if (currentUser.WAREHOUSE === "024") {

                if (filterStatus === 0) {
                    inputData = inputData.slice(0, 1); // Return only the first two items
                }

            }

        } else {
            inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        }
    }

    // if (filterService !== 'all') {
    //     inputData = inputData.filter((invoice) => invoice.ESTADO === filterService);
    // }

    // if (filterStartDate && filterEndDate) {
    //
    //     inputData = inputData.filter(
    //         (invoice) => {
    //             console.log("invoice.FECHACREACION: "+parseCustomDate(invoice.FECHACREACION));
    //             console.log("filterStartDate: "+filterStartDate);
    //             console.log("filterEndDate: "+filterEndDate);
    //             fTimestamp(parseCustomDate(invoice.FECHACREACION)) >= fTimestamp(filterStartDate) &&
    //             fTimestamp(parseCustomDate(invoice.FECHACREACION)) <= fTimestamp(filterEndDate)
    //         }
    //     );
    //
    // }

    return inputData;
}


function parseCustomDate(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');
    const formattedDateString = `${month} ${day} ${year} ${hour}:${minute}:${second}`;
    return new Date(formattedDateString);
}

const getTabs = (user, tableData, getLengthByStatus) => {

    if (user.COMPANY === 'HT') {

        if (user.ROLE === '31') {
            return [
                {value: 'all', label: 'Total', color: 'info', count: tableData.length},
                {value: 15, label: 'Pendiente Aprobar Vendedor', color: 'success', count: getLengthByStatus(15)},
                {value: 6, label: 'Pendiente Aprobar Crédito', color: 'success', count: getLengthByStatus(6)},
                {value: 0, label: 'Pendiente Facturar', color: 'warning', count: getLengthByStatus(0)},
                {value: 1, label: 'Fact./Entregado', color: 'error', count: getLengthByStatus(1)},
                {value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8)},
            ];
        } else {

            return [
                {value: 'all', label: 'Total', color: 'info', count: tableData.length},
                {value: 15, label: 'Pendiente Aprobar Vendedor', color: 'success', count: getLengthByStatus(15)},
                {value: 6, label: 'Pendiente Aprobar Crédito', color: 'success', count: getLengthByStatus(6)},
                {value: 0, label: 'Pendiente Facturar', color: 'warning', count: getLengthByStatus(0)},
                {value: 22, label: 'F/Pend. Cargar Evidencia', color: 'info', count: getLengthByStatus(22)},
                {value: 23, label: 'F/Pend. Validar Cartera', color: 'info', count: getLengthByStatus(23)},
                {value: 1, label: 'Fact./Entregado', color: 'error', count: getLengthByStatus(1)},
                {value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8)},
            ];
        }

    } else {
        return [
            {value: 'all', label: 'Total', color: 'info', count: tableData.length},
            {value: 6, label: 'Pendiente de aprobar', color: 'success', count: getLengthByStatus(6)},
            {value: 0, label: 'Pendiente de Facturar', color: 'warning', count: getLengthByStatus(0)},
            {value: 1, label: 'Facturado', color: 'error', count: getLengthByStatus(1)},
            {value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8)},
        ];
    }


}
