import React, { useState } from 'react';
import {
    Box, Button, Card, Container, Stack, Typography, alpha, useTheme, TextField, MenuItem
} from '@mui/material';
import * as XLSX from "xlsx";
// axios
import axios from '../../../utils/axios';
import axiosRaw from 'axios';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useWarehouseContext } from '../../../auth/useWarehouseContext';

function ExcelDownload({ data }) {
    const handleExportToExcel = () => {
        const exportData = data.map(item => ({
            'Código Item': item.ItemCode,
            'Nombre Item': item.ItemName,
            'Número de Serie': item.DistNumber,
            'Código Bodega': item.WhsCode,
            'Cantidad': item.Quantity,
            'Cantidad Series por Item': item.CANTIDAD_SERIES_POR_ITEM,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 20 },  // Código Item
            { wch: 50 },  // Nombre Item
            { wch: 25 },  // Número de Serie
            { wch: 15 },  // Código Bodega
            { wch: 12 },  // Cantidad
            { wch: 25 },  // Cantidad Series por Item
        ];

        // Generar nombre de archivo con fecha y hora
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `Control_Inventario_Series_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, 'Control Inventario');
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

export default function ControlInventarioView() {
    const theme = useTheme();
    const { user } = useAuthContext();
    const { getWarehouseList } = useWarehouseContext();
    const [bodega, setBodega] = useState('030');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!bodega) {
            alert('Por favor seleccione una bodega');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosRaw.get('/api/bi/control_inventario_series', {
                params: {
                    bodega: bodega,
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
        setBodega('019');
        setData([]);
    };

    return (
        <Container maxWidth="xl">
            <Stack spacing={3}>
                {/* HEADER */}
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Control de Inventario por Series
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Seleccione una bodega para generar el reporte Excel de series en inventario
                    </Typography>
                </Box>

                {/* FILTRO DE BODEGA */}
                <Card sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderRadius: 3
                }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="eva:layers-fill" width={24} />
                        Seleccionar Bodega
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            select
                            label="Bodega"
                            value={bodega}
                            onChange={(e) => setBodega(e.target.value)}
                            fullWidth
                            sx={{ maxWidth: 400 }}
                        >
                            {getWarehouseList().map((w) => (
                                <MenuItem key={w.WhsCode} value={w.WhsCode}>
                                    {`${w.WhsCode} - ${w.WhsName}`}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={fetchData}
                            disabled={!bodega || loading}
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
                            ✅ {data.length} series encontradas
                        </Typography>
                        <ExcelDownload data={data} />
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                            El archivo Excel incluirá todas las series en inventario de la bodega seleccionada
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
                            <Iconify icon="eva:layers-outline" width={120} sx={{ color: 'text.disabled', opacity: 0.3 }} />
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            No hay datos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Selecciona una bodega y presiona 'Consultar' para generar el reporte
                        </Typography>
                    </Card>
                )}
            </Stack>
        </Container>
    );
}
