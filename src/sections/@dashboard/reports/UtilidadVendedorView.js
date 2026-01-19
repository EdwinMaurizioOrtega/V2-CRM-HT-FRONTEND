import React, { useState } from 'react';
import { 
    Box, Button, Card, Container, Stack, Typography, alpha, useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import * as XLSX from "xlsx";
import axios from '../../../utils/axios';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';

function ExcelDownload({ data }) {
    const handleExportToExcel = () => {
        const exportData = data.map(item => ({
            'Número de Factura': item['Numero Factura'],
            'Fecha': item.DocDate,
            'Vendedor': item.Vendedor,
            'Nombre Cliente': item['Nombre Cliente'],
            'Tipo Cliente': item['Tipo Cliente'],
            'Nombre Tipo Cliente': item['Nombre Tipo Cliente'],
            'Utilidad Generada': item['Utilidad Generada'],
            'Utilidad Negativa': item['Utilidad Negativa'],
            'Bajo Costo': item['Bajo Costo'],
            'Marca': item.Marca,
            'Cantidad': item.Cantidad,
            'Sum of Neto': item['Sum of Neto'],
            'Sum of Costo': item['Sum of Costo'],
            'Item Code': item.ItemCode,
            'Nombre Item': item['Nombre Item2'],
            'Costo Unitario': item.C_U,
            'Neto Unitario': item.N_U,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 18 },  // Número de Factura
            { wch: 12 },  // Fecha
            { wch: 25 },  // Vendedor
            { wch: 30 },  // Nombre Cliente
            { wch: 15 },  // Tipo Cliente
            { wch: 25 },  // Nombre Tipo Cliente
            { wch: 15 },  // Utilidad Generada
            { wch: 15 },  // Utilidad Negativa
            { wch: 12 },  // Bajo Costo
            { wch: 20 },  // Marca
            { wch: 10 },  // Cantidad
            { wch: 15 },  // Sum of Neto
            { wch: 15 },  // Sum of Costo
            { wch: 40 },  // Nombre Item
            { wch: 15 },  // Costo Unitario
            { wch: 15 },  // Neto Unitario
        ];

        // Generar nombre de archivo con fecha y hora
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `Utilidad_Vendedor_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, 'Utilidad Vendedor');
        XLSX.writeFile(wb, fileName);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <Button 
                variant="contained" 
                onClick={handleExportToExcel}
                startIcon={<Iconify icon="vscode-icons:file-type-excel" width={24} />}
                sx={{
                    background: 'linear-gradient(135deg, #1D6F42 0%, #28a745 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(29, 111, 66, 0.4)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: 280,
                    '&:hover': {
                        background: 'linear-gradient(135deg, #155d35 0%, #20893a 100%)',
                        boxShadow: '0 12px 32px rgba(29, 111, 66, 0.6)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                📊 Exportar Reporte Excel
            </Button>
        </Box>
    );
}

export default function UtilidadVendedorView() {
    const theme = useTheme();
    const { user } = useAuthContext();
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDataByDateRange = async () => {
        if (!fechaInicio || !fechaFin) {
            alert('Por favor seleccione ambas fechas');
            return;
        }

        setLoading(true);
        try {
            // Formatear fechas a YYYY-MM-DD HH:MM:SS
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day} 00:00:00`;
            };

            const formattedStartDate = formatDate(fechaInicio);
            const formattedEndDate = formatDate(fechaFin);

            console.log('Fechas formateadas:', formattedStartDate, formattedEndDate);

            const response = await axios.get('/hanadb/api/power_bi/utilidad_vendedor', {
                params: {
                    fecha_inicio: formattedStartDate,
                    fecha_fin: formattedEndDate,
                    empresa: user.EMPRESA
                }
            });

            console.log('Respuesta del servidor:', response.data);
            setData(response.data);

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            alert('Error al cargar los datos del reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleLimpiarFiltros = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setData([]);
    };

    return (
        <Container maxWidth="xl">
            <Stack spacing={3}>
                {/* HEADER */}
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Reporte de Utilidad por Vendedor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Seleccione un rango de fechas para generar el reporte Excel
                    </Typography>
                </Box>

                {/* FILTROS DE FECHA */}
                <Card sx={{ 
                    p: 3, 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderRadius: 3
                }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="eva:calendar-fill" width={24} />
                        Rango de Fechas
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <DatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => setFechaInicio(newValue)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => setFechaFin(newValue)}
                                minDate={fechaInicio}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <Button
                                variant="contained"
                                size="large"
                                onClick={fetchDataByDateRange}
                                disabled={!fechaInicio || !fechaFin || loading}
                                startIcon={<Iconify icon="eva:search-fill" />}
                                sx={{ minWidth: 150, height: 56 }}
                            >
                                {loading ? 'Cargando...' : 'Consultar'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleLimpiarFiltros}
                                startIcon={<Iconify icon="eva:refresh-fill" />}
                                sx={{ minWidth: 150, height: 56 }}
                            >
                                Limpiar
                            </Button>
                        </Stack>
                    </LocalizationProvider>
                </Card>

                {/* BOTÓN DE DESCARGA EXCEL */}
                {data.length > 0 && (
                    <Card sx={{ 
                        p: 4,
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.dark, 0.05)} 100%)`,
                    }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                            ✅ {data.length} registros encontrados
                        </Typography>
                        <ExcelDownload data={data} />
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                            El archivo Excel incluirá todos los campos del reporte
                        </Typography>
                    </Card>
                )}

                {!loading && data.length === 0 && (
                    <Card sx={{ 
                        p: 10, 
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3
                    }}>
                        <Box sx={{ mb: 3 }}>
                            <Iconify icon="eva:file-text-outline" width={120} sx={{ color: 'text.disabled', opacity: 0.3 }} />
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            No hay datos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Selecciona un rango de fechas y presiona 'Consultar' para generar el reporte
                        </Typography>
                    </Card>
                )}
            </Stack>
        </Container>
    );
}
