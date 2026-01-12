import { useState } from 'react';
// @mui
import {
    Container,
    Card,
    Stack,
    Button,
    Box,
    Typography,
    CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';
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
// utils
import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

NumeroGuiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

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
            'ID': item.ID,
            'Número Factura': item.NUMEROFACTURALIDENAR,
            'Fecha Facturación': item.FECHAFACTURACION,
            'Cliente ID': item.CLIENTEID,
            'Nombre Cliente': item.NOMBRE,
            'Empresa': item.EMPRESA,
            'Total con IVA': item.total_con_iva,
            'Número Guía': item.NUMEROGUIA,
            'Usuario Entregará': item.NOMBREUSUARIOENTREGARA,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();

        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 10 },  // ID
            { wch: 20 },  // Número Factura
            { wch: 20 },  // Fecha Facturación
            { wch: 12 },  // Cliente ID
            { wch: 35 },  // Nombre Cliente
            { wch: 10 },  // Empresa
            { wch: 15 },  // Total con IVA
            { wch: 20 },  // Número Guía
            { wch: 30 },  // Usuario Entregará
        ];

        // Generar nombre de archivo con fecha y hora
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `Reporte_Numero_Guia_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Guías');
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

export default function NumeroGuiaPage() {
    const { user } = useAuthContext();
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Función para cargar datos con rango de fechas
    const fetchDataByDateRange = async () => {
        if (!fechaInicio || !fechaFin) {
            alert('Por favor seleccione ambas fechas');
            return;
        }

        setLoading(true);
        try {
            // Formatear fechas a DD-MM-YYYY
            const formatDate = (date) => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const formattedStartDate = formatDate(fechaInicio);
            const formattedEndDate = formatDate(fechaFin);

            console.log('Fechas formateadas:', formattedStartDate, formattedEndDate);

            const response = await axios.get('/hanadb/api/power_bi/ordenes_con_guias', {
                params: {
                    fecha_inicio: formattedStartDate,
                    fecha_fin: formattedEndDate
                }
            });

            console.log('Respuesta del servidor:', response.data);
            setData(response.data);

        } catch (error) {
            console.error('Error al obtener los datos:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            alert(`Error al cargar los datos del reporte: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Función para limpiar filtros
    const handleLimpiarFiltros = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setData([]);
    };

    // Definir las columnas del DataGrid
    const columns = [
        {
            field: 'ID',
            headerName: 'ID',
            flex: 0.5,
            minWidth: 80,
        },
        {
            field: 'NUMEROFACTURALIDENAR',
            headerName: 'Número Factura',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'FECHAFACTURACION',
            headerName: 'Fecha Facturación',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'CLIENTEID',
            headerName: 'Cliente ID',
            flex: 0.7,
            minWidth: 100,
        },
        {
            field: 'NOMBRE',
            headerName: 'Nombre Cliente',
            flex: 2,
            minWidth: 250,
        },
        {
            field: 'EMPRESA',
            headerName: 'Empresa',
            flex: 0.5,
            minWidth: 80,
            renderCell: (params) => (
                <Box
                    sx={{
                        backgroundColor: params.value === 'HT' ? '#e3f2fd' : '#fff3e0',
                        color: params.value === 'HT' ? '#1976d2' : '#f57c00',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                    }}
                >
                    {params.value}
                </Box>
            ),
        },
        {
            field: 'total_con_iva',
            headerName: 'Total con IVA',
            flex: 1,
            minWidth: 130,
            type: 'number',
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                return !isNaN(value) ? `$${value.toFixed(2)}` : '$0.00';
            },
        },
        {
            field: 'NUMEROGUIA',
            headerName: 'Número Guía',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'NOMBREUSUARIOENTREGARA',
            headerName: 'Usuario Entregará',
            flex: 1.5,
            minWidth: 200,
        },
    ];

    return (
        <>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 3 }}>
                    📦 Reporte de Órdenes con Número de Guía
                </Typography>

                <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <DatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => setFechaInicio(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: {
                                            backgroundColor: 'white',
                                            borderRadius: 1,
                                        }
                                    }
                                }}
                            />
                            <DatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => setFechaFin(newValue)}
                                minDate={fechaInicio}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: {
                                            backgroundColor: 'white',
                                            borderRadius: 1,
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={fetchDataByDateRange}
                                disabled={!fechaInicio || !fechaFin || loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:search-fill" />}
                                sx={{
                                    minWidth: 150,
                                    height: 56,
                                    bgcolor: 'white',
                                    color: '#667eea',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                    }
                                }}
                            >
                                {loading ? 'Cargando...' : 'Consultar'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleLimpiarFiltros}
                                sx={{
                                    minWidth: 150,
                                    height: 56,
                                    borderColor: 'white',
                                    color: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                    }
                                }}
                            >
                                Limpiar
                            </Button>
                        </Stack>
                    </LocalizationProvider>
                </Card>

                {data.length > 0 && (
                    <Card sx={{ p: 3 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                📊 Resultados: {data.length} registros encontrados
                            </Typography>
                            <ExcelDownload data={data} />
                        </Box>
                        <DataGrid
                            rows={data.map((item, index) => ({
                                ...item,
                                id: item.ID || index + 1,
                            }))}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            disableSelectionOnClick
                            autoHeight
                            components={{
                                Toolbar: CustomToolbar,
                            }}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    fontWeight: 'bold',
                                },
                            }}
                        />
                    </Card>
                )}

                {data.length === 0 && !loading && fechaInicio && fechaFin && (
                    <Card sx={{ p: 5, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron resultados para el rango de fechas seleccionado
                        </Typography>
                    </Card>
                )}
            </Container>
        </>
    );
}
