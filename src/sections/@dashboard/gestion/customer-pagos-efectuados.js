import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Label from "../../../components/label";
import React, { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { HOST_API_KEY } from "../../../config-global";
import { useAuthContext } from "../../../auth/useAuthContext";
import { alpha, useTheme } from '@mui/material/styles';
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";

import EmptyContent from "../../../components/empty-content";
import { EcommerceYearlySales } from '../../../sections/@dashboard/general/e-commerce';
import {
    AnalyticsTasks,
    AnalyticsNewsUpdate,
    AnalyticsOrderTimeline,
    AnalyticsCurrentVisits,
    AnalyticsWebsiteVisits,
    AnalyticsTrafficBySite,
    AnalyticsWidgetSummary,
    AnalyticsCurrentSubject,
    AnalyticsConversionRates,
} from '../../../sections/@dashboard/general/analytics';
import { differenceInDays } from "date-fns";
import { Card, CardContent, Typography } from "@mui/material";

// ----------------------------------------------------------------------

export default function CustomerPagosEfectuados({ currentPartner, open, onClose }) {

    const theme = useTheme();


    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'NO_PAGO',
            headerName: 'NO_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CONTAB_PAGO',
            headerName: 'FECHA_CONTAB_PAGO',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'TOTAL_PAGO',
            headerName: 'TOTAL_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'DOC_TYPE',
            headerName: 'DOC_TYPE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CANCELED',
            headerName: 'CANCELED',
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
            field: 'CARD_NAME',
            headerName: 'CARD_NAME',
            flex: 1,
            minWidth: 300,
        },
        {
            field: 'FACTURA',
            headerName: 'FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'EMISION',
            headerName: 'EMISION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NO_FACTURA',
            headerName: 'NO_FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CONTAB_FACT',
            headerName: 'FECHA_CONTAB_FACT',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'TOTAL_FACTURA',
            headerName: 'TOTAL_FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CONDICIONES_PAGO',
            headerName: 'CONDICIONES_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'VENDEDOR_FACTURADOR',
            headerName: 'VENDEDOR_FACTURADOR',
            flex: 1,
            minWidth: 300,
        },

        {
            field: 'TIPO',
            headerName: 'TIPO_VENDEDOR',
            flex: 1,
            minWidth: 160,
        },


    ]

    const { user } = useAuthContext();

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/pagos_efectuados_by_cliente?EMPRESA=${user?.EMPRESA}&CARD_CODE=${currentPartner.ID}`);

                if (response.status === 200) {
                    //console.log("DATA: " + JSON.stringify(response.data));

                    const businessPartnersWithId = response.data.data.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartnersInvoiced(businessPartnersWithId);

                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [currentPartner.ID]);

    // Agrupar por número de factura y sumar los pagos
    const facturaGroups = businessPartnersInvoiced.reduce((acc, item) => {
        const facturaNum = item.NO_FACTURA || 'S/N';
        
        if (!acc[facturaNum]) {
            acc[facturaNum] = {
                NO_FACTURA: facturaNum,
                TOTAL_FACTURA: parseFloat(item.TOTAL_FACTURA),
                TOTAL_PAGOS: 0,
                FECHA_CONTAB_FACT: item.FECHA_CONTAB_FACT,
                FECHA_ULTIMO_PAGO: item.FECHA_CONTAB_PAGO,
                PAGOS: []
            };
        }
        
        // Sumar todos los pagos de esta factura
        acc[facturaNum].TOTAL_PAGOS += parseFloat(item.TOTAL_PAGO);
        acc[facturaNum].PAGOS.push({
            monto: parseFloat(item.TOTAL_PAGO),
            fecha: item.FECHA_CONTAB_PAGO,
            noPago: item.NO_PAGO
        });
        
        // Actualizar fecha del último pago
        if (new Date(item.FECHA_CONTAB_PAGO) > new Date(acc[facturaNum].FECHA_ULTIMO_PAGO)) {
            acc[facturaNum].FECHA_ULTIMO_PAGO = item.FECHA_CONTAB_PAGO;
        }
        
        return acc;
    }, {});

    // Convertir a array y ordenar por número de factura
    const facturasAgrupadas = Object.values(facturaGroups).sort((a, b) => 
        a.NO_FACTURA.localeCompare(b.NO_FACTURA)
    );

    // Sacar las categorías (números de factura) y los valores agrupados
    const categories = facturasAgrupadas.map(item => item.NO_FACTURA);
    const facturado = facturasAgrupadas.map(item => item.TOTAL_FACTURA);
    const pagos = facturasAgrupadas.map(item => item.TOTAL_PAGOS);
    const pendiente = facturasAgrupadas.map(item => item.TOTAL_FACTURA - item.TOTAL_PAGOS);

    // Total facturado
    const totalFacturado = facturado.reduce((acc, val) => acc + val, 0);

    // Total pagado
    const totalPagado = pagos.reduce((acc, val) => acc + val, 0);

    // Saldo pendiente total
    const saldoPendiente = pendiente.reduce((acc, val) => acc + val, 0);

    // Número de facturas pendientes
    const facturasPendientes = pendiente.filter((p) => p > 0).length;

    // Promedio de días en pagar
    const diasPago = businessPartnersInvoiced.map(item =>
        differenceInDays(new Date(item.FECHA_CONTAB_PAGO), new Date(item.FECHA_CONTAB_FACT))
    );

    const promedioDiasPago = diasPago.length > 0 ? (diasPago.reduce((a, b) => a + b, 0) / diasPago.length).toFixed(1) : 0;


    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: { maxWidth: '100%' },
        }}
    >

        <DialogTitle>Pagos Efectuados</DialogTitle>

        <DialogContent>
            <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
                Cliente: {currentPartner.Cliente || ''}
            </Alert>

            {currentPartner ? (<>
                <Stack spacing={2}>
                    <Grid item xs={12} md={6} lg={8}>

                        <Grid size={{ xs: 12, md: 6, lg: 8 }}>


                            <Stack spacing={3}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Total Facturado</Typography>
                                                <Typography variant="h6">${totalFacturado.toFixed(2)}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Total Pagado</Typography>
                                                <Typography variant="h6">${totalPagado.toFixed(2)}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Saldo Pendiente</Typography>
                                                <Typography variant="h6">${saldoPendiente.toFixed(2)}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Facturas Pendientes</Typography>
                                                <Typography variant="h6">{facturasPendientes}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2">Promedio Días en Pagar</Typography>
                                                <Typography variant="h6">{promedioDiasPago}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>


                                <EcommerceYearlySales
                                    title="Evolución de lo Facturado en el tiempo"
                                    // subheader="(+43%) than last year"
                                    chart={{
                                        categories,
                                        series: [
                                            {
                                                name: '2025',
                                                data: [
                                                    {
                                                        name: 'Pagos',
                                                        data: pagos
                                                    },
                                                    {
                                                        name: 'Facturado',
                                                        data: facturado,
                                                    },
                                                ],
                                            },
                                        ],
                                    }}
                                />




                                <Grid item xs={12} md={6} lg={8}>
                                    <Box
                                        sx={{
                                            p: 3,
                                            borderRadius: '20px',
                                            background: `linear-gradient(135deg, 
                                                ${alpha(theme.palette.primary.main, 0.02)} 0%, 
                                                ${alpha(theme.palette.success.main, 0.02)} 50%, 
                                                ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
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
                                                background: `linear-gradient(90deg, 
                                                    ${theme.palette.primary.main}, 
                                                    ${theme.palette.success.main}, 
                                                    ${theme.palette.warning.main})`,
                                                borderRadius: '20px 20px 0 0',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }
                                        }}
                                    >
                                        <AnalyticsWebsiteVisits
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: '12px',
                                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '20px',
                                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                                            }}
                                                        >
                                                            📊
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1.125rem',
                                                                    background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                                                    backgroundClip: 'text',
                                                                    WebkitBackgroundClip: 'text',
                                                                    WebkitTextFillColor: 'transparent',
                                                                    letterSpacing: '-0.5px',
                                                                }}
                                                            >
                                                                Evolución de Pagos vs Facturado
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => {
                                                            // Crear datos para CSV con facturas agrupadas
                                                            const csvData = facturasAgrupadas.map(factura => {
                                                                const detallesPagos = factura.PAGOS.map(pago => 
                                                                    `${pago.noPago}:$${pago.monto.toFixed(2)}:${new Date(pago.fecha).toLocaleDateString('en-US')}`
                                                                ).join('|');
                                                                
                                                                return {
                                                                    'No_Factura': factura.NO_FACTURA,
                                                                    'Fecha_Factura': new Date(factura.FECHA_CONTAB_FACT).toLocaleDateString('en-US'),
                                                                    'Total_Facturado': factura.TOTAL_FACTURA.toFixed(2),
                                                                    'Total_Pagado': factura.TOTAL_PAGOS.toFixed(2),
                                                                    'Saldo_Pendiente': (factura.TOTAL_FACTURA - factura.TOTAL_PAGOS).toFixed(2),
                                                                    'Porcentaje_Pagado': ((factura.TOTAL_PAGOS / factura.TOTAL_FACTURA) * 100).toFixed(1) + '%',
                                                                    'Cantidad_Pagos': factura.PAGOS.length,
                                                                    'Fecha_Ultimo_Pago': new Date(factura.FECHA_ULTIMO_PAGO).toLocaleDateString('en-US'),
                                                                    'Estado': (factura.TOTAL_FACTURA - factura.TOTAL_PAGOS) <= 0 ? 'Pagado' : 'Pendiente',
                                                                    'Cliente': currentPartner.Cliente || '',
                                                                    'Detalle_Pagos': detallesPagos
                                                                };
                                                            });
                                                            
                                                            // Convertir a CSV
                                                            const headers = Object.keys(csvData[0] || {}).join(',');
                                                            const rows = csvData.map(row => Object.values(row).join(','));
                                                            const csvContent = [headers, ...rows].join('\n');
                                                            
                                                            // Descargar archivo
                                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                            const link = document.createElement('a');
                                                            const url = URL.createObjectURL(blob);
                                                            link.setAttribute('href', url);
                                                            link.setAttribute('download', `facturas-agrupadas-${currentPartner.Cliente || 'cliente'}-${new Date().toISOString().split('T')[0]}.csv`);
                                                            link.style.visibility = 'hidden';
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                        sx={{
                                                            borderRadius: '12px',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.dark, 0.1)})`,
                                                            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                                            color: theme.palette.success.main,
                                                            '&:hover': {
                                                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)}, ${alpha(theme.palette.success.dark, 0.2)})`,
                                                                border: `1px solid ${alpha(theme.palette.success.main, 0.5)}`,
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
                                                            }
                                                        }}
                                                        startIcon={
                                                            <Box sx={{ fontSize: '16px' }}>📥</Box>
                                                        }
                                                    >
                                                        Descargar CSV
                                                    </Button>
                                                </Box>
                                            }
                                            subheader={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '6px',
                                                            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        💰
                                                    </Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: theme.palette.text.secondary,
                                                            fontSize: '0.875rem',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Comparativa de montos facturados y pagados en el tiempo
                                                    </Typography>
                                                </Box>
                                            }
                                            chart={{
                                                labels: categories,
                                                series: [
                                                    {
                                                        name: '💵 Pagos',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: pagos,
                                                        color: '#00AB55',
                                                    },
                                                    {
                                                        name: '📋 Facturado',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: facturado,
                                                        color: '#1877F2',
                                                    },
                                                    {
                                                        name: '⏰ Pendiente',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: pendiente,
                                                        color: '#FF5630',
                                                    },
                                                ],
                                                options: {
                                                    chart: {
                                                        type: 'bar',
                                                        stacked: false,
                                                        toolbar: {
                                                            show: true,
                                                            tools: {
                                                                download: true,
                                                                selection: true,
                                                                zoom: true,
                                                                zoomin: true,
                                                                zoomout: true,
                                                                pan: true,
                                                                reset: true
                                                            }
                                                        }
                                                    },
                                                    plotOptions: {
                                                        bar: {
                                                            horizontal: false,
                                                            borderRadius: 4,
                                                            columnWidth: '65%',
                                                            barHeight: '70%',
                                                            dataLabels: {
                                                                position: 'top'
                                                            }
                                                        }
                                                    },
                                                    dataLabels: {
                                                        enabled: true,
                                                        formatter: function(val, opts) {
                                                            return val > 0 ? `$${val.toFixed(0)}` : '';
                                                        },
                                                        style: {
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            colors: ['#FFFFFF']
                                                        },
                                                        offsetY: -5
                                                    },
                                                    xaxis: {
                                                        categories: categories,
                                                        title: {
                                                            text: 'Número de Factura'
                                                        },
                                                        labels: {
                                                            rotate: -45,
                                                            style: {
                                                                fontSize: '10px'
                                                            }
                                                        }
                                                    },
                                                    yaxis: {
                                                        title: {
                                                            text: 'Monto ($)'
                                                        },
                                                        labels: {
                                                            formatter: function(val) {
                                                                return '$' + val.toFixed(0);
                                                            }
                                                        }
                                                    },
                                                    legend: {
                                                        position: 'top',
                                                        horizontalAlign: 'center',
                                                        fontSize: '12px',
                                                        markers: {
                                                            radius: 6
                                                        }
                                                    },
                                                    tooltip: {
                                                        shared: true,
                                                        intersect: false,
                                                        custom: function({series, seriesIndex, dataPointIndex, w}) {
                                                            const pagado = series[0][dataPointIndex];
                                                            const facturado = series[1][dataPointIndex];
                                                            const pendiente = series[2][dataPointIndex];
                                                            const facturaData = facturasAgrupadas[dataPointIndex];
                                                            const numeroFactura = facturaData.NO_FACTURA;
                                                            const fechaFactura = new Date(facturaData.FECHA_CONTAB_FACT).toLocaleDateString('en-US');
                                                            const fechaUltimoPago = new Date(facturaData.FECHA_ULTIMO_PAGO).toLocaleDateString('en-US');
                                                            const porcentajePagado = facturado > 0 ? ((pagado/facturado)*100).toFixed(1) : 0;
                                                            const porcentajePendiente = facturado > 0 ? ((pendiente/facturado)*100).toFixed(1) : 0;
                                                            
                                                            // Generar lista de pagos
                                                            const listaPagos = facturaData.PAGOS.map((pago, idx) => 
                                                                `<div style="margin: 2px 0; font-size: 10px; color: #666; padding-left: 10px;">
                                                                    • $${pago.monto.toFixed(2)} - ${new Date(pago.fecha).toLocaleDateString('en-US')} (${pago.noPago})
                                                                </div>`
                                                            ).join('');
                                                            
                                                            return `
                                                                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; max-width: 300px;">
                                                                    <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 12px;">📋 Factura: ${numeroFactura}</div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px; color: #666;">
                                                                        📅 Fecha Factura: ${fechaFactura}
                                                                    </div>
                                                                    <div style="margin-bottom: 6px; font-size: 11px; color: #666;">
                                                                        💰 Último Pago: ${fechaUltimoPago}
                                                                    </div>
                                                                    
                                                                    <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; margin: 6px 0; background: #fafafa;">
                                                                        <div style="font-weight: 600; font-size: 10px; color: #333; margin-bottom: 4px;">💳 Detalle de Pagos (${facturaData.PAGOS.length}):</div>
                                                                        ${listaPagos}
                                                                    </div>
                                                                    
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #1877F2;">📋 Facturado: $${facturado.toFixed(2)}</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #00AB55;">💵 Total Pagado: $${pagado.toFixed(2)} (${porcentajePagado}%)</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #FF5630;">⏰ Pendiente: $${pendiente.toFixed(2)} (${porcentajePendiente}%)</span>
                                                                    </div>
                                                                    <div style="border-top: 1px solid #e0e0e0; padding-top: 4px; margin-top: 8px; font-weight: 600; font-size: 11px;">
                                                                        <span style="color: ${pendiente <= 0 ? '#00AB55' : '#FF5630'};">
                                                                            ${pendiente <= 0 ? '✅ Totalmente Pagado' : '⚠️ Pago Incompleto'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }
                                                    },
                                                    colors: ['#00AB55', '#1877F2', '#FF5630'],
                                                    fill: {
                                                        opacity: 0.8
                                                    },
                                                    stroke: {
                                                        width: 1,
                                                        colors: ['#fff']
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Stack>
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
                </Stack>
            </>
            ) : (<Label color="error">Cliente no encontrado</Label>)}

        </DialogContent>

        <DialogActions>
            <Button variant="outlined" onClick={onClose}>
                Cerrar
            </Button>

        </DialogActions>

    </Dialog>);
}

CustomerPagosEfectuados.propTypes = {
    open: PropTypes.bool, onClose: PropTypes.func, currentUser: PropTypes.object,
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