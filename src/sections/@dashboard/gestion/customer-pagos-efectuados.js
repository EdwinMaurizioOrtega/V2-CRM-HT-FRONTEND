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
import TextField from '@mui/material/TextField';
import Label from "../../../components/label";
import React, { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { HOST_API_KEY } from "../../../config-global";
import { useAuthContext } from "../../../auth/useAuthContext";
import { alpha, useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
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
            field: 'TIPO_REGISTRO',
            headerName: 'TIPO_REGISTRO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NO_DOCUMENTO',
            headerName: 'NO_DOCUMENTO',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'FECHA_CONTABILIZACION',
            headerName: 'FECHA_CONTABILIZACION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'MONTO',
            headerName: 'MONTO',
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
            minWidth: 300,
        },
        {
            field: 'CARD_NAME',
            headerName: 'CARD_NAME',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FACTURA_RELACIONADA',
            headerName: 'FACTURA_RELACIONADA',
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
            minWidth: 250,
        },
        {
            field: 'FECHA_FACTURA',
            headerName: 'FECHA_FACTURA',
            flex: 1,
            minWidth: 160,
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
            minWidth: 300,
        },

        {
            field: 'VENDEDOR',
            headerName: 'VENDEDOR',
            flex: 1,
            minWidth: 160,
        },

        {
            field: 'TIPO_VENDEDOR',
            headerName: 'TIPO_VENDEDOR',
            flex: 1,
            minWidth: 160,
        },

        {
            field: 'U_SYP_DOCORIGEN',
            headerName: 'U_SYP_DOCORIGEN',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'U_SYP_MDTD',
            headerName: 'U_SYP_MDTD',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'U_SYP_MTDE',
            headerName: 'U_SYP_MTDE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'MOTIVO_DETALLE',
            headerName: 'MOTIVO_DETALLE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'RECON_TYPE',
            headerName: 'RECON_TYPE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'RECON_DESCRIPCION',
            headerName: 'RECON_DESCRIPCION',
            flex: 1,
            minWidth: 160,
        },

    ]

    const { user } = useAuthContext();

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);
    const [allData, setAllData] = useState([]); // Guardar todos los datos
    
    // Calcular fecha de hace 12 meses
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    
    const [fechaInicio, setFechaInicio] = useState(twelveMonthsAgo);
    const [fechaFin, setFechaFin] = useState(today);

    // Función para filtrar datos por rango de fechas
    const filtrarPorFechas = (datos, inicio, fin) => {
        if (!inicio || !fin) return datos;
        
        const fechaInicioTime = new Date(inicio).setHours(0, 0, 0, 0);
        const fechaFinTime = new Date(fin).setHours(23, 59, 59, 999);
        
        return datos.filter(item => {
            const fechaItem = new Date(item.FECHA_CONTABILIZACION).getTime();
            return fechaItem >= fechaInicioTime && fechaItem <= fechaFinTime;
        });
    };

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

                                    setAllData(businessPartnersWithId); // Guardar todos los datos
                    
                    // Filtrar por últimos 12 meses por defecto
                    const datosFiltrados = filtrarPorFechas(businessPartnersWithId, fechaInicio, fechaFin);
                    setBusinessPartnersInvoiced(datosFiltrados);                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [currentPartner.ID]);

    // Actualizar datos cuando cambian las fechas
    useEffect(() => {
        if (allData.length > 0) {
            const datosFiltrados = filtrarPorFechas(allData, fechaInicio, fechaFin);
            setBusinessPartnersInvoiced(datosFiltrados);
        }
    }, [fechaInicio, fechaFin, allData]);

    // Primero, crear un mapa de todas las notas de crédito por U_SYP_DOCORIGEN
    const notasCreditoMap = {};
    businessPartnersInvoiced.forEach(item => {
        if (item.TIPO_REGISTRO === 'NOTA_CREDITO' && item.U_SYP_DOCORIGEN) {
            if (!notasCreditoMap[item.U_SYP_DOCORIGEN]) {
                notasCreditoMap[item.U_SYP_DOCORIGEN] = [];
            }
            notasCreditoMap[item.U_SYP_DOCORIGEN].push({
                monto: parseFloat(item.MONTO),
                fecha: item.FECHA_CONTABILIZACION,
                noNota: item.NO_DOCUMENTO,
                motivo: item.MOTIVO_DETALLE
            });
        }
    });

    // Crear un mapa de todas las reconciliaciones internas por FACTURA_RELACIONADA
    const reconciliacionesMap = {};
    businessPartnersInvoiced.forEach(item => {
        if (item.TIPO_REGISTRO === 'RECONCILIACION_INTERNA' && item.FACTURA_RELACIONADA) {
            if (!reconciliacionesMap[item.FACTURA_RELACIONADA]) {
                reconciliacionesMap[item.FACTURA_RELACIONADA] = [];
            }
            reconciliacionesMap[item.FACTURA_RELACIONADA].push({
                monto: parseFloat(item.MONTO),
                fecha: item.FECHA_CONTABILIZACION,
                noDocumento: item.NO_DOCUMENTO,
                reconType: item.RECON_TYPE,
                reconDescripcion: item.RECON_DESCRIPCION
            });
        }
    });

    // Agrupar por NO_FACTURA y procesar pagos con sus notas de crédito relacionadas
    const facturaGroups = businessPartnersInvoiced.reduce((acc, item) => {
        // Solo procesar registros de PAGO que tengan información de factura
        if (item.TIPO_REGISTRO === 'PAGO' && item.NO_FACTURA) {
            const facturaNum = item.NO_FACTURA;
            
            if (!acc[facturaNum]) {
                acc[facturaNum] = {
                    NO_FACTURA: facturaNum,
                    FACTURA_RELACIONADA: item.FACTURA_RELACIONADA,
                    TOTAL_FACTURA: parseFloat(item.TOTAL_FACTURA || 0),
                    TOTAL_PAGOS: 0,
                    TOTAL_NOTAS_CREDITO: 0,
                    TOTAL_RECONCILIACIONES: 0,
                    FECHA_CONTAB_FACT: item.FECHA_FACTURA,
                    FECHA_ULTIMO_PAGO: null,
                    PAGOS: [],
                    NOTAS_CREDITO: [],
                    RECONCILIACIONES_INTERNAS: []
                };
                
                // Buscar notas de crédito relacionadas usando FACTURA_RELACIONADA -> U_SYP_DOCORIGEN
                if (item.FACTURA_RELACIONADA && notasCreditoMap[item.FACTURA_RELACIONADA]) {
                    acc[facturaNum].NOTAS_CREDITO = notasCreditoMap[item.FACTURA_RELACIONADA];
                    acc[facturaNum].TOTAL_NOTAS_CREDITO = notasCreditoMap[item.FACTURA_RELACIONADA]
                        .reduce((sum, nota) => sum + nota.monto, 0);
                }
                
                // Buscar reconciliaciones internas relacionadas por FACTURA_RELACIONADA
                if (item.FACTURA_RELACIONADA && reconciliacionesMap[item.FACTURA_RELACIONADA]) {
                    acc[facturaNum].RECONCILIACIONES_INTERNAS = reconciliacionesMap[item.FACTURA_RELACIONADA];
                    acc[facturaNum].TOTAL_RECONCILIACIONES = reconciliacionesMap[item.FACTURA_RELACIONADA]
                        .reduce((sum, recon) => sum + recon.monto, 0);
                }
            }
            
            // Agregar el pago
            const montoPago = parseFloat(item.MONTO);
            acc[facturaNum].TOTAL_PAGOS += montoPago;
            acc[facturaNum].PAGOS.push({
                monto: montoPago,
                fecha: item.FECHA_CONTABILIZACION,
                noPago: item.NO_DOCUMENTO
            });
            
            // Actualizar fecha del último pago
            if (!acc[facturaNum].FECHA_ULTIMO_PAGO || 
                new Date(item.FECHA_CONTABILIZACION) > new Date(acc[facturaNum].FECHA_ULTIMO_PAGO)) {
                acc[facturaNum].FECHA_ULTIMO_PAGO = item.FECHA_CONTABILIZACION;
            }
        }
        
        return acc;
    }, {});

    // Convertir a array, filtrar solo facturas con datos válidos y ordenar por número de factura
    const facturasAgrupadas = Object.values(facturaGroups)
        .filter(factura => factura.TOTAL_FACTURA > 0) // Solo facturas que tienen monto facturado
        .sort((a, b) => a.NO_FACTURA.localeCompare(b.NO_FACTURA));

    // Sacar las categorías (números de factura) y los valores agrupados
    const categories = facturasAgrupadas.map(item => item.NO_FACTURA);
    const facturado = facturasAgrupadas.map(item => item.TOTAL_FACTURA);
    const pagos = facturasAgrupadas.map(item => item.TOTAL_PAGOS);
    const notasCredito = facturasAgrupadas.map(item => item.TOTAL_NOTAS_CREDITO);
    const reconciliaciones = facturasAgrupadas.map(item => item.TOTAL_RECONCILIACIONES);
    // Pendiente = Facturado - Pagos - Notas de Crédito - Reconciliaciones Internas
    const pendiente = facturasAgrupadas.map(item => 
        Math.max(0, item.TOTAL_FACTURA - item.TOTAL_PAGOS - item.TOTAL_NOTAS_CREDITO - item.TOTAL_RECONCILIACIONES)
    );

    // Total facturado
    const totalFacturado = facturado.reduce((acc, val) => acc + val, 0);

    // Total pagado
    const totalPagado = pagos.reduce((acc, val) => acc + val, 0);

    // Total notas de crédito
    const totalNotasCredito = notasCredito.reduce((acc, val) => acc + val, 0);

    // Total reconciliaciones internas
    const totalReconciliaciones = reconciliaciones.reduce((acc, val) => acc + val, 0);

    // Saldo pendiente total (Facturado - Pagos - Notas de Crédito - Reconciliaciones)
    const saldoPendiente = totalFacturado - totalPagado - totalNotasCredito - totalReconciliaciones;

    // Número de facturas pendientes
    const facturasPendientes = pendiente.filter((p) => p > 0).length;

    // Promedio de días en pagar (solo considerando registros de PAGO)
    const registrosPago = businessPartnersInvoiced.filter(item => 
        item.TIPO_REGISTRO === 'PAGO' && item.FECHA_CONTABILIZACION && item.FECHA_FACTURA
    );
    
    const diasPago = registrosPago.map(item =>
        differenceInDays(new Date(item.FECHA_CONTABILIZACION), new Date(item.FECHA_FACTURA))
    );

    const promedioDiasPago = diasPago.length > 0 ? (diasPago.reduce((a, b) => a + b, 0) / diasPago.length).toFixed(1) : 0;


    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: { 
                maxWidth: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.default, 0.9)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.12)}`,
            },
        }}
        sx={{
            '& .MuiBackdrop-root': {
                background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.05)} 50%,
                    ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                backdropFilter: 'blur(8px)',
            },
            '@keyframes pulse': {
                '0%': {
                    transform: 'scale(1)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                '50%': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                '100%': {
                    transform: 'scale(1)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }
            }
        }}
    >

        <DialogTitle
            sx={{
                background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                    ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                pb: 3
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                >
                    💰
                </Box>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Pagos Efectuados
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                        Análisis detallado de pagos y facturación
                    </Typography>
                </Box>
            </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
            <Alert 
                icon={
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                        }}
                    >
                        👤
                    </Box>
                }
                sx={{ 
                    mb: 4,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.light, 0.02)})`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    '& .MuiAlert-message': {
                        fontWeight: 600,
                        fontSize: '1rem'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                        Cliente:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {currentPartner.Cliente || 'No especificado'}
                    </Typography>
                </Box>
            </Alert>

            {/* Filtro de fechas */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.02)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            📅
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            Rango de Fechas
                        </Typography>
                    </Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                            <DatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => setFechaInicio(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: theme.palette.background.paper,
                                            }
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <DatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => setFechaFin(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                background: theme.palette.background.paper,
                                            }
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    const hoy = new Date();
                                    const hace12Meses = new Date();
                                    hace12Meses.setMonth(hoy.getMonth() - 12);
                                    setFechaInicio(hace12Meses);
                                    setFechaFin(hoy);
                                }}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    height: '40px',
                                    width: '100%',
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                    color: theme.palette.warning.main,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.dark, 0.1)})`,
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
                                    }
                                }}
                            >
                                🔄 12 meses
                            </Button>
                        </Grid>
                    </Grid>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block',
                            mt: 1.5,
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic'
                        }}
                    >
                        📊 Mostrando datos del {fechaInicio?.toLocaleDateString('es-EC')} al {fechaFin?.toLocaleDateString('es-EC')} • {businessPartnersInvoiced.length} registros
                    </Typography>
                </Box>
            </LocalizationProvider>

            {currentPartner ? (<>
                <Stack spacing={2}>
                    <Grid item xs={12} md={6} lg={8}>

                        <Grid size={{ xs: 12, md: 6, lg: 8 }}>


                            <Stack spacing={3}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                                        }}
                                                    >
                                                        📋
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Total Facturado
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                                    ${totalFacturado.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.success.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.3)}`
                                                        }}
                                                    >
                                                        💵
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Total Pagado
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                                    ${totalPagado.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)}, ${alpha(theme.palette.warning.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.warning.main, 0.3)}`
                                                        }}
                                                    >
                                                        📄
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Notas de Crédito
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                                    ${totalNotasCredito.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha('#9C27B0', 0.08)}, ${alpha('#9C27B0', 0.03)})`,
                                                border: `1px solid ${alpha('#9C27B0', 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha('#9C27B0', 0.15)}`,
                                                    border: `1px solid ${alpha('#9C27B0', 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, #9C27B0, #BA68C8)`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, #9C27B0, #7B1FA2)`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha('#9C27B0', 0.3)}`
                                                        }}
                                                    >
                                                        🔄
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Reconciliaciones
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                                                    ${totalReconciliaciones.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)}, ${alpha(theme.palette.error.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.3)}`
                                                        }}
                                                    >
                                                        ⏰
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Saldo Pendiente
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                                                    ${saldoPendiente.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.info.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.3)}`
                                                        }}
                                                    >
                                                        📊
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Facturas Pendientes
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                                    {facturasPendientes}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={1.7}>
                                        <Card 
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)}, ${alpha(theme.palette.secondary.light, 0.03)})`,
                                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`,
                                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '3px',
                                                    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '10px',
                                                            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            mr: 1.5,
                                                            boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.3)}`
                                                        }}
                                                    >
                                                        📅
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                                        Promedio Días en Pagar
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                                                    {promedioDiasPago} días
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>

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
                                                                    `${pago.noPago}:$${pago.monto.toFixed(2)}:${new Date(pago.fecha).toLocaleDateString('es-EC')}`
                                                                ).join('|');
                                                                
                                                                const detallesNotasCredito = factura.NOTAS_CREDITO.map(nota => 
                                                                    `${nota.noNota}:$${nota.monto.toFixed(2)}:${new Date(nota.fecha).toLocaleDateString('es-EC')}`
                                                                ).join('|');

                                                                const detallesReconciliaciones = factura.RECONCILIACIONES_INTERNAS.map(recon => 
                                                                    `${recon.noDocumento}:$${recon.monto.toFixed(2)}:${new Date(recon.fecha).toLocaleDateString('es-EC')}:${recon.reconType}`
                                                                ).join('|');
                                                                
                                                                return {
                                                                    'No_Factura': factura.NO_FACTURA,
                                                                    'Fecha_Factura': new Date(factura.FECHA_CONTAB_FACT).toLocaleDateString('es-EC'),
                                                                    'Total_Facturado': factura.TOTAL_FACTURA.toFixed(2),
                                                                    'Total_Pagado': factura.TOTAL_PAGOS.toFixed(2),
                                                                    'Total_Notas_Credito': factura.TOTAL_NOTAS_CREDITO.toFixed(2),
                                                                    'Total_Reconciliaciones': factura.TOTAL_RECONCILIACIONES.toFixed(2),
                                                                    'Saldo_Pendiente': (factura.TOTAL_FACTURA - factura.TOTAL_PAGOS - factura.TOTAL_NOTAS_CREDITO - factura.TOTAL_RECONCILIACIONES).toFixed(2),
                                                                    'Porcentaje_Pagado': ((factura.TOTAL_PAGOS / factura.TOTAL_FACTURA) * 100).toFixed(1) + '%',
                                                                    'Porcentaje_Notas_Credito': ((factura.TOTAL_NOTAS_CREDITO / factura.TOTAL_FACTURA) * 100).toFixed(1) + '%',
                                                                    'Porcentaje_Reconciliaciones': ((factura.TOTAL_RECONCILIACIONES / factura.TOTAL_FACTURA) * 100).toFixed(1) + '%',
                                                                    'Cantidad_Pagos': factura.PAGOS.length,
                                                                    'Cantidad_Notas_Credito': factura.NOTAS_CREDITO.length,
                                                                    'Cantidad_Reconciliaciones': factura.RECONCILIACIONES_INTERNAS.length,
                                                                    'Fecha_Ultimo_Pago': factura.FECHA_ULTIMO_PAGO ? new Date(factura.FECHA_ULTIMO_PAGO).toLocaleDateString('es-EC') : 'N/A',
                                                                    'Estado': (factura.TOTAL_FACTURA - factura.TOTAL_PAGOS - factura.TOTAL_NOTAS_CREDITO - factura.TOTAL_RECONCILIACIONES) <= 0 ? 'Pagado' : 'Pendiente',
                                                                    'Cliente': currentPartner.Cliente || '',
                                                                    'Detalle_Pagos': detallesPagos,
                                                                    'Detalle_Notas_Credito': detallesNotasCredito,
                                                                    'Detalle_Reconciliaciones': detallesReconciliaciones
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
                                                        name: '📋 Facturado',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: facturado,
                                                        color: '#1877F2',
                                                    },
                                                    {
                                                        name: '💵 Pagos',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: pagos,
                                                        color: '#00AB55',
                                                    },
                                                    {
                                                        name: '📄 Notas Crédito',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: notasCredito,
                                                        color: '#FF9800',
                                                    },
                                                    {
                                                        name: '🔄 Reconciliaciones',
                                                        type: 'bar',
                                                        fill: 'solid',
                                                        data: reconciliaciones,
                                                        color: '#9C27B0',
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
                                                            const facturado = series[0][dataPointIndex];
                                                            const pagado = series[1][dataPointIndex];
                                                            const notaCredito = series[2][dataPointIndex];
                                                            const reconciliacion = series[3][dataPointIndex];
                                                            const pendiente = series[4][dataPointIndex];
                                                            const facturaData = facturasAgrupadas[dataPointIndex];
                                                            const numeroFactura = facturaData.NO_FACTURA;
                                                            const fechaFactura = new Date(facturaData.FECHA_CONTAB_FACT).toLocaleDateString('es-EC');
                                                            const fechaUltimoPago = facturaData.FECHA_ULTIMO_PAGO ? new Date(facturaData.FECHA_ULTIMO_PAGO).toLocaleDateString('es-EC') : 'N/A';
                                                            const porcentajePagado = facturado > 0 ? ((pagado/facturado)*100).toFixed(1) : 0;
                                                            const porcentajeNotasCredito = facturado > 0 ? ((notaCredito/facturado)*100).toFixed(1) : 0;
                                                            const porcentajeReconciliacion = facturado > 0 ? ((reconciliacion/facturado)*100).toFixed(1) : 0;
                                                            const porcentajePendiente = facturado > 0 ? ((pendiente/facturado)*100).toFixed(1) : 0;
                                                            
                                                            // Generar lista de pagos
                                                            const listaPagos = facturaData.PAGOS.map((pago, idx) => 
                                                                `<div style="margin: 2px 0; font-size: 10px; color: #666; padding-left: 10px;">
                                                                    • $${pago.monto.toFixed(2)} - ${new Date(pago.fecha).toLocaleDateString('es-EC')} (${pago.noPago})
                                                                </div>`
                                                            ).join('');

                                                            // Generar lista de notas de crédito
                                                            const listaNotasCredito = facturaData.NOTAS_CREDITO.map((nota, idx) => 
                                                                `<div style="margin: 2px 0; font-size: 10px; color: #666; padding-left: 10px;">
                                                                    • $${nota.monto.toFixed(2)} - ${new Date(nota.fecha).toLocaleDateString('es-EC')} (${nota.noNota}) - ${nota.motivo || 'S/M'}
                                                                </div>`
                                                            ).join('');

                                                            // Generar lista de reconciliaciones internas
                                                            const listaReconciliaciones = facturaData.RECONCILIACIONES_INTERNAS.map((recon, idx) => 
                                                                `<div style="margin: 2px 0; font-size: 10px; color: #666; padding-left: 10px;">
                                                                    • $${recon.monto.toFixed(2)} - ${new Date(recon.fecha).toLocaleDateString('es-EC')} (${recon.noDocumento}) - ${recon.reconType}
                                                                </div>`
                                                            ).join('');
                                                            
                                                            return `
                                                                <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; max-width: 350px;">
                                                                    <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 12px;">📋 Factura: ${numeroFactura}</div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px; color: #666;">
                                                                        📅 Fecha Factura: ${fechaFactura}
                                                                    </div>
                                                                    <div style="margin-bottom: 6px; font-size: 11px; color: #666;">
                                                                        💰 Último Pago: ${fechaUltimoPago}
                                                                    </div>
                                                                    
                                                                    ${facturaData.PAGOS.length > 0 ? `
                                                                    <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; margin: 6px 0; background: #f8fff8;">
                                                                        <div style="font-weight: 600; font-size: 10px; color: #333; margin-bottom: 4px;">💳 Pagos (${facturaData.PAGOS.length}):</div>
                                                                        ${listaPagos}
                                                                    </div>` : ''}
                                                                    
                                                                    ${facturaData.NOTAS_CREDITO.length > 0 ? `
                                                                    <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; margin: 6px 0; background: #fff8f0;">
                                                                        <div style="font-weight: 600; font-size: 10px; color: #333; margin-bottom: 4px;">📄 Notas de Crédito (${facturaData.NOTAS_CREDITO.length}):</div>
                                                                        ${listaNotasCredito}
                                                                    </div>` : ''}
                                                                    
                                                                    ${facturaData.RECONCILIACIONES_INTERNAS.length > 0 ? `
                                                                    <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; margin: 6px 0; background: #f8f0ff;">
                                                                        <div style="font-weight: 600; font-size: 10px; color: #333; margin-bottom: 4px;">🔄 Reconciliaciones Internas (${facturaData.RECONCILIACIONES_INTERNAS.length}):</div>
                                                                        ${listaReconciliaciones}
                                                                    </div>` : ''}
                                                                    
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #1877F2;">📋 Facturado: $${facturado.toFixed(2)}</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #00AB55;">💵 Total Pagado: $${pagado.toFixed(2)} (${porcentajePagado}%)</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #FF9800;">📄 Notas Crédito: $${notaCredito.toFixed(2)} (${porcentajeNotasCredito}%)</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #9C27B0;">🔄 Reconciliaciones: $${reconciliacion.toFixed(2)} (${porcentajeReconciliacion}%)</span>
                                                                    </div>
                                                                    <div style="margin-bottom: 4px; font-size: 11px;">
                                                                        <span style="color: #FF5630;">⏰ Pendiente: $${pendiente.toFixed(2)} (${porcentajePendiente}%)</span>
                                                                    </div>
                                                                    <div style="border-top: 1px solid #e0e0e0; padding-top: 4px; margin-top: 8px; font-weight: 600; font-size: 11px;">
                                                                        <span style="color: ${pendiente <= 0 ? '#00AB55' : '#FF5630'};">
                                                                            ${pendiente <= 0 ? '✅ Totalmente Liquidado' : '⚠️ Saldo Pendiente'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }
                                                    },
                                                    colors: ['#1877F2', '#00AB55', '#FF9800', '#9C27B0', '#FF5630'],
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


                    <Box
                        sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                                ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                            backdropFilter: 'blur(10px)',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: `linear-gradient(90deg, 
                                    ${theme.palette.primary.main}, 
                                    ${theme.palette.secondary.main}, 
                                    ${theme.palette.success.main})`,
                            },
                        }}
                    >
                        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                                    📋
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '-0.5px',
                                        }}
                                    >
                                        Detalle de Transacciones
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                        Registro completo de pagos, notas de crédito y reconciliaciones internas
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <DataGrid
                            rows={businessPartnersInvoiced}
                            columns={baseColumns}
                            pagination
                            slots={{
                                toolbar: CustomToolbar,
                                noRowsOverlay: () => <EmptyContent title="No Data" />,
                                noResultsOverlay: () => <EmptyContent title="No results found" />,
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    '& .MuiDataGrid-columnHeader': {
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                    }
                                },
                                '& .MuiDataGrid-row:hover': {
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.01)})`,
                                },
                            }}
                        />
                    </Box>
                </Stack>
            </>
            ) : (<Label color="error">Cliente no encontrado</Label>)}

        </DialogContent>

        <DialogActions
            sx={{
                p: 3,
                background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.8)} 0%, 
                    ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                justifyContent: 'space-between'
            }}
        >
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
                    ✅
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Análisis completado • {facturasAgrupadas.length} facturas procesadas
                </Typography>
            </Box>
            <Button 
                variant="contained"
                onClick={onClose}
                sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                }}
                startIcon={
                    <Box sx={{ fontSize: '16px' }}>🚪</Box>
                }
            >
                Cerrar Análisis
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