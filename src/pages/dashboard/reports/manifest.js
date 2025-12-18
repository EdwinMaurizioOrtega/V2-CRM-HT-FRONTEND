import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
// @mui
import {
  Container,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
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
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
// components
import Iconify from '../../../components/iconify';
// layouts
import DashboardLayout from '../../../layouts/dashboard/DashboardLayout';
// axios
import axios from '../../../utils/axios';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';

// Mapeo de códigos de bodega a nombres
const WAREHOUSE_NAMES = {
  '019': 'CENTRO DE DISTRIBUCIÓN HT',
  '002': 'MAYORISTA CUENCA',
  '006': 'MAYORISTA QUITO',
  '030': 'MAYORISTA COLÓN',
  '024': 'MAYORISTA MANTA',
  '001': 'BODEGA ALPHACELL',
  'DISTLF': 'CENTRO DISTRIBUCIÓN MOVILCELISTIC',
  '003': 'MAYORISTAS MOVILCELISTIC MACHALA',
  '004': 'MAYORISTAS MOVILCELISTIC CUENCA',
  '005': 'OPERADORAS CARRIER',
  '008': 'BODEGA 008',
  'CARRIERS': 'CARRIERS',
  'EA': 'BODEGA EA',
};

const LIDENAR_WAREHOUSES = [
  { code: '019', name: 'CENTRO DE DISTRIBUCIÓN HT' },
  { code: '002', name: 'MAYORISTA CUENCA' },
  { code: '006', name: 'MAYORISTA QUITO' },
  { code: '030', name: 'MAYORISTA GUAYAQUIL' },
  { code: '024', name: 'MAYORISTA MANTA' },
  { code: '001', name: 'SAMSUNG CARACOL QUITO' },
  { code: '015', name: 'INACTIVA' },
  { code: '009', name: 'SAMSUNG BAHIA' },
  { code: '014', name: 'BODEGA COMBO' },
  { code: '011', name: 'SAMSUNG CUENCA' },
  { code: '016', name: 'SAMSUNG MALL GUAYAQUIL' },
  { code: '017', name: 'SAMSUNG MALL CUENCA' },
  { code: '020', name: 'SAMSUNG MANTA' },
  { code: '022', name: 'SAMSUNG PORTOVIEJO' },
  { code: '003', name: 'PADRE AGUIRRE' },
];

const MOVILCELISTIC_WAREHOUSES = [
  { code: 'DISTLF', name: 'CENTRO DISTRIBUCIÓN MOVILCELISTIC' },
  { code: '003', name: 'MAYORISTAS MOVILCELISTIC MACHALA' },
  { code: '004', name: 'MAYORISTAS MOVILCELISTIC CUENCA' },
  { code: 'T1CARACO', name: 'CARACOL XIAOMI TERMINALES' },
  { code: 'T1CUENCA', name: 'CUENCA XIAOMI TERMINALES' },
  { code: 'T1MACHAL', name: 'MACHALA XIAOMI TERMINALES' },
  { code: 'T3CARACO', name: 'CARACOL XIAOMI ACCESORIOS' },
  { code: 'T3CUENCA', name: 'CUENCA XIAOMI ACCESORIOS' },
  { code: 'T3MACHAL', name: 'MACHALA XIAOMI ACCESORIOS' },
  { code: 'T2CARACO', name: 'CARACOL XIAOMI ELECTRODOMESTICOS' },
  { code: 'T2CUENCA', name: 'CUENCA XIAOMI ELECTRODOMESTICOS' },
  { code: 'T2MACHAL', name: 'MACHALA XIAOMI ELECTRODOMESTICOS' },
  { code: '030', name: 'MAYORISTAS MOVILCELISTIC COLON' },
  { code: '024', name: 'MAYORISTAS MOVILCELISTIC MANTA' },
  { code: '020', name: 'MALL GUAYAQUIL' },
  { code: '021', name: 'MALL CUENCA' },
  { code: '005', name: 'OPERADORAS CARRIER' },
];

// Mapeo de RUC a nombres de empresa
const COMPANY_NAMES = {
  '0992537442001': 'LIDENAR',
  '1792161037001': 'MOVILCELISTIC',
};

// Estilos para impresión
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #print-area, #print-area * {
      visibility: visible;
    }
    #print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    @page {
      size: letter landscape;
      margin: 1cm;
    }
  }
