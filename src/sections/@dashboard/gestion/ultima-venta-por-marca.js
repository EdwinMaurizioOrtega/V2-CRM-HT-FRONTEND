import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Label from "../../../components/label";
import React, {useEffect, useState} from "react";
import axios from '../../../utils/axios';
import {HOST_API_KEY} from "../../../config-global";
import {useAuthContext} from "../../../auth/useAuthContext";
import { alpha, useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";

import EmptyContent from "../../../components/empty-content";
import {AnalyticsWebsiteVisits} from "../general/analytics";
import {Grid} from "@mui/material";

// ----------------------------------------------------------------------

export default function CustomerUltimaVentaPorMarca({currentPartner, open, onClose}) {

    const theme = useTheme();

    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'U_SYP_GRUPO',
            headerName: 'U_SYP_GRUPO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'Nombre_Grupo',
            headerName: 'Nombre_Grupo',
            flex: 1,
            minWidth: 150,
        },

        {
            field: 'Fecha',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 150,
        },

        {
            field: 'No_Documento_Ref',
            headerName: 'No_Documento_Ref',
            flex: 1,
            minWidth: 250,
        },

        {
            field: 'ItemCode',
            headerName: 'ItemCode',
            flex: 1,
            minWidth: 250,
        },

        {
            field: 'Tiempo_sin_vender',
            headerName: 'Tiempo_sin_vender',
            flex: 1,
            minWidth: 250,
        },

    ]

    const {user} = useAuthContext();

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/ultima-venta-por-marca?EMPRESA=${user?.EMPRESA}&CARD_CODE=${currentPartner.ID}&USER_NAME=${user.DISPLAYNAME}`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data));

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

    // Sacar las categorías (fechas) y los valores (pagos)
    const categories = businessPartnersInvoiced.map(item =>
        new Date(item.FECHA_CONTAB_PAGO).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    );

    // Preparar datos para el gráfico de barras
    const marcasLabels = businessPartnersInvoiced.map(item => item.Nombre_Grupo);
    const diasSinVender = businessPartnersInvoiced.map(item => {
        let dias = 0;
        if (item.Tiempo_sin_vender.includes("Hace")) {
            const match = item.Tiempo_sin_vender.match(/-?\d+/);
            dias = match ? Math.abs(parseInt(match[0], 10)) : 0;
        }
        return dias;
    });

    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {maxWidth: '100%'},
        }}
    >

        <DialogTitle>Última Venta Por Marca</DialogTitle>

        <DialogContent>
            <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                Cliente: {currentPartner.Cliente || ''}
            </Alert>

            {currentPartner ? (<>
                    <Stack spacing={2}>

                        <Grid item xs={12} md={6} lg={8}>
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: '20px',
                                    background: `linear-gradient(135deg, 
                                        ${alpha(theme.palette.warning.main, 0.02)} 0%, 
                                        ${alpha(theme.palette.error.main, 0.02)} 50%, 
                                        ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
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
                                            ${theme.palette.warning.main}, 
                                            ${theme.palette.error.main}, 
                                            ${theme.palette.info.main})`,
                                        borderRadius: '20px 20px 0 0',
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}`,
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
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
                                                        background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px',
                                                        boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`
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
                                                            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.warning.main})`,
                                                            backgroundClip: 'text',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            letterSpacing: '-0.5px',
                                                        }}
                                                    >
                                                        Última Venta por Marca
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    // Crear datos para CSV
                                                    const csvData = businessPartnersInvoiced.map(item => {
                                                        let dias = 0;
                                                        if (item.Tiempo_sin_vender.includes("Hace")) {
                                                            const match = item.Tiempo_sin_vender.match(/-?\d+/);
                                                            dias = match ? Math.abs(parseInt(match[0], 10)) : 0;
                                                        }
                                                        
                                                        return {
                                                            'Grupo': item.U_SYP_GRUPO,
                                                            'Nombre_Marca': item.Nombre_Grupo,
                                                            'Ultima_Fecha_Venta': item.Fecha,
                                                            'Documento_Referencia': item.No_Documento_Ref,
                                                            'Codigo_Item': item.ItemCode,
                                                            'Dias_Sin_Vender': dias,
                                                            'Tiempo_Texto': item.Tiempo_sin_vender,
                                                            'Cliente': currentPartner.Cliente || ''
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
                                                    link.setAttribute('download', `ultima-venta-por-marca-${currentPartner.Cliente || 'cliente'}-${new Date().toISOString().split('T')[0]}.csv`);
                                                    link.style.visibility = 'hidden';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.dark, 0.1)})`,
                                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                                    color: theme.palette.warning.main,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.warning.dark, 0.2)})`,
                                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`
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
                                                    background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                ⏰
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: theme.palette.text.secondary,
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Tiempo en días desde la última venta por marca - cliente - vendedor
                                            </Typography>
                                        </Box>
                                    }
                                    chart={{
                                        labels: marcasLabels,
                                        series: [
                                            {
                                                name: '📅 Días sin Vender',
                                                type: 'bar',
                                                fill: 'solid',
                                                data: diasSinVender,
                                            },
                                        ],
                                        options: {
                                            chart: {
                                                type: 'bar',
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
                                                    borderRadius: 6,
                                                    columnWidth: '60%',
                                                    dataLabels: {
                                                        position: 'top'
                                                    }
                                                }
                                            },
                                            dataLabels: {
                                                enabled: true,
                                                formatter: function(val) {
                                                    return val > 0 ? `${val} días` : '';
                                                },
                                                style: {
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    colors: ['#FFFFFF']
                                                },
                                                offsetY: -5
                                            },
                                            xaxis: {
                                                categories: marcasLabels,
                                                title: {
                                                    text: 'Marcas'
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
                                                    text: 'Días sin Vender'
                                                },
                                                labels: {
                                                    formatter: function(val) {
                                                        return val + ' días';
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                custom: function({series, seriesIndex, dataPointIndex, w}) {
                                                    const dias = series[seriesIndex][dataPointIndex];
                                                    const marca = marcasLabels[dataPointIndex];
                                                    const item = businessPartnersInvoiced[dataPointIndex];
                                                    
                                                    let colorAlerta = '#00AB55'; // Verde por defecto
                                                    let iconoAlerta = '✅';
                                                    let textoAlerta = 'Ventas Recientes';
                                                    
                                                    if (dias > 90) {
                                                        colorAlerta = '#FF5630';
                                                        iconoAlerta = '🚨';
                                                        textoAlerta = 'Crítico - Sin ventas por más de 3 meses';
                                                    } else if (dias > 60) {
                                                        colorAlerta = '#FF9800';
                                                        iconoAlerta = '⚠️';
                                                        textoAlerta = 'Alerta - Sin ventas por más de 2 meses';
                                                    } else if (dias > 30) {
                                                        colorAlerta = '#FFC107';
                                                        iconoAlerta = '⚡';
                                                        textoAlerta = 'Atención - Sin ventas por más de 1 mes';
                                                    }
                                                    
                                                    return `
                                                        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; max-width: 280px;">
                                                            <div style="font-weight: 600; color: #333; margin-bottom: 8px; font-size: 12px;">🏷️ Marca: ${marca}</div>
                                                            <div style="margin-bottom: 4px; font-size: 11px; color: #666;">
                                                                📅 Última Venta: ${item?.Fecha || 'No disponible'}
                                                            </div>
                                                            <div style="margin-bottom: 4px; font-size: 11px; color: #666;">
                                                                📋 Documento: ${item?.No_Documento_Ref || 'No disponible'}
                                                            </div>
                                                            <div style="margin-bottom: 6px; font-size: 11px; color: #666;">
                                                                🔍 Item: ${item?.ItemCode || 'No disponible'}
                                                            </div>
                                                            <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; margin: 6px 0; background: #fafafa;">
                                                                <div style="font-weight: 600; font-size: 14px; color: ${colorAlerta}; text-align: center;">
                                                                    ${iconoAlerta} ${dias} días sin vender
                                                                </div>
                                                                <div style="font-size: 10px; color: ${colorAlerta}; text-align: center; margin-top: 2px;">
                                                                    ${textoAlerta}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `;
                                                }
                                            },
                                            colors: ['#FF9800'],
                                            fill: {
                                                type: 'gradient',
                                                gradient: {
                                                    shade: 'light',
                                                    type: 'vertical',
                                                    shadeIntensity: 0.25,
                                                    gradientToColors: ['#FF5630'],
                                                    inverseColors: true,
                                                    opacityFrom: 0.85,
                                                    opacityTo: 0.55,
                                                    stops: [50, 0, 100]
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                        <DataGrid
                            rows={businessPartnersInvoiced}
                            columns={baseColumns}
                            pagination
                            slots={{
                                toolbar: CustomToolbar,
                                noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                noResultsOverlay: () => <EmptyContent title="No results found"/>,
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

CustomerUltimaVentaPorMarca.propTypes = {
    open: PropTypes.bool, onClose: PropTypes.func, currentUser: PropTypes.object,
};

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