import { useState } from 'react';
import {
  Box,
  Card,
  Paper,
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Chip,
  Alert,
  Stack,
  Divider,
  LinearProgress,
  Avatar,
  AvatarGroup,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Send as SendIcon,
  TrendingUp,
  TrendingDown,
  AccessTime,
  CheckCircleOutline,
  ErrorOutline,
  LocalShipping,
  Inventory,
  SwapHoriz,
  InsertChart,
} from '@mui/icons-material';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from '../../../auth/useAuthContext';

// ----------------------------------------------------------------------

// KPIs del dashboard
const DASHBOARD_KPIS = [
  {
    id: 'pendientes',
    title: 'Solicitudes Pendientes',
    value: '8',
    change: '+12%',
    trend: 'up',
    icon: AccessTime,
    color: '#FFA726',
    bgColor: 'rgba(255, 167, 38, 0.12)',
  },
  {
    id: 'en_proceso',
    title: 'En Proceso',
    value: '15',
    change: '+5%',
    trend: 'up',
    icon: LocalShipping,
    color: '#2065D1',
    bgColor: 'rgba(32, 101, 209, 0.12)',
  },
  {
    id: 'completadas',
    title: 'Completadas (7d)',
    value: '42',
    change: '+23%',
    trend: 'up',
    icon: CheckCircleOutline,
    color: '#00A76F',
    bgColor: 'rgba(0, 167, 111, 0.12)',
  },
  {
    id: 'total_items',
    title: 'Items Transferidos',
    value: '1,247',
    change: '+18%',
    trend: 'up',
    icon: Inventory,
    color: '#7635DC',
    bgColor: 'rgba(118, 53, 220, 0.12)',
  },
];

// Módulos de acción
const ACTION_MODULES = [
  {
    id: 'solicitar',
    title: 'Nueva Solicitud',
    description: 'Crear solicitud de transferencia',
    icon: SendIcon,
    color: '#2065D1',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'aprobar',
    title: 'Aprobar Solicitudes',
    description: 'Revisar y autorizar transferencias',
    icon: CheckCircleOutline,
    color: '#FFA726',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    badge: 2,
  },
  {
    id: 'cargar_series',
    title: 'Cargar Series',
    description: 'Registrar números de serie',
    icon: Inventory,
    color: '#7635DC',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    badge: 1,
  },
  {
    id: 'aceptar',
    title: 'Recibir Transferencia',
    description: 'Confirmar recepción de productos',
    icon: CheckCircleOutline,
    color: '#00A76F',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    badge: 1,
  },
];

const BODEGAS_LIDENAR = [
  { value: '019', label: '019 - LIDENAR CRM BODEGA 1' },
  { value: '002', label: '002 - LIDENAR CRM BODEGA 2' },
  { value: '006', label: '006 - LIDENAR CRM BODEGA 3' },
];

const BODEGAS_MOVILCELISTIC = [
  { value: 'DISTLF', label: 'DISTLF - MOVILCELISTIC BODEGA 1' },
  { value: '003', label: '003 - MOVILCELISTIC BODEGA 2' },
  { value: '004', label: '004 - MOVILCELISTIC BODEGA 3' },
];

// ----------------------------------------------------------------------

