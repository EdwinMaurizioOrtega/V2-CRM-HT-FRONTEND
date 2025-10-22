import * as Yup from 'yup';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { USER_STATUS_OPTIONS } from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { DatePicker } from "@mui/x-date-pickers";
import { Grid, Link, TextField } from "@mui/material";
import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import { useAuthContext } from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import EmptyContent from "../../../components/empty-content";
import { PATH_DASHBOARD } from "../../../routes/paths";
import { useRouter } from "next/router";
import {
    AnalyticsConversionRates, AnalyticsCurrentSubject, AnalyticsCurrentVisits, AnalyticsWebsiteVisits,



} from "../general/analytics";
import { useTheme } from "@mui/material/styles";
import { EcommerceSaleByGender } from "../general/e-commerce";
import { AppCurrentDownload } from "../general/app";


// ----------------------------------------------------------------------

const options_1 = [
    { id: '01', label: 'Agendar' },
    { id: '02', label: 'No le interesa' },
    { id: '03', label: 'Cierre definitivo' },
    { id: '04', label: 'No Contactado' },
]

const options_2 = [
    { id: '01', label: 'Llamada telefonic' },
    { id: '02', label: 'Llamada telefonica' },
    { id: '03', label: 'Whatsapp' },
    { id: '04', label: 'Correo' },
    { id: '05', label: 'Otros' },
]