`;

// ----------------------------------------------------------------------

ManifestPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ManifestPage() {
  const { user } = useAuthContext();
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterGuide, setFilterGuide] = useState('todos');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [manifestData, setManifestData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const printRef = useRef(null);

  const availableWarehouses = user.EMPRESA === '0992537442001' ? LIDENAR_WAREHOUSES : MOVILCELISTIC_WAREHOUSES;

  // Función para obtener los nombres de las bodegas
  const getWarehouseNames = () => {
    try {
      const warehouses = Array.isArray(user.WAREHOUSE) 
        ? user.WAREHOUSE 
        : JSON.parse(user.WAREHOUSE);
      
      return warehouses
        .map(code => WAREHOUSE_NAMES[code] || code)
        .join(', ');
    } catch (error) {
      return user.WAREHOUSE;
    }
  };

  // Función para obtener los datos del manifiesto
  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert('Por favor seleccione ambas fechas');
      return;
    }

    setLoading(true);
    try {
      // Formatear fechas en formato DD-MM-YYYY
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const fechaInicio = formatDate(startDate);
      const fechaFin = formatDate(endDate);

      let warehouseToSend;
      if (user.ROLE === '10') {
          if (selectedWarehouse === 'all') {
              warehouseToSend = JSON.stringify(availableWarehouses.map(w => w.code));
          } else {
              warehouseToSend = JSON.stringify([selectedWarehouse]);
          }
      } else {
          warehouseToSend = user.WAREHOUSE;
      }

      const response = await axios.get('/hanadb/api/orders/manifest', {
        params: {
          empresa: user.EMPRESA,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          warehouse: warehouseToSend,
          filter_guide: filterGuide,
        },
      });
      
      if (response.status === 200 && response.data.status === 'success') {
        if (response.data.data && response.data.data.length > 0) {
          setManifestData(response.data.data);
        } else {
          setManifestData([]);
          alert('No se encontraron datos para el rango de fechas seleccionado');
        }
      } else {
        alert('No se pudieron cargar los datos del manifiesto');
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      alert('Error al cargar los datos del manifiesto');
    } finally {
      setLoading(false);
    }
  };

  // Función para imprimir
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Manifiesto_${startDate?.toLocaleDateString()}_${endDate?.toLocaleDateString()}`,
  });

  // Calcular totales
  const totalGeneral = manifestData.reduce((sum, item) => sum + (item.SUBTOTAL || 0), 0);

  return (
    <>
      <style>{printStyles}</style>
      <Container maxWidth="xl">
      <Stack spacing={3} sx={{ mb: 3 }}>
        <Typography variant="h4">Imprimir Manifiesto</Typography>

        {/* Filtros de fecha */}
        <Card>
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <DatePicker
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={startDate}
                />
                <TextField
                  select
                  label="Filtro Guía"
                  value={filterGuide}
                  onChange={(e) => setFilterGuide(e.target.value)}
                  fullWidth
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="con_guia">Con Guía</MenuItem>
                  <MenuItem value="sin_guia">Sin Guía</MenuItem>
                </TextField>

                {user.ROLE === '10' && (
                  <TextField
                    select
                    label="Bodega"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    fullWidth
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="all">Todas</MenuItem>
                    {availableWarehouses.map((option) => (
                      <MenuItem key={option.code} value={option.code}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={<Iconify icon="eva:search-fill" />}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Cargando...' : 'Buscar'}
                </Button>
                {manifestData.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handlePrint}
                    startIcon={<Iconify icon="eva:printer-fill" />}
                    sx={{ minWidth: 150 }}
                  >
                    Imprimir
                  </Button>
                )}
              </Stack>
            </LocalizationProvider>
          </CardContent>
        </Card>

        {/* Vista previa del manifiesto */}
        {manifestData.length > 0 && (
          <Card>
            <CardContent id="print-area" ref={printRef}>
              <Box sx={{ p: 3 }}>
                {/* Encabezado */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h4" align="center">
                    MANIFIESTO DE GUÍAS
                  </Typography>
                  <Typography variant="subtitle1" align="center" color="text.secondary">
                    Del {startDate?.toLocaleDateString('es-ES')} al {endDate?.toLocaleDateString('es-ES')}
                  </Typography>
                  <Divider />
                </Stack>

                {/* Información del reporte */}
                <Box sx={{ mb: 2, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Empresa
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {COMPANY_NAMES[user.EMPRESA] || user.EMPRESA}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sucursal
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {user.ROLE === '10' 
                          ? (selectedWarehouse === 'all' ? 'TODAS' : availableWarehouses.find(w => w.code === selectedWarehouse)?.name || selectedWarehouse)
                          : getWarehouseNames()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Fecha de Impresión
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date().toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Usuario
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {user.DISPLAYNAME}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>


                {/* Tabla de datos */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Orden</strong></TableCell>
                        <TableCell><strong>Guía</strong></TableCell>
                        <TableCell><strong>Fecha</strong></TableCell>
                        <TableCell><strong>Cliente</strong></TableCell>
                        <TableCell><strong>Cantón</strong></TableCell>
                        <TableCell align="right"><strong>Valor Sin IVA</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {manifestData.map((row, index) => (
                        <TableRow key={`${row.ID}-${index}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.ID}</TableCell>
                          <TableCell>{row.NUMEROGUIA || '-'}</TableCell>
                          <TableCell>{row.FECHA}</TableCell>
                          <TableCell>{row.CLIENTE}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                const obj = JSON.parse(row.OBSERVACIONESB);
                                return `${obj.CANTON || obj.ciudad || ''}`;
                              } catch (e) {
                                return row.OBSERVACIONESB || '-';
                              }
                            })()}
                          </TableCell>
                          <TableCell align="right">${Number(row.SUBTOTAL).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell colSpan={6} align="right">
                          <strong>TOTAL GENERAL:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>${totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Firmas */}
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

                {/* Pie de página */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Impreso el: {new Date().toLocaleString('es-ES')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
    </>
  );
}