export default function GestionTransferenciasView() {
  const { themeStretch } = useSettingsContext();
  const { user } = useAuthContext();
  const theme = useTheme();

  const [selectedModule, setSelectedModule] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  
  // Estado para Solicitar Transferencia
  const [solicitudData, setSolicitudData] = useState({
    bodegaOrigen: '',
    bodegaDestino: '',
    observaciones: '',
    productos: [],
  });

  // Estado para productos en la solicitud
  const [productoActual, setProductoActual] = useState({
    codigo: '',
    descripcion: '',
    cantidad: '',
  });

  // Estado para Aprobar Transferencia
  const [transferenciasParaAprobar] = useState([
    {
      id: 'TRF-001',
      fecha: '2026-01-28',
      bodegaOrigen: '019',
      bodegaDestino: '002',
      solicitante: 'Juan Pérez',
      items: 5,
      estado: 'PENDIENTE',
    },
    {
      id: 'TRF-002',
      fecha: '2026-01-27',
      bodegaOrigen: '006',
      bodegaDestino: '019',
      solicitante: 'María García',
      items: 3,
      estado: 'PENDIENTE',
    },
  ]);

  // Estado para Cargar Series
  const [transferenciasParaSeries] = useState([
    {
      id: 'TRF-003',
      fecha: '2026-01-26',
      bodegaOrigen: '019',
      bodegaDestino: '002',
      producto: 'SAMSUNG GALAXY A54',
      cantidadRequerida: 10,
      seriesCargadas: 0,
      estado: 'APROBADA',
    },
  ]);

  const [seriesActual, setSeriesActual] = useState({
    transferencia: '',
    serie: '',
    series: [],
  });

  // Estado para Aceptar Transferencia
  const [transferenciasParaAceptar] = useState([
    {
      id: 'TRF-004',
      fecha: '2026-01-25',
      bodegaOrigen: '006',
      bodegaDestino: '019',
      productos: 8,
      seriesCompletas: true,
      estado: 'SERIES_CARGADAS',
    },
  ]);

  const bodegas = user?.EMPRESA === '0992537442001' ? BODEGAS_LIDENAR : BODEGAS_MOVILCELISTIC;

  // Handlers para navegación
  const handleSelectModule = (moduleId) => {
    setSelectedModule(moduleId);
    setShowDashboard(false);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setShowDashboard(true);
  };

  // Handlers para Solicitar Transferencia
  const handleAgregarProducto = () => {
    if (productoActual.codigo && productoActual.descripcion && productoActual.cantidad) {
      setSolicitudData({
        ...solicitudData,
        productos: [...solicitudData.productos, { ...productoActual, id: Date.now() }],
      });
      setProductoActual({ codigo: '', descripcion: '', cantidad: '' });
    }
  };

  const handleEliminarProducto = (id) => {
    setSolicitudData({
      ...solicitudData,
      productos: solicitudData.productos.filter((p) => p.id !== id),
    });
  };

  const handleEnviarSolicitud = () => {
    console.log('Enviando solicitud:', solicitudData);
    // Aquí se integraría con el backend
    alert('Solicitud de transferencia enviada correctamente');
  };

  // Handlers para Aprobar Transferencia
  const handleAprobarTransferencia = (id) => {
    console.log('Aprobando transferencia:', id);
    // Aquí se integraría con el backend
    alert(`Transferencia ${id} aprobada`);
  };

  const handleRechazarTransferencia = (id) => {
    console.log('Rechazando transferencia:', id);
    // Aquí se integraría con el backend
    alert(`Transferencia ${id} rechazada`);
  };

  // Handlers para Cargar Series
  const handleAgregarSerie = () => {
    if (seriesActual.serie && seriesActual.transferencia) {
      setSeriesActual({
        ...seriesActual,
        series: [...seriesActual.series, seriesActual.serie],
        serie: '',
      });
    }
  };

  const handleEliminarSerie = (index) => {
    setSeriesActual({
      ...seriesActual,
      series: seriesActual.series.filter((_, i) => i !== index),
    });
  };

  const handleGuardarSeries = () => {
    console.log('Guardando series:', seriesActual);
    // Aquí se integraría con el backend
    alert('Series guardadas correctamente');
  };

  // Handlers para Aceptar Transferencia
  const handleAceptarTransferencia = (id) => {
    console.log('Aceptando transferencia:', id);
    // Aquí se integraría con el backend
    alert(`Transferencia ${id} aceptada e ingresada al inventario`);
  };

  // Render del módulo seleccionado
  const renderModuleContent = () => {
    switch (selectedModule) {
      case 'solicitar':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Solicitar Nueva Transferencia
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Bodega Origen"
                  value={solicitudData.bodegaOrigen}
                  onChange={(e) => setSolicitudData({ ...solicitudData, bodegaOrigen: e.target.value })}
                >
                  {bodegas.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Bodega Destino"
                  value={solicitudData.bodegaDestino}
                  onChange={(e) => setSolicitudData({ ...solicitudData, bodegaDestino: e.target.value })}
                >
                  {bodegas.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones"
                  value={solicitudData.observaciones}
                  onChange={(e) => setSolicitudData({ ...solicitudData, observaciones: e.target.value })}
                />
              </Grid>

              {/* Agregar productos */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Productos a Transferir
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Código Producto"
                  value={productoActual.codigo}
                  onChange={(e) => setProductoActual({ ...productoActual, codigo: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Descripción"
                  value={productoActual.descripcion}
                  onChange={(e) => setProductoActual({ ...productoActual, descripcion: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  value={productoActual.cantidad}
                  onChange={(e) => setProductoActual({ ...productoActual, cantidad: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAgregarProducto}
                  sx={{ height: '56px' }}
                >
                  <AddIcon />
                </Button>
              </Grid>

              {/* Tabla de productos agregados */}
              {solicitudData.productos.length > 0 && (
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {solicitudData.productos.map((producto) => (
                          <TableRow key={producto.id}>
                            <TableCell>{producto.codigo}</TableCell>
                            <TableCell>{producto.descripcion}</TableCell>
                            <TableCell align="center">{producto.cantidad}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => handleEliminarProducto(producto.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={handleEnviarSolicitud}
                  disabled={!solicitudData.bodegaOrigen || !solicitudData.bodegaDestino || solicitudData.productos.length === 0}
                  size="large"
                >
                  Enviar Solicitud de Transferencia
                </Button>
              </Grid>
            </Grid>
          </Box>
        );

      case 'aprobar':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Aprobar Transferencias Pendientes
            </Typography>

            {transferenciasParaAprobar.length === 0 ? (
              <Alert severity="info">No hay transferencias pendientes de aprobación</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
           'aprobar'        <TableRow>
                      <TableCell>ID Transferencia</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Origen</TableCell>
                      <TableCell>Destino</TableCell>
                      <TableCell>Solicitante</TableCell>
                      <TableCell align="center">Items</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferenciasParaAprobar.map((transferencia) => (
                      <TableRow key={transferencia.id}>
                        <TableCell>{transferencia.id}</TableCell>
                        <TableCell>{transferencia.fecha}</TableCell>
                        <TableCell>{transferencia.bodegaOrigen}</TableCell>
                        <TableCell>{transferencia.bodegaDestino}</TableCell>
                        <TableCell>{transferencia.solicitante}</TableCell>
                        <TableCell align="center">{transferencia.items}</TableCell>
                        <TableCell align="center">
                          <Chip label={transferencia.estado} color="warning" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleAprobarTransferencia(transferencia.id)}
                            sx={{ mr: 1 }}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRechazarTransferencia(transferencia.id)}
                          >
                            Rechazar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      case 'cargar_series':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Cargar Series para Transferencias Aprobadas
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Seleccionar Transferencia"
                  value={seriesActual.transferencia}
                  onChange={(e) => setSeriesActual({ ...seriesActual, transferencia: e.target.value })}
                >
                  {transferenciasParaSeries.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {`${option.id} - ${option.producto} (${option.seriesCargadas}/${option.cantidadRequerida})`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {seriesActual.transferencia && (
                <>
                  <Grid item xs={12} md={10}>
                    <TextField
                      fullWidth
                      label="Número de Serie / IMEI"
                      value={seriesActual.serie}
                      onChange={(e) => setSeriesActual({ ...seriesActual, serie: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAgregarSerie();
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAgregarSerie}
                      sx={{ height: '56px' }}
                    >
                      <AddIcon />
                    </Button>
                  </Grid>

                  {seriesActual.series.length > 0 && (
                    <Grid item xs={12}>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Serie / IMEI</TableCell>
                              <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {seriesActual.series.map((serie, index) => (
                              <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{serie}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleEliminarSerie(index)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGuardarSeries}
                      disabled={seriesActual.series.length === 0}
                      size="large"
                    >
                      Guardar Series
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );

      case 'aceptar':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Aceptar Transferencias Completas
            </Typography>

            {transferenciasParaAceptar.length === 0 ? (
              <Alert severity="info">No hay transferencias listas para aceptar</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Transferencia</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Origen</TableCell>
                      <TableCell>Destino</TableCell>
                      <TableCell align="center">Productos</TableCell>
                      <TableCell align="center">Series</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferenciasParaAceptar.map((transferencia) => (
                      <TableRow key={transferencia.id}>
                        <TableCell>{transferencia.id}</TableCell>
                        <TableCell>{transferencia.fecha}</TableCell>
                        <TableCell>{transferencia.bodegaOrigen}</TableCell>
                        <TableCell>{transferencia.bodegaDestino}</TableCell>
                        <TableCell align="center">{transferencia.productos}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={transferencia.seriesCompletas ? 'Completas' : 'Incompletas'} 
                            color={transferencia.seriesCompletas ? 'success' : 'error'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={transferencia.estado} color="info" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleAceptarTransferencia(transferencia.id)}
                            disabled={!transferencia.seriesCompletas}
                          >
                            Aceptar e Ingresar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Gestión de Transferencias de Stock"
        links={[
          { name: 'Dashboard', href: PATH_DASHBOARD.root },
          { name: 'TEVCOL', href: PATH_DASHBOARD.tevcol.control_inventario },
          { name: 'Transferencias' },
        ]}
        action={
          !showDashboard && (
            <Button
              variant="outlined"
              onClick={handleBackToDashboard}
              startIcon={<InsertChart />}
            >
              Ver Dashboard
            </Button>
          )
        }
      />

      {showDashboard ? (
        <>
          {/* KPI Cards - Estilo Power BI */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {DASHBOARD_KPIS.map((kpi) => {
              const Icon = kpi.icon;
              const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
              
              return (
                <Grid key={kpi.id} item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.customShadows.z24,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: kpi.color,
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: kpi.bgColor,
                            color: kpi.color,
                          }}
                        >
                          <Icon sx={{ fontSize: 32 }} />
                        </Box>
                        
                        <Chip
                          icon={<TrendIcon />}
                          label={kpi.change}
                          size="small"
                          sx={{
                            bgcolor: kpi.trend === 'up' ? alpha(theme.palette.success.main, 0.16) : alpha(theme.palette.error.main, 0.16),
                            color: kpi.trend === 'up' ? theme.palette.success.dark : theme.palette.error.dark,
                            fontWeight: 700,
                            '& .MuiChip-icon': {
                              color: 'inherit',
                            },
                          }}
                        />
                      </Stack>

                      <Box>
                        <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 800 }}>
                          {kpi.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {kpi.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Action Modules - Estilo moderno con gradientes */}
          <Grid container spacing={3}>
            {ACTION_MODULES.map((module) => {
              const Icon = module.icon;
              
              return (
                <Grid key={module.id} item xs={12} sm={6} md={3}>
                  <Card
                    onClick={() => handleSelectModule(module.id)}
                    sx={{
                      height: 240,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(module.color, 0.3)}`,
                        '& .module-gradient': {
                          opacity: 1,
                        },
                        '& .module-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                      },
                    }}
                  >
                    {/* Gradient Background */}
                    <Box
                      className="module-gradient"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: module.gradient,
                        opacity: 0.15,
                        transition: 'opacity 0.4s',
                      }}
                    />

                    {/* Content */}
                    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        {/* Badge */}
                        {module.badge > 0 && (
                          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#FF4842',
                                fontSize: 14,
                                fontWeight: 700,
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%, 100%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.1)' },
                                },
                              }}
                            >
                              {module.badge}
                            </Avatar>
                          </Box>
                        )}

                        {/* Icon */}
                        <Box
                          className="module-icon"
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: module.gradient,
                            color: 'white',
                            transition: 'transform 0.4s',
                            boxShadow: `0 8px 16px ${alpha(module.color, 0.3)}`,
                          }}
                        >
                          <Icon sx={{ fontSize: 40 }} />
                        </Box>

                        {/* Text */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {module.description}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Arrow indicator */}
                      <Stack direction="row" justifyContent="flex-end">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(module.color, 0.16),
                            color: module.color,
                          }}
                        >
                          →
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Recent Activity - Timeline style */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">Actividad Reciente</Typography>
              <Button size="small">Ver Todo</Button>
            </Stack>
            
            <Stack spacing={2}>
              {transferenciasParaAprobar.slice(0, 3).map((item) => (
                <Paper
                  key={item.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#FFA726', 0.16), color: '#FFA726' }}>
                    <SwapHoriz />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{item.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.bodegaOrigen} → {item.bodegaDestino} • {item.items} items
                    </Typography>
                  </Box>
                  <Chip label={item.estado} color="warning" size="small" />
                  <Typography variant="caption" color="text.disabled">
                    {item.fecha}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Card>
        </>
      ) : (
        <Card sx={{ p: 3 }}>
          {renderModuleContent()}
        </Card>
      )}
    </Container>
  );
}
