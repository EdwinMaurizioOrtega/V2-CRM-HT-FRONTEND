import React, { useState } from 'react';
import {
    Box, Button, Card, Container, Stack, TextField, Typography, alpha, useTheme,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, InputAdornment, CircularProgress, Chip
} from '@mui/material';
import * as XLSX from "xlsx";
import axios from '../../../utils/axios';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';

// Columnas para la tabla
const TABLE_COLUMNS = [
    { id: 'DocEntry', label: 'DocEntry' },
    { id: 'LineNum', label: 'LineNum' },
    { id: 'DocNum', label: 'DocNum' },
    { id: 'TransId', label: 'TransId' },
    { id: 'U_SYP_ORDEN_CRM', label: 'Orden CRM' },
    { id: 'U_SYP_SERIESUC', label: 'Series UC' },
    { id: 'U_SYP_MDSD', label: 'MDSD' },
    { id: 'U_SYP_MDCD', label: 'MDCD' },
    { id: 'CardCode', label: 'Código Cliente' },
    { id: 'CardName', label: 'Nombre Cliente' },
    { id: 'LicTradNum', label: 'RUC/CI' },
    { id: 'E_Mail', label: 'Email' },
    { id: 'DocDate', label: 'Fecha Doc.' },
    { id: 'U_SYP_NROAUTO', label: 'Nro. Auto.' },
    { id: 'ItemCode', label: 'Código Art.' },
    { id: 'Dscription', label: 'Descripción' },
    { id: 'DistNumber', label: 'Serie/IMEI' },
    { id: 'InDate', label: 'Fecha Ingreso' },
    { id: 'SlpName', label: 'Vendedor' },
    { id: 'Name', label: 'Grupo' },
];

function ExcelDownload({ data }) {
    const handleExportToExcel = () => {
        const exportData = data.map(item => ({
            'DocEntry': item.DocEntry,
            'LineNum': item.LineNum,
            'DocNum': item.DocNum,
            'TransId': item.TransId,
            'Orden CRM': item.U_SYP_ORDEN_CRM,
            'Series UC': item.U_SYP_SERIESUC,
            'MDSD': item.U_SYP_MDSD,
            'MDCD': item.U_SYP_MDCD,
            'Código Cliente': item.CardCode,
            'Nombre Cliente': item.CardName,
            'RUC/CI': item.LicTradNum,
            'Email': item.E_Mail,
            'Fecha Documento': item.DocDate,
            'Nro. Autorización': item.U_SYP_NROAUTO,
            'Código Artículo': item.ItemCode,
            'Descripción': item.Dscription,
            'Serie/IMEI': item.DistNumber,
            'Fecha Ingreso': item.InDate,
            'Vendedor': item.SlpName,
            'Grupo': item.Name,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        const columnWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, 18)
        }));
        ws['!cols'] = columnWidths;

        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `Series_Facturadas_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, 'Series Facturadas');
        XLSX.writeFile(wb, fileName);
    };

    return (
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
            📊 Descargar Excel
        </Button>
    );
}

export default function SeriesFacturadasView() {
    const theme = useTheme();
    const { user } = useAuthContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orden, setOrden] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const fetchData = async () => {
        if (!orden.trim()) {
            alert('Ingrese un número de orden');
            return;
        }
        setLoading(true);
        setData([]);
        try {
            const response = await axios.get('/hanadb/api/orders/series_facturadas', {
                params: {
                    orden: orden.trim(),
                    empresa: user.EMPRESA
                }
            });

            if (response.data.status === 'success') {
                setData(response.data.data);
            } else {
                alert('No se encontraron resultados');
            }
        } catch (error) {
            console.error('Error al obtener series facturadas:', error);
            alert('Error al consultar las series facturadas');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchData();
        }
    };

    return (
        <Container maxWidth={false}>
            <Stack spacing={3}>
                {/* HEADER */}
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Series Facturadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Consulte las series/IMEI facturados por número de orden CRM
                    </Typography>
                </Box>

                {/* BUSCADOR */}
                <Card sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderRadius: 3
                }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="eva:search-fill" width={24} />
                        Buscar por Número de Orden
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            label="Número de Orden"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ej: 124262"
                            variant="outlined"
                            sx={{ minWidth: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="solar:document-bold" width={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            onClick={fetchData}
                            disabled={loading || !orden.trim()}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:search-fill" />}
                            sx={{ minWidth: 200, height: 56 }}
                        >
                            {loading ? 'Consultando...' : 'Consultar'}
                        </Button>
                    </Stack>
                    {loading && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'warning.main' }}>
                            ⏳ Consultando SAP... Esto puede tardar unos segundos
                        </Typography>
                    )}
                </Card>

                {/* RESULTADOS */}
                {data.length > 0 && (
                    <Card sx={{
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        overflow: 'hidden',
                    }}>
                        {/* Header con info y botón Excel */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                p: 3,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.dark, 0.05)} 100%)`,
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Chip
                                    label={`${data.length} registros`}
                                    color="success"
                                    variant="filled"
                                    sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Orden: <strong>{orden}</strong>
                                </Typography>
                            </Stack>
                            <ExcelDownload data={data} />
                        </Stack>

                        {/* TABLA */}
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        {TABLE_COLUMNS.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    backgroundColor: theme.palette.grey[200],
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {col.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow
                                                key={`${row.DocEntry}-${row.LineNum}-${row.DistNumber}-${index}`}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                    },
                                                }}
                                            >
                                                {TABLE_COLUMNS.map((col) => (
                                                    <TableCell
                                                        key={col.id}
                                                        sx={{
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '0.75rem',
                                                            maxWidth: 200,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {row[col.id] ?? '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={data.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage="Filas por página:"
                        />
                    </Card>
                )}

                {/* ESTADO VACÍO */}
                {!loading && data.length === 0 && (
                    <Card sx={{
                        p: 10,
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3
                    }}>
                        <Box sx={{ mb: 3 }}>
                            <Iconify icon="solar:document-bold-duotone" width={120} sx={{ color: 'text.disabled', opacity: 0.3 }} />
                        </Box>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            Sin resultados
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ingrese un número de orden y presione "Consultar" para ver las series facturadas
                        </Typography>
                    </Card>
                )}
            </Stack>
        </Container>
    );
}
