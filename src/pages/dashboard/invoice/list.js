import React, { useEffect, useState } from 'react';
import sumBy from 'lodash/sumBy';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
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
import { PATH_DASHBOARD } from '../../../routes/paths';
// utils
import { fDate, fDateCustom } from '../../../utils/formatTime';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
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
import { InvoiceTableRow, InvoiceTableToolbar } from '../../../sections/@dashboard/invoice/list';
import { useDispatch } from "../../../redux/store";
import { useAuthContext } from "../../../auth/useAuthContext";
import { HOST_API_KEY } from "../../../config-global";
import CustomDateRangePicker, { useDateRangePicker } from 'src/components/custom-date-range-picker';
import { AppCompanyWork } from "../../../sections/@dashboard/general/app";
import dynamic from 'next/dynamic';

// Importar ApexCharts dinámicamente para evitar errores de SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div>Cargando gráfico...</div>
});

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
    'Todos',
    'Pendiente de aprobar',
    'Pendiente de facturar',
    'Facturado',
    'Anulado',
];

const TABLE_HEAD = [
    { id: 'detalle', label: 'Detalle', align: 'left' },
    { id: 'ID', label: 'Orden', align: 'left' },
    // {id: 'NUMEROFACTURAE4', label: 'NOTA', align: 'left'},
    { id: 'ESTADO', label: 'Estado', align: 'left' },
    // {id: 'BODEGA', label: 'Bodega', align: 'left'},
    // {id: 'FORMADEPAGO', label: 'FPago', align: 'left'},
    { id: 'CLIENTEID', label: 'CI/RUC', align: 'left' },
    { id: 'Cliente', label: 'R.Social', align: 'center', width: 140 },
    { id: 'Celular', label: 'Celular', align: 'center', width: 140 },
    // {id: 'Tipo', label: 'Tipo Cliente', align: 'left'},
    { id: 'Ciudad', label: 'Ciudad Cliente', align: 'left' },
    { id: 'CITY', label: 'Ciudad Vendedor', align: 'left' },
    { id: 'NUMEROGUIA', label: 'Servientrega', align: 'left' },
    // {id: 'NOMBREUSUARIOENTREGARA', label: 'ENTREGAR', align: 'left'},
    // {id: 'DOCNUM', label: 'OV SAP', align: 'left'},
    { id: 'FECHACREACION', label: 'Creación', align: 'left' },
    { id: 'FECHAAPROBO', label: 'Aprobación', align: 'left' },
    { id: 'FECHAFACTURACION', label: 'Facturación', align: 'left' },
    { id: 'NUMEROFACTURALIDENAR', label: 'Nro. Factura', align: 'left' },
    { id: 'OBSERVACION_ANULACION', label: 'Obs. Anulación', align: 'center', width: 240 },
];
// ----------------------------------------------------------------------

InvoiceListPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceListPage() {

    const router = useRouter();

    const rangeInputPicker = useDateRangePicker(new Date(), new Date());

    const { user } = useAuthContext();

    const theme = useTheme();

    const dispatch = useDispatch();

    //const { orders, isLoading } = useSelector((state) => state.orders_status);
    const [orders, setOrders] = useState([]);

    const { themeStretch } = useSettingsContext();

    const { push } = useRouter();

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
    } = useTable({ defaultOrderBy: 'invoiceNumber' });

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
        //console.log(event.target.checked ? 'Activo' : 'Inactivo');
    };

    // Filtrar la tabla según el rol del usuario
    const filteredTableHead = [
        ...TABLE_HEAD.slice(0, 4), // Incluye las primeras 4 columnas
        ...(user && user.ROLE !== '31' ? [
            { id: 'BODEGA', label: 'Bodega', align: 'left' }, // Incluir "Bodega" si el rol no es '31'
            { id: 'FORMADEPAGO', label: 'FPago', align: 'left' } // Incluir "FPago" si el rol no es '31'
        ] : []),
        ...TABLE_HEAD.slice(4, 7), // Incluye las columnas desde el índice 4 hasta el 7 (que incluye 'CLIENTEID', 'Cliente', 'Celular')
        ...(user && user.ROLE !== '31' ? [{ id: 'Tipo', label: 'Tipo Cliente', align: 'left' }] : []), // Incluir "Tipo" si el rol no es '31'
        ...TABLE_HEAD.slice(7, 10), // Incluye las columnas desde el índice 7 hasta el 10 (que incluye 'Ciudad', 'CITY', 'NUMEROGUIA')
        ...(user && user.ROLE !== '31' ? [
            { id: 'NOMBREUSUARIOENTREGARA', label: 'ENTREGAR', align: 'left' },
            { id: 'USUARIOAPROBO', label: 'USUARIOAPROBO', align: 'left' },
            { id: 'DOCNUM', label: 'OV SAP', align: 'left' },
        ] : []), // Incluir "ENTREGAR" y "OV SAP" si el rol no es '31'
        ...TABLE_HEAD.slice(10) // Incluye el resto de las columnas
    ];

    // useEffect(async () => {
    //
    //   //console.log(user.DISPLAYNAME);
    //   //console.log(user.ROLE);
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
    //       //console.log(orders);
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
    //       //console.log(orders);
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
    //     //console.log(user.WAREHOUSE);
    //     const bodegaSAP = user.WAREHOUSE;
    //
    //     dispatch(getOrdersByBodega(bodegaSAP));
    //
    //     try {
    //       const response = await fetch(`https://crm.lidenar.com/hanadb/api/orders/bodega?bod=${bodegaSAP}`);
    //
    //       const data = await response.json();
    //       setOrders(data.data.orders);
    //       //console.log(orders);
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
            //console.log(user.DISPLAYNAME);
            //console.log(user.ROLE);

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
                    ////console.log(user.WAREHOUSE);
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
                //console.log("data.orders: " + JSON.stringify(data.orders));
            } catch (error) {
                console.error('Error fetching data:', error);
                setOrders([]);
            }
        }

        fetchData();
    }, [user, rangeInputPicker.startDate, rangeInputPicker.endDate, isChecked]);


    useEffect(() => {
        if (orders && Array.isArray(orders) && orders.length > 0) {
            setTableData(orders);
        } else if (orders && Array.isArray(orders) && orders.length === 0) {
            setTableData([]);
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

    //const getLengthByNumeroSinGuia = (sin_guia) => tableData.filter((item) => item.NUMEROGUIA === sin_guia).length;

    //const getLengthByNumeroConGuia = (con_guia) => tableData.filter((item) => item.NUMEROGUIA !== con_guia).length;

    // Obtener las pestañas basadas en el usuario
    const TABS = getTabs(user, tableData, getLengthByStatus,
        //getLengthByNumeroSinGuia,
        //getLengthByNumeroConGuia
    );

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

    const downloadFile = ({ data, fileName, fileType }) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], { type: fileType })
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

    const [dataServientrega, setDataServientrega] = useState(null);
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

                if (user.ROLE == '8') {
                    // Filtrar solo las bodegas que coincidan con user.WAREHOUSE
                    //console.log("Usuario con rol 8 (Bodega):", user.WAREHOUSE);
                    //console.log("Datos completos de Servientrega:", result.data);
                    
                    // Parsear user.WAREHOUSE si es string, o usar directamente si es array
                    let userWarehouses;
                    try {
                        userWarehouses = Array.isArray(user.WAREHOUSE) 
                            ? user.WAREHOUSE 
                            : JSON.parse(user.WAREHOUSE);
                    } catch (error) {
                        console.error("Error parseando user.WAREHOUSE:", error);
                        userWarehouses = [];
                    }
                    
                    // Filtrar result.data para mostrar solo las bodegas del usuario
                    const filteredData = result.data.filter(item => 
                        userWarehouses.includes(item.BODEGA)
                    );
                    
                    //console.log("Bodegas del usuario:", userWarehouses);
                    //console.log("Datos filtrados por bodega:", filteredData);
                    
                    setDataServientrega(filteredData);
                } else if (user.ROLE == '10') {
                    setDataServientrega(result.data);
                }

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


    const ApexChart = () => {
        // Generar datos dinámicamente desde dataServientrega
        let chartData;

        if (dataServientrega && Array.isArray(dataServientrega) && dataServientrega.length > 0) {
            // Usar datos reales de Servientrega
            const totalAmount = dataServientrega.reduce((sum, item) => sum + parseFloat(item.SUBTOTAL_POR_BODEGA), 0);

            chartData = {
                series: dataServientrega.map(item =>
                    Math.round((parseFloat(item.SUBTOTAL_POR_BODEGA) / totalAmount) * 100)
                ),
                labels: dataServientrega.map(item => `Bodega ${item.BODEGA}`),
                counts: dataServientrega.map(item => parseFloat(item.SUBTOTAL_POR_BODEGA)),
                total: totalAmount
            };
        } else {
            // No mostrar nada cuando no hay datos disponibles
            return null;
        }

        // Referencia al gráfico
        const chartRef = React.useRef(null);

        // Función para descargar el gráfico
        const downloadChart = (format = 'png') => {
            const filename = `distribucion-bodegas-${new Date().toISOString().split('T')[0]}`;
            
            // Método 1: Usar la referencia del gráfico
            if (chartRef.current && chartRef.current.chart) {
                chartRef.current.chart.dataURI({ format }).then((uri) => {
                    const link = document.createElement('a');
                    link.href = uri.imgURI;
                    link.download = `${filename}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }).catch((error) => {
                    console.error('Error método 1:', error);
                    downloadChartAlternative(format, filename);
                });
            } else {
                // Método 2: Usar ApexCharts global
                downloadChartAlternative(format, filename);
            }
        };

        // Método alternativo para descargar
        const downloadChartAlternative = (format, filename) => {
            try {
                if (window.ApexCharts) {
                    // Buscar el gráfico por ID
                    const chart = window.ApexCharts.getChartByID('chart-bodegas');
                    if (chart) {
                        chart.dataURI({ format }).then((uri) => {
                            const link = document.createElement('a');
                            link.href = uri.imgURI;
                            link.download = `${filename}.${format}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        });
                    } else {
                        // Método 3: Usar toolbar nativo
                        window.ApexCharts.exec('chart-bodegas', 'exportChart', { type: format });
                    }
                } else {
                    console.warn('ApexCharts no disponible');
                }
            } catch (error) {
                console.error('Error método alternativo:', error);
            }
        };

        // Función para descargar datos en CSV
        const downloadCSV = () => {
            const csvContent = [
                ['Bodega', 'Subtotal', 'Porcentaje'],
                ...chartData.labels.map((label, index) => [
                    label,
                    chartData.counts[index].toLocaleString('es-EC'),
                    `${chartData.series[index]}%`
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `distribucion-bodegas-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const [state, setState] = React.useState({
            series: chartData.series,
            options: {
                chart: {
                    id: 'chart-bodegas',
                    height: 390,
                    type: 'radialBar',
                    background: 'transparent',
                    toolbar: {
                        show: true,
                        offsetX: 0,
                        offsetY: 0,
                        tools: {
                            download: true,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                            customIcons: []
                        },
                        export: {
                            csv: {
                                filename: `distribucion-bodegas-${new Date().toISOString().split('T')[0]}`,
                                columnDelimiter: ',',
                                headerCategory: 'Bodega',
                                headerValue: 'Subtotal',
                                dateFormatter: (timestamp) => new Date(timestamp).toDateString()
                            },
                            svg: {
                                filename: `grafico-bodegas-${new Date().toISOString().split('T')[0]}`
                            },
                            png: {
                                filename: `grafico-bodegas-${new Date().toISOString().split('T')[0]}`
                            }
                        }
                    },
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                        animateGradually: {
                            enabled: true,
                            delay: 150
                        },
                        dynamicAnimation: {
                            enabled: true,
                            speed: 350
                        }
                    }
                },
                plotOptions: {
                    radialBar: {
                        offsetY: 0,
                        startAngle: 0,
                        endAngle: 270,
                        hollow: {
                            margin: 15,
                            size: '25%',
                            background: 'transparent',
                            dropShadow: {
                                enabled: true,
                                top: 3,
                                left: 0,
                                blur: 4,
                                opacity: 0.24
                            }
                        },
                        track: {
                            background: alpha(theme.palette.grey[500], 0.16),
                            strokeWidth: '67%',
                            margin: 0,
                        },
                        dataLabels: {
                            name: {
                                show: true,
                                fontSize: '12px',
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '14px',
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                offsetY: 6,
                                formatter: function (val) {
                                    return parseInt(val) + '%'
                                }
                            },
                            total: {
                                show: true,
                                showAlways: false,
                                label: 'Total Subtotal',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: theme.palette.text.secondary,
                                formatter: function () {
                                    return `$${chartData.total.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                }
                            }
                        },
                        barLabels: {
                            enabled: true,
                            useSeriesColors: true,
                            offsetX: -8,
                            fontSize: '11px',
                            fontWeight: 600,
                            formatter: function (seriesName, opts) {
                                const amount = chartData.counts[opts.seriesIndex];
                                return seriesName + ": $" + amount.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                            },
                        },
                    }
                },
                colors: [
                    theme.palette.primary.main,   // Bodega 002 - Azul
                    theme.palette.success.main,   // Bodega 019 - Verde  
                    theme.palette.warning.main,   // Bodega 024 - Amarillo
                    theme.palette.error.main,     // Bodega 030 - Rojo
                ],
                labels: chartData.labels,
                legend: {
                    show: true,
                    floating: true,
                    fontSize: '11px',
                    position: 'left',
                    offsetX: 10,
                    offsetY: 15,
                    labels: {
                        useSeriesColors: true
                    },
                    markers: {
                        size: 6
                    },
                    formatter: function (seriesName, opts) {
                        const amount = chartData.counts[opts.seriesIndex];
                        return seriesName + ": $" + amount.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    },
                    itemMargin: {
                        vertical: 3
                    }
                },
                tooltip: {
                    enabled: true,
                    fillSeriesColor: false,
                    custom: function ({ seriesIndex }) {
                        const label = chartData.labels[seriesIndex];
                        const amount = chartData.counts[seriesIndex];
                        const percentage = chartData.series[seriesIndex];

                        return `
                            <div style="
                                padding: 8px 12px;
                                border-radius: 6px;
                                background: ${theme.palette.background.paper};
                                border: 1px solid ${alpha(theme.palette.divider, 0.2)};
                                box-shadow: 0 4px 12px ${alpha(theme.palette.common.black, 0.15)};
                                font-family: ${theme.typography.fontFamily};
                            ">
                                <div style="font-weight: 600; color: ${theme.palette.text.primary}; margin-bottom: 4px;">
                                    ${label}
                                </div>
                                <div style="color: ${theme.palette.text.secondary}; font-size: 12px;">
                                    <div>Subtotal: <strong>$${amount.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong></div>
                                    <div>Porcentaje: <strong>${percentage}%</strong></div>
                                </div>
                            </div>
                        `;
                    }
                },
                responsive: [
                    {
                        breakpoint: 900,
                        options: {
                            legend: {
                                show: true,
                                position: 'bottom',
                                offsetX: 0,
                                offsetY: 0
                            },
                            plotOptions: {
                                radialBar: {
                                    hollow: {
                                        size: '20%'
                                    }
                                }
                            }
                        }
                    },
                    {
                        breakpoint: 600,
                        options: {
                            legend: {
                                show: false
                            },
                            chart: {
                                height: 320
                            }
                        }
                    }
                ]
            },
        });

        // Actualizar el gráfico cuando cambien los datos de Servientrega
        React.useEffect(() => {
            if (dataServientrega && Array.isArray(dataServientrega)) {
                const totalAmount = dataServientrega.reduce((sum, item) => sum + parseFloat(item.SUBTOTAL_POR_BODEGA), 0);

                const newChartData = {
                    series: dataServientrega.map(item =>
                        Math.round((parseFloat(item.SUBTOTAL_POR_BODEGA) / totalAmount) * 100)
                    ),
                    labels: dataServientrega.map(item => `Bodega ${item.BODEGA}`),
                    counts: dataServientrega.map(item => parseFloat(item.SUBTOTAL_POR_BODEGA)),
                    total: totalAmount
                };

                setState(prevState => ({
                    ...prevState,
                    series: newChartData.series
                }));
            }
        }, [dataServientrega]);

        return (
            <Card sx={{
                mb: 3,
                background: `
                    linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                        ${alpha(theme.palette.secondary.main, 0.03)} 50%,
                        ${alpha(theme.palette.success.main, 0.02)} 100%)
                `,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `
                    0 8px 32px ${alpha(theme.palette.primary.main, 0.08)},
                    0 4px 16px ${alpha(theme.palette.common.black, 0.04)},
                    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
                `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `
                        0 12px 40px ${alpha(theme.palette.primary.main, 0.12)},
                        0 6px 20px ${alpha(theme.palette.common.black, 0.08)},
                        inset 0 1px 0 ${alpha(theme.palette.common.white, 0.15)}
                    `,
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `
                        linear-gradient(90deg, 
                            ${theme.palette.primary.main} 0%,
                            ${theme.palette.success.main} 25%, 
                            ${theme.palette.warning.main} 50%,
                            ${theme.palette.error.main} 75%,
                            ${theme.palette.primary.main} 100%)
                    `,
                    borderRadius: '20px 20px 0 0',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(
                        circle at 20% 80%, 
                        ${alpha(theme.palette.primary.main, 0.03)} 0%, 
                        transparent 50%
                    ), radial-gradient(
                        circle at 80% 20%, 
                        ${alpha(theme.palette.success.main, 0.03)} 0%, 
                        transparent 50%
                    )`,
                    pointerEvents: 'none',
                    zIndex: 0,
                }
            }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        p: 4,
                        pb: 2,
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: `
                                    linear-gradient(135deg, 
                                        ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                                        ${alpha(theme.palette.primary.dark, 0.1)} 100%)
                                `,
                                animation: 'pulse 3s ease-in-out infinite',
                                zIndex: -1,
                            }} />
                            <Iconify
                                icon="solar:chart-square-bold-duotone"
                                sx={{
                                    width: 44,
                                    height: 44,
                                    color: theme.palette.primary.main,
                                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                                }}
                            />
                        </div>
                        <Stack spacing={0.5}>
                            <div style={{
                                fontWeight: 800,
                                fontSize: '1.25rem',
                                color: theme.palette.text.primary,
                                letterSpacing: '-0.025em',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Distribución por Bodega
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                            }}>
                                📊 Análisis de totales para el número de camiones Servientrega
                            </div>
                        </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        
                        {/* Badge del total */}
                        <Tooltip
                            title="Total subtotal de todas las bodegas"
                            arrow
                            placement="left"
                        >
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: '16px',
                                background: `
                                    linear-gradient(135deg, 
                                        ${alpha(theme.palette.success.main, 0.15)} 0%, 
                                        ${alpha(theme.palette.success.dark, 0.08)} 100%)
                                `,
                                border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                backdropFilter: 'blur(10px)',
                                color: theme.palette.success.main,
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.1)}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span style={{ fontSize: '1.1em' }}>💰</span>
                                ${chartData.total.toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        </Tooltip>
                    </Stack>
                </Stack>

                <div style={{
                    padding: '20px 24px 32px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        borderRadius: '16px',
                        background: `
                            radial-gradient(
                                ellipse at center, 
                                ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                                ${alpha(theme.palette.background.paper, 0.4)} 100%
                            )
                        `,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        padding: '16px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <ReactApexChart
                            ref={chartRef}
                            options={{
                                ...state.options,
                                chart: {
                                    ...state.options.chart,
                                    id: 'chart-bodegas'
                                }
                            }}
                            series={state.series}
                            type="radialBar"
                            height={390}
                        />
                    </div>
                </div>
            </Card>
        );
    }



    return (
        <>
            <Head>
                <title> Invoice: List | HT</title>
            </Head>

            <Container maxWidth={false}>
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
                                        control={<Switch checked={isChecked} onChange={handleSwitchChange} />}
                                        label="Fact." />
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
                    mb: { xs: 3, md: 5 },
                }}
                >

                    {/* <AppCompanyWork/> */}

                    {user.ROLE === "10" &&
                        <Stack sx={{ typography: 'body2', mt: 3 }} alignItems="center">
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
                            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
                            sx={{ py: 2 }}
                        >
                            <InvoiceAnalytic
                                title="Total"
                                total={tableData.length}
                                percent={100}
                                //price={user.COMPANY !== 'TOMEBAMBA' && sumBy(tableData, (item) => Number(item.SUBTOTAL))}
                                price={user.COMPANY !== 'TOMEBAMBA' && sumBy(
                                    tableData.filter((item) => item.ESTADO === 6 || item.ESTADO === 7 || item.ESTADO === 1 || item.ESTADO === 0 || item.ESTADO === 22),
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
                                title="Por Cargar Series"
                                total={getLengthByStatus(7)}
                                percent={getPercentByStatus(7)}
                                price={user.COMPANY !== 'TOMEBAMBA' && getTotalPriceByStatus(7)}
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

                {/* {(user.ROLE === '8' || user.ROLE === '10') && (
                    <div style={{ textAlign: 'center' }}>
                        <p>
                            Total Para Servientrega: <strong>
                                ${Number(total).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                            </strong>
                        </p>
                    </div>
                )} */}


                <ApexChart />

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

                    <Divider />

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

                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                            <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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

                                    <TableNoData isNotFound={isNotFound} />
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
                            <Iconify icon="eva:download-fill" />
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


    ////console.log("user_user:" + JSON.stringify(currentUser))

    if (filterStatus !== 'all') {

        //ALERTA - MUY IMPORTANTE

        // if (currentUser.ROLE === "8") {
        //
        //     const warehouses = JSON.parse(currentUser.WAREHOUSE);
        //
        //     //CDHT -CDMC
        //     if (warehouses.includes("019") || warehouses.includes("DISTLF")) {
        //         if (filterStatus === 0) {
        //             inputData = inputData
        //                 .filter((invoice) => invoice.ESTADO === filterStatus)
        //                 .slice(0, 6); // Return only the first two items
        //         } else {
        //             inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        //         }
        //     }
        //
        //     //Cuenca HT - MC
        //     if (warehouses.includes("002") || warehouses.includes("004")) {
        //
        //         if (filterStatus === 0) {
        //             inputData = inputData
        //                 .filter((invoice) => invoice.ESTADO === filterStatus)
        //                 .slice(0, 3); // Return only the first two items
        //         } else {
        //             inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        //         }
        //
        //     }
        //
        //     //Colon HT - MC
        //     if (warehouses.includes("030")) {
        //
        //         if (filterStatus === 0) {
        //             inputData = inputData
        //                 .filter((invoice) => invoice.ESTADO === filterStatus)
        //                 .slice(0, 2); // Return only the first two items
        //         } else {
        //             inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        //         }
        //
        //     }
        //
        //     // Manta HT - MC
        //     if (warehouses.includes("024")) {
        //
        //         if (filterStatus === 0) {
        //             inputData = inputData
        //                 .filter((invoice) => invoice.ESTADO === filterStatus)
        //                 .slice(0, 2); // Return only the first two items
        //         } else {
        //             inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        //         }
        //
        //     }
        //
        // } else {
        inputData = inputData.filter((invoice) => invoice.ESTADO === filterStatus);
        // }
    }

    // if (filterService !== 'all') {
    //     inputData = inputData.filter((invoice) => invoice.ESTADO === filterService);
    // }

    // if (filterStartDate && filterEndDate) {
    //
    //     inputData = inputData.filter(
    //         (invoice) => {
    //             //console.log("invoice.FECHACREACION: "+parseCustomDate(invoice.FECHACREACION));
    //             //console.log("filterStartDate: "+filterStartDate);
    //             //console.log("filterEndDate: "+filterEndDate);
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

const getTabs = (user, tableData, getLengthByStatus,
    //getLengthByNumeroSinGuia,
    //getLengthByNumeroConGuia
) => {

    //console.log("tableData: "+ JSON.stringify( tableData));

    if (user.COMPANY === 'HT') {

        if (user.ROLE === '31') {
            return [
                { value: 'all', label: 'Total', color: 'info', count: tableData.length },
                { value: 15, label: 'Pendiente Aprobar Vendedor', color: 'success', count: getLengthByStatus(15) },
                { value: 6, label: 'Pendiente Aprobar Crédito', color: 'success', count: getLengthByStatus(6) },
                { value: 0, label: 'Pendiente Facturar', color: 'warning', count: getLengthByStatus(0) },
                { value: 1, label: 'Fact./Entregado', color: 'error', count: getLengthByStatus(1) },
                { value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8) },
            ];
        } else {

            return [
                { value: 'all', label: 'Total', color: 'info', count: tableData.length },
                { value: 15, label: 'Pendiente Aprobar Vendedor', color: 'success', count: getLengthByStatus(15) },
                { value: 6, label: 'Pendiente Aprobar Crédito', color: 'success', count: getLengthByStatus(6) },
                { value: 7, label: 'Pendiente Cargar Series', color: 'success', count: getLengthByStatus(7) },
                { value: 0, label: 'Pendiente Facturar', color: 'warning', count: getLengthByStatus(0) },
                { value: 22, label: 'F/Pend. Cargar Evidencia', color: 'info', count: getLengthByStatus(22) },
                { value: 23, label: 'F/Pend. Validar Cartera', color: 'info', count: getLengthByStatus(23) },
                { value: 1, label: 'Fact./Entregado', color: 'error', count: getLengthByStatus(1) },
                { value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8) },

                //{value: 'con', label: 'CON GUIA', color: 'default', count: getLengthByNumeroConGuia('000000000')},
                //{value: 'sin', label: 'SIN GUIA', color: 'default', count: getLengthByNumeroSinGuia('000000000')},

            ];
        }

    } else {
        return [
            { value: 'all', label: 'Total', color: 'info', count: tableData.length },
            { value: 6, label: 'Pendiente de aprobar', color: 'success', count: getLengthByStatus(6) },
            { value: 0, label: 'Pendiente de Facturar', color: 'warning', count: getLengthByStatus(0) },
            { value: 1, label: 'Facturado', color: 'error', count: getLengthByStatus(1) },
            { value: 8, label: 'Anulado', color: 'default', count: getLengthByStatus(8) },
        ];
    }
}

// Estilos CSS para animaciones y efectos del ApexChart
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { 
                transform: scale(1); 
                opacity: 0.5; 
            }
            50% { 
                transform: scale(1.1); 
                opacity: 0.8; 
            }
        }
        
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px); 
            }
            50% { 
                transform: translateY(-4px); 
            }
        }
        
        /* Mejoras visuales para ApexChart */
        .apexcharts-canvas {
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.05));
        }
        
        .apexcharts-radialbar-series path {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .apexcharts-radialbar-series:hover path {
            filter: brightness(1.1) saturate(1.1);
        }
        
        .apexcharts-legend-text {
            font-weight: 600 !important;
        }
    `;
    document.head.appendChild(style);
}
