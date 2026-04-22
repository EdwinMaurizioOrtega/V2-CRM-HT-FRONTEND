import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReactToPrint } from 'react-to-print';
import {
    Stack,
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Link,
    TextField,
    Chip,
} from '@mui/material';
import Iconify from '../../../components/iconify';
import axios from '../../../utils/axios';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useWarehouseContext } from '../../../auth/useWarehouseContext';

const COMPANY_NAMES = {
    '0992537442001': 'LIDENAR',
    '1792161037001': 'MOVILCELISTIC',
};

const printStyles = `
  @media print {
    /* Ocultar todo y mostrar solo el área imprimible */
    body * {
      visibility: hidden;
    }
    #manifest-despacho-print, #manifest-despacho-print * {
      visibility: visible;
    }
    #manifest-despacho-print {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Configuración de página para tablets e impresoras */
    @page {
      size: A4 landscape;
      margin: 0.8cm;
    }

    /* Forzar colores exactos en impresión */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    /* Tabla compacta y legible */
    #manifest-despacho-print .MuiTable-root {
      width: 100% !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
      font-size: 9pt !important;
    }
    #manifest-despacho-print .MuiTableCell-root {
      padding: 3px 4px !important;
      border: 1px solid #bdbdbd !important;
      font-size: 9pt !important;
      line-height: 1.2 !important;
      word-break: break-word !important;
      white-space: normal !important;
    }
    #manifest-despacho-print .MuiTableHead-root .MuiTableCell-root {
      background-color: #f0f0f0 !important;
      font-weight: bold !important;
      font-size: 9pt !important;
    }

    /* Ocultar inputs (campo bultos) pero mostrar su valor via Chip */
    #manifest-despacho-print .MuiTextField-root,
    #manifest-despacho-print .MuiInputBase-root,
    #manifest-despacho-print input {
      display: none !important;
    }

    /* Asegurar que los Chip de bultos se vean */
    #manifest-despacho-print .MuiChip-root {
      border: 1px solid #1976d2 !important;
      background: transparent !important;
      color: #1976d2 !important;
      font-size: 8pt !important;
      height: auto !important;
      padding: 1px 4px !important;
    }

    /* Links como texto negro normal en impresión */
    #manifest-despacho-print a,
    #manifest-despacho-print button {
      color: #000 !important;
      text-decoration: none !important;
      font-weight: 600 !important;
    }

    /* Evitar que filas se corten entre páginas */
    #manifest-despacho-print tr {
      page-break-inside: avoid !important;
    }
    #manifest-despacho-print thead {
      display: table-header-group !important;
    }
    #manifest-despacho-print tfoot {
      display: table-footer-group !important;
    }
  }
`;

