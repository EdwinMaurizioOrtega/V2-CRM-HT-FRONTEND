import React, { useState } from 'react';
import {
    Box, Button, Card, Container, Stack, Typography, alpha, useTheme
} from '@mui/material';
import * as XLSX from "xlsx";
import axios from '../../../utils/axios';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';

function ExcelDownload({ data }) {
    const handleExportToExcel = () => {
        const exportData = data.map(item => ({
            'ID': item.ID,
            'Cliente ID': item.CLIENTEID,
            'Estado': item.ESTADO,
            'Fecha': item.FECHA,
            'Fecha Actualización': item.FECHAACTUALIZACION,
            'Fecha Creación': item.FECHACREACION,
            'Forma de Pago': item.FORMADEPAGO,
            'Guardado': item.GUARDADO,
            'Hora': item.HORA,
            'Latitud': item.LATITUD,
            'Longitud': item.LONGITUD,
            'Observaciones': item.OBSERVACIONES,
            'Online': item.ONLINE,
            'Subtotal': item.SUBTOTAL,
            'Total': item.TOTAL,
            'Total IVA': item.TOTALIVA,
            'Usuario Actualización': item.USUARIOAACTUALIZACION,
            'Vendedor': item.VENDEDOR,
            'Vendedor ID': item.VENDEDORID,
            'Local Cliente ID': item.LOCALCLIENTE_ID,
            'Empresa': item.EMPRESA,
            'Fecha Facturación': item.FECHAFACTURACION,
            'Número Factura E4': item.NUMEROFACTURAE4,
            'Número Factura Hipertronics': item.NUMEROFACTURAHIPERTRONICS,
            'Número Factura Lidenar': item.NUMEROFACTURALIDENAR,
            'Número Guía': item.NUMEROGUIA,
            'Observaciones B': item.OBSERVACIONESB,
            'Nota Cliente': item.NOTACLIENTE,
            'Usuario Aprobó': item.USUARIOAPROBO,
            'Plan Pagos Tomebamba ID': item.PLANPAGOSTOMEBAMBA_ID,
            'Aplicación Origen': item.APLICACIONORIGEN,
            'Comentario Entrega': item.COMENTARIOENTREGA,
            'Fecha Entrega': item.FECHAENTREGA,
            'Nombre Usuario Entrega': item.NOMBREUSUARIOENTREGA,
            'Usuario Entrega ID': item.USUARIOENTREGA_ID,
            'Fecha Entrega Solicitada': item.FECHAENTREGASOLICITADA,
            'ID Usuario Entregará': item.IDUSUARIOENTREGARA,
            'Nombre Usuario Entregará': item.NOMBREUSUARIOENTREGARA,
            'Courier': item.COURIER,
            'Usuario Entrega Bodega ID': item.USUARIOENTREGABODEGA_ID,
            'Bodega': item.BODEGA,
            'Pedido Categoría Propia': item.PEDIDOCATEGORIAPROPIA,
            'Imagen A': item.IMAGENA,
            'Imagen B': item.IMAGENB,
            'Imagen': item.IMAGEN,
            'Imagen Guía': item.IMAGENGUIA,
            'Fecha Aprobó': item.FECHAAPROBO,
            'DocNum': item.DOCNUM,
            'Fecha Impresión': item.FECHA_IMPRESION,
            'Observación Anulación': item.OBSERVACION_ANULACION,
            'Fecha Anulación': item.FECHA_ANULACION,
            'Usuario Anulación': item.USER_ANULACION,
            'Fecha Cambio Bodega': item.FECHA_CAMBIO_BODEGA,
            'Usuario Cambio Bodega': item.USER_CAMBIO_BODEGA,
            'URL Invoice Seller': item.URL_INVOICE_SELLER,
            'Descuento': item.DISCOUNT,
            'Cuenta Transferencia': item.CUENTA_TRANSFERENCIA,
            'Número Referencia': item.NUMERO_REFERENCIA,
            'Total Dólares Referencia': item.TOTAL_DOLARES_REFERENCIA,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Ajustar ancho de columnas automáticamente
        const columnWidths = Object.keys(exportData[0] || {}).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        ws['!cols'] = columnWidths;

        // Generar nombre de archivo con fecha y hora
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `Reporte_General_Ordenes_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, 'Órdenes');
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

export default function ReporteGeneralOrdenesView() {
    const theme = useTheme();
    const { user } = useAuthContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/hanadb/api/power_bi/reporte_general_ordenes', {
                params: {
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

    return (
        <Container maxWidth="xl">
            <Stack spacing={3}>
                {/* HEADER */}
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Reporte General de Órdenes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Genere y descargue el reporte completo de todas las órdenes en Excel
                    </Typography>
                </Box>

                {/* BOTÓN DE CONSULTA */}
                <Card sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderRadius: 3
                }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="eva:file-text-fill" width={24} />
                        Generar Reporte
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={fetchData}
                            disabled={loading}
                            startIcon={<Iconify icon="eva:download-fill" />}
                            sx={{ minWidth: 200, height: 56 }}
                        >
                            {loading ? 'Cargando...' : 'Generar Reporte'}
                        </Button>
                    </Stack>
                    {loading && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'warning.main' }}>
                            ⏳ Procesando... Esto puede tardar unos segundos
                        </Typography>
                    )}
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
                            ✅ {data.length} órdenes encontradas
                        </Typography>
                        <ExcelDownload data={data} />
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                            El archivo Excel incluirá todos los campos de las órdenes
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
                            Presiona 'Generar Reporte' para obtener todas las órdenes
                        </Typography>
                    </Card>
                )}
            </Stack>
        </Container>
    );
}
