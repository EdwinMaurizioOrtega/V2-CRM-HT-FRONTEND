import { useState, useEffect, Fragment } from 'react';
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
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
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
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useSettingsContext } from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useAuthContext } from '../../../auth/useAuthContext';
import { HOST_API_KEY } from '../../../config-global';

// ----------------------------------------------------------------------

// Mapeo de estados numéricos a nombres
const ESTADOS_MAP = {
  0: { nombre: 'PENDIENTE_APROBACION', label: 'Pendiente Aprobación', color: '#FFA726' },
  1: { nombre: 'PENDIENTE_CARGAR_SERIES', label: 'Pendiente Series', color: '#2065D1' },
  2: { nombre: 'PENDIENTE_RECEPCION', label: 'Pendiente Recepción', color: '#FFC107' },
  3: { nombre: 'COMPLETADA', label: 'Completada', color: '#00A76F' },
  4: { nombre: 'CANCELADA', label: 'Cancelada', color: '#637381' },
};

// Función helper para obtener info del estado
const getEstadoInfo = (estadoNumerico) => {
  return ESTADOS_MAP[estadoNumerico] || { nombre: 'DESCONOCIDO', label: 'Desconocido', color: '#637381' };
};

// Función helper para limpiar warehouse (puede venir como ["002", "004"] o "002")
// Limpia el valor SOLO para mostrarlo al usuario, el valor original se mantiene para el backend
const cleanWarehouse = (warehouse) => {
  if (!warehouse) return 'N/A';
  
  // Convertir a string si es necesario
  const warehouseStr = typeof warehouse === 'string' ? warehouse : String(warehouse);
  
  // Si es un string que parece JSON array, limpiarlo
  if (warehouseStr.startsWith('[')) {
    const cleaned = warehouseStr
      .replace(/[\[\]"']/g, '') // Quitar corchetes y comillas
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0) // Eliminar strings vacíos
      .join(', ');
    return cleaned || 'N/A';
  }
  
  return warehouseStr;
};

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
  },
  {
    id: 'cargar_series',
    title: 'Cargar Series',
    description: 'Registrar números de serie',
    icon: Inventory,
    color: '#7635DC',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'aceptar',
    title: 'Recibir Transferencia',
    description: 'Confirmar recepción de productos',
    icon: CheckCircleOutline,
    color: '#00A76F',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
];

const BODEGAS_LIDENAR = [
  { value: '019', label: '019 - CENTRO DE DISTRIBUCIÓN HT' },
  { value: '002', label: '002 - MAYORISTA CUENCA' },
  { value: '006', label: '006 - MAYORISTA QUITO' },
  { value: '030', label: '030 - MAYORISTA GUAYAQUIL' },
  { value: '024', label: '024 - MAYORISTA MANTA' },
  { value: '001', label: '001 - SAMSUNG CARACOL QUITO' },
  { value: '015', label: '015 - INACTIVA' },
  { value: '009', label: '009 - SAMSUNG BAHIA' },
  { value: '014', label: '014 - BODEGA COMBO' },
  { value: '011', label: '011 - SAMSUNG CUENCA' },
  { value: '016', label: '016 - SAMSUNG MALL GUAYAQUIL' },
  { value: '017', label: '017 - SAMSUNG MALL CUENCA' },
  { value: '020', label: '020 - SAMSUNG MANTA' },
  { value: '022', label: '022 - SAMSUNG PORTOVIEJO' },
  { value: '003', label: '003 - PADRE AGUIRRE' },
];

const BODEGAS_MOVILCELISTIC = [
  { value: 'DISTLF', label: 'DISTLF - CENTRO DISTRIBUCIÓN MOVILCELISTIC' },
  { value: '003', label: '003 - MAYORISTAS MOVILCELISTIC MACHALA' },
  { value: '004', label: '004 - MAYORISTAS MOVILCELISTIC CUENCA' },
  { value: 'T1CARACO', label: 'T1CARACO - CARACOL XIAOMI TERMINALES' },
  { value: 'T1CUENCA', label: 'T1CUENCA - CUENCA XIAOMI TERMINALES' },
  { value: 'T1MACHAL', label: 'T1MACHAL - MACHALA XIAOMI TERMINALES' },
  { value: 'T3CARACO', label: 'T3CARACO - CARACOL XIAOMI ACCESORIOS' },
  { value: 'T3CUENCA', label: 'T3CUENCA - CUENCA XIAOMI ACCESORIOS' },
  { value: 'T3MACHAL', label: 'T3MACHAL - MACHALA XIAOMI ACCESORIOS' },
  { value: 'T2CARACO', label: 'T2CARACO - CARACOL XIAOMI ELECTRODOMESTICOS' },
  { value: 'T2CUENCA', label: 'T2CUENCA - CUENCA XIAOMI ELECTRODOMESTICOS' },
  { value: 'T2MACHAL', label: 'T2MACHAL - MACHALA XIAOMI ELECTRODOMESTICOS' },
  { value: '030', label: '030 - MAYORISTAS MOVILCELISTIC COLON' },
  { value: '024', label: '024 - MAYORISTAS MOVILCELISTIC MANTA' },
  { value: '020', label: '020 - MALL GUAYAQUIL' },
  { value: '021', label: '021 - MALL CUENCA' },
  { value: '005', label: '005 - OPERADORAS CARRIER' },
];

// ----------------------------------------------------------------------