export default function ManifestDespachoView({ orders, user, onOrdersDispatched }) {
    const { push } = useRouter();
    const { getWarehouseName } = useWarehouseContext();
    const [selectedRows, setSelectedRows] = useState([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dispatching, setDispatching] = useState(false);
    const [dispatchResult, setDispatchResult] = useState(null);
    const [bultos, setBultos] = useState({});

    useEffect(() => {
        const initial = {};
        orders.forEach((order) => {
            if (order.BULTOS) {
                initial[order.ID] = String(order.BULTOS);
            }
        });
        setBultos(initial);
    }, [orders]);

    const handleBultosChange = (orderId, value) => {
        const num = value.replace(/[^0-9]/g, '');
        setBultos((prev) => ({ ...prev, [orderId]: num }));
    };

    const handleBultosBlur = async (orderId) => {
        const value = parseInt(bultos[orderId] || '0', 10);
        try {
            await axios.put('/hanadb/api/orders/order/change_bultos', {
                ID_ORDER: orderId,
                BULTOS: value,
                empresa: user.EMPRESA,
            });
        } catch (error) {
            console.error(`Error guardando bultos para orden ${orderId}:`, error);
        }
    };

    const printRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Manifiesto_Despacho_${new Date().toLocaleDateString('es-ES')}`,
    });

    // Selección de filas
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedRows(orders.map((_, index) => index));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (index) => {
        setSelectedRows((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const selectedData = selectedRows.length > 0
        ? selectedRows.sort((a, b) => a - b).map((i) => orders[i])
        : orders;

    const totalGeneral = selectedData.reduce((sum, item) => sum + (parseFloat(item.SUBTOTAL) || 0), 0);

    // Despachar órdenes seleccionadas
    const handleDespachar = async () => {
        setDispatching(true);
        setDispatchResult(null);

        const ordersToDispatch = selectedRows.sort((a, b) => a - b).map((i) => orders[i]);
        let success = 0;
        let failed = 0;

        for (const order of ordersToDispatch) {
            try {
                await axios.put('/hanadb/api/orders/order/despachar_orden', {
                    ID_ORDER: order.ID,
                    empresa: user.EMPRESA,
                    ID_USER: user.ID,
                });
                success++;
            } catch (error) {
                console.error(`Error despachando orden ${order.ID}:`, error);
                failed++;
            }
        }

        setDispatching(false);
        setOpenConfirm(false);
        setSelectedRows([]);
        setDispatchResult({ success, failed });

        if (success > 0 && onOrdersDispatched) {
            onOrdersDispatched();
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No hay órdenes pendientes de despachar.
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <style>{printStyles}</style>

            {/* Barra de acciones */}
            <Stack direction="row" spacing={2} sx={{ p: 2.5 }} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="subtitle1">
                        {selectedRows.length > 0
                            ? `${selectedRows.length} de ${orders.length} seleccionadas`
                            : `${orders.length} órdenes pendientes de despachar`}
                    </Typography>
                    <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                        Valor Sin IVA: ${totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="warning"
                        disabled={selectedRows.length === 0}
                        onClick={() => setOpenConfirm(true)}
                        startIcon={<Iconify icon="solar:delivery-bold" />}
                    >
                        Despachar Seleccionados ({selectedRows.length})
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handlePrint}
                        startIcon={<Iconify icon="eva:printer-fill" />}
                    >
                        Imprimir {selectedRows.length > 0 ? `(${selectedRows.length})` : '(Todo)'}
                    </Button>
                </Stack>
            </Stack>

            {dispatchResult && (
                <Box sx={{ px: 2.5, pb: 1 }}>
                    <Alert
                        severity={dispatchResult.failed > 0 ? 'warning' : 'success'}
                        onClose={() => setDispatchResult(null)}
                    >
                        {dispatchResult.success > 0 && `${dispatchResult.success} orden(es) despachada(s) exitosamente. `}
                        {dispatchResult.failed > 0 && `${dispatchResult.failed} orden(es) fallaron al despachar.`}
                    </Alert>
                </Box>
            )}

            {/* Área imprimible */}
            <Box id="manifest-despacho-print" ref={printRef} sx={{ px: 2.5, pb: 2.5 }}>
                {/* Encabezado (solo visible en impresión) */}
                <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="h4" align="center">
                            MANIFIESTO DE DESPACHO
                        </Typography>
                        <Typography variant="subtitle1" align="center" color="text.secondary">
                            {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                        <Divider />
                    </Stack>

                    <Box sx={{ mb: 2, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                        <Stack direction="row" spacing={2} justifyContent="space-between">
                            <Box>
                                <Typography variant="caption" color="text.secondary">Empresa</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {COMPANY_NAMES[user.EMPRESA] || user.EMPRESA}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Fecha de Impresión</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Usuario</Typography>
                                <Typography variant="body2" fontWeight="bold">{user.DISPLAYNAME}</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Box>

                {/* Tabla de datos */}
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ '@media print': { display: 'none' } }} padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < orders.length}
                                        checked={orders.length > 0 && selectedRows.length === orders.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell><strong>#</strong></TableCell>
                                <TableCell><strong>Orden</strong></TableCell>
                                <TableCell><strong>Bultos</strong></TableCell>
                                <TableCell><strong>Bodega</strong></TableCell>
                                <TableCell><strong>Transportista</strong></TableCell>
                                <TableCell><strong>Guía</strong></TableCell>
                                <TableCell><strong>Fecha</strong></TableCell>
                                <TableCell><strong>Cliente</strong></TableCell>
                                <TableCell><strong>Cantón</strong></TableCell>
                                <TableCell align="right"><strong>Valor Sin IVA</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((row, index) => (
                                <TableRow
                                    key={`${row.ID}-${index}`}
                                    selected={selectedRows.includes(index)}
                                    sx={{
                                        ...(selectedRows.length > 0 && !selectedRows.includes(index) && {
                                            '@media print': { display: 'none' },
                                        }),
                                    }}
                                >
                                    <TableCell sx={{ '@media print': { display: 'none' } }} padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.includes(index)}
                                            onChange={() => handleSelectRow(index)}
                                        />
                                    </TableCell>
                                    <TableCell>{selectedRows.length > 0 ? selectedRows.sort((a, b) => a - b).indexOf(index) + 1 : index + 1}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Link
                                                component="button"
                                                variant="body2"
                                                sx={{ cursor: 'pointer', fontWeight: 600 }}
                                                onClick={() => push(PATH_DASHBOARD.invoice.view(row.ID))}
                                            >
                                                {row.ID}
                                            </Link>
                                            {bultos[row.ID] && (
                                                <Chip label={`${bultos[row.ID]} bto(s)`} size="small" color="info" variant="outlined" />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 70 }}>
                                        <TextField
                                            size="small"
                                            value={bultos[row.ID] || ''}
                                            onChange={(e) => handleBultosChange(row.ID, e.target.value)}
                                            onBlur={() => handleBultosBlur(row.ID)}
                                            placeholder="0"
                                            inputProps={{ style: { textAlign: 'center', padding: '4px 8px' } }}
                                            sx={{ width: 60 }}
                                        />
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'none',
                                                '@media print': {
                                                    display: 'inline',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    width: '100%',
                                                },
                                            }}
                                        >
                                            {bultos[row.ID] || '-'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{getWarehouseName(row.BODEGA)}</TableCell>
                                    <TableCell>{row.TRANSPORTISTA || '-'}</TableCell>
                                    <TableCell>{row.NUMEROGUIA && row.NUMEROGUIA !== '000000000' ? row.NUMEROGUIA : '-'}</TableCell>
                                    <TableCell>{row.FECHACREACION}</TableCell>
                                    <TableCell>{row.Cliente}</TableCell>
                                    <TableCell>
                                        {(() => {
                                            try {
                                                const obj = JSON.parse(row.OBSERVACIONESB);
                                                return `${obj.CANTON || obj.ciudad || ''}`;
                                            } catch (e) {
                                                return row.Ciudad || '-';
                                            }
                                        })()}
                                    </TableCell>
                                    <TableCell align="right">
                                        ${(parseFloat(row.SUBTOTAL) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ '@media print': { display: 'none' } }} />
                                <TableCell colSpan={9} align="right">
                                    <strong>TOTAL {selectedRows.length > 0 ? `(${selectedRows.length} seleccionados)` : 'GENERAL'}:</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>${totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Firmas (solo visible en impresión) */}
                <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 10, px: 4 }}>
                        <Box sx={{ width: '40%', textAlign: 'center' }}>
                            <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                                <Typography variant="subtitle2">
                                    Elaborado por {COMPANY_NAMES[user.EMPRESA] || user.EMPRESA}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ width: '40%', textAlign: 'center' }}>
                            <Box sx={{ borderTop: '1px solid #000', pt: 1 }}>
                                <Typography variant="subtitle2">
                                    Recibido por Servientrega
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="caption" color="text.secondary">
                            Impreso el: {new Date().toLocaleString('es-ES')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Diálogo de confirmación */}
            <Dialog open={openConfirm} onClose={() => !dispatching && setOpenConfirm(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar Despacho</DialogTitle>
                <DialogContent>
                    {dispatching ? (
                        <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
                            <CircularProgress />
                            <Typography>Despachando órdenes...</Typography>
                        </Stack>
                    ) : (
                        <Typography sx={{ pt: 1 }}>
                            ¿Está seguro de despachar <strong>{selectedRows.length}</strong> orden(es) seleccionada(s)?
                            Las órdenes pasarán al siguiente estado correspondiente.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} disabled={dispatching}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleDespachar}
                        disabled={dispatching}
                    >
                        Confirmar Despacho
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
