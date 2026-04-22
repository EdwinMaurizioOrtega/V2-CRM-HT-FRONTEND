import DashboardLayout from "../../../layouts/dashboard";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import { PATH_DASHBOARD } from "../../../routes/paths";
import {
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Tooltip,
    Stack,
    Typography,
    Chip,
    alpha,
    CircularProgress,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider
} from "@mui/material";
import { useSettingsContext } from "../../../components/settings";
import { useRouter } from "next/router";
import EmptyContent from "../../../components/empty-content";
import axios from "../../../utils/axios";
import { useAuthContext } from "../../../auth/useAuthContext";
import Iconify from "../../../components/iconify";
import ConfirmDialog from "../../../components/confirm-dialog";
import NotificationsIcon from '@mui/icons-material/Notifications';
import * as XLSX from 'xlsx';
import {
    getFlow as uanatacaGetFlow,
    getFlowDocuments as uanatacaGetFlowDocuments,
    openFlowDocumentPdf as uanatacaOpenFlowDocumentPdf,
    extractFlowId,
} from "../../../api/uanataca";


CargarArchivosCreditoPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

// ============================================================
// 📋 ESTADOS DEL PROCESO DE CRÉDITO - FLUJO LÓGICO
// ============================================================
// Orden reorganizado según el flujo natural del proceso crediticio:
// 1. Solicitud y Evaluación Inicial (0, 8)
// 2. Decisión de Aprobación (1, 7)
// 3. Proceso de Firma (2, 3)
// 4. Tipo de Crédito Asignado (4, 5, 6)
// ============================================================

const CREDIT_STATES = [
    // ========== FASE 1: EVALUACIÓN INICIAL ==========
    {
        value: 0,
        label: 'Evaluación de Crédito',
        color: '#4ECDC4',
        icon: '⚖️',
        description: 'En proceso de evaluación crediticia',
        phase: 'Evaluación'
    },
    {
        value: 8,
        label: 'Pendiente Documentación - Información',
        color: '#FFA726',
        icon: '📝',
        description: 'Pendiente de cargar documentos e información',
        phase: 'Evaluación'
    },
    {
        value: 2,
        label: 'Firma de Documentación',
        color: '#42A5F5',
        icon: '📄',
        description: 'Pendiente de firma de documentos',
        phase: 'Formalización'
    },
    {
        value: 1,
        label: 'Aprobación de Crédito',
        color: '#5CDB95',
        icon: '✅',
        description: 'Crédito aprobado - Continuar con firma',
        phase: 'Decisión'
    },
    {
        value: 3,
        label: 'Firma de Pagaré',
        color: '#66BB6A',
        icon: '✍️',
        description: 'Pendiente de firma de pagaré',
        phase: 'Formalización'
    },
    {
        value: 4,
        label: 'Crédito Nominado',
        color: '#AB47BC',
        icon: '💼',
        description: 'Crédito asignado a cliente específico',
        phase: 'Asignación'
    },
    {
        value: 5,
        label: 'Crédito Innominado',
        color: '#7E57C2',
        icon: '🏦',
        description: 'Crédito genérico disponible',
        phase: 'Asignación'
    },
    {
        value: 6,
        label: 'Crédito Interno',
        color: '#FF7043',
        icon: '🏢',
        description: 'Crédito interno de la empresa',
        phase: 'Asignación'
    },
    {
        value: 7,
        label: 'Crédito Negado',
        color: '#E74C3C',
        icon: '❌',
        description: 'Solicitud de crédito rechazada - Proceso finalizado',
        phase: 'Decisión'
    },
];

// Catálogo de tipos de cliente
const TIPOS_CLIENTE = [
    { value: 106, label: 'Mayoristas', icon: '🏢', color: '#3498db' },
    { value: 124, label: 'Master Dealer', icon: '👑', color: '#9b59b6' },
    { value: 122, label: 'Minoristas', icon: '🏪', color: '#e74c3c' },
    { value: 123, label: 'Corporativo', icon: '🏛️', color: '#2ecc71' },
    { value: 112, label: 'Retail', icon: '🛒', color: '#f39c12' },
    { value: 115, label: 'Operadoras', icon: '📱', color: '#1abc9c' },
];

