import React, { useState, useMemo } from 'react';
import { 
    Box, Button, Card, Container, Stack, TextField, Typography, Grid, 
    Chip, Select, MenuItem, FormControl, InputLabel, alpha, useTheme, Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from '../../../utils/axios';
import EmptyContent from '../../../components/empty-content';
import Iconify from '../../../components/iconify';
import { fNumber, fCurrency, fPercent } from '../../../utils/formatNumber';
import { D3BarChart, D3LineChart, D3PieChart, D3ScatterPlot } from '../../../components/d3-charts';
import { 
    AnalyticsWidgetSummary,
    AnalyticsCurrentVisits,
    AnalyticsConversionRates,
    AnalyticsWebsiteVisits
} from '../general/analytics';

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter />
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

function ExcelDownload({ data }) {
    const handleExportToExcel = () => {
        const exportData = data.map(item => ({
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
            'Nombre Item': item['Nombre Item2'],
            'Costo Unitario': item.C_U,
            'Neto Unitario': item.N_U,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Ajustar ancho de columnas
        ws['!cols'] = [
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
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filtros dinámicos
    const [selectedVendedor, setSelectedVendedor] = useState('Todos');
    const [selectedMarca, setSelectedMarca] = useState('Todas');
    const [selectedCliente, setSelectedCliente] = useState('Todos');
    const [selectedTipoCliente, setSelectedTipoCliente] = useState('Todos');
    const [showOnlyBajoCosto, setShowOnlyBajoCosto] = useState(false);

    // Función para cargar datos con rango de fechas
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
                    fecha_fin: formattedEndDate
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

    // Función para limpiar filtros
    const handleLimpiarFiltros = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setData([]);
        setSelectedVendedor('Todos');
        setSelectedMarca('Todas');
        setSelectedCliente('Todos');
        setSelectedTipoCliente('Todos');
        setShowOnlyBajoCosto(false);
    };

    // ========== FILTROS DINÁMICOS ==========
    const vendedores = useMemo(() => {
        const unique = [...new Set(data.map(item => item.Vendedor))].filter(Boolean);
        return ['Todos', ...unique.sort()];
    }, [data]);

    const marcas = useMemo(() => {
        const unique = [...new Set(data.map(item => item.Marca))].filter(Boolean);
        return ['Todas', ...unique.sort()];
    }, [data]);

    const clientes = useMemo(() => {
        const unique = [...new Set(data.map(item => item['Nombre Cliente']))].filter(Boolean);
        return ['Todos', ...unique.sort()];
    }, [data]);

    const tiposCliente = useMemo(() => {
        const unique = [...new Set(data.map(item => item['Nombre Tipo Cliente']))].filter(Boolean);
        return ['Todos', ...unique.sort()];
    }, [data]);

    // Datos filtrados
    const filteredData = useMemo(() => {
        return data.filter(item => {
            if (selectedVendedor !== 'Todos' && item.Vendedor !== selectedVendedor) return false;
            if (selectedMarca !== 'Todas' && item.Marca !== selectedMarca) return false;
            if (selectedCliente !== 'Todos' && item['Nombre Cliente'] !== selectedCliente) return false;
            if (selectedTipoCliente !== 'Todos' && item['Nombre Tipo Cliente'] !== selectedTipoCliente) return false;
            if (showOnlyBajoCosto && item['Bajo Costo'] !== 'si') return false;
            return true;
        });
    }, [data, selectedVendedor, selectedMarca, selectedCliente, selectedTipoCliente, showOnlyBajoCosto]);

    // ========== ANÁLISIS 1: RENTABILIDAD POR VENDEDOR ==========
    const rentabilidadPorVendedor = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ vendedor: 'Sin datos', utilidad: 0, perdida: 0, ventas: 0, utilidadNeta: 0 }];
        }
        const grouped = {};
        filteredData.forEach(item => {
            const vendedor = item.Vendedor || 'Sin Vendedor';
            if (!grouped[vendedor]) {
                grouped[vendedor] = { utilidad: 0, perdida: 0, ventas: 0 };
            }
            grouped[vendedor].utilidad += (item['Utilidad Generada'] || 0);
            grouped[vendedor].perdida += (item['Utilidad Negativa'] || 0);
            grouped[vendedor].ventas += (item['Sum of Neto'] || 0);
        });
        const result = Object.entries(grouped)
            .map(([vendedor, stats]) => ({
                vendedor,
                ...stats,
                utilidadNeta: stats.utilidad - stats.perdida
            }))
            .sort((a, b) => b.utilidadNeta - a.utilidadNeta)
            .slice(0, 10);
        return result.length > 0 ? result : [{ vendedor: 'Sin datos', utilidad: 0, perdida: 0, ventas: 0, utilidadNeta: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS 2: CLIENTES PROBLEMÁTICOS ==========
    const clientesProblematicos = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ cliente: 'Sin datos', count: 0, perdida: 0 }];
        }
        const grouped = {};
        filteredData.filter(item => item['Bajo Costo'] === 'si').forEach(item => {
            const cliente = item['Nombre Cliente'] || 'Sin Cliente';
            if (!grouped[cliente]) {
                grouped[cliente] = { count: 0, perdida: 0 };
            }
            grouped[cliente].count += 1;
            grouped[cliente].perdida += (item['Utilidad Negativa'] || 0);
        });
        const result = Object.entries(grouped)
            .map(([cliente, stats]) => ({ cliente, ...stats }))
            .sort((a, b) => b.perdida - a.perdida)
            .slice(0, 10);
        return result.length > 0 ? result : [{ cliente: 'Sin datos', count: 0, perdida: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS 3: PRODUCTOS MÁS RENTABLES POR MARCA ==========
    const productosPorMarca = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ marca: 'Sin datos', utilidad: 0 }];
        }
        const grouped = {};
        filteredData.forEach(item => {
            const marca = item.Marca || 'Sin Marca';
            if (!grouped[marca]) {
                grouped[marca] = 0;
            }
            grouped[marca] += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
        });
        const result = Object.entries(grouped)
            .map(([marca, utilidad]) => ({ marca, utilidad }))
            .sort((a, b) => b.utilidad - a.utilidad);
        return result.length > 0 ? result : [{ marca: 'Sin datos', utilidad: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS 4: MÁRGENES UNITARIOS ==========
    const margenesUnitarios = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ producto: 'Sin datos', vendedor: 'N/A', margen: 0, utilidad: 0 }];
        }
        const result = filteredData
            .filter(item => item.N_U && item.C_U && item.N_U > 0)
            .map(item => ({
                producto: item['Nombre Item2'] || 'Sin nombre',
                vendedor: item.Vendedor || 'Sin vendedor',
                margen: ((item.N_U - item.C_U) / item.N_U * 100),
                utilidad: (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0)
            }))
            .sort((a, b) => b.margen - a.margen)
            .slice(0, 15);
        return result.length > 0 ? result : [{ producto: 'Sin datos', vendedor: 'N/A', margen: 0, utilidad: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS 5: VENTAS CON PÉRDIDA ==========
    const ventasConPerdida = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [];
        }
        return filteredData
            .filter(item => (item['Utilidad Negativa'] || 0) > 0)
            .sort((a, b) => (b['Utilidad Negativa'] || 0) - (a['Utilidad Negativa'] || 0));
    }, [filteredData]);

    // ========== KPIs PRINCIPALES ==========
    const kpis = useMemo(() => {
        const totalUtilidad = filteredData.reduce((sum, item) => sum + (item['Utilidad Generada'] || 0), 0);
        const totalPerdida = filteredData.reduce((sum, item) => sum + (item['Utilidad Negativa'] || 0), 0);
        const totalVentas = filteredData.reduce((sum, item) => sum + (item['Sum of Neto'] || 0), 0);
        const totalCostos = filteredData.reduce((sum, item) => sum + (item['Sum of Costo'] || 0), 0);
        const margenPromedio = totalVentas > 0 ? ((totalVentas - totalCostos) / totalVentas * 100) : 0;
        const ventasBajoCosto = filteredData.filter(item => item['Bajo Costo'] === 'si').length;

        return {
            utilidadNeta: totalUtilidad - totalPerdida,
            totalVentas,
            margenPromedio,
            ventasBajoCosto,
            totalTransacciones: filteredData.length
        };
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 6: EVOLUCIÓN TEMPORAL ==========
    const evolucionTemporal = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ fecha: 'Sin datos', utilidad: 0, ventas: 0, perdidas: 0, cantidad: 0 }];
        }
        const grouped = {};
        filteredData.forEach(item => {
            const fecha = item.DocDate ? item.DocDate.split('T')[0] : 'Sin Fecha';
            if (!grouped[fecha]) {
                grouped[fecha] = { utilidad: 0, ventas: 0, perdidas: 0, cantidad: 0 };
            }
            grouped[fecha].utilidad += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
            grouped[fecha].ventas += (item['Sum of Neto'] || 0);
            grouped[fecha].perdidas += (item['Utilidad Negativa'] || 0);
            grouped[fecha].cantidad += (item.Cantidad || 0);
        });
        const result = Object.entries(grouped)
            .map(([fecha, stats]) => ({ fecha, ...stats }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
        return result.length > 0 ? result : [{ fecha: 'Sin datos', utilidad: 0, ventas: 0, perdidas: 0, cantidad: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 7: PARETO 80/20 - PRODUCTOS ==========
    const paretoProductos = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ nombre: 'Sin datos', utilidad: 0, ventas: 0, porcentajeAcumulado: 0 }];
        }
        const productos = {};
        filteredData.forEach(item => {
            const nombre = item['Nombre Item2'] || 'Sin Nombre';
            if (!productos[nombre]) {
                productos[nombre] = { utilidad: 0, ventas: 0 };
            }
            productos[nombre].utilidad += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
            productos[nombre].ventas += (item['Sum of Neto'] || 0);
        });
        
        const sorted = Object.entries(productos)
            .map(([nombre, stats]) => ({ nombre, ...stats }))
            .sort((a, b) => b.utilidad - a.utilidad);
        
        if (sorted.length === 0) {
            return [{ nombre: 'Sin datos', utilidad: 0, ventas: 0, porcentajeAcumulado: 0 }];
        }
        
        const totalUtilidad = sorted.reduce((sum, p) => sum + p.utilidad, 0);
        let acumulado = 0;
        
        return sorted.map(item => {
            acumulado += item.utilidad;
            return {
                ...item,
                porcentajeAcumulado: totalUtilidad > 0 ? (acumulado / totalUtilidad * 100) : 0
            };
        }).slice(0, 20);
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 8: EFICIENCIA POR VENDEDOR ==========
    const eficienciaVendedores = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ vendedor: 'Sin datos', utilidad: 0, ventas: 0, transacciones: 0, ventasBajoCosto: 0, unidadesVendidas: 0, roi: 0, ticketPromedio: 0, tasaCalidad: 0 }];
        }
        const vendedoresStats = {};
        filteredData.forEach(item => {
            const vendedor = item.Vendedor || 'Sin Vendedor';
            if (!vendedoresStats[vendedor]) {
                vendedoresStats[vendedor] = {
                    utilidad: 0,
                    ventas: 0,
                    transacciones: 0,
                    ventasBajoCosto: 0,
                    unidadesVendidas: 0
                };
            }
            vendedoresStats[vendedor].utilidad += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
            vendedoresStats[vendedor].ventas += (item['Sum of Neto'] || 0);
            vendedoresStats[vendedor].transacciones += 1;
            vendedoresStats[vendedor].unidadesVendidas += (item.Cantidad || 0);
            if (item['Bajo Costo'] === 'si') {
                vendedoresStats[vendedor].ventasBajoCosto += 1;
            }
        });
        
        const result = Object.entries(vendedoresStats)
            .map(([vendedor, stats]) => ({
                vendedor,
                ...stats,
                roi: stats.ventas > 0 ? (stats.utilidad / stats.ventas * 100) : 0,
                ticketPromedio: stats.transacciones > 0 ? (stats.ventas / stats.transacciones) : 0,
                tasaCalidad: stats.transacciones > 0 ? ((stats.transacciones - stats.ventasBajoCosto) / stats.transacciones * 100) : 0
            }))
            .sort((a, b) => b.roi - a.roi);
        return result.length > 0 ? result : [{ vendedor: 'Sin datos', utilidad: 0, ventas: 0, transacciones: 0, ventasBajoCosto: 0, unidadesVendidas: 0, roi: 0, ticketPromedio: 0, tasaCalidad: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 9: CLIENTES DE ALTO RIESGO ==========
    const clientesAltoRiesgo = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ cliente: 'Sin datos', ventas: 0, utilidad: 0, perdida: 0, transacciones: 0, bajoCosto: 0, margen: 0, tasaBajoCosto: 0, riesgo: 0 }];
        }
        const clientesStats = {};
        filteredData.forEach(item => {
            const cliente = item['Nombre Cliente'] || 'Sin Cliente';
            if (!clientesStats[cliente]) {
                clientesStats[cliente] = {
                    ventas: 0,
                    utilidad: 0,
                    perdida: 0,
                    transacciones: 0,
                    bajoCosto: 0
                };
            }
            clientesStats[cliente].ventas += (item['Sum of Neto'] || 0);
            clientesStats[cliente].utilidad += (item['Utilidad Generada'] || 0);
            clientesStats[cliente].perdida += (item['Utilidad Negativa'] || 0);
            clientesStats[cliente].transacciones += 1;
            if (item['Bajo Costo'] === 'si') clientesStats[cliente].bajoCosto += 1;
        });
        
        const result = Object.entries(clientesStats)
            .map(([cliente, stats]) => ({
                cliente,
                ...stats,
                margen: stats.ventas > 0 ? ((stats.utilidad - stats.perdida) / stats.ventas * 100) : 0,
                tasaBajoCosto: stats.transacciones > 0 ? (stats.bajoCosto / stats.transacciones * 100) : 0,
                riesgo: (stats.ventas * 0.3) + ((stats.transacciones > 0 ? (stats.bajoCosto / stats.transacciones * 100) : 0) * 0.7)
            }))
            .filter(c => c.tasaBajoCosto > 20 || c.margen < 10)
            .sort((a, b) => b.riesgo - a.riesgo)
            .slice(0, 15);
        return result.length > 0 ? result : [{ cliente: 'Sin datos', ventas: 0, utilidad: 0, perdida: 0, transacciones: 0, bajoCosto: 0, margen: 0, tasaBajoCosto: 0, riesgo: 0 }];
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 10: MATRIZ PRODUCTO (Volumen vs Margen) ==========
    const matrizProductos = useMemo(() => {
        const productos = {};
        filteredData.forEach(item => {
            const nombre = item['Nombre Item2'] || 'Sin Nombre';
            const marca = item.Marca || 'Sin Marca';
            const key = `${nombre}|${marca}`;
            
            if (!productos[key]) {
                productos[key] = {
                    nombre,
                    marca,
                    ventas: 0,
                    utilidad: 0,
                    cantidad: 0
                };
            }
            productos[key].ventas += (item['Sum of Neto'] || 0);
            productos[key].utilidad += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
            productos[key].cantidad += (item.Cantidad || 0);
        });
        
        return Object.values(productos)
            .map(p => ({
                ...p,
                margen: p.ventas > 0 ? (p.utilidad / p.ventas * 100) : 0
            }))
            .filter(p => p.ventas > 0)
            .slice(0, 50);
    }, [filteredData]);

    // ========== ANÁLISIS AVANZADO 11: DISTRIBUCIÓN POR TIPO CLIENTE ==========
    const distribucionTipoCliente = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return [{ tipo: 'Sin datos', utilidad: 0, ventas: 0, transacciones: 0, numClientes: 0, ticketPromedio: 0, margen: 0 }];
        }
        const tipos = {};
        filteredData.forEach(item => {
            const tipo = item['Nombre Tipo Cliente'] || 'Sin Tipo';
            if (!tipos[tipo]) {
                tipos[tipo] = {
                    utilidad: 0,
                    ventas: 0,
                    transacciones: 0,
                    clientes: new Set()
                };
            }
            tipos[tipo].utilidad += (item['Utilidad Generada'] || 0) - (item['Utilidad Negativa'] || 0);
            tipos[tipo].ventas += (item['Sum of Neto'] || 0);
            tipos[tipo].transacciones += 1;
            tipos[tipo].clientes.add(item['Nombre Cliente']);
        });
        
        const result = Object.entries(tipos)
            .map(([tipo, stats]) => ({
                tipo,
                utilidad: stats.utilidad,
                ventas: stats.ventas,
                transacciones: stats.transacciones,
                numClientes: stats.clientes.size,
                ticketPromedio: stats.transacciones > 0 ? (stats.ventas / stats.transacciones) : 0,
                margen: stats.ventas > 0 ? (stats.utilidad / stats.ventas * 100) : 0
            }))
            .sort((a, b) => b.utilidad - a.utilidad);
        return result.length > 0 ? result : [{ tipo: 'Sin datos', utilidad: 0, ventas: 0, transacciones: 0, numClientes: 0, ticketPromedio: 0, margen: 0 }];
    }, [filteredData]);

    // Definir las columnas del DataGrid
    const columns = [
        {
            field: 'DocDate',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 120,
        },
        {
            field: 'Vendedor',
            headerName: 'Vendedor',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'Nombre Cliente',
            headerName: 'Nombre Cliente',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'Tipo Cliente',
            headerName: 'Tipo Cliente',
            flex: 0.8,
            minWidth: 120,
        },
        {
            field: 'Nombre Tipo Cliente',
            headerName: 'Nombre Tipo Cliente',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'Utilidad Generada',
            headerName: 'Utilidad Generada',
            flex: 1,
            minWidth: 150,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'Utilidad Negativa',
            headerName: 'Utilidad Negativa',
            flex: 1,
            minWidth: 150,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'Bajo Costo',
            headerName: 'Bajo Costo',
            flex: 0.7,
            minWidth: 100,
            renderCell: (params) => (
                <Box
                    sx={{
                        backgroundColor: params.value === 'si' ? '#ffebee' : '#e8f5e9',
                        color: params.value === 'si' ? '#c62828' : '#2e7d32',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                    }}
                >
                    {params.value?.toUpperCase()}
                </Box>
            ),
        },
        {
            field: 'Marca',
            headerName: 'Marca',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'Cantidad',
            headerName: 'Cantidad',
            flex: 0.7,
            minWidth: 100,
            type: 'number',
        },
        {
            field: 'Sum of Neto',
            headerName: 'Total Neto',
            flex: 1,
            minWidth: 130,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'Sum of Costo',
            headerName: 'Total Costo',
            flex: 1,
            minWidth: 130,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'Nombre Item2',
            headerName: 'Producto',
            flex: 2,
            minWidth: 300,
        },
        {
            field: 'C_U',
            headerName: 'Costo Unitario',
            flex: 1,
            minWidth: 130,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'N_U',
            headerName: 'Neto Unitario',
            flex: 1,
            minWidth: 130,
            type: 'number',
            valueFormatter: (params) => {
                return params.value != null ? `$${params.value.toFixed(2)}` : '$0.00';
            },
        },
    ];

    return (
        <Container maxWidth="xl">
            <Stack spacing={3}>
                {/* HEADER */}
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Dashboard de Rentabilidad
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Análisis dinámico de utilidades por vendedor, cliente y producto
                    </Typography>
                </Box>

                {/* FILTROS DE FECHA */}
                <Card sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)` }}>
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

                {data.length > 0 && (
                    <>
                        {/* FILTROS DINÁMICOS */}
                        <Card sx={{ 
                            p: 3, 
                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon="eva:funnel-fill" width={24} />
                                Filtros Dinámicos
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Vendedor</InputLabel>
                                        <Select
                                            value={selectedVendedor}
                                            onChange={(e) => setSelectedVendedor(e.target.value)}
                                            label="Vendedor"
                                        >
                                            {vendedores.map(v => (
                                                <MenuItem key={v} value={v}>{v}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Marca</InputLabel>
                                        <Select
                                            value={selectedMarca}
                                            onChange={(e) => setSelectedMarca(e.target.value)}
                                            label="Marca"
                                        >
                                            {marcas.map(m => (
                                                <MenuItem key={m} value={m}>{m}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo Cliente</InputLabel>
                                        <Select
                                            value={selectedTipoCliente}
                                            onChange={(e) => setSelectedTipoCliente(e.target.value)}
                                            label="Tipo Cliente"
                                        >
                                            {tiposCliente.map(t => (
                                                <MenuItem key={t} value={t}>{t}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Cliente</InputLabel>
                                        <Select
                                            value={selectedCliente}
                                            onChange={(e) => setSelectedCliente(e.target.value)}
                                            label="Cliente"
                                        >
                                            {clientes.slice(0, 100).map(c => (
                                                <MenuItem key={c} value={c}>{c}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.4}>
                                    <Button
                                        fullWidth
                                        variant={showOnlyBajoCosto ? 'contained' : 'outlined'}
                                        color="error"
                                        size="large"
                                        onClick={() => setShowOnlyBajoCosto(!showOnlyBajoCosto)}
                                        startIcon={<Iconify icon="eva:alert-triangle-fill" />}
                                        sx={{ height: 56 }}
                                    >
                                        Solo Bajo Costo
                                    </Button>
                                </Grid>
                            </Grid>
                            {filteredData.length !== data.length && (
                                <Box sx={{ mt: 2 }}>
                                    <Chip 
                                        label={`${filteredData.length} de ${data.length} registros`}
                                        color="primary"
                                        icon={<Iconify icon="eva:funnel-fill" />}
                                        sx={{ 
                                            fontWeight: 700, 
                                            fontSize: '0.95rem',
                                            py: 2.5,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </Box>
                            )}
                        </Card>

                        {/* KPIs PRINCIPALES */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`, 
                                    color: 'white',
                                    boxShadow: '0 12px 24px rgba(46, 125, 50, 0.3)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 16px 32px rgba(46, 125, 50, 0.4)'
                                    }
                                }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify icon="eva:trending-up-fill" width={32} />
                                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                                                Utilidad Neta
                                            </Typography>
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                            {fCurrency(kpis.utilidadNeta)}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`, 
                                    color: 'white',
                                    boxShadow: '0 12px 24px rgba(2, 136, 209, 0.3)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 16px 32px rgba(2, 136, 209, 0.4)'
                                    }
                                }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify icon="eva:shopping-cart-fill" width={32} />
                                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                                                Total Ventas
                                            </Typography>
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                            {fCurrency(kpis.totalVentas)}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`, 
                                    color: 'white',
                                    boxShadow: '0 12px 24px rgba(237, 108, 2, 0.3)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 16px 32px rgba(237, 108, 2, 0.4)'
                                    }
                                }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify icon="eva:percent-outline" width={32} />
                                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                                                Margen Promedio
                                            </Typography>
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                            {kpis.margenPromedio.toFixed(1)}%
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`, 
                                    color: 'white',
                                    boxShadow: '0 12px 24px rgba(211, 47, 47, 0.3)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 16px 32px rgba(211, 47, 47, 0.4)'
                                    }
                                }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify icon="eva:alert-circle-fill" width={32} />
                                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                                                Ventas Bajo Costo
                                            </Typography>
                                        </Box>
                                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                            {kpis.ventasBajoCosto}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* GRÁFICOS DINÁMICOS */}
                        <Grid container spacing={3}>
                            {/* EVOLUCIÓN TEMPORAL */}
                            {evolucionTemporal.length > 0 && evolucionTemporal[0].fecha !== 'Sin datos' && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                        <Iconify icon="eva:trending-up-fill" width={28} />
                                        📈 Evolución Temporal de Ventas y Utilidad
                                    </Typography>
                                    <Box sx={{ height: 450 }}>
                                        <D3LineChart
                                            data={evolucionTemporal}
                                            xKey="fecha"
                                            yKeys={['utilidad', 'ventas', 'perdidas']}
                                            height={450}
                                            colors={[theme.palette.success.main, theme.palette.info.main, theme.palette.error.main]}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* ANÁLISIS PARETO */}
                            {paretoProductos.length > 0 && paretoProductos[0].nombre !== 'Sin datos' && (
                            <Grid item xs={12} lg={6}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Iconify icon="eva:pie-chart-fill" width={24} />
                                        📊 Análisis Pareto 80/20 - Top 20 Productos
                                    </Typography>
                                    <Box sx={{ height: 450 }}>
                                        <D3BarChart
                                            data={paretoProductos.slice(0, 15).map(item => ({
                                                ...item,
                                                nombre: item.nombre.substring(0, 20)
                                            }))}
                                            xKey="nombre"
                                            yKey="utilidad"
                                            height={450}
                                            color={theme.palette.primary.main}
                                            horizontal={false}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* DISTRIBUCIÓN POR TIPO CLIENTE */}
                            {distribucionTipoCliente.length > 0 && distribucionTipoCliente[0].tipo !== 'Sin datos' && (
                            <Grid item xs={12} lg={6}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Iconify icon="eva:people-fill" width={24} />
                                        👥 Distribución por Tipo de Cliente
                                    </Typography>
                                    <Box sx={{ height: 450 }}>
                                        <D3BarChart
                                            data={distribucionTipoCliente}
                                            xKey="tipo"
                                            yKey="utilidad"
                                            height={450}
                                            color={theme.palette.success.main}
                                            horizontal={false}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* EFICIENCIA POR VENDEDOR */}
                            {eficienciaVendedores.length > 0 && eficienciaVendedores[0].vendedor !== 'Sin datos' && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.dark, 0.1)} 100%)`,
                                    boxShadow: '0 8px 32px rgba(46, 125, 50, 0.15)',
                                    borderRadius: 3,
                                    border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(46, 125, 50, 0.25)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Iconify icon="eva:award-fill" width={24} />
                                        🏆 Dashboard de Eficiencia por Vendedor
                                    </Typography>
                                    <Box sx={{ height: 500 }}>
                                        <D3BarChart
                                            data={eficienciaVendedores.map(item => ({
                                                vendedor: item.vendedor,
                                                roi: parseFloat(item.roi.toFixed(2))
                                            }))}
                                            xKey="vendedor"
                                            yKey="roi"
                                            height={500}
                                            color={theme.palette.success.main}
                                            horizontal={true}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* CLIENTES DE ALTO RIESGO */}
                            {clientesAltoRiesgo.length > 0 && clientesAltoRiesgo[0].cliente !== 'Sin datos' && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3, 
                                    border: `2px solid ${theme.palette.warning.main}`,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.dark, 0.1)} 100%)`,
                                    boxShadow: '0 8px 32px rgba(237, 108, 2, 0.15)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(237, 108, 2, 0.25)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                                        <Iconify icon="eva:shield-off-fill" width={24} />
                                        ⚠️ Clientes de Alto Riesgo (Bajo Margen / Alto % Bajo Costo)
                                    </Typography>
                                    <Box sx={{ height: 450 }}>
                                        <D3ScatterPlot
                                            data={clientesAltoRiesgo}
                                            xKey="margen"
                                            yKey="tasaBajoCosto"
                                            labelKey="cliente"
                                            sizeKey="ventas"
                                            height={450}
                                            color={theme.palette.error.main}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* 1. RENTABILIDAD POR VENDEDOR */}
                            {rentabilidadPorVendedor.length > 0 && rentabilidadPorVendedor[0].vendedor !== 'Sin datos' && (
                            <Grid item xs={12} lg={6}>
                                <AnalyticsConversionRates
                                    title="💰 Top 10 Vendedores por Rentabilidad"
                                    subheader="Utilidad neta (Generada - Negativa)"
                                    chart={{
                                        series: rentabilidadPorVendedor.map(item => ({
                                            label: item.vendedor,
                                            value: item.utilidadNeta
                                        }))
                                    }}
                                />
                            </Grid>
                            )}

                            {/* 3. PRODUCTOS POR MARCA */}
                            {productosPorMarca.length > 0 && productosPorMarca[0].marca !== 'Sin datos' && (
                            <Grid item xs={12} lg={6}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        🏷️ Utilidad por Marca
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Distribución de ganancias por marca
                                    </Typography>
                                    <Box sx={{ height: 400 }}>
                                        <D3PieChart
                                            data={productosPorMarca.slice(0, 8).map(item => ({
                                                marca: item.marca,
                                                utilidad: item.utilidad
                                            }))}
                                            labelKey="marca"
                                            valueKey="utilidad"
                                            height={400}
                                            colors={[
                                                theme.palette.primary.main,
                                                theme.palette.info.main,
                                                theme.palette.success.main,
                                                theme.palette.warning.main,
                                                theme.palette.error.main,
                                                theme.palette.primary.dark,
                                                theme.palette.info.dark,
                                                theme.palette.success.dark,
                                            ]}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* 4. MÁRGENES UNITARIOS */}
                            {margenesUnitarios.length > 0 && margenesUnitarios[0].producto !== 'Sin datos' && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Iconify icon="eva:bar-chart-fill" width={24} />
                                        📊 Top 15 Márgenes de Utilidad Unitarios
                                    </Typography>
                                    <Box sx={{ height: 500 }}>
                                        <D3BarChart
                                            data={margenesUnitarios.map(item => ({
                                                producto: item.producto?.substring(0, 30) || 'Sin nombre',
                                                margen: parseFloat(item.margen.toFixed(2))
                                            }))}
                                            xKey="producto"
                                            yKey="margen"
                                            height={500}
                                            color={theme.palette.info.main}
                                            horizontal={true}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* 2. CLIENTES PROBLEMÁTICOS */}
                            {clientesProblematicos.length > 0 && clientesProblematicos[0].cliente !== 'Sin datos' && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3, 
                                    border: `2px solid ${theme.palette.error.main}`,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.dark, 0.1)} 100%)`,
                                    boxShadow: '0 8px 32px rgba(211, 47, 47, 0.15)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(211, 47, 47, 0.25)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                                        <Iconify icon="eva:alert-triangle-fill" width={24} />
                                        🚨 Top 10 Clientes Problemáticos (Compran Bajo Costo)
                                    </Typography>
                                    <Box sx={{ height: 450 }}>
                                        <D3BarChart
                                            data={clientesProblematicos.map(item => ({
                                                cliente: item.cliente.substring(0, 25),
                                                count: item.count
                                            }))}
                                            xKey="cliente"
                                            yKey="count"
                                            height={450}
                                            color={theme.palette.error.main}
                                            horizontal={false}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                            )}

                            {/* 5. DETECCIÓN DE VENTAS CON PÉRDIDA */}
                            {ventasConPerdida.length > 0 && (
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                                    }
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Iconify icon="eva:trending-down-fill" width={24} color="error.main" />
                                            ⚠️ Detección de Ventas con Pérdida ({ventasConPerdida.length})
                                        </Typography>
                                        <ExcelDownload data={filteredData} />
                                    </Stack>
                                    <DataGrid
                                        rows={ventasConPerdida.slice(0, 100).map((item, index) => ({
                                            ...item,
                                            id: index + 1,
                                        }))}
                                        columns={columns}
                                        rowHeight={60}
                                        autoHeight
                                        pageSize={10}
                                        rowsPerPageOptions={[10, 25, 50]}
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No hay ventas con pérdida" sx={{ py: 10 }} />,
                                        }}
                                        disableSelectionOnClick
                                        sx={{
                                            '& .MuiDataGrid-row': {
                                                backgroundColor: alpha(theme.palette.error.main, 0.05),
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                }
                                            }
                                        }}
                                    />  
                                </Card>
                            </Grid>
                            )}

                            {/* TABLA COMPLETA */}
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    p: 3,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
                                    }
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Typography variant="h6">
                                            📋 Datos Completos ({filteredData.length} registros)
                                        </Typography>
                                    </Stack>
                                    <DataGrid
                                        rows={filteredData.map((item, index) => ({
                                            ...item,
                                            id: index + 1,
                                        }))}
                                        columns={columns}
                                        rowHeight={60}
                                        autoHeight
                                        pageSize={10}
                                        rowsPerPageOptions={[10, 25, 50, 100]}
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No hay datos" sx={{ py: 10 }} />,
                                        }}
                                        loading={loading}
                                        disableSelectionOnClick
                                        sx={{
                                            '& .MuiDataGrid-cell': {
                                                fontSize: '0.875rem',
                                            },
                                            '& .MuiDataGrid-columnHeaders': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                    />
                                </Card>
                            </Grid>
                        </Grid>
                    </>
                )}

                {!loading && data.length === 0 && (
                    <Card sx={{ p: 10 }}>
                        <EmptyContent
                            title="No hay datos"
                            description="Selecciona un rango de fechas y presiona 'Consultar' para ver el dashboard"
                            img="/assets/illustrations/illustration_empty_content.svg"
                        />
                    </Card>
                )}
            </Stack>
        </Container>
    );
}