export default function InvoicedClientOrders({ userID, currentPartner, open, onClose }) {

    //console.log("partner.ID " + currentPartner?.ID || '');
    //console.log("Current User: " + userID || '');

    const { push } = useRouter();

    const theme = useTheme();

    const handleViewRow = (id) => {
        // //console.log("id_id"+ id);
        //push(PATH_DASHBOARD.invoice.view(id));
        window.open(PATH_DASHBOARD.invoice.view(id), '_blank');

    };

    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'ID',
            headerName: 'ORDEN',
            flex: 1,
            minWidth: 160,
            renderCell: (param) => <Link
                noWrap
                variant="body2"
                onClick={() => handleViewRow(param.row.ID)}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
            >
                {`INV-${param.row.ID}`}
            </Link>
        },
        {
            field: 'FECHACREACION',
            headerName: 'FECHACREACION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'ESTADO',
            headerName: 'ESTADO',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => params.row.ESTADO == "8" && "Anulado"
                || params.row.ESTADO == "6" && "Área de crédito"
                || params.row.ESTADO == "0" && "Área de facturación"
                || params.row.ESTADO == "1" && "Facturado"

        },
        {
            field: 'Cliente',
            headerName: 'CLIENTE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CLIENTEID',
            headerName: 'CLIENTEID',
            flex: 1,
            minWidth: 160,
        },

        {
            field: 'BODEGA',
            headerName: 'BODEGA',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => params.row.BODEGA == "002" && "MAYORISTA CUENCA"
                || params.row.BODEGA == "019" && "C. DISTRIBUCIÓN HT"
                || params.row.BODEGA == "006" && "MAYORISTA QUITO"
                || params.row.BODEGA == "030" && "MAYORISTA COLÓN"
                || params.row.BODEGA == "024" && "MAYORISTA MANTA"
        },
        {
            field: 'VENDEDOR',
            headerName: 'VENDEDOR',
            flex: 1,
            minWidth: 160,
        },

    ]

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);
    const [ventasBySemanaUserWithId, setVentasBySemanaUserWithId] = useState([]);
    const [ventasAnuladoFacturado, setVentasAnuladoFacturado] = useState([]);

    //Ver el registro de pedidos
    useEffect(() => {
        const handleViewManagementRow = async () => {
            if (currentPartner) {
                //console.log("event: " + JSON.stringify(currentPartner.ID));

                try {
                    const response = await axios.post('/hanadb/api/customers/management/OrdersList', {
                        ID_CLIENTE: currentPartner.ID,
                    });

                    if (response.status === 200) {
                        //console.log("DATA: " + JSON.stringify(response.data));

                        const businessPartnersWithId = response.data.data.map((partner, index) => ({
                            ...partner,
                            id: index + 1, // Puedes ajustar la lógica según tus necesidades
                        }));

                        setBusinessPartnersInvoiced(businessPartnersWithId);
                        //console.log("response.data.data: " + JSON.stringify(response.data.data));
                        //console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                }
                ;
            }
        };

        handleViewManagementRow();

        const handleValorFacturado = async () => {
            if (userID) {
                //console.log("userIDuserID: " + JSON.stringify(userID));

                try {
                    const response = await axios.get(`/hanadb/api/customers/total_sales_per_week?USER_ID=${userID}&ID_CLIENTE=${currentPartner.ID}`);

                    if (response.status === 200) {
                        //console.log("DATA: " + JSON.stringify(response.data));

                        setVentasBySemanaUserWithId(response.data.data);

                        //console.log("PorSemanaFacturado: " + JSON.stringify(response.data.data));
                        //console.log("PorSemanaFacturado: " + JSON.stringify(ventasBySemanaUserWithId));

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                };
            }
        };

        handleValorFacturado();


        const handleFacturadoAndAnulado = async () => {
            if (userID) {
                //console.log("userIDuserID: " + JSON.stringify(userID));

                try {
                    const response = await axios.get(`/hanadb/api/customers/total_billed_and_voided?USER_ID=${userID}&ID_CLIENTE=${currentPartner.ID}`);

                    if (response.status === 200) {
                        //console.log("DATA_AnalyticsConversionRates: " + JSON.stringify(response.data));

                        const ventasAuxAnuladoFacturado = response.data.data.map((partner, index) => ({
                            id: index + 1, // Puedes ajustar la lógica según tus necesidades
                            label: partner.LABEL, //
                            value: Number(partner.VALUE), //
                        }));

                        setVentasAnuladoFacturado(ventasAuxAnuladoFacturado);
                        //console.log("PorSemana: " + JSON.stringify(response.data.data));
                        //console.log("PorSemana: " + JSON.stringify(ventasBySemanaUserWithId));

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                };
            }
        };

        handleFacturadoAndAnulado();

    }, [currentPartner?.ID, userID])

    return (
        <Dialog
            fullWidth
            maxWidth={false}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { maxWidth: '100' },
            }}
        >

            <DialogTitle>Historico ordenes.</DialogTitle>

            <DialogContent>
                <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
                    Cliente: {currentPartner?.Cliente || ''}
                </Alert>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12} lg={10}>
                        <AnalyticsWebsiteVisits
                            title="📈 Ventas Diarias Facturado"
                            subheader="💰 Rendimiento de ventas por período - Análisis detallado"
                            chart={{
                                labels: ventasBySemanaUserWithId.map(item => item.LABELS),
                                colors: [
                                    theme.palette.primary.main,
                                    theme.palette.secondary.main,
                                    theme.palette.success.main
                                ],
                                series: [
                                    {
                                        name: '💵 Ventas Diarias',
                                        type: 'column',
                                        fill: 'gradient',
                                        data: ventasBySemanaUserWithId.map(item => Number(item.DATA)),
                                    },
                                ],
                                options: {
                                    chart: {
                                        background: 'transparent',
                                        foreColor: theme.palette.text.primary,
                                        fontFamily: theme.typography.fontFamily,
                                        toolbar: {
                                            show: true,
                                            offsetX: 0,
                                            offsetY: 0,
                                            tools: {
                                                download: true,
                                                selection: false,
                                                zoom: true,
                                                zoomin: true,
                                                zoomout: true,
                                                pan: false,
                                                reset: true
                                            },
                                            export: {
                                                csv: {
                                                    filename: 'ventas-diarias',
                                                    columnDelimiter: ',',
                                                    headerCategory: 'Fecha',
                                                    headerValue: 'Ventas'
                                                },
                                                svg: {
                                                    filename: 'ventas-diarias'
                                                },
                                                png: {
                                                    filename: 'ventas-diarias'
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
                                        bar: {
                                            borderRadius: 12,
                                            borderRadiusApplication: 'end',
                                            borderRadiusWhenStacked: 'last',
                                            columnWidth: '65%',
                                            dataLabels: {
                                                position: 'top'
                                            }
                                        }
                                    },
                                    dataLabels: {
                                        enabled: true,
                                        formatter: function (val) {
                                            return `$${Number(val).toLocaleString()}`;
                                        },
                                        offsetY: -25,
                                        style: {
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            colors: [theme.palette.text.primary]
                                        },
                                        background: {
                                            enabled: true,
                                            foreColor: theme.palette.background.paper,
                                            padding: 4,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: theme.palette.divider,
                                            opacity: 0.9
                                        }
                                    },
                                    fill: {
                                        type: 'gradient',
                                        gradient: {
                                            shade: theme.palette.mode === 'dark' ? 'dark' : 'light',
                                            type: 'vertical',
                                            shadeIntensity: 0.4,
                                            gradientToColors: [
                                                theme.palette.primary.light,
                                                theme.palette.secondary.light
                                            ],
                                            inverseColors: false,
                                            opacityFrom: 0.95,
                                            opacityTo: 0.3,
                                            stops: [0, 50, 100]
                                        }
                                    },
                                    stroke: {
                                        show: true,
                                        width: 2,
                                        colors: [theme.palette.primary.dark]
                                    },
                                    grid: {
                                        show: true,
                                        borderColor: theme.palette.divider,
                                        strokeDashArray: 5,
                                        position: 'back',
                                        xaxis: {
                                            lines: {
                                                show: false
                                            }
                                        },
                                        yaxis: {
                                            lines: {
                                                show: true
                                            }
                                        },
                                        row: {
                                            colors: undefined,
                                            opacity: 0.5
                                        },
                                        column: {
                                            colors: undefined,
                                            opacity: 0.5
                                        },
                                        padding: {
                                            top: 10,
                                            right: 10,
                                            bottom: 10,
                                            left: 10
                                        }
                                    },
                                    xaxis: {
                                        categories: ventasBySemanaUserWithId.map(item => item.LABELS),
                                        labels: {
                                            style: {
                                                colors: theme.palette.text.secondary,
                                                fontSize: '12px',
                                                fontWeight: 500
                                            },
                                            rotate: -45,
                                            rotateAlways: false,
                                            hideOverlappingLabels: true,
                                            showDuplicates: false,
                                            trim: false
                                        },
                                        axisBorder: {
                                            show: true,
                                            color: theme.palette.divider,
                                            height: 1,
                                            width: '100%',
                                            offsetX: 0,
                                            offsetY: 0
                                        },
                                        axisTicks: {
                                            show: true,
                                            borderType: 'solid',
                                            color: theme.palette.divider,
                                            height: 6,
                                            offsetX: 0,
                                            offsetY: 0
                                        },
                                        title: {
                                            text: '📅 Período de Tiempo',
                                            style: {
                                                color: theme.palette.text.primary,
                                                fontSize: '13px',
                                                fontWeight: 600
                                            }
                                        }
                                    },
                                    yaxis: {
                                        labels: {
                                            formatter: function (val) {
                                                return `$${Number(val).toLocaleString()}`;
                                            },
                                            style: {
                                                colors: theme.palette.text.secondary,
                                                fontSize: '12px',
                                                fontWeight: 500
                                            }
                                        },
                                        title: {
                                            text: '💰 Valor en Ventas',
                                            style: {
                                                color: theme.palette.text.primary,
                                                fontSize: '13px',
                                                fontWeight: 600
                                            }
                                        }
                                    },
                                    tooltip: {
                                        enabled: true,
                                        theme: theme.palette.mode,
                                        style: {
                                            fontSize: '14px',
                                            fontFamily: theme.typography.fontFamily
                                        },
                                        y: {
                                            formatter: function (val) {
                                                return `$${Number(val).toLocaleString()}`;
                                            },
                                            title: {
                                                formatter: function (seriesName) {
                                                    return seriesName + ': ';
                                                }
                                            }
                                        },
                                        marker: {
                                            show: true,
                                            fillColors: [theme.palette.primary.main]
                                        },
                                        fixed: {
                                            enabled: false,
                                            position: 'topRight'
                                        }
                                    },
                                    legend: {
                                        show: true,
                                        position: 'top',
                                        horizontalAlign: 'center',
                                        floating: false,
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        fontFamily: theme.typography.fontFamily,
                                        labels: {
                                            colors: theme.palette.text.primary
                                        },
                                        markers: {
                                            width: 12,
                                            height: 12,
                                            strokeWidth: 0,
                                            strokeColor: '#fff',
                                            fillColors: [theme.palette.primary.main],
                                            radius: 6,
                                            customHTML: undefined,
                                            onClick: undefined,
                                            offsetX: 0,
                                            offsetY: 0
                                        },
                                        itemMargin: {
                                            horizontal: 5,
                                            vertical: 0
                                        }
                                    },
                                    responsive: [
                                        {
                                            breakpoint: 600,
                                            options: {
                                                plotOptions: {
                                                    bar: {
                                                        columnWidth: '80%'
                                                    }
                                                },
                                                dataLabels: {
                                                    enabled: false
                                                },
                                                xaxis: {
                                                    labels: {
                                                        rotate: -90
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={12} lg={2}>
                        <AppCurrentDownload
                            title="📊 Estado de Facturación"
                            subheader="💼 Distribución de ventas por estado"
                            chart={{
                                colors: [
                                    theme.palette.success.main,
                                    theme.palette.error.main,
                                    theme.palette.warning.main,
                                    theme.palette.info.main,
                                ],
                                series: ventasAnuladoFacturado,
                                options: {
                                    chart: {
                                        background: 'transparent',
                                        foreColor: theme.palette.text.primary,
                                        fontFamily: theme.typography.fontFamily,
                                        sparkline: {
                                            enabled: false // Habilitar toolbar desactivando sparkline
                                        },
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
                                                reset: false
                                            },
                                            export: {
                                                csv: {
                                                    filename: 'estado-facturacion',
                                                    columnDelimiter: ',',
                                                    headerCategory: 'Estado',
                                                    headerValue: 'Valor'
                                                },
                                                svg: {
                                                    filename: 'estado-facturacion'
                                                },
                                                png: {
                                                    filename: 'estado-facturacion'
                                                }
                                            }
                                        },
                                        animations: {
                                            enabled: true,
                                            easing: 'easeinout',
                                            speed: 1200,
                                            animateGradually: {
                                                enabled: true,
                                                delay: 200
                                            },
                                            dynamicAnimation: {
                                                enabled: true,
                                                speed: 500
                                            }
                                        }
                                    },
                                    plotOptions: {
                                        pie: {
                                            startAngle: -90,
                                            endAngle: 270,
                                            expandOnClick: true,
                                            offsetX: 0,
                                            offsetY: 0,
                                            customScale: 1,
                                            dataLabels: {
                                                offset: 0,
                                                minAngleToShowLabel: 10
                                            },
                                            donut: {
                                                size: '65%',
                                                background: 'transparent',
                                                labels: {
                                                    show: true,
                                                    name: {
                                                        show: true,
                                                        fontSize: '16px',
                                                        fontFamily: theme.typography.fontFamily,
                                                        fontWeight: 600,
                                                        color: theme.palette.text.primary,
                                                        offsetY: -10,
                                                        formatter: function (val) {
                                                            return val;
                                                        }
                                                    },
                                                    value: {
                                                        show: true,
                                                        fontSize: '24px',
                                                        fontFamily: theme.typography.fontFamily,
                                                        fontWeight: 700,
                                                        color: theme.palette.text.primary,
                                                        offsetY: 10,
                                                        formatter: function (val) {
                                                            return `$${Number(val).toLocaleString()}`;
                                                        }
                                                    },
                                                    total: {
                                                        show: true,
                                                        showAlways: true,
                                                        label: '💰 Total',
                                                        fontSize: '14px',
                                                        fontFamily: theme.typography.fontFamily,
                                                        fontWeight: 600,
                                                        color: theme.palette.text.secondary,
                                                        formatter: function (w) {
                                                            const total = w.globals.seriesTotals.reduce((a, b) => {
                                                                return a + b;
                                                            }, 0);
                                                            return `$${total.toLocaleString()}`;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    dataLabels: {
                                        enabled: true,
                                        formatter: function (val, opts) {
                                            const name = opts.w.globals.labels[opts.seriesIndex];
                                            return [`${name}`, `${val.toFixed(1)}%`];
                                        },
                                        style: {
                                            fontSize: '12px',
                                            fontFamily: theme.typography.fontFamily,
                                            fontWeight: 600,
                                            colors: ['#fff']
                                        },
                                        background: {
                                            enabled: true,
                                            foreColor: '#000',
                                            padding: 6,
                                            borderRadius: 6,
                                            borderWidth: 1,
                                            borderColor: theme.palette.divider,
                                            opacity: 0.8
                                        },
                                        dropShadow: {
                                            enabled: true,
                                            top: 2,
                                            left: 2,
                                            blur: 4,
                                            color: '#000',
                                            opacity: 0.3
                                        }
                                    },
                                    fill: {
                                        type: 'gradient',
                                        gradient: {
                                            shade: theme.palette.mode === 'dark' ? 'dark' : 'light',
                                            type: 'radial',
                                            shadeIntensity: 0.5,
                                            gradientToColors: [
                                                theme.palette.success.light,
                                                theme.palette.error.light,
                                                theme.palette.warning.light,
                                                theme.palette.info.light,
                                            ],
                                            inverseColors: false,
                                            opacityFrom: 0.9,
                                            opacityTo: 0.6,
                                            stops: [0, 100]
                                        }
                                    },
                                    stroke: {
                                        show: true,
                                        width: 3,
                                        colors: [theme.palette.background.paper]
                                    },
                                    legend: {
                                        show: true,
                                        position: 'bottom',
                                        horizontalAlign: 'center',
                                        floating: false,
                                        fontSize: '13px',
                                        fontFamily: theme.typography.fontFamily,
                                        fontWeight: 500,
                                        labels: {
                                            colors: theme.palette.text.primary,
                                            useSeriesColors: false
                                        },
                                        markers: {
                                            width: 14,
                                            height: 14,
                                            strokeWidth: 0,
                                            strokeColor: '#fff',
                                            fillColors: [
                                                theme.palette.success.main,
                                                theme.palette.error.main,
                                                theme.palette.warning.main,
                                                theme.palette.info.main,
                                            ],
                                            radius: 7,
                                            customHTML: undefined,
                                            onClick: undefined,
                                            offsetX: 0,
                                            offsetY: 0
                                        },
                                        itemMargin: {
                                            horizontal: 8,
                                            vertical: 4
                                        },
                                        formatter: function(seriesName, opts) {
                                            const value = opts.w.globals.series[opts.seriesIndex];
                                            return `${seriesName}: $${Number(value).toLocaleString()}`;
                                        }
                                    },
                                    tooltip: {
                                        enabled: true,
                                        theme: theme.palette.mode,
                                        style: {
                                            fontSize: '14px',
                                            fontFamily: theme.typography.fontFamily
                                        },
                                        y: {
                                            formatter: function (val) {
                                                return `$${Number(val).toLocaleString()}`;
                                            },
                                            title: {
                                                formatter: function (seriesName) {
                                                    return seriesName + ': ';
                                                }
                                            }
                                        },
                                        marker: {
                                            show: true,
                                            fillColors: [
                                                theme.palette.success.main,
                                                theme.palette.error.main,
                                                theme.palette.warning.main,
                                                theme.palette.info.main,
                                            ]
                                        }
                                    },
                                    states: {
                                        hover: {
                                            filter: {
                                                type: 'lighten',
                                                value: 0.15,
                                            }
                                        },
                                        active: {
                                            allowMultipleDataPointsSelection: false,
                                            filter: {
                                                type: 'darken',
                                                value: 0.2,
                                            }
                                        }
                                    },
                                    responsive: [
                                        {
                                            breakpoint: 600,
                                            options: {
                                                chart: {
                                                    width: '100%'
                                                },
                                                legend: {
                                                    position: 'bottom',
                                                    fontSize: '11px'
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        donut: {
                                                            size: '70%',
                                                            labels: {
                                                                value: {
                                                                    fontSize: '20px'
                                                                },
                                                                total: {
                                                                    fontSize: '12px'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                <DataGrid
                    rows={businessPartnersInvoiced}
                    columns={baseColumns}
                    pagination
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => <EmptyContent title="No Data" />,
                        noResultsOverlay: () => <EmptyContent title="No results found" />,
                    }}
                />


            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogActions>

        </Dialog>
    );
}

InvoicedClientOrders.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentUser: PropTypes.object,
};


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