export default function GestionTransferenciaBodegasView() {
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
    cantidadDisponible: 0,
    producto: null,
  });

  // Estado para productos disponibles desde la bodega de origen
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Estado para Aprobar Transferencia
  const [transferenciasParaAprobar, setTransferenciasParaAprobar] = useState([]);
  const [loadingAprobar, setLoadingAprobar] = useState(false);

  // Estado para Cargar Series
  const [transferenciasParaSeries, setTransferenciasParaSeries] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [productosTransferencia, setProductosTransferencia] = useState([]);
  const [loadingProductosTransferencia, setLoadingProductosTransferencia] = useState(false);

  const [seriesActual, setSeriesActual] = useState({
    transferencia: '',
    producto_id: null,
    item_code: '',
    item_name: '',
    serie: '',
    series: [],
  });

  // Estados para carga masiva de series
  const [openCargaMasiva, setOpenCargaMasiva] = useState(false);
  const [seriesText, setSeriesText] = useState('');
  const [textArrayCount, setTextArrayCount] = useState(0);
  const [validSeriesCount, setValidSeriesCount] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Estado para Aceptar Transferencia
  const [transferenciasParaAceptar, setTransferenciasParaAceptar] = useState([]);
  const [loadingAceptar, setLoadingAceptar] = useState(false);
  const [procesandoTransferencia, setProcesandoTransferencia] = useState(null); // ID de la transferencia en proceso

  // Estado para transferencias del usuario actual
  const [transferenciasUsuario, setTransferenciasUsuario] = useState([]);
  const [loadingTransferencias, setLoadingTransferencias] = useState(false);

  // Estado para el modal de detalle
  const [modalDetalle, setModalDetalle] = useState({
    open: false,
    transferencia: null,
    productos: [],
    series: {}, // Series agrupadas por producto ID
    loading: false,
    loadingSeries: false,
    editMode: false,
    productosEditados: [],
    expandedProduct: null, // ID del producto con series expandidas
    // Nuevos estados para agregar/eliminar productos
    productosDisponibles: [],
    loadingProductosDisponibles: false,
    productoActual: {
      codigo: '',
      descripcion: '',
      cantidad: '',
      cantidadDisponible: 0,
      producto: null,
    },
    productosNuevos: [], // Productos agregados
    productosEliminados: [], // IDs de productos a eliminar
  });

  const bodegas = user?.EMPRESA === '0992537442001' ? BODEGAS_LIDENAR : BODEGAS_MOVILCELISTIC;

  // Filtrar módulos según el rol del usuario
  const getVisibleModules = () => {
    if (!user?.ROLE) return ACTION_MODULES;

    // ROLE 8 (Bodega): Puede crear solicitudes, cargar series y recibir transferencias
    if (user.ROLE === '8') {
      return ACTION_MODULES.filter(module => 
        module.id === 'solicitar' || module.id === 'cargar_series' || module.id === 'aceptar'
      );
    }

    // ROLE 9 (Crédito): Solo puede aprobar o rechazar solicitudes
    if (user.ROLE === '9') {
      return ACTION_MODULES.filter(module => 
        module.id === 'aprobar'
      );
    }

    // ROLE 10 (Admin) u otros: Acceso a todos los módulos
    return ACTION_MODULES;
  };

  const visibleModules = getVisibleModules();

  // Función helper para normalizar warehouse para comparaciones
  const normalizeWarehouse = (warehouse) => {
    if (!warehouse) return '';
    // Si es un array, tomar el primer elemento
    if (Array.isArray(warehouse)) {
      return warehouse[0] || '';
    }
    // Si es un string que parece un array, parsearlo
    if (typeof warehouse === 'string' && warehouse.startsWith('[')) {
      try {
        const parsed = JSON.parse(warehouse);
        return Array.isArray(parsed) ? (parsed[0] || '') : warehouse;
      } catch (e) {
        return warehouse;
      }
    }
    return warehouse;
  };

  // Función para calcular contadores de cada módulo
  const getModuleCounters = () => {
    const counters = {
      aprobar: 0,
      cargar_series: 0,
      aceptar: 0,
    };

    if (!transferenciasUsuario || transferenciasUsuario.length === 0) {
      return counters;
    }

    const userWarehouse = normalizeWarehouse(user?.WAREHOUSE);

    transferenciasUsuario.forEach(transferencia => {
      switch (transferencia.ESTADO) {
        case 0: // PENDIENTE_APROBACION
          counters.aprobar++;
          break;
        case 1: // PENDIENTE_CARGAR_SERIES
          // Solo contar si es de la bodega del usuario (bodega origen)
          if (userWarehouse && normalizeWarehouse(transferencia.BODEGA_ORIGEN) === userWarehouse) {
            counters.cargar_series++;
          }
          break;
        case 2: // PENDIENTE_RECEPCION
          // Solo contar si es de la bodega del usuario (bodega destino)
          if (userWarehouse && normalizeWarehouse(transferencia.BODEGA_DESTINO) === userWarehouse) {
            counters.aceptar++;
          }
          break;
        default:
          break;
      }
    });

    return counters;
  };

  const moduleCounters = getModuleCounters();

  // Función para cargar productos por bodega
  const fetchProductosPorBodega = async (bodegaOrigen, bodegaDestino) => {
    if (!bodegaOrigen || !bodegaDestino || !user?.EMPRESA) return;
    
    setLoadingProductos(true);
    try {
      const response = await fetch(
        `${HOST_API_KEY}/warehouse/products?empresa=${user.EMPRESA}&bodega_origen=${bodegaOrigen}&bodega_destino=${bodegaDestino}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setProductosDisponibles(data);
      } else {
        console.error('Error al cargar productos:', response.statusText);
        setProductosDisponibles([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setProductosDisponibles([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Función para cargar transferencias del usuario actual
  const fetchTransferenciasUsuario = async () => {
    if (!user?.EMPRESA) return;
    
    setLoadingTransferencias(true);
    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias?empresa=${user.EMPRESA}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTransferenciasUsuario(data);
      } else {
        console.error('Error al cargar transferencias:', response.statusText);
        setTransferenciasUsuario([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setTransferenciasUsuario([]);
    } finally {
      setLoadingTransferencias(false);
    }
  };

  // Cargar transferencias al montar el componente
  useEffect(() => {
    if (user?.EMPRESA) {
      fetchTransferenciasUsuario();
    }
  }, [user?.EMPRESA]);

  // Función para ver detalle de una transferencia
  const handleVerDetalle = async (transferencia) => {
    setModalDetalle({
      open: true,
      transferencia,
      productos: [],
      series: {},
      loading: true,
      loadingSeries: false,
      expandedProduct: null,
      editMode: false,
      productosEditados: [],
      productosDisponibles: [],
      loadingProductosDisponibles: false,
      productoActual: {
        codigo: '',
        descripcion: '',
        cantidad: '',
        cantidadDisponible: 0,
        producto: null,
      },
      productosNuevos: [],
      productosEliminados: [],
    });

    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${transferencia.ID}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setModalDetalle(prev => ({
          ...prev,
          productos: data.productos || [],
          loading: false,
        }));

        // Si el estado es >= 1 (PENDIENTE_CARGAR_SERIES o mayor), cargar las series
        if (transferencia.ESTADO >= 1) {
          handleCargarSeries(transferencia.ID);
        }
      } else {
        console.error('Error al cargar detalle:', response.statusText);
        setModalDetalle(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setModalDetalle(prev => ({ ...prev, loading: false }));
    }
  };

  // Función para cargar series de una transferencia
  const handleCargarSeries = async (transferenciaId) => {
    setModalDetalle(prev => ({ ...prev, loadingSeries: true }));

    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${transferenciaId}/series`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Agrupar series por DETALLE_ID (producto)
        const seriesAgrupadas = {};
        if (data.series && Array.isArray(data.series)) {
          data.series.forEach(serie => {
            if (!seriesAgrupadas[serie.DETALLE_ID]) {
              seriesAgrupadas[serie.DETALLE_ID] = [];
            }
            seriesAgrupadas[serie.DETALLE_ID].push(serie);
          });
        }

        setModalDetalle(prev => ({
          ...prev,
          series: seriesAgrupadas,
          loadingSeries: false,
        }));
      } else {
        console.error('Error al cargar series:', response.statusText);
        setModalDetalle(prev => ({ ...prev, loadingSeries: false }));
      }
    } catch (error) {
      console.error('Error al cargar series:', error);
      setModalDetalle(prev => ({ ...prev, loadingSeries: false }));
    }
  };

  // Función para expandir/contraer series de un producto
  const handleToggleSeriesProducto = (productoId) => {
    setModalDetalle(prev => ({
      ...prev,
      expandedProduct: prev.expandedProduct === productoId ? null : productoId,
    }));
  };

  // Función para cerrar el modal
  const handleCerrarDetalle = () => {
    setModalDetalle({
      open: false,
      transferencia: null,
      productos: [],
      series: {},
      loading: false,
      loadingSeries: false,
      editMode: false,
      productosEditados: [],
      expandedProduct: null,
      productosDisponibles: [],
      loadingProductosDisponibles: false,
      productoActual: {
        codigo: '',
        descripcion: '',
        cantidad: '',
        cantidadDisponible: 0,
        producto: null,
      },
      productosNuevos: [],
      productosEliminados: [],
    });
  };

  // Función para activar modo edición
  const handleActivarEdicion = async () => {
    setModalDetalle(prev => ({
      ...prev,
      editMode: true,
      productosEditados: prev.productos.map(p => ({
        ...p,
        CANTIDAD_EDITADA: p.CANTIDAD_SOLICITADA,
      })),
      loadingProductosDisponibles: true,
    }));

    // Cargar productos disponibles de la bodega origen
    if (modalDetalle.transferencia?.BODEGA_ORIGEN && user?.EMPRESA) {
      try {
        const response = await fetch(
          `${HOST_API_KEY}/warehouse/products?empresa=${user.EMPRESA}&bodega=${modalDetalle.transferencia.BODEGA_ORIGEN}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setModalDetalle(prev => ({
            ...prev,
            productosDisponibles: data,
            loadingProductosDisponibles: false,
          }));
        } else {
          console.error('Error al cargar productos:', response.statusText);
          setModalDetalle(prev => ({
            ...prev,
            productosDisponibles: [],
            loadingProductosDisponibles: false,
          }));
        }
      } catch (error) {
        console.error('Error en la petición:', error);
        setModalDetalle(prev => ({
          ...prev,
          productosDisponibles: [],
          loadingProductosDisponibles: false,
        }));
      }
    }
  };

  // Función para cancelar edición
  const handleCancelarEdicion = () => {
    setModalDetalle(prev => ({
      ...prev,
      editMode: false,
      productosEditados: [],
      productosDisponibles: [],
      productoActual: {
        codigo: '',
        descripcion: '',
        cantidad: '',
        cantidadDisponible: 0,
        producto: null,
      },
      productosNuevos: [],
      productosEliminados: [],
    }));
  };

  // Función para cambiar cantidad editada
  const handleCambiarCantidad = (index, nuevaCantidad) => {
    setModalDetalle(prev => ({
      ...prev,
      productosEditados: prev.productosEditados.map((producto, i) => 
        i === index ? { ...producto, CANTIDAD_EDITADA: nuevaCantidad } : producto
      ),
    }));
  };

  // Función para agregar nuevo producto en el modal (con guardado inmediato)
  const handleAgregarProductoModal = async () => {
    if (!modalDetalle.productoActual.codigo || 
        !modalDetalle.productoActual.descripcion || 
        !modalDetalle.productoActual.cantidad) {
      alert('❌ Por favor complete todos los campos del producto');
      return;
    }
    
    // Validar cantidad disponible
    const cantidad = parseInt(modalDetalle.productoActual.cantidad, 10);
    if (modalDetalle.productoActual.cantidadDisponible && 
        cantidad > modalDetalle.productoActual.cantidadDisponible) {
      alert(`❌ La cantidad solicitada (${cantidad}) excede la cantidad disponible (${modalDetalle.productoActual.cantidadDisponible})`);
      return;
    }

    // Verificar que no exista ya en productos editados
    const yaExiste = modalDetalle.productosEditados.some(
      p => p.ITEM_CODE === modalDetalle.productoActual.codigo
    );
    
    if (yaExiste) {
      alert('❌ Este producto ya está en la lista');
      return;
    }

    if (!window.confirm(`¿Desea agregar el producto ${modalDetalle.productoActual.codigo} con cantidad ${cantidad}?`)) {
      return;
    }

    try {
      // Agregar el producto inmediatamente al backend
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${modalDetalle.transferencia.ID}/productos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productos_nuevos: [{
              codigo: modalDetalle.productoActual.codigo,
              descripcion: modalDetalle.productoActual.descripcion,
              cantidad: cantidad,
            }],
            actualizado_por_id: user.ID,
            actualizado_por_nombre: user.DISPLAYNAME,
          })
        }
      );

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { success: false, message: responseText };
      }

      if (response.ok && result.success) {
        alert(`✅ ${result.message || 'Producto agregado exitosamente'}`);
        
        // Recargar el detalle para ver el producto agregado
        handleVerDetalle(modalDetalle.transferencia);
        
        // Actualizar listas
        fetchTransferenciasParaAprobar();
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error al agregar producto: ${result.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message}`);
    }
  };

  // Función para marcar producto para eliminar
  const handleMarcarParaEliminar = (producto, index) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el producto ${producto.ITEM_CODE}?`)) {
      return;
    }

    setModalDetalle(prev => {
      // Si es un producto nuevo (sin ID), solo quitarlo de las listas
      if (producto.ES_NUEVO) {
        return {
          ...prev,
          productosEditados: prev.productosEditados.filter((_, i) => i !== index),
          productosNuevos: prev.productosNuevos.filter(p => p.tempId !== producto.tempId),
        };
      }

      // Si es un producto existente, marcarlo para eliminar
      return {
        ...prev,
        productosEditados: prev.productosEditados.filter((_, i) => i !== index),
        productosEliminados: [...prev.productosEliminados, producto.ID],
      };
    });
  };

  // Función para guardar cantidades editadas, productos nuevos y eliminados
  const handleGuardarCantidades = async () => {
    if (!modalDetalle.transferencia?.ID) return;

    // Validar que todas las cantidades sean válidas
    const cantidadesInvalidas = modalDetalle.productosEditados.some(
      p => !p.CANTIDAD_EDITADA || parseInt(p.CANTIDAD_EDITADA) <= 0
    );

    if (cantidadesInvalidas) {
      alert('❌ Por favor ingrese cantidades válidas para todos los productos');
      return;
    }

    // Validar que quede al menos un producto
    if (modalDetalle.productosEditados.length === 0 && modalDetalle.productosEliminados.length > 0) {
      alert('❌ La transferencia debe tener al menos un producto');
      return;
    }

    // Preparar resumen de cambios
    const productosActualizados = modalDetalle.productosEditados
      .filter(p => !p.ES_NUEVO && p.ID && p.CANTIDAD_EDITADA !== p.CANTIDAD_SOLICITADA)
      .map(p => ({
        id: p.ID,
        cantidad: parseInt(p.CANTIDAD_EDITADA),
      }));

    const hayActualizaciones = productosActualizados.length > 0;
    const hayNuevos = modalDetalle.productosNuevos.length > 0;
    const hayEliminados = modalDetalle.productosEliminados.length > 0;

    if (!hayActualizaciones && !hayNuevos && !hayEliminados) {
      alert('ℹ️ No hay cambios para guardar');
      return;
    }

    // Mensaje de confirmación
    let mensajeConfirmacion = '¿Está seguro que desea guardar los cambios?\n\n';
    if (hayActualizaciones) {
      mensajeConfirmacion += `📝 Se actualizarán ${productosActualizados.length} cantidade(s)\n`;
    }
    if (hayNuevos) {
      mensajeConfirmacion += `✅ Se agregarán ${modalDetalle.productosNuevos.length} producto(s) nuevo(s)\n`;
    }
    if (hayEliminados) {
      mensajeConfirmacion += `❌ Se eliminarán ${modalDetalle.productosEliminados.length} producto(s)\n`;
    }

    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }

    try {
      let errores = [];
      let exitosos = [];

      // 1. Actualizar cantidades de productos existentes
      if (hayActualizaciones) {
        const requestBody = {
          productos: productosActualizados,
          actualizado_por_id: user.ID,
          actualizado_por_nombre: user.DISPLAYNAME,
        };

        console.log('📤 Actualizando cantidades:', requestBody);

        const response = await fetch(
          `${HOST_API_KEY}/transferencias/${modalDetalle.transferencia.ID}/cantidades`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Error al actualizar cantidades: ${responseText}`);
        }

        if (response.ok && result.success) {
          exitosos.push(result.message);
        } else {
          errores.push(result.message || 'Error al actualizar cantidades');
        }
      }

      // 2. Agregar productos nuevos
      if (hayNuevos) {
        const requestBody = {
          productos_nuevos: modalDetalle.productosNuevos.map(p => ({
            codigo: p.ITEM_CODE,
            descripcion: p.ITEM_NAME,
            cantidad: parseInt(p.CANTIDAD_EDITADA),
          })),
          actualizado_por_id: user.ID,
          actualizado_por_nombre: user.DISPLAYNAME,
        };

        console.log('📤 Agregando productos:', requestBody);

        const response = await fetch(
          `${HOST_API_KEY}/transferencias/${modalDetalle.transferencia.ID}/productos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Error al agregar productos: ${responseText}`);
        }

        if (response.ok && result.success) {
          exitosos.push(result.message);
        } else {
          errores.push(result.message || 'Error al agregar productos');
        }
      }

      // 3. Eliminar productos
      if (hayEliminados) {
        const requestBody = {
          productos_ids: modalDetalle.productosEliminados,
          actualizado_por_id: user.ID,
          actualizado_por_nombre: user.DISPLAYNAME,
        };

        console.log('📤 Eliminando productos:', requestBody);

        const response = await fetch(
          `${HOST_API_KEY}/transferencias/${modalDetalle.transferencia.ID}/productos`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Error al eliminar productos: ${responseText}`);
        }

        if (response.ok && result.success) {
          exitosos.push(result.message);
        } else {
          errores.push(result.message || 'Error al eliminar productos');
        }
      }

      // Mostrar resultado final
      if (errores.length > 0) {
        alert(`⚠️ Operación completada con errores:\n\n${exitosos.join('\n')}\n\n❌ Errores:\n${errores.join('\n')}`);
      } else {
        alert(`✅ Todos los cambios se guardaron exitosamente:\n\n${exitosos.join('\n')}`);
      }

      // Recargar el detalle
      handleVerDetalle(modalDetalle.transferencia);
      // Actualizar listas
      fetchTransferenciasParaAprobar();
      fetchTransferenciasUsuario();
    } catch (error) {
      console.error('❌ Error al guardar cambios:', error);
      alert(`❌ Error al conectar con el servidor: ${error.message}`);
    }
  };

  // Función para cargar transferencias pendientes de aprobación
  const fetchTransferenciasParaAprobar = async () => {
    if (!user?.EMPRESA) return;
    
    setLoadingAprobar(true);
    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias?empresa=${user.EMPRESA}&estado=0`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTransferenciasParaAprobar(data);
      } else {
        console.error('Error al cargar transferencias para aprobar:', response.statusText);
        setTransferenciasParaAprobar([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setTransferenciasParaAprobar([]);
    } finally {
      setLoadingAprobar(false);
    }
  };

  // Función para cargar transferencias pendientes de cargar series
  const fetchTransferenciasParaSeries = async () => {
    if (!user?.EMPRESA || !user?.WAREHOUSE) return;
    
    // Verificar que el usuario tenga role 8 (Bodega)
    if (user.ROLE !== '8') {
      console.log('Usuario no tiene permisos para cargar series (requiere ROLE 8)');
      return;
    }
    
    setLoadingSeries(true);
    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias?empresa=${user.EMPRESA}&estado=1&bodega_origen=${user.WAREHOUSE}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTransferenciasParaSeries(data);
      } else {
        console.error('Error al cargar transferencias para series:', response.statusText);
        setTransferenciasParaSeries([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setTransferenciasParaSeries([]);
    } finally {
      setLoadingSeries(false);
    }
  };

  // Función para cargar productos de una transferencia seleccionada
  const fetchProductosTransferencia = async (transferenciaId) => {
    if (!transferenciaId) return;
    
    setLoadingProductosTransferencia(true);
    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${transferenciaId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Respuesta completa del servidor:', data);
        console.log('📦 Productos recibidos:', data.productos);
        setProductosTransferencia(data.productos || []);
      } else {
        console.error('Error al cargar productos de transferencia:', response.statusText);
        setProductosTransferencia([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setProductosTransferencia([]);
    } finally {
      setLoadingProductosTransferencia(false);
    }
  };

  // Función para cargar transferencias pendientes de aceptar/recibir
  const fetchTransferenciasParaRecibir = async () => {
    if (!user?.EMPRESA || !user?.WAREHOUSE) return;
    
    // Verificar que el usuario tenga role 8 (Bodega)
    if (user.ROLE !== '8') {
      console.log('Usuario no tiene permisos para recibir transferencias (requiere ROLE 8)');
      return;
    }
    
    setLoadingAceptar(true);
    try {
      // Estado 2 (PENDIENTE_RECEPCION) está lista para recibir
      const response = await fetch(
        `${HOST_API_KEY}/transferencias?empresa=${user.EMPRESA}&estado=2&bodega_destino=${user.WAREHOUSE}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTransferenciasParaAceptar(data);
      } else {
        console.error('Error al cargar transferencias para recibir:', response.statusText);
        setTransferenciasParaAceptar([]);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      setTransferenciasParaAceptar([]);
    } finally {
      setLoadingAceptar(false);
    }
  };

  // Handlers para navegación
  const handleSelectModule = (moduleId) => {
    setSelectedModule(moduleId);
    setShowDashboard(false);
    
    // Cargar datos según el módulo seleccionado
    if (moduleId === 'aprobar') {
      fetchTransferenciasParaAprobar();
    } else if (moduleId === 'cargar_series') {
      fetchTransferenciasParaSeries();
    } else if (moduleId === 'aceptar') {
      fetchTransferenciasParaRecibir();
    }
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setShowDashboard(true);
  };

  // Handler para cambio de bodega origen
  const handleBodegaOrigenChange = (bodega) => {
    setSolicitudData(prev => {
      const updated = { ...prev, bodegaOrigen: bodega };
      if (bodega && updated.bodegaDestino) {
        fetchProductosPorBodega(bodega, updated.bodegaDestino);
      }
      return updated;
    });
  };

  // Handler para cambio de bodega destino
  const handleBodegaDestinoChange = (bodega) => {
    setSolicitudData(prev => {
      const updated = { ...prev, bodegaDestino: bodega };
      if (updated.bodegaOrigen && bodega) {
        fetchProductosPorBodega(updated.bodegaOrigen, bodega);
      }
      return updated;
    });
  };

  // Handlers para Solicitar Transferencia
  const handleAgregarProducto = () => {
    if (productoActual.codigo && productoActual.descripcion && productoActual.cantidad) {
      // Validar cantidad disponible
      const cantidad = parseInt(productoActual.cantidad, 10);
      if (productoActual.cantidadDisponible && cantidad > productoActual.cantidadDisponible) {
        alert(`La cantidad solicitada (${cantidad}) excede la cantidad disponible (${productoActual.cantidadDisponible})`);
        return;
      }

      setSolicitudData({
        ...solicitudData,
        productos: [...solicitudData.productos, { ...productoActual, id: Date.now() }],
      });
      setProductoActual({ 
        codigo: '', 
        descripcion: '', 
        cantidad: '', 
        cantidadDisponible: 0, 
        producto: null 
      });
    }
  };

  const handleEliminarProducto = (id) => {
    setSolicitudData({
      ...solicitudData,
      productos: solicitudData.productos.filter((p) => p.id !== id),
    });
  };

  const handleEnviarSolicitud = async () => {
    if (!solicitudData.bodegaOrigen || !solicitudData.bodegaDestino) {
      alert('Por favor seleccione las bodegas de origen y destino');
      return;
    }

    if (solicitudData.productos.length === 0) {
      alert('Por favor agregue al menos un producto a la solicitud');
      return;
    }

    if (solicitudData.bodegaOrigen === solicitudData.bodegaDestino) {
      alert('La bodega de origen y destino no pueden ser la misma');
      return;
    }

    try {
      const requestData = {
        empresa: user.EMPRESA,
        bodega_origen: solicitudData.bodegaOrigen,
        bodega_destino: solicitudData.bodegaDestino,
        observaciones: solicitudData.observaciones || '',
        solicitante_id: user.ID,
        solicitante_nombre: user.DISPLAYNAME,
        productos: solicitudData.productos.map(p => ({
          codigo: p.codigo,
          descripcion: p.descripcion,
          cantidad: parseInt(p.cantidad, 10)
        }))
      };

      console.log('Enviando solicitud:', requestData);

      const response = await fetch(`${HOST_API_KEY}/transferencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ ${result.message}`);
        // Limpiar formulario
        setSolicitudData({
          bodegaOrigen: '',
          bodegaDestino: '',
          observaciones: '',
          productos: [],
        });
        setProductosDisponibles([]);
        // Recargar lista de transferencias
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error: ${result.message || 'No se pudo crear la solicitud'}`);
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('❌ Error al conectar con el servidor. Por favor intente nuevamente.');
    }
  };

  // Handlers para Aprobar Transferencia
  const handleAprobarTransferencia = async (id) => {
    if (!window.confirm('¿Está seguro que desea aprobar esta transferencia?')) {
      return;
    }

    try {
      const response = await fetch(`${HOST_API_KEY}/transferencias/${id}/aprobar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aprobador_id: user.ID,
          aprobador_nombre: user.DISPLAYNAME,
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ ${result.message}`);
        // Recargar lista de transferencias para aprobar
        fetchTransferenciasParaAprobar();
        // Actualizar lista general también
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error: ${result.message || 'No se pudo aprobar la transferencia'}`);
      }
    } catch (error) {
      console.error('Error al aprobar transferencia:', error);
      alert('❌ Error al conectar con el servidor');
    }
  };

  const handleRechazarTransferencia = async (id) => {
    if (!window.confirm('¿Está seguro que desea rechazar esta transferencia?')) {
      return;
    }

    try {
      const response = await fetch(`${HOST_API_KEY}/transferencias/${id}/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aprobador_id: user.ID,
          aprobador_nombre: user.DISPLAYNAME,
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ ${result.message}`);
        // Recargar lista de transferencias para aprobar
        fetchTransferenciasParaAprobar();
        // Actualizar lista general también
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error: ${result.message || 'No se pudo rechazar la transferencia'}`);
      }
    } catch (error) {
      console.error('Error al rechazar transferencia:', error);
      alert('❌ Error al conectar con el servidor');
    }
  };

  // Funciones de validación Luhn para IMEIs
  const luhn_validate = (fullcode) => {
    return luhn_checksum(fullcode) === 0;
  };

  const luhn_checksum = (code) => {
    const len = code.length;
    const parity = len % 2;
    let sum = 0;
    for (let i = len - 1; i >= 0; i--) {
      let d = parseInt(code.charAt(i));
      if (i % 2 === parity) {
        d *= 2;
      }
      if (d > 9) {
        d -= 9;
      }
      sum += d;
    }
    return sum % 10;
  };

  // Handlers para carga masiva
  const handleOpenCargaMasiva = () => {
    setOpenCargaMasiva(true);
    setSeriesText('');
    setTextArrayCount(0);
    setValidSeriesCount(0);
    setButtonDisabled(false);
  };

  const handleCloseCargaMasiva = () => {
    setOpenCargaMasiva(false);
    setSeriesText('');
    setTextArrayCount(0);
    setValidSeriesCount(0);
    setButtonDisabled(false);
  };

  const handleSeriesTextChange = (event) => {
    const inputText = event.target.value;
    const textArray = inputText.split('\n').map((item) => item.trim());
    setTextArrayCount(textArray.length);
    setSeriesText(event.target.value);
  };

  const handleValidarSeries = () => {
    setButtonDisabled(true);

    const textArray = seriesText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean); // Eliminar líneas vacías

    setTextArrayCount(textArray.length);

    const uniqueTextArray = [...new Set(textArray)]; // Eliminar duplicados

    // Validar con algoritmo Luhn
    const validSeries = uniqueTextArray.filter((serie) => luhn_validate(serie));

    setValidSeriesCount(validSeries.length);

    const validatedSeries = validSeries.join(',\n');
    setSeriesText(validatedSeries);
  };

  const handleLimpiarSeries = () => {
    setSeriesText('');
    setTextArrayCount(0);
    setValidSeriesCount(0);
    setButtonDisabled(false);
  };

  const handleCargarSeriesMasivas = () => {
    // Quitar saltos de línea y convertir a array
    const sinSaltosDeLinea = seriesText.replace(/\n/g, '');
    const listaDeStrings = sinSaltosDeLinea.split(',').map(String).filter(Boolean);

    // Agregar todas las series al estado actual
    setSeriesActual({
      ...seriesActual,
      series: [...seriesActual.series, ...listaDeStrings],
    });

    // Cerrar modal
    handleCloseCargaMasiva();

    alert(`✅ Se agregaron ${listaDeStrings.length} series al lote actual`);
  };

  // Handlers para Cargar Series
  const handleSeleccionarTransferencia = (transferenciaId) => {
    setSeriesActual({
      transferencia: transferenciaId,
      producto_id: null,
      item_code: '',
      item_name: '',
      serie: '',
      series: [],
    });
    setProductosTransferencia([]);
    if (transferenciaId) {
      fetchProductosTransferencia(transferenciaId);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setSeriesActual({
      ...seriesActual,
      producto_id: producto.ID,
      item_code: producto.ITEM_CODE,
      item_name: producto.ITEM_NAME,
      serie: '',
      series: [],
    });
  };

  const handleAgregarSerie = () => {
    if (seriesActual.serie && seriesActual.producto_id) {
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

  const handleGuardarSeries = async () => {
    if (!seriesActual.transferencia || !seriesActual.producto_id || seriesActual.series.length === 0) {
      alert('❌ Por favor seleccione una transferencia, un producto y agregue al menos una serie');
      return;
    }

    // Buscar la transferencia seleccionada para obtener información
    const transferenciaSeleccionada = transferenciasParaSeries.find(
      t => t.ID === parseInt(seriesActual.transferencia)
    );

    if (!transferenciaSeleccionada) {
      alert('❌ No se pudo encontrar la información de la transferencia');
      return;
    }

    if (!window.confirm(
      `¿Está seguro que desea guardar ${seriesActual.series.length} serie(s) para el producto ${seriesActual.item_code}?\n\n⚠️ Las series serán validadas en SAP antes de guardar.`
    )) {
      return;
    }

    setButtonDisabled(true);

    try {
      // Usar endpoint V2 con validación en SAP
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${seriesActual.transferencia}/series-v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            empresa: user.EMPRESA,
            series: seriesActual.series,
            bodega: transferenciaSeleccionada.BODEGA_ORIGEN,
            item_code: seriesActual.item_code,
            usuario_id: user.ID,
            usuario_nombre: user.DISPLAYNAME,
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Mostrar información detallada sobre las series
        let mensaje = `${result.message}\n\n`;
        mensaje += `📊 Resumen:\n`;
        mensaje += `✅ Series cargadas: ${result.series_cargadas}\n`;
        
        if (result.series_invalidas && result.series_invalidas.length > 0) {
          mensaje += `\n❌ Series rechazadas (no disponibles en SAP):\n`;
          result.series_invalidas.forEach((serie, index) => {
            if (index < 5) {
              mensaje += `   - ${serie}\n`;
            }
          });
          if (result.series_invalidas.length > 5) {
            mensaje += `   ... y ${result.series_invalidas.length - 5} más\n`;
          }
        }

        alert(mensaje);

        // Recargar productos para ver las series actualizadas
        fetchProductosTransferencia(seriesActual.transferencia);
        // Limpiar solo las series y producto seleccionado
        setSeriesActual({
          ...seriesActual,
          producto_id: null,
          item_code: '',
          item_name: '',
          serie: '',
          series: [],
        });
        // Recargar lista de transferencias pendientes de series
        fetchTransferenciasParaSeries();
        // Actualizar lista general de transferencias
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error: ${result.message || 'No se pudieron guardar las series'}`);
      }
    } catch (error) {
      console.error('Error al guardar series:', error);
      alert('❌ Error al conectar con el servidor. Por favor intente nuevamente.');
    } finally {
      setButtonDisabled(false);
    }
  };

  // Handlers para Aceptar Transferencia
  const handleAceptarTransferencia = async (id) => {
    // Buscar la transferencia para obtener información
    const transferenciaSeleccionada = transferenciasParaAceptar.find(
      t => t.ID === id
    );

    if (!transferenciaSeleccionada) {
      alert('❌ No se pudo encontrar la información de la transferencia');
      return;
    }

    if (!window.confirm(
      `¿Está seguro que desea recibir la transferencia TRF-${id}?\n\nOrigen: ${transferenciaSeleccionada.BODEGA_ORIGEN}\nDestino: ${transferenciaSeleccionada.BODEGA_DESTINO}\n\nEsto procesará el traslado físico de inventario en SAP y marcará la transferencia como completada.`
    )) {
      return;
    }

    setProcesandoTransferencia(id);

    try {
      const response = await fetch(
        `${HOST_API_KEY}/transferencias/${id}/recibir-v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bodega: transferenciaSeleccionada.BODEGA_DESTINO,
            recibido_por_id: user.ID,
            recibido_por_nombre: user.DISPLAYNAME,
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ ${result.message}`);
        // Recargar lista de transferencias para recibir
        fetchTransferenciasParaRecibir();
        // Actualizar lista general de transferencias
        fetchTransferenciasUsuario();
      } else {
        alert(`❌ Error: ${result.message || 'No se pudo recibir la transferencia'}`);
      }
    } catch (error) {
      console.error('Error al recibir transferencia:', error);
      alert('❌ Error al conectar con el servidor. Por favor intente nuevamente.');
    } finally {
      setProcesandoTransferencia(null);
    }
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
                  onChange={(e) => handleBodegaOrigenChange(e.target.value)}
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
                  onChange={(e) => handleBodegaDestinoChange(e.target.value)}
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
                  Productos a Transferir {solicitudData.bodegaOrigen && `(Bodega: ${cleanWarehouse(solicitudData.bodegaOrigen)})`}
                </Typography>
                {loadingProductos && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando productos disponibles...
                    </Typography>
                  </Stack>
                )}
              </Grid>

              {solicitudData.bodegaOrigen && solicitudData.bodegaDestino && (
                <>
                  <Grid item xs={12} md={8}>
                    <Autocomplete
                      fullWidth
                      options={productosDisponibles}
                      getOptionLabel={(option) => `${option.ItemCode} - ${option.ItemName} (Origen: ${option.DISPONIBLES_BODEGA_ORIGEN} | Destino: ${option.DISPONIBLES_BODEGA_DESTINO})`}
                      loading={loadingProductos}
                      value={productoActual.producto || null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          setProductoActual({
                            ...productoActual,
                            codigo: newValue.ItemCode,
                            descripcion: newValue.ItemName,
                            cantidadDisponible: newValue.DISPONIBLES_BODEGA_ORIGEN,
                            producto: newValue,
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Seleccionar Producto"
                          placeholder="Buscar por código o descripción..."
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingProductos ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      disabled={!solicitudData.bodegaOrigen || !solicitudData.bodegaDestino || loadingProductos}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cantidad"
                      value={productoActual.cantidad}
                      onChange={(e) => setProductoActual({ ...productoActual, cantidad: e.target.value })}
                      helperText={productoActual.cantidadDisponible ? `Disponibles: ${productoActual.cantidadDisponible}` : ''}
                      inputProps={{ min: 1, max: productoActual.cantidadDisponible || undefined }}
                    />
                  </Grid>

                  <Grid item xs={12} md={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAgregarProducto}
                      sx={{ height: '56px' }}
                      disabled={!productoActual.codigo || !productoActual.cantidad}
                    >
                      <AddIcon />
                    </Button>
                  </Grid>
                </>
              )}

              {(!solicitudData.bodegaOrigen || !solicitudData.bodegaDestino) && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Seleccione la bodega de origen y destino para ver los productos disponibles
                  </Alert>
                </Grid>
              )}

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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Aprobar Transferencias Pendientes
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchTransferenciasParaAprobar}
                disabled={loadingAprobar}
              >
                {loadingAprobar ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </Stack>

            {loadingAprobar ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Cargando transferencias pendientes...
                </Typography>
              </Stack>
            ) : transferenciasParaAprobar.length === 0 ? (
              <Alert severity="info">No hay transferencias pendientes de aprobación</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha Solicitud</TableCell>
                      <TableCell>Origen</TableCell>
                      <TableCell>Destino</TableCell>
                      <TableCell>Solicitante</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferenciasParaAprobar.map((transferencia) => (
                      <TableRow key={transferencia.ID}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            TRF-{transferencia.ID}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(transferencia.FECHA_SOLICITUD).toLocaleString('es-EC', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>{transferencia.BODEGA_ORIGEN}</TableCell>
                        <TableCell>{transferencia.BODEGA_DESTINO}</TableCell>
                        <TableCell>{transferencia.SOLICITANTE_NOMBRE}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {transferencia.OBSERVACIONES || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label="Pendiente" 
                            color="warning" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleVerDetalle(transferencia)}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleAprobarTransferencia(transferencia.ID)}
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRechazarTransferencia(transferencia.ID)}
                            >
                              Rechazar
                            </Button>
                          </Stack>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Cargar Series para Transferencias Aprobadas
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchTransferenciasParaSeries}
                disabled={loadingSeries}
              >
                {loadingSeries ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </Stack>

            {loadingSeries ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Cargando transferencias pendientes de series...
                </Typography>
              </Stack>
            ) : transferenciasParaSeries.length === 0 ? (
              <Alert severity="info">
                No hay transferencias pendientes de cargar series para tu bodega ({cleanWarehouse(user?.WAREHOUSE)})
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {/* Paso 1: Seleccionar Transferencia */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                      Paso 1: Seleccionar Transferencia
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      label="Seleccionar Transferencia"
                      value={seriesActual.transferencia}
                      onChange={(e) => handleSeleccionarTransferencia(e.target.value)}
                    >
                      {transferenciasParaSeries.map((option) => (
                        <MenuItem key={option.ID} value={option.ID}>
                          {`TRF-${option.ID} - ${option.BODEGA_ORIGEN} → ${option.BODEGA_DESTINO} (${new Date(option.FECHA_SOLICITUD).toLocaleDateString('es-EC')})`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Paper>
                </Grid>

                {/* Paso 2: Productos de la Transferencia */}
                {seriesActual.transferencia && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.04) }}>
                      <Typography variant="subtitle2" color="info.main" sx={{ mb: 2 }}>
                        Paso 2: Seleccionar Producto para Asignar Series
                      </Typography>
                      
                      {loadingProductosTransferencia ? (
                        <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
                          <CircularProgress size={32} />
                          <Typography variant="body2" color="text.secondary">
                            Cargando productos...
                          </Typography>
                        </Stack>
                      ) : productosTransferencia.length === 0 ? (
                        <Alert severity="warning">No hay productos en esta transferencia</Alert>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Código</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="center">Cantidad Solicitada</TableCell>
                                <TableCell align="center">Series Cargadas</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {productosTransferencia.map((producto, index) => {
                                const esSeleccionado = seriesActual.producto_id === producto.ID;
                                const seriesCargadas = producto.SERIES_CARGADAS || 0;
                                const faltanSeries = producto.CANTIDAD_SOLICITADA - seriesCargadas;
                                
                                return (
                                  <TableRow 
                                    key={producto.ID}
                                    sx={{
                                      bgcolor: esSeleccionado ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    }}
                                  >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={600}>
                                        {producto.ITEM_CODE}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{producto.ITEM_NAME}</TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={producto.CANTIDAD_SOLICITADA}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={`${seriesCargadas} / ${producto.CANTIDAD_SOLICITADA}`}
                                        size="small"
                                        color={faltanSeries === 0 ? 'success' : 'warning'}
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <Button
                                        variant={esSeleccionado ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => handleSeleccionarProducto(producto)}
                                        disabled={faltanSeries === 0}
                                      >
                                        {esSeleccionado ? 'Seleccionado' : (faltanSeries === 0 ? 'Completo' : 'Asignar Series')}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Paper>
                  </Grid>
                )}

                {/* Paso 3: Agregar Series al Producto Seleccionado */}
                {seriesActual.producto_id && (
                  <>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.04) }}>
                        <Typography variant="subtitle2" color="success.main" sx={{ mb: 2 }}>
                          Paso 3: Agregar Series para {seriesActual.item_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Producto: {seriesActual.item_name}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
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
                              placeholder="Escanea o escribe el número de serie..."
                              autoFocus
                            />
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleAgregarSerie}
                              disabled={!seriesActual.serie}
                              sx={{ height: '56px' }}
                            >
                              <AddIcon />
                            </Button>
                          </Grid>

                          <Grid item xs={12} md={2}>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="secondary"
                              onClick={handleOpenCargaMasiva}
                              startIcon={<CloudUploadIcon />}
                              sx={{ height: '56px' }}
                            >
                              Carga Masiva
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {seriesActual.series.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Series Agregadas ({seriesActual.series.length})
                        </Typography>
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
                                  <TableCell>
                                    <Typography variant="body2" fontFamily="monospace">
                                      {serie}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      color="error"
                                      size="small"
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
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleGuardarSeries}
                          disabled={seriesActual.series.length === 0 || buttonDisabled}
                          size="large"
                          startIcon={<SendIcon />}
                        >
                          {buttonDisabled ? 'Validando en SAP...' : 'Guardar Series (Validación SAP)'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setSeriesActual({
                            ...seriesActual,
                            producto_id: null,
                            item_code: '',
                            item_name: '',
                            serie: '',
                            series: [],
                          })}
                          size="large"
                          disabled={buttonDisabled}
                        >
                          Cancelar
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          ⚠️ Las series serán validadas automáticamente en SAP antes de guardar
                        </Typography>
                      </Stack>
                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </Box>
        );

      case 'aceptar':
        return (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Recibir Transferencias
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchTransferenciasParaRecibir}
                disabled={loadingAceptar}
              >
                {loadingAceptar ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </Stack>

            {loadingAceptar ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Cargando transferencias pendientes de recibir...
                </Typography>
              </Stack>
            ) : transferenciasParaAceptar.length === 0 ? (
              <Alert severity="info">
                No hay transferencias listas para recibir en tu bodega ({cleanWarehouse(user?.WAREHOUSE)})
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Fecha Solicitud</TableCell>
                      <TableCell>Origen</TableCell>
                      <TableCell>Destino</TableCell>
                      <TableCell>Solicitante</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transferenciasParaAceptar.map((transferencia) => {
                      const estadoInfo = getEstadoInfo(transferencia.ESTADO);
                      
                      return (
                        <TableRow key={transferencia.ID}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              TRF-{transferencia.ID}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(transferencia.FECHA_SOLICITUD).toLocaleString('es-EC', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>{transferencia.BODEGA_ORIGEN}</TableCell>
                          <TableCell>{transferencia.BODEGA_DESTINO}</TableCell>
                          <TableCell>{transferencia.SOLICITANTE_NOMBRE}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={estadoInfo.label}
                              size="small"
                              sx={{
                                bgcolor: alpha(estadoInfo.color, 0.16),
                                color: estadoInfo.color,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleVerDetalle(transferencia)}
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleAceptarTransferencia(transferencia.ID)}
                                disabled={procesandoTransferencia !== null}
                                startIcon={procesandoTransferencia === transferencia.ID ? <CircularProgress size={16} color="inherit" /> : null}
                              >
                                {procesandoTransferencia === transferencia.ID ? 'Recibiendo transferencia...' : 'Recibir e Ingresar'}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

          {/* Action Modules - Estilo moderno con gradientes */}
          <Grid container spacing={3}>
            {visibleModules.map((module) => {
              const Icon = module.icon;
              const counter = moduleCounters[module.id] || 0;
              
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
                        {/* Badge - Solo mostrar para módulos con contador (no para solicitar) */}
                        {module.id !== 'solicitar' && counter > 0 && (
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
                              {counter}
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
              <Typography variant="h6">Mis Solicitudes de Transferencia</Typography>
              <Button size="small" onClick={fetchTransferenciasUsuario} disabled={loadingTransferencias}>
                {loadingTransferencias ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </Stack>
            
            {loadingTransferencias ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Cargando transferencias...
                </Typography>
              </Stack>
            ) : transferenciasUsuario.length === 0 ? (
              <Alert severity="info">No tienes solicitudes de transferencia registradas</Alert>
            ) : (
              <Stack spacing={2}>
                {transferenciasUsuario.map((item) => {
                  // Obtener información del estado usando el helper
                  const estadoInfo = getEstadoInfo(item.ESTADO);

                  return (
                    <Paper
                      key={item.ID}
                      onClick={() => handleVerDetalle(item)}
                      sx={{
                        p: 2,
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateX(8px)',
                          boxShadow: theme.customShadows.z8,
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha(estadoInfo.color, 0.16), color: estadoInfo.color }}>
                          <SwapHoriz />
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2">TRF-{item.ID}</Typography>
                            <Chip 
                              label={estadoInfo.label} 
                              size="small"
                              sx={{
                                bgcolor: alpha(estadoInfo.color, 0.16),
                                color: estadoInfo.color,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {item.BODEGA_ORIGEN} → {item.BODEGA_DESTINO}
                          </Typography>
                          {item.OBSERVACIONES && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                              {item.OBSERVACIONES}
                            </Typography>
                          )}
                        </Box>

                        <Stack alignItems="flex-end" spacing={0.5}>
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.16),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(item.FECHA_SOLICITUD).toLocaleDateString('es-EC', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.SOLICITANTE_NOMBRE}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Card>
        </>
      ) : (
        <Card sx={{ p: 3 }}>
          {renderModuleContent()}
        </Card>
      )}

      {/* Modal de Detalle de Transferencia - Fuera del condicional para que esté disponible siempre */}
      <Dialog
        open={modalDetalle.open}
        onClose={handleCerrarDetalle}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Detalle de Transferencia {modalDetalle.transferencia && `TRF-${modalDetalle.transferencia.ID}`}
            </Typography>
            <IconButton onClick={handleCerrarDetalle} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers>
          {modalDetalle.transferencia && (
            <Stack spacing={3}>
              {/* Información General */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Información General
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Estado</Typography>
                    <Chip
                      label={getEstadoInfo(modalDetalle.transferencia.ESTADO).label}
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        bgcolor: alpha(getEstadoInfo(modalDetalle.transferencia.ESTADO).color, 0.16),
                        color: getEstadoInfo(modalDetalle.transferencia.ESTADO).color,
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fecha Solicitud</Typography>
                    <Typography variant="body1">
                      {new Date(modalDetalle.transferencia.FECHA_SOLICITUD).toLocaleString('es-EC')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Bodega Origen</Typography>
                    <Typography variant="body1">{modalDetalle.transferencia.BODEGA_ORIGEN}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Bodega Destino</Typography>
                    <Typography variant="body1">{modalDetalle.transferencia.BODEGA_DESTINO}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Solicitante</Typography>
                    <Typography variant="body1">{modalDetalle.transferencia.SOLICITANTE_NOMBRE}</Typography>
                  </Grid>
                  {modalDetalle.transferencia.OBSERVACIONES && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Observaciones</Typography>
                      <Typography variant="body1">{modalDetalle.transferencia.OBSERVACIONES}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Productos */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Productos ({modalDetalle.productos.length})
                  </Typography>
                  {modalDetalle.transferencia?.ESTADO === 0 && !modalDetalle.editMode && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleActivarEdicion}
                      disabled={modalDetalle.loading}
                    >
                      Editar Productos y Cantidades
                    </Button>
                  )}
                  {modalDetalle.editMode && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleGuardarCantidades}
                      >
                        Guardar Cambios
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCancelarEdicion}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  )}
                </Stack>
                
                {modalDetalle.loading ? (
                  <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando productos...
                    </Typography>
                  </Stack>
                ) : modalDetalle.productos.length === 0 ? (
                  <Alert severity="info">No hay productos en esta transferencia</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Código</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          {modalDetalle.transferencia?.ESTADO >= 1 && (
                            <TableCell align="center">Series/IMEIs</TableCell>
                          )}
                          {modalDetalle.editMode && (
                            <TableCell align="center">Acciones</TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(modalDetalle.editMode ? modalDetalle.productosEditados : modalDetalle.productos).map((producto, index) => {
                          const seriesProducto = modalDetalle.series[producto.ID] || [];
                          const isExpanded = modalDetalle.expandedProduct === producto.ID;
                          const uniqueKey = producto.ID || producto.tempId || `producto-${index}`;
                          
                          return (
                            <Fragment key={uniqueKey}>
                              <TableRow sx={producto.ES_NUEVO ? { bgcolor: alpha(theme.palette.success.main, 0.08) } : {}}>
                                <TableCell>
                                  {index + 1}
                                  {producto.ES_NUEVO && (
                                    <Chip label="Nuevo" size="small" color="success" sx={{ ml: 0.5 }} />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    {producto.ITEM_CODE}
                                  </Typography>
                                </TableCell>
                                <TableCell>{producto.ITEM_NAME}</TableCell>
                                <TableCell align="center">
                                  {modalDetalle.editMode ? (
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={producto.CANTIDAD_EDITADA}
                                      onChange={(e) => handleCambiarCantidad(index, e.target.value)}
                                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                      sx={{ width: 80 }}
                                    />
                                  ) : (
                                    <Chip
                                      label={producto.CANTIDAD_SOLICITADA}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                </TableCell>
                                {modalDetalle.transferencia?.ESTADO >= 1 && (
                                  <TableCell align="center">
                                    {modalDetalle.loadingSeries ? (
                                      <CircularProgress size={20} />
                                    ) : seriesProducto.length > 0 ? (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleToggleSeriesProducto(producto.ID)}
                                        startIcon={isExpanded ? '▼' : '▶'}
                                      >
                                        Ver {seriesProducto.length} serie(s)
                                      </Button>
                                    ) : (
                                      <Chip
                                        label="Sin series"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                  </TableCell>
                                )}
                                {modalDetalle.editMode && (
                                  <TableCell align="center">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleMarcarParaEliminar(producto, index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                              {isExpanded && seriesProducto.length > 0 && (
                                <TableRow key={`series-${index}`}>
                                  <TableCell colSpan={modalDetalle.transferencia?.ESTADO >= 1 ? 5 : 4} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04), p: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                                      Series / IMEIs cargadas:
                                    </Typography>
                                    <Grid container spacing={1}>
                                      {seriesProducto.map((serie, idx) => (
                                        <Grid item xs={12} sm={6} md={4} key={idx}>
                                          <Paper
                                            variant="outlined"
                                            sx={{
                                              p: 1.5,
                                              bgcolor: 'background.paper',
                                              borderColor: 'primary.light',
                                            }}
                                          >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <Chip
                                                label={idx + 1}
                                                size="small"
                                                color="primary"
                                                sx={{ width: 32, height: 24 }}
                                              />
                                              <Typography
                                                variant="body2"
                                                fontFamily="monospace"
                                                sx={{ fontWeight: 600 }}
                                              >
                                                {serie.SERIE_IMEI}
                                              </Typography>
                                            </Stack>
                                            {serie.CARGADO_POR_NOMBRE && (
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                Por: {serie.CARGADO_POR_NOMBRE}
                                              </Typography>
                                            )}
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Sección para agregar nuevos productos (solo en modo edición) */}
                {modalDetalle.editMode && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                      Agregar Nuevo Producto
                    </Typography>
                    
                    {modalDetalle.loadingProductosDisponibles ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          Cargando productos disponibles...
                        </Typography>
                      </Stack>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={7}>
                          <Autocomplete
                            fullWidth
                            options={modalDetalle.productosDisponibles}
                            getOptionLabel={(option) => `${option.ItemCode} - ${option.ItemName} (Origen: ${option.DISPONIBLES_BODEGA_ORIGEN} | Destino: ${option.DISPONIBLES_BODEGA_DESTINO})`}
                            value={modalDetalle.productoActual.producto || null}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                setModalDetalle(prev => ({
                                  ...prev,
                                  productoActual: {
                                    codigo: newValue.ItemCode,
                                    descripcion: newValue.ItemName,
                                    cantidad: prev.productoActual.cantidad,
                                    cantidadDisponible: newValue.DISPONIBLES_BODEGA_ORIGEN,
                                    producto: newValue,
                                  },
                                }));
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Seleccionar Producto"
                                placeholder="Buscar por código o descripción..."
                                size="small"
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Cantidad"
                            size="small"
                            value={modalDetalle.productoActual.cantidad}
                            onChange={(e) => setModalDetalle(prev => ({
                              ...prev,
                              productoActual: {
                                ...prev.productoActual,
                                cantidad: e.target.value,
                              },
                            }))}
                            helperText={modalDetalle.productoActual.cantidadDisponible ? `Disponibles: ${modalDetalle.productoActual.cantidadDisponible}` : ''}
                            inputProps={{ min: 1, max: modalDetalle.productoActual.cantidadDisponible || undefined }}
                          />
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={handleAgregarProductoModal}
                            disabled={!modalDetalle.productoActual.codigo || !modalDetalle.productoActual.cantidad}
                            startIcon={<AddIcon />}
                          >
                            Agregar
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCerrarDetalle} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Carga Masiva de Series - Fuera del condicional para que esté disponible siempre */}
      <Dialog
        open={openCargaMasiva}
        onClose={handleCloseCargaMasiva}
        fullScreen
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseCargaMasiva}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Carga Masiva de Series - {seriesActual.item_code}
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={handleValidarSeries}
              disabled={buttonDisabled || !seriesText}
              startIcon={<CheckCircleOutline />}
            >
              Validar
            </Button>
            <Button
              color="inherit"
              onClick={handleLimpiarSeries}
              sx={{ ml: 1 }}
            >
              Limpiar
            </Button>
            <Button
              color="inherit"
              onClick={handleCargarSeriesMasivas}
              disabled={validSeriesCount === 0}
              sx={{ ml: 1 }}
              startIcon={<SendIcon />}
            >
              Cargar ({validSeriesCount})
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent sx={{ p: 3 }}>
          {/* Contadores */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              mb: 3,
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
            }}
          >
            <Typography variant="body1">
              Líneas ingresadas: <strong>{textArrayCount}</strong>
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: validSeriesCount > 0 ? 'success.main' : 'error.main',
                fontWeight: 'bold',
              }}
            >
              Válidos: {validSeriesCount}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
              }}
            >
              Requeridos: {(() => {
                const producto = productosTransferencia.find(p => p.ID === seriesActual.producto_id);
                const seriesCargadas = producto?.SERIES_CARGADAS || 0;
                return (producto?.CANTIDAD_SOLICITADA || 0) - seriesCargadas;
              })()}
            </Typography>
          </Box>

          {/* Alert informativo */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Instrucciones:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              1. Pegue o escriba las series (una por línea)<br />
              2. Click en "Validar" para limpiar duplicados y verificar IMEIs<br />
              3. Click en "Cargar" para agregar las series al lote actual<br />
              4. No olvide hacer click en "Guardar Series del Producto" después de cerrar este diálogo
            </Typography>
          </Alert>

          {/* TextArea */}
          <TextField
            fullWidth
            multiline
            rows={30}
            label="Lista de Series / IMEIs"
            value={seriesText}
            onChange={handleSeriesTextChange}
            placeholder="357855570566493&#10;357855570557807&#10;358976543210987&#10;..."
            disabled={buttonDisabled}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '14px',
              },
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