export default function CargarArchivosCreditoPage() {

    const { user } = useAuthContext();

    const { themeStretch } = useSettingsContext();

    const router = useRouter();
    // const {id} = router.query; // Captura el parámetro "id"

    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);

    const [openPopover, setOpenPopover] = useState(null);
    const [openOBS, setOpenOBS] = useState(false);
    const [openChangeState, setOpenChangeState] = useState(false);
    const [openChangeTipoCliente, setOpenChangeTipoCliente] = useState(false);
    const [valueNewOBS, setValueNewOBS] = useState('Ninguno..');
    const [selectedNewState, setSelectedNewState] = useState(0);
    const [selectedTipoCliente, setSelectedTipoCliente] = useState(null);
    // Estado para guardar el ID seleccionado
    const [selectedIdEmpresa, setSelectedIdEmpresa] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [draggedCard, setDraggedCard] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'N', 'J'
    const [filterVendedor, setFilterVendedor] = useState('all');

    // Estado Uanataca - diálogo para ver estado del flujo y documentos
    const [openEstadoFirma, setOpenEstadoFirma] = useState(false);
    const [loadingEstadoFirma, setLoadingEstadoFirma] = useState(false);
    const [estadoFirmaData, setEstadoFirmaData] = useState(null);
    const [estadoFirmaError, setEstadoFirmaError] = useState('');
    const [estadoFirmaTitulo, setEstadoFirmaTitulo] = useState('');
    const handleChangeOBS = (event) => {
        setValueNewOBS(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };

    // Helpers multi-empresa: MovilCelistic (RUC 1792161037001) usa columnas _MC.
    // Cualquier otra empresa (Lidenar por defecto) usa las columnas originales.
    const isMovilCelistic = user?.EMPRESA === '1792161037001';
    const pickSoo = (partner) => (isMovilCelistic ? partner?.SOO_MC : partner?.SOO);
    const pickSooPagare = (partner) =>
        isMovilCelistic ? partner?.SOO_PAGARE_MC : partner?.SOO_PAGARE;
    const hasSoo = (partner) => {
        const v = pickSoo(partner);
        return v && v !== '<NULL>';
    };
    const hasSooPagare = (partner) => {
        const v = pickSooPagare(partner);
        return v && v !== '<NULL>';
    };

    const handleCloseOBS = () => {
        setOpenOBS(false);
    };

    const handleOpenChangeState = () => {
        setOpenChangeState(true);
    };

    const handleCloseChangeState = () => {
        setOpenChangeState(false);
    };

    const handleChangeNewState = (event) => {
        setSelectedNewState(event.target.value);
    };

    const handleOpenChangeTipoCliente = () => {
        setOpenChangeTipoCliente(true);
    };

    const handleCloseChangeTipoCliente = () => {
        setOpenChangeTipoCliente(false);
    };

    const handleChangeTipoCliente = (event) => {
        setSelectedTipoCliente(event.target.value);
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        try {
            // Obtener todos los datos filtrados
            const dataToExport = getFilteredPartners();

            if (!dataToExport || dataToExport.length === 0) {
                alert('⚠️ No hay datos para exportar');
                return;
            }

            // Preparar datos para Excel con toda la información
            const excelData = dataToExport.map((partner, index) => {
                // Obtener estado y tipo de cliente
                const estado = CREDIT_STATES.find(s => s.value === (partner.ESTADO_CREDITO ?? 0));
                const tipoCliente = TIPOS_CLIENTE.find(t => t.value === partner.TIPO_CLIENTE);

                return {
                    'N°': index + 1,
                    'ID Empresa': partner.ID_EMPRESA || '',
                    'Nombre/Razón Social': partner.NOMBRE || '',
                    'RUC/Cédula': partner.RUC || '',
                    'Tipo Persona': partner.TIPO_PERSONA === 'N' ? 'Natural' : 'Jurídica',
                    'Representante Legal': partner.NOMBRE_REPRESENTANTE || '',
                    'Cédula Representante': partner.CEDULA_REPRESENTANTE || '',
                    'Estado Crédito': estado?.label || 'Sin Estado',
                    'Fase': estado?.phase || '',
                    'Tipo Cliente': tipoCliente?.label || 'Sin Clasificar',
                    'Vendedor': partner.DISPLAYNAME || '',
                    'Teléfono': partner.TELEFONO || '',
                    'Email': partner.EMAIL || '',
                    'Dirección': partner.DIRECCION || '',
                    'Ciudad': partner.CIUDAD || '',
                    'Provincia': partner.PROVINCIA || '',
                    'Monto Solicitado': partner.MONTO_SOLICITADO || '',
                    'Plazo (meses)': partner.PLAZO_MESES || '',
                    'Tasa Interés': partner.TASA_INTERES || '',
                    'Observaciones': partner.OBSERVACIONES_CREDITO && partner.OBSERVACIONES_CREDITO !== '<NULL>' 
                        ? partner.OBSERVACIONES_CREDITO 
                        : '',
                    'Estado Documentación': hasSoo(partner) ? 'Documentos Cargados' : 'Pendiente',
                    'Estado Pagaré': hasSooPagare(partner) ? 'Pagaré Firmado' : 'Pendiente',
                    'Fecha Creación': partner.CREATED_AT || '',
                    'Última Actualización': partner.UPDATED_AT || '',
                    'Usuario Creación': partner.CREATED_BY_USER || '',
                    'Usuario Actualización': partner.UPDATED_BY_USER || '',
                };
            });

            // Crear workbook y worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Ajustar ancho de columnas
            const colWidths = [
                { wch: 5 },   // N°
                { wch: 12 },  // ID Empresa
                { wch: 35 },  // Nombre
                { wch: 15 },  // RUC
                { wch: 12 },  // Tipo Persona
                { wch: 30 },  // Representante
                { wch: 15 },  // Cédula Rep
                { wch: 30 },  // Estado Crédito
                { wch: 15 },  // Fase
                { wch: 18 },  // Tipo Cliente
                { wch: 25 },  // Vendedor
                { wch: 15 },  // Teléfono
                { wch: 30 },  // Email
                { wch: 40 },  // Dirección
                { wch: 15 },  // Ciudad
                { wch: 15 },  // Provincia
                { wch: 15 },  // Monto
                { wch: 12 },  // Plazo
                { wch: 12 },  // Tasa
                { wch: 50 },  // Observaciones
                { wch: 20 },  // Estado Doc
                { wch: 20 },  // Estado Pagaré
                { wch: 20 },  // Fecha Creación
                { wch: 20 },  // Última Act
                { wch: 20 },  // Usuario Creación
                { wch: 20 },  // Usuario Act
            ];
            ws['!cols'] = colWidths;

            // Agregar worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Gestión de Créditos');

            // Crear hoja adicional con resumen por estado
            const resumenEstados = CREDIT_STATES.map(estado => ({
                'Estado': estado.label,
                'Fase': estado.phase,
                'Total': getFilteredPartners().filter(p => (p.ESTADO_CREDITO ?? 0) === estado.value).length,
                'Porcentaje': `${((getFilteredPartners().filter(p => (p.ESTADO_CREDITO ?? 0) === estado.value).length / dataToExport.length) * 100).toFixed(2)}%`
            }));
            const wsResumen = XLSX.utils.json_to_sheet(resumenEstados);
            wsResumen['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 12 }];
            XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen por Estado');

            // Crear hoja adicional con resumen por tipo de cliente
            const resumenTipos = TIPOS_CLIENTE.map(tipo => ({
                'Tipo Cliente': tipo.label,
                'Total': getFilteredPartners().filter(p => p.TIPO_CLIENTE === tipo.value).length,
                'Porcentaje': `${((getFilteredPartners().filter(p => p.TIPO_CLIENTE === tipo.value).length / dataToExport.length) * 100).toFixed(2)}%`
            }));
            const wsTipos = XLSX.utils.json_to_sheet(resumenTipos);
            wsTipos['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }];
            XLSX.utils.book_append_sheet(wb, wsTipos, 'Resumen por Tipo Cliente');

            // Generar nombre de archivo con fecha
            const fecha = new Date().toISOString().split('T')[0];
            const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `Reporte_Gestion_Creditos_${fecha}_${hora}.xlsx`;

            // Descargar archivo
            XLSX.writeFile(wb, fileName);

            // Mensaje de éxito
            alert(`✅ Reporte generado exitosamente\n📊 ${dataToExport.length} registros exportados\n📄 Archivo: ${fileName}`);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            alert('❌ Error al generar el reporte. Por favor, intenta nuevamente.');
        }
    };

    const handleOpenPopover = (event, partner) => {
        setOpenPopover(event.currentTarget);
        setSelectedPartner(partner);
        setSelectedIdEmpresa(partner.ID_EMPRESA);
        setSelectedNewState(partner.ESTADO_CREDITO ?? 0);
        setSelectedTipoCliente(partner.TIPO_CLIENTE ?? null);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const handleOpenOBS = () => {
        setOpenOBS(true);
    };

    // Manejador para cambiar de tab
    const handleChangeTab = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Filtrar datos según el tab actual
    const filteredBusinessPartners = businessPartners?.filter(
        (partner) => (partner.ESTADO_CREDITO ?? 0) === currentTab
    ) || [];

    // Obtener el conteo por cada estado
    const getStateCount = (state) => {
        return businessPartners?.filter(
            (partner) => (partner.ESTADO_CREDITO ?? 0) === state
        ).length || 0;
    };

    // Handlers para drag & drop
    const handleDragStart = (partner) => {
        setDraggedCard(partner);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (newState) => {
        if (!draggedCard || draggedCard.ESTADO_CREDITO === newState) {
            setDraggedCard(null);
            return;
        }

        try {
            const response = await axios.put('/hanadb/api/customers/cambiar_estado_credito', {
                ID_REGISTRO: draggedCard.ID_EMPRESA,
                ESTADO_CREDITO: newState,
                USER_ID: Number(user?.ID),
            });

            if (response.status === 200) {
                fetchData(true);
            }
        } catch (error) {
            console.error('Error al cambiar el estado del crédito:', error);
            alert('Error al cambiar el estado. Por favor, intenta nuevamente.');
        } finally {
            setDraggedCard(null);
        }
    };

    // Función de filtrado avanzado
    const getFilteredPartners = () => {
        let filtered = businessPartners || [];

        // Filtro por búsqueda de texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(partner =>
                partner.NOMBRE?.toLowerCase().includes(query) ||
                partner.RUC?.toLowerCase().includes(query) ||
                partner.NOMBRE_REPRESENTANTE?.toLowerCase().includes(query) ||
                partner.DISPLAYNAME?.toLowerCase().includes(query)
            );
        }

        // Filtro por tipo de persona
        if (filterType !== 'all') {
            filtered = filtered.filter(partner => partner.TIPO_PERSONA === filterType);
        }

        // Filtro por vendedor (solo para admin)
        if (filterVendedor !== 'all' && user?.ROLE !== '7') {
            filtered = filtered.filter(partner => partner.DISPLAYNAME === filterVendedor);
        }

        return filtered;
    };

    // Obtener lista única de vendedores para el filtro
    const uniqueVendedores = [...new Set(businessPartners?.map(p => p.DISPLAYNAME).filter(Boolean))] || [];

    // Obtener conteo filtrado por estado
    const getFilteredStateCount = (state) => {
        return getFilteredPartners().filter(
            (partner) => (partner.ESTADO_CREDITO ?? 0) === state
        ).length;
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setFilterVendedor('all');
    };

    const VerInformacionCliente = (partner) => {
        const { TIPO_PERSONA, RUC } = partner;

        const url =
            TIPO_PERSONA === 'N'
                ? PATH_DASHBOARD.credito.natural_view(RUC)
                : PATH_DASHBOARD.credito.juridica_view(RUC);

        router.push(url);

    }

    const VerInformacionUanataca = () => {
        const url = `https://console.nexxit.dev/#login`;
        window.open(url, "_blank");
    }


    const VerFirmaUanataca = (dato) => {
        //console.log(dato);
        const url = `https://hypertronics.nexxit.dev/#sso/${dato}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                alert("Enlace copiado al portapapeles ✅");
            })
            .catch(() => {
                alert("No se pudo copiar el enlace ❌");
            });

    }

    // Abre el diálogo con el estado del flujo + lista de documentos Uanataca.
    // `dato` puede ser el flowId o la URL legacy guardada en SOO/SOO_PAGARE.
    const VerEstadoFirmaUanataca = async (dato, titulo) => {
        const flowId = extractFlowId(dato);
        setEstadoFirmaTitulo(titulo || 'Estado del Flujo Uanataca');
        setEstadoFirmaData(null);
        setEstadoFirmaError('');
        setOpenEstadoFirma(true);
        if (!flowId) {
            setEstadoFirmaError('No se pudo determinar el flowId del registro.');
            return;
        }
        setLoadingEstadoFirma(true);
        try {
            const rucEmpresa = user?.EMPRESA;
            const [flow, documents] = await Promise.all([
                uanatacaGetFlow(rucEmpresa, flowId),
                uanatacaGetFlowDocuments(rucEmpresa, flowId),
            ]);
            setEstadoFirmaData({ flowId, flow, documents: Array.isArray(documents) ? documents : [] });
        } catch (err) {
            console.error('[Uanataca] Error consultando flujo:', err);
            setEstadoFirmaError(err?.message || 'Error consultando el flujo.');
        } finally {
            setLoadingEstadoFirma(false);
        }
    };

    const handleCloseEstadoFirma = () => {
        setOpenEstadoFirma(false);
        setEstadoFirmaData(null);
        setEstadoFirmaError('');
    };

    // Descarga desde Uanataca el PDF específico de un documento y lo abre en otra pestaña.
    const handleVerPdfDocumento = async (doc) => {
        try {
            const flowId = estadoFirmaData?.flowId;
            if (!flowId || !doc?.id) return;
            await uanatacaOpenFlowDocumentPdf(
                user?.EMPRESA,
                flowId,
                doc.id,
                doc.name || doc.filename || `${doc.id}.pdf`
            );
        } catch (err) {
            console.error('[Uanataca] Error abriendo PDF:', err);
            alert(`No se pudo abrir el PDF: ${err?.message || err}`);
        }
    };

    const VerFotoRegistroCivil = (row) => {
        //console.log(row);
        // const SESSION_ID = row.row.SESSION_ID;
        // console.log(SESSION_ID);

    }

    // Componente de Tarjeta Kanban
    const CreditCard = ({ partner }) => {
        const state = CREDIT_STATES.find(s => s.value === (partner.ESTADO_CREDITO ?? 0));
        const hasNotification = partner.OBSERVACIONES_CREDITO && partner.OBSERVACIONES_CREDITO !== "<NULL>";

        return (
            <Card
                draggable
                onDragStart={() => handleDragStart(partner)}
                sx={{
                    mb: 2,
                    cursor: 'grab',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                    '&:active': {
                        cursor: 'grabbing',
                        opacity: 0.8,
                    },
                    borderLeft: 4,
                    borderColor: state?.color || '#ccc',
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    {/* Header con acciones */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Chip
                            label={partner.TIPO_PERSONA === 'N' ? 'Natural' : 'Jurídica'}
                            size="small"
                            sx={{
                                bgcolor: alpha(state?.color || '#ccc', 0.15),
                                color: state?.color,
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                            }}
                        />
                        <Stack direction="row" spacing={0.5}>
                            {hasNotification && (
                                <Tooltip title={partner.OBSERVACIONES_CREDITO}>
                                    <IconButton size="small" color="error">
                                        <Badge badgeContent={1} color="error">
                                            <NotificationsIcon fontSize="small" />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton
                                size="small"
                                onClick={(e) => handleOpenPopover(e, partner)}
                                sx={{
                                    bgcolor: alpha(state?.color || '#ccc', 0.1),
                                    '&:hover': { bgcolor: alpha(state?.color || '#ccc', 0.2) }
                                }}
                            >
                                <Iconify icon="eva:menu-2-fill" width={18} />
                            </IconButton>
                        </Stack>
                    </Stack>

                    {/* Tipo de Cliente */}
                    {partner.TIPO_CLIENTE && (
                        <Box sx={{ mb: 1.5 }}>
                            <Chip
                                icon={<Box sx={{ fontSize: '14px' }}>{TIPOS_CLIENTE.find(t => t.value === partner.TIPO_CLIENTE)?.icon}</Box>}
                                label={TIPOS_CLIENTE.find(t => t.value === partner.TIPO_CLIENTE)?.label || 'Sin tipo'}
                                size="small"
                                sx={{
                                    bgcolor: alpha(TIPOS_CLIENTE.find(t => t.value === partner.TIPO_CLIENTE)?.color || '#ccc', 0.15),
                                    color: TIPOS_CLIENTE.find(t => t.value === partner.TIPO_CLIENTE)?.color || '#666',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: '24px',
                                    '& .MuiChip-icon': {
                                        marginLeft: '6px',
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Información principal */}
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                        {partner.NOMBRE}
                    </Typography>

                    {/* RUC */}
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                        <Iconify icon="mdi:card-account-details" width={16} color={state?.color} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>
                            {partner.RUC}
                        </Typography>
                    </Stack>

                    {/* Representante */}
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                        <Iconify icon="mdi:account" width={16} color={state?.color} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }} noWrap>
                            {partner.NOMBRE_REPRESENTANTE}
                        </Typography>
                    </Stack>

                    {/* Vendedor */}
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={1.5}>
                        <Iconify icon="mdi:account-tie" width={16} color={state?.color} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }} noWrap>
                            {partner.DISPLAYNAME}
                        </Typography>
                    </Stack>

                    {/* Fecha de creación */}
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 2 }}>
                        📅 {partner.CREATED_AT}
                    </Typography>

                    {/* Botones de acción */}
                    <Stack spacing={1}>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<Iconify icon="eva:eye-outline" />}
                            onClick={() => VerInformacionCliente(partner)}
                            sx={{
                                borderColor: state?.color,
                                color: state?.color,
                                '&:hover': {
                                    borderColor: state?.color,
                                    bgcolor: alpha(state?.color || '#ccc', 0.08),
                                },
                            }}
                        >
                            Ver Información
                        </Button>

                        {hasSoo(partner) && (
                            <Stack direction="row" spacing={1}>
                
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Iconify icon="mdi:eye-outline" />}
                                    onClick={() => VerEstadoFirmaUanataca(pickSoo(partner), `Estado Firma Doc - ${partner.NOMBRE}`)}
                                    sx={{
                                        borderColor: alpha(state?.color || '#ccc', 0.5),
                                        color: state?.color,
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    Ver Estado Solicitud + Autorización
                                </Button>
                            </Stack>
                        )}

                        {hasSooPagare(partner) && (
                            <Stack direction="row" spacing={1}>
                                
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Iconify icon="mdi:eye-outline" />}
                                    onClick={() => VerEstadoFirmaUanataca(pickSooPagare(partner), `Estado Firma Pagaré - ${partner.NOMBRE}`)}
                                    sx={{
                                        borderColor: alpha(state?.color || '#ccc', 0.5),
                                        color: state?.color,
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    Ver Estado Pagaré
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        );
    };

    // 🚀 ESTRATEGIA RECOMENDADA: Cargar todos los datos UNA VEZ
    // Ventajas:
    // - Una sola petición HTTP (más eficiente)
    // - Cambio de tabs instantáneo (mejor UX)
    // - Filtrado local super rápido
    // - Contadores en tiempo real
    // - Búsqueda global disponible

    const fetchData = async (isRefresh = false) => {
        try {
            // Mostrar loading solo en carga inicial, no en refresh
            if (!isRefresh) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            let url = '';

            // Vendedor: solo sus prospectos
            if (user?.ROLE === '7') {
                url = `/hanadb/api/customers/lista_validar_info_prospecto_cartera_by_user?id_user=${user?.ID}`;
            } else {
                // Admin/Otros: todos los prospectos
                url = '/hanadb/api/customers/lista_validar_info_prospecto_cartera';
            }

            const response = await axios.get(url);
            setBusinessPartners(response.data);
            setLastUpdate(new Date()); // Registrar hora de actualización

            // Mostrar mensaje de éxito solo en refresh manual
            if (isRefresh) {
                // Opcional: agregar toast notification
                console.log('✅ Datos actualizados correctamente');
            }
        } catch (error) {
            console.error('❌ Error al obtener los datos:', error);
            // Opcional: mostrar toast de error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        if (user?.ID) {
            fetchData();
        }
    }, [user?.ID]); // Solo recargar si cambia el usuario

    // Función para refresh manual
    const handleRefreshData = () => {
        fetchData(true);
    };

    const onRowOBS = async () => {
        //console.log("Número ID_EMPRESA: " + selectedIdEmpresa);
        //console.log("Observación de cartera: " + valueNewOBS);
        //console.log("USER_ID: " + user?.ID);

        try {
            const response = await axios.put('/hanadb/api/customers/obs_cartera_uanataca', {
                ID_REGISTRO: selectedIdEmpresa,
                OBS: valueNewOBS,
                USER_ID: Number(user?.ID),
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('Cambiando estado');
            //console.log("Código de estado:", response.status);

            // ✅ MEJOR PRÁCTICA: Recargar solo los datos, no toda la página
            if (response.status === 200) {
                // Recargar datos sin reload completo = Mejor UX
                fetchData(true);
                handleCloseOBS();
            }

        } catch (error) {
            console.error('Error al cambiar el status de la orden:', error);
            alert('Error al guardar la observación. Intenta nuevamente.');
        }
    };

    const onChangeState = async () => {
        try {
            const response = await axios.put('/hanadb/api/customers/cambiar_estado_credito', {
                ID_REGISTRO: selectedIdEmpresa,
                ESTADO_CREDITO: selectedNewState,
                USER_ID: Number(user?.ID),
            });

            if (response.status === 200) {
                // ✅ MEJOR PRÁCTICA: Recargar solo los datos, no toda la página
                // Ventaja: Mantiene el scroll, no pierde el contexto
                fetchData(true);
                handleCloseChangeState();
                // Opcional: Cambiar al tab del nuevo estado
                setCurrentTab(selectedNewState);
            }

        } catch (error) {
            console.error('Error al cambiar el estado del crédito:', error);
            alert('Error al cambiar el estado. Por favor, intenta nuevamente.');
        }
    };

    const onUpdateTipoCliente = async () => {
        if (!selectedTipoCliente) {
            alert('⚠️ Por favor selecciona un tipo de cliente');
            return;
        }

        try {
            const response = await axios.put('/hanadb/api/customers/actualizar_tipo_cliente', {
                tipo_cliente: selectedTipoCliente,
                idEmpresa: selectedIdEmpresa,
            });

            if (response.status === 200) {
                alert('✅ Tipo de cliente actualizado exitosamente');
                fetchData(true);
                handleCloseChangeTipoCliente();
                handleClosePopover();
            }
        } catch (error) {
            console.error('Error al actualizar tipo de cliente:', error);
            alert('❌ Error al actualizar tipo de cliente. Intenta nuevamente.');
        }
    };

    return (
        <>
            <Head>
                <title> Validar Información | HT</title>
            </Head>

            <Container maxWidth={false}>
                <CustomBreadcrumbs
                    heading="Gestión de Créditos"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'Crédito', href: PATH_DASHBOARD.blog.root },
                        { name: 'Validar Información' },
                    ]}
                />

                {/* Header con estadísticas */}
                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                🎯 Sistema de Gestión de Créditos
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Administra y controla todos los estados del proceso crediticio
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleRefreshData}
                                    disabled={refreshing}
                                    startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:refresh-fill" />}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#667eea',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        },
                                    }}
                                >
                                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                                </Button>
                                {lastUpdate && (
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                        Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                {/* Tabs con diseño moderno */}
                <Card
                    sx={{
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
                            p: 2,
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                📋 Vista Kanban Board
                            </Typography>
                            <Chip
                                label={`${getFilteredPartners().length} de ${businessPartners?.length || 0}`}
                                sx={{
                                    bgcolor: '#667eea',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            💡 Arrastra las tarjetas entre columnas para cambiar su estado
                        </Typography>

                        {/* Barra de búsqueda y filtros */}
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                placeholder="🔍 Buscar por nombre, RUC, representante o vendedor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
                                    ),
                                    endAdornment: searchQuery && (
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <Iconify icon="eva:close-fill" />
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'white',
                                        '&:hover': {
                                            bgcolor: alpha('#667eea', 0.02),
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: 'white',
                                        },
                                    },
                                }}
                            />

                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                {/* Filtro por tipo de persona */}
                                <TextField
                                    select
                                    size="small"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    sx={{ minWidth: 180, bgcolor: 'white' }}
                                    SelectProps={{
                                        displayEmpty: true,
                                    }}
                                >
                                    <MenuItem value="all">📋 Todos los tipos</MenuItem>
                                    <MenuItem value="N">👤 Persona Natural</MenuItem>
                                    <MenuItem value="J">🏢 Persona Jurídica</MenuItem>
                                </TextField>

                                {/* Filtro por vendedor (solo para admin) */}
                                {user?.ROLE !== '7' && uniqueVendedores.length > 0 && (
                                    <TextField
                                        select
                                        size="small"
                                        value={filterVendedor}
                                        onChange={(e) => setFilterVendedor(e.target.value)}
                                        sx={{ minWidth: 200, bgcolor: 'white' }}
                                        SelectProps={{
                                            displayEmpty: true,
                                        }}
                                    >
                                        <MenuItem value="all">👥 Todos los vendedores</MenuItem>
                                        {uniqueVendedores.map((vendedor) => (
                                            <MenuItem key={vendedor} value={vendedor}>
                                                {vendedor}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}

                                {/* Botón limpiar filtros */}
                                {(searchQuery || filterType !== 'all' || filterVendedor !== 'all') && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Iconify icon="eva:refresh-outline" />}
                                        onClick={handleClearFilters}
                                        sx={{
                                            borderColor: alpha('#667eea', 0.3),
                                            color: '#667eea',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                bgcolor: alpha('#667eea', 0.08),
                                            },
                                        }}
                                    >
                                        Limpiar Filtros
                                    </Button>
                                )}

                                <Box sx={{ flexGrow: 1 }} />

                                {/* Indicador de filtros activos */}
                                {(searchQuery || filterType !== 'all' || filterVendedor !== 'all') && (
                                    <Chip
                                        label={`🔍 Filtrando resultados`}
                                        size="small"
                                        color="primary"
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                            </Stack>
                        </Stack>
                    </Box>
                </Card>

                {/* Botón para exportar a Excel */}
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        onClick={exportToExcel}
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

                {/* Kanban Board */}
                {loading ? (
                    <Card sx={{ p: 5, textAlign: 'center' }}>
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            Cargando créditos...
                        </Typography>
                    </Card>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            overflowX: 'auto',
                            pb: 2,
                            minHeight: '70vh',
                            '&::-webkit-scrollbar': {
                                height: 8,
                            },
                            '&::-webkit-scrollbar-track': {
                                bgcolor: alpha('#000', 0.05),
                                borderRadius: 4,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha('#667eea', 0.3),
                                borderRadius: 4,
                                '&:hover': {
                                    bgcolor: alpha('#667eea', 0.5),
                                },
                            },
                        }}
                    >
                        {CREDIT_STATES.map((state) => {
                            const statePartners = getFilteredPartners().filter(
                                (partner) => (partner.ESTADO_CREDITO ?? 0) === state.value
                            ) || [];

                            return (
                                <Box
                                    key={state.value}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(state.value)}
                                    sx={{
                                        minWidth: 320,
                                        maxWidth: 320,
                                        bgcolor: alpha(state.color, 0.03),
                                        borderRadius: 2,
                                        p: 2,
                                        border: '2px solid',
                                        borderColor: draggedCard && draggedCard.ESTADO_CREDITO !== state.value
                                            ? alpha(state.color, 0.5)
                                            : alpha(state.color, 0.15),
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: alpha(state.color, 0.4),
                                            bgcolor: alpha(state.color, 0.06),
                                        },
                                    }}
                                >
                                    {/* Header de columna */}
                                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                        <Box sx={{ fontSize: '24px' }}>{state.icon}</Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                                {state.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {state.description}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={statePartners.length}
                                            size="small"
                                            sx={{
                                                bgcolor: state.color,
                                                color: 'white',
                                                fontWeight: 'bold',
                                                minWidth: 32,
                                            }}
                                        />
                                    </Stack>

                                    {/* Tarjetas */}
                                    <Box
                                        sx={{
                                            maxHeight: 'calc(100vh - 420px)',
                                            overflowY: 'auto',
                                            pr: 1,
                                            '&::-webkit-scrollbar': {
                                                width: 6,
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                bgcolor: alpha(state.color, 0.05),
                                                borderRadius: 3,
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                bgcolor: alpha(state.color, 0.3),
                                                borderRadius: 3,
                                                '&:hover': {
                                                    bgcolor: alpha(state.color, 0.5),
                                                },
                                            },
                                        }}
                                    >
                                        {statePartners.length === 0 ? (
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    py: 4,
                                                    color: 'text.disabled',
                                                }}
                                            >
                                                <Iconify icon="eva:inbox-outline" width={48} sx={{ mb: 1, opacity: 0.3 }} />
                                                <Typography variant="body2">
                                                    {searchQuery || filterType !== 'all' || filterVendedor !== 'all'
                                                        ? 'Sin coincidencias'
                                                        : 'No hay registros'}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            statePartners.map((partner) => (
                                                <CreditCard key={partner.ID_EMPRESA || partner.RUC} partner={partner} />
                                            ))
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                <Drawer
                    anchor="right"
                    open={Boolean(openPopover)}
                    onClose={handleClosePopover}
                    PaperProps={{
                        sx: {
                            width: { xs: '80vw', sm: 340 },
                            p: 0,
                        },
                    }}
                >
                    {/* Header del drawer */}
                    <Box
                        sx={{
                            p: 2.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack>
                                <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                                    Acciones
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                                    {selectedPartner?.NOMBRE || 'Registro'}
                                </Typography>
                                {selectedPartner?.RUC && (
                                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                                        RUC: {selectedPartner.RUC}
                                    </Typography>
                                )}
                            </Stack>
                            <IconButton
                                onClick={handleClosePopover}
                                sx={{ color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.15) } }}
                            >
                                <Iconify icon="eva:close-fill" />
                            </IconButton>
                        </Stack>
                    </Box>

                    <Divider />

                    <List sx={{ p: 1 }}>
                        <ListItemButton
                            onClick={() => {
                                handleOpenChangeState();
                                handleClosePopover();
                            }}
                            sx={{ borderRadius: 1, py: 1.25 }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <Iconify icon="eva:swap-outline" width={22} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Cambiar Estado"
                                secondary="Mover la tarjeta a otra fase"
                                primaryTypographyProps={{ fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItemButton>

                        <ListItemButton
                            onClick={() => {
                                handleOpenChangeTipoCliente();
                                handleClosePopover();
                            }}
                            sx={{ borderRadius: 1, py: 1.25 }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <Iconify icon="mdi:account-group" width={22} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Tipo de Cliente"
                                secondary="Clasificar al cliente"
                                primaryTypographyProps={{ fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItemButton>

                        <ListItemButton
                            onClick={() => {
                                handleOpenOBS();
                                handleClosePopover();
                            }}
                            sx={{ borderRadius: 1, py: 1.25 }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <Iconify icon="eva:message-circle-outline" width={22} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Observación"
                                secondary="Agregar nota interna"
                                primaryTypographyProps={{ fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItemButton>

                        <Divider sx={{ my: 1 }} />

                        <ListItemButton
                            onClick={() => {
                                VerInformacionUanataca();
                                handleClosePopover();
                            }}
                            sx={{ borderRadius: 1, py: 1.25 }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <Iconify icon="mdi:web" width={22} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Ver en Uanataca"
                                secondary="Abrir consola externa"
                                primaryTypographyProps={{ fontWeight: 600 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItemButton>
                    </List>
                </Drawer>

                <ConfirmDialog
                    open={openChangeState}
                    onClose={handleCloseChangeState}
                    title="Cambiar Estado del Crédito"
                    content={
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                Selecciona el nuevo estado para este crédito:
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                label="Nuevo Estado"
                                value={selectedNewState}
                                onChange={handleChangeNewState}
                                sx={{ mb: 2 }}
                            >
                                {CREDIT_STATES.map((state) => (
                                    <MenuItem key={state.value} value={state.value}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box sx={{ fontSize: '20px' }}>{state.icon}</Box>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {state.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {state.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    }
                    action={
                        <Button
                            variant="contained"
                            onClick={() => {
                                onChangeState();
                                handleCloseChangeState();
                            }}
                            sx={{
                                bgcolor: CREDIT_STATES[selectedNewState]?.color,
                                '&:hover': {
                                    bgcolor: CREDIT_STATES[selectedNewState]?.color,
                                    opacity: 0.9,
                                },
                            }}
                        >
                            Cambiar Estado
                        </Button>
                    }
                />

                <ConfirmDialog
                    open={openOBS}
                    onClose={handleCloseOBS}
                    title="Observación Cartera (UANATACA)"
                    action={
                        <>
                            <TextField
                                label="Nota"
                                value={valueNewOBS}
                                onChange={handleChangeOBS}
                            />
                            <Button variant="contained" color="error" onClick={() => {
                                onRowOBS();
                            }}>
                                Guardar.
                            </Button>
                        </>
                    }
                />

                <ConfirmDialog
                    open={openChangeTipoCliente}
                    onClose={handleCloseChangeTipoCliente}
                    title="Cambiar Tipo de Cliente"
                    content={
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                Selecciona el tipo de cliente para: <strong>{selectedPartner?.NOMBRE}</strong>
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                label="Tipo de Cliente"
                                value={selectedTipoCliente || ''}
                                onChange={handleChangeTipoCliente}
                                helperText="Categoría de cliente según clasificación empresarial"
                            >
                                {TIPOS_CLIENTE.map((tipo) => (
                                    <MenuItem key={tipo.value} value={tipo.value}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box
                                                sx={{
                                                    fontSize: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '8px',
                                                    bgcolor: alpha(tipo.color, 0.1),
                                                }}
                                            >
                                                {tipo.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {tipo.label}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: tipo.color, fontWeight: 500 }}>
                                                    Código: {tipo.value}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    }
                    action={
                        <Button
                            variant="contained"
                            onClick={onUpdateTipoCliente}
                            disabled={!selectedTipoCliente}
                            sx={{
                                bgcolor: selectedTipoCliente ? TIPOS_CLIENTE.find(t => t.value === selectedTipoCliente)?.color : 'grey',
                                '&:hover': {
                                    bgcolor: selectedTipoCliente ? TIPOS_CLIENTE.find(t => t.value === selectedTipoCliente)?.color : 'grey',
                                    opacity: 0.9,
                                },
                            }}
                        >
                            💾 Guardar Tipo
                        </Button>
                    }
                />

                <ConfirmDialog
                    open={openEstadoFirma}
                    onClose={handleCloseEstadoFirma}
                    maxWidth="md"
                    title={estadoFirmaTitulo}
                    content={
                        <Box sx={{ pt: 2, minWidth: { xs: '100%', sm: 640 } }}>
                            {loadingEstadoFirma && (
                                <Stack alignItems="center" py={3}>
                                    <CircularProgress />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Consultando Uanataca...
                                    </Typography>
                                </Stack>
                            )}
                            {!loadingEstadoFirma && estadoFirmaError && (
                                <Typography color="error" variant="body2">
                                    ❌ {estadoFirmaError}
                                </Typography>
                            )}
                            {!loadingEstadoFirma && !estadoFirmaError && estadoFirmaData && (
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Flow ID</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                            {estadoFirmaData.flowId}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Chip
                                            label={`Estado: ${estadoFirmaData.flow?.status || '—'}`}
                                            color={estadoFirmaData.flow?.status === 'COMPLETED' ? 'success' : 'primary'}
                                            sx={{ fontWeight: 600 }}
                                        />
                                        <Chip
                                            label={`Activo: ${estadoFirmaData.flow?.active ? 'Sí' : 'No'}`}
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`Tipo: ${estadoFirmaData.flow?.flowType || '—'}`}
                                            variant="outlined"
                                        />
                                    </Stack>

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            📄 Documentos ({estadoFirmaData.documents.length})
                                        </Typography>
                                        {estadoFirmaData.documents.length === 0 ? (
                                            <Typography variant="body2" color="text.disabled">
                                                Sin documentos asociados.
                                            </Typography>
                                        ) : (
                                            <Stack spacing={1}>
                                                {estadoFirmaData.documents.map((doc) => (
                                                    <Card key={doc.id} variant="outlined" sx={{ p: 1.5 }}>
                                                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                                            <Iconify icon="mdi:file-pdf-box" width={20} color="#e53935" />
                                                            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                                                                {doc.name || doc.filename || doc.id}
                                                            </Typography>
                                                            <Chip
                                                                label={doc.signingStatus || '—'}
                                                                size="small"
                                                                color={doc.signingStatus === 'COMPLETED' ? 'success' : 'default'}
                                                            />
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            Firmas: {doc.completedSigners ?? 0} / {doc.totalSigners ?? 0}
                                                            {typeof doc.size === 'number' && ` · ${(doc.size / 1024).toFixed(1)} KB`}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', wordBreak: 'break-all' }}>
                                                            {doc.id}
                                                        </Typography>
                                                        <Stack direction="row" justifyContent="flex-end" mt={1}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                startIcon={<Iconify icon="mdi:eye-outline" />}
                                                                onClick={() => handleVerPdfDocumento(doc)}
                                                            >
                                                                Ver PDF
                                                            </Button>
                                                        </Stack>
                                                    </Card>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </Stack>
                            )}
                        </Box>
                    }
                    action={
                        <Button variant="contained" onClick={handleCloseEstadoFirma}>
                            Cerrar
                        </Button>
                    }
                />
            </Container>
        </>
    )
}
