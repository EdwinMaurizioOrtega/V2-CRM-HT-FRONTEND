import React, { useState } from 'react';
// next
import Head from 'next/head';
// @mui
import { Box, Button, Card, Container, Grid, LinearProgress, FormGroup, FormControlLabel, Checkbox, Typography, TextField, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// ----------------------------------------------------------------------
import { useSettingsContext } from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import Link from "next/link";
import { useAuthContext } from "../../../auth/useAuthContext";
import * as XLSX from "xlsx";

// ----------------------------------------------------------------------

ReporteRRhhPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ReporteRRhhPage() {

    const { user } = useAuthContext();
    console.log("User en ReporteRRHH:", user);

    const { themeStretch } = useSettingsContext();

    // Estado para almacenar los datos y el estado de carga
    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados para el rango de fechas
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    // Estados para los checkboxes de ubicaciones
    const [ubicaciones, setUbicaciones] = useState({
        kleberGranda: false,      // ID: 1
        ambatoCentro: false,      // ID: 2
        cci: false,               // ID: 3
        mallDeLosAndes: false,    // ID: 4
        malteria: false,          // ID: 5
        paseoShopping: false,     // ID: 6
        quicentroSur: false,      // ID: 7
        recreo: false,            // ID: 8
        sanLuis: false,           // ID: 9
        administrador: false      // ID: 10
    });

    // Mapeo de ubicaciones con sus IDs y nombres
    const ubicacionConfig = {
        kleberGranda: { id: 1, nombre: 'KLEBER GRANDA' },
        ambatoCentro: { id: 2, nombre: 'AMBATO CENTRO' },
        cci: { id: 3, nombre: 'CCI' },
        mallDeLosAndes: { id: 4, nombre: 'MALL DE LOS ANDES' },
        malteria: { id: 5, nombre: 'MALTERIA' },
        paseoShopping: { id: 6, nombre: 'PASEO SHOPPING' },
        quicentroSur: { id: 7, nombre: 'QUICENTRO SUR' },
        recreo: { id: 8, nombre: 'RECREO' },
        sanLuis: { id: 9, nombre: 'SAN LUIS' },
        administrador: { id: 10, nombre: 'ADMINISTRADOR' }
    };

    // Función para manejar el cambio de checkboxes
    const handleUbicacionChange = (event) => {
        setUbicaciones({
            ...ubicaciones,
            [event.target.name]: event.target.checked
        });
    };

    // Filtrar datos según las ubicaciones seleccionadas y rango de fechas
    const getFilteredData = () => {
        // Primero filtrar por COMPANY
        let filteredByCompany = businessPartners;

        if (user.COMPANY === 'MC') {
            filteredByCompany = businessPartners.filter(partner => partner.COMPANY === 'MC');
        }

        if (user.COMPANY === 'HT') {
            filteredByCompany = businessPartners.filter(partner => partner.COMPANY === 'HT' || partner.COMPANY === 'NU');
        }

        // Filtrar por rango de fechas si están seleccionadas
        let filteredByDate = filteredByCompany;
        if (fechaInicio && fechaFin) {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const startDate = formatDate(fechaInicio);
            const endDate = formatDate(fechaFin);

            console.log("Filtro de fechas - Inicio:", startDate, "Fin:", endDate);
            console.log("Total registros antes de filtrar por fecha:", filteredByCompany.length);

            filteredByDate = filteredByCompany.filter(partner => {
                const markedDate = partner.MARKED_DATE;
                return markedDate >= startDate && markedDate <= endDate;
            });

            console.log("Total registros después de filtrar por fecha:", filteredByDate.length);
            if (filteredByDate.length > 0) {
                console.log("Ejemplo de registro filtrado:", filteredByDate[0]);
            }
        }

        const selectedUbicaciones = Object.keys(ubicaciones).filter(key => ubicaciones[key]);

        // Si no hay ninguna ubicación seleccionada, mostrar todos los datos filtrados por company y fecha
        if (selectedUbicaciones.length === 0) {
            return filteredByDate;
        }

        // Obtener los IDs de las ubicaciones seleccionadas
        const selectedIds = selectedUbicaciones.map(key => ubicacionConfig[key].id);

        // Filtrar los datos según el campo SUCURSAL
        return filteredByDate.filter(partner => {
            // Filtra por el campo SUCURSAL que viene de la API (números del 0 al 9)
            return selectedIds.includes(Number(partner.SUCURSAL));
        });
    };

    // Define las columnas para el DataGrid
    const baseColumns = [
        { field: 'ID', headerName: 'ID', width: 90 },
        { field: 'COMPANY', headerName: 'EMPRESA', width: 100 },
        {
            field: 'SUCURSAL',
            headerName: 'SUCURSAL',
            width: 200,
            renderCell: (params) => {
                const sucursalId = Number(params.row.SUCURSAL);

                // Buscar el nombre de la ubicación según el ID
                const ubicacion = Object.values(ubicacionConfig).find(ub => ub.id === sucursalId);

                if (ubicacion) {
                    return `[${sucursalId}] ${ubicacion.nombre}`;
                }

                // Si no encuentra la ubicación o es 0 (por defecto)
                return sucursalId === 0 ? '[0] SIN ASIGNAR' : `[${sucursalId}] Desconocido`;
            }
        },
        { field: 'USER_ID', headerName: 'User ID', width: 100 },
        { field: 'MARKED_DATE', headerName: 'Marked Date', width: 100 },
        { field: 'MARKED_TIME', headerName: 'Marked Time', width: 100 },
        { field: 'DISPLAYNAME', headerName: 'Display Name', width: 280 },
        {
            field: 'google_maps',
            headerName: 'Google Maps',
            width: 180,
            renderCell: (params) => {
                const latitude = params.row.LATITUDE;
                const longitude = params.row.LONGITUDE;
                const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

                return (
                    <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        Ver en Google Maps
                    </Link>
                );
            }
        },
        {
            field: 'preview',
            headerName: 'Evidencia Marcación',
            width: 150,
            renderCell: (params) => {
                const imageUrl = params.row.IMAGE_URL_EVIDENCIA;

                // Verificar si no hay imagen o es "<NULL>"
                if (!imageUrl || imageUrl === '' || imageUrl === null || imageUrl === '<NULL>') {
                    return (
                        <span style={{
                            color: '#d32f2f',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            Sin foto
                        </span>
                    );
                }

                return (
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => window.open(imageUrl, '_blank')}
                    >
                        Ver Foto
                    </Button>
                );
            }
        },

    ];

    // Función para cargar datos con rango de fechas
    const fetchDataByDateRange = async () => {
        if (!fechaInicio || !fechaFin) {
            alert('Por favor seleccione ambas fechas');
            return;
        }

        setLoading(true);
        try {
            // Formatear fechas a YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const startDate = formatDate(fechaInicio);
            const endDate = formatDate(fechaFin);

            const response = await axios.get('/hanadb/api/rrhh/get_all_registros_reloj_biometrico_online', {
                params: {
                    fecha_inicio: startDate,
                    fecha_fin: endDate
                }
            });

            setBusinessPartners(response.data);
            console.log("response.data ", response.data);

            if (response.data.length > 0) {
                console.log("Ejemplo de registro:", response.data[0]);
                console.log("Campos disponibles:", Object.keys(response.data[0]));
                console.log("Campo SUCURSAL del primer registro:", response.data[0].SUCURSAL);
                console.log("Total de registros:", response.data.length);

                // Si el usuario es MC, mostrar cuántos registros son de MC
                if (user.COMPANY === 'MC') {
                    const mcRecords = response.data.filter(item => item.COMPANY === 'MC');
                    console.log("Registros filtrados por COMPANY='MC':", mcRecords.length);
                }

                if (user.COMPANY === 'HT') {
                    const htRecords = response.data.filter(item => item.COMPANY === 'HT' || item.COMPANY === 'NU');
                    console.log("Registros filtrados por COMPANY='HT' o 'NU':", htRecords.length);
                }
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            alert('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Función para limpiar filtros
    const handleLimpiarFiltros = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setBusinessPartners([]);
        setUbicaciones({
            kleberGranda: false,
            ambatoCentro: false,
            cci: false,
            mallDeLosAndes: false,
            malteria: false,
            paseoShopping: false,
            quicentroSur: false,
            recreo: false,
            sanLuis: false,
            administrador: false
        });
    };

    return (
        <>
            <Head>
                <title> RRHH | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reloj Biométrico Online"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'RRHH',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Reporte Marcaciones',
                        },
                    ]}
                />

                {/* Selector de Rango de Fechas */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Seleccionar Rango de Fechas
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <DatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => setFechaInicio(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
                            />
                            <DatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => setFechaFin(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                minDate={fechaInicio}
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={fetchDataByDateRange}
                                disabled={!fechaInicio || !fechaFin || loading}
                                sx={{ minWidth: 150, height: 56 }}
                            >
                                {loading ? 'Cargando...' : 'Consultar'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleLimpiarFiltros}
                                sx={{ minWidth: 150, height: 56 }}
                            >
                                Limpiar
                            </Button>
                        </Stack>
                    </LocalizationProvider>
                </Card>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{ p: 3, textAlign: "center" }}>
                            {(user.COMPANY === 'HT') && (
                                <>
                                    {getFilteredData().length > 0 && <ExcelDownload data={getFilteredData()} />}
                                    <DataGrid
                                        rows={getFilteredData()?.map((partner, index) => ({
                                            ...partner,
                                            id: partner.ID || index + 1,
                                        })) || []}
                                        columns={baseColumns}
                                        rowHeight={100}
                                        pagination
                                        pageSize={10}
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No Data" />,
                                            noResultsOverlay: () => <EmptyContent title="No results found" />,
                                            loadingOverlay: LinearProgress,
                                        }}
                                        loading={loading}
                                    />
                                </>
                            )}

                            {(user.COMPANY === 'MC') && (
                                <>
                                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'left' }}>
                                        Filtrar por Ubicación
                                    </Typography>

                                    <FormGroup sx={{ mb: 3, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>

                                        {(user.SUCURSAL === 1 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.kleberGranda}
                                                        onChange={handleUbicacionChange}
                                                        name="kleberGranda"
                                                    />
                                                }
                                                label="[1] KLEBER GRANDA"
                                            />
                                        )}
                                        {(user.SUCURSAL === 2 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.ambatoCentro}
                                                        onChange={handleUbicacionChange}
                                                        name="ambatoCentro"
                                                    />
                                                }
                                                label="[2] AMBATO CENTRO"
                                            />
                                        )}

                                        {(user.SUCURSAL === 3 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.cci}
                                                        onChange={handleUbicacionChange}
                                                        name="cci"
                                                    />
                                                }
                                                label="[3] CCI"
                                            />
                                        )}
                                        {(user.SUCURSAL === 4 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.mallDeLosAndes}
                                                        onChange={handleUbicacionChange}
                                                        name="mallDeLosAndes"
                                                    />
                                                }
                                                label="[4] MALL DE LOS ANDES"
                                            />
                                        )}
                                        {(user.SUCURSAL === 5 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.malteria}
                                                        onChange={handleUbicacionChange}
                                                        name="malteria"
                                                    />
                                                }
                                                label="[5] MALTERIA"
                                            />
                                        )}
                                        {(user.SUCURSAL === 6 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.paseoShopping}
                                                        onChange={handleUbicacionChange}
                                                        name="paseoShopping"
                                                    />
                                                }
                                                label="[6] PASEO SHOPPING"
                                            />
                                        )}
                                        {(user.SUCURSAL === 7 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.quicentroSur}
                                                        onChange={handleUbicacionChange}
                                                        name="quicentroSur"
                                                    />
                                                }
                                                label="[7] QUICENTRO SUR"
                                            />
                                        )}
                                        {(user.SUCURSAL === 8 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.recreo}
                                                        onChange={handleUbicacionChange}
                                                        name="recreo"
                                                    />
                                                }
                                                label="[8] RECREO"
                                            />
                                        )}
                                        {(user.SUCURSAL === 9 || user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.sanLuis}
                                                        onChange={handleUbicacionChange}
                                                        name="sanLuis"
                                                    />
                                                }
                                                label="[9] SAN LUIS"
                                            />
                                        )}
                                        {(user.SUCURSAL === 10) && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={ubicaciones.administrador}
                                                        onChange={handleUbicacionChange}
                                                        name="administrador"
                                                    />
                                                }
                                                label="[10] ADMINISTRADOR"
                                            />
                                        )}
                                    </FormGroup>

                                    {getFilteredData().length > 0 && <ExcelDownload data={getFilteredData()} />}
                                    <DataGrid
                                        rows={getFilteredData()?.map((partner, index) => ({
                                            ...partner,
                                            id: partner.ID || index + 1,
                                        })) || []}
                                        columns={baseColumns}
                                        rowHeight={100}
                                        pagination
                                        pageSize={10}
                                        slots={{
                                            toolbar: CustomToolbar,
                                            noRowsOverlay: () => <EmptyContent title="No Data" />,
                                            noResultsOverlay: () => <EmptyContent title="No results found" />,
                                            loadingOverlay: LinearProgress,
                                        }}
                                        loading={loading}
                                    />
                                </>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

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

    const { user } = useAuthContext();

    // Mapeo de ubicaciones con sus IDs y nombres (mismo que en el componente principal)
    const ubicacionConfig = {
        kleberGranda: { id: 1, nombre: 'KLEBER GRANDA' },
        ambatoCentro: { id: 2, nombre: 'AMBATO CENTRO' },
        cci: { id: 3, nombre: 'CCI' },
        mallDeLosAndes: { id: 4, nombre: 'MALL DE LOS ANDES' },
        malteria: { id: 5, nombre: 'MALTERIA' },
        paseoShopping: { id: 6, nombre: 'PASEO SHOPPING' },
        quicentroSur: { id: 7, nombre: 'QUICENTRO SUR' },
        recreo: { id: 8, nombre: 'RECREO' },
        sanLuis: { id: 9, nombre: 'SAN LUIS' },
        administrador: { id: 10, nombre: 'ADMINISTRADOR' }
    };

    // Función para obtener el nombre de la sucursal
    const getSucursalNombre = (sucursalId) => {
        const id = Number(sucursalId);
        const ubicacion = Object.values(ubicacionConfig).find(ub => ub.id === id);

        if (ubicacion) {
            return `[${id}] ${ubicacion.nombre}`;
        }

        return id === 0 ? '[0] SIN ASIGNAR' : `[${id}] Desconocido`;
    };

    //console.log("data: "+data);

    const handleExportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Crear una nueva hoja de trabajo vacía con la fila de texto
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [
            { wch: 10 },   // A - ID
            { wch: 10 },   // B - EMPRESA
            { wch: 25 },   // C - SUCURSAL (aumentado para mostrar el nombre completo)
            { wch: 10 },   // D - USER_ID
            { wch: 15 },   // E - MARKED_DATE
            { wch: 15 },   // F - MARKED_TIME
            { wch: 45 },   // G - DISPLAYNAME
            { wch: 15 },   // H - LATITUDE
            { wch: 15 },   // I - LONGITUDE
            { wch: 60 },   // J - UBICACION_GOOGLE_MAPS (URL completa)
            { wch: 80 },   // K - URL_EVIDENCIA (URL completa)
        ];

        // Ordenar los datos por USER_ID para agruparlos
        const sortedData = [...data].sort((a, b) => {
            // Ordenar por USER_ID primero
            if (a.USER_ID < b.USER_ID) return -1;
            if (a.USER_ID > b.USER_ID) return 1;

            // Si tienen el mismo USER_ID, ordenar por fecha y hora
            if (a.MARKED_DATE < b.MARKED_DATE) return -1;
            if (a.MARKED_DATE > b.MARKED_DATE) return 1;

            if (a.MARKED_TIME < b.MARKED_TIME) return -1;
            if (a.MARKED_TIME > b.MARKED_TIME) return 1;

            return 0;
        });

        // Agregar los datos JSON a la hoja de trabajo según el mapeo
        XLSX.utils.sheet_add_json(
            ws,
            sortedData.map((item) => ({
                ID: item.ID,
                EMPRESA: item.COMPANY,
                SUCURSAL: getSucursalNombre(item.SUCURSAL),
                USER_ID: item.USER_ID,
                MARKED_DATE: item.MARKED_DATE,
                MARKED_TIME: item.MARKED_TIME,
                DISPLAYNAME: item.DISPLAYNAME,
                LATITUDE: `${item.LATITUDE}`,
                LONGITUDE: `${item.LONGITUDE}`,
                UBICACION_GOOGLE_MAPS: `https://www.google.com/maps?q=${item.LATITUDE},${item.LONGITUDE}`,
                URL_EVIDENCIA: item.IMAGE_URL_EVIDENCIA || 'Sin evidencia',
            })),
            { origin: 'A1' }
        );

        for (let R = 3; R <= 25; ++R) {
            for (let C = 1; C <= 6; ++C) {
                const cell_address = { c: C, r: R };
                /* if an A1-style address is needed, encode the address */
                var cell_ref = XLSX.utils.encode_cell(cell_address);

                // Obtener la celda actual o crear una nueva si no existe
                var cell = ws[cell_ref] || (ws[cell_ref] = {});

                // Crear un estilo de borde negro
                var borderStyle = {
                    top: { style: "thin", color: { rgb: "000000" } }, // Negro
                    right: { style: "thin", color: { rgb: "000000" } }, // Negro
                    bottom: { style: "thin", color: { rgb: "000000" } }, // Negro
                    left: { style: "thin", color: { rgb: "000000" } } // Negro
                };

                // Aplicar el estilo de borde a la celda
                cell.s = { border: borderStyle };
            }
        }

        // Configurar todas las opciones de protección
        ws['!protect'] = {
            selectLockedCells: false,      // Permitir la selección de celdas bloqueadas
            selectUnlockedCells: false,    // Permitir la selección de celdas desbloqueadas
            formatCells: false,           // Permitir el formato de celdas
            formatColumns: false,         // Permitir el formato de columnas
            formatRows: false,            // Permitir el formato de filas
            insertRows: false,            // Permitir la inserción de filas
            insertColumns: false,         // Permitir la inserción de columnas
            insertHyperlinks: false,      // Permitir la inserción de hipervínculos
            deleteRows: false,            // Permitir la eliminación de filas
            deleteColumns: false,         // Permitir la eliminación de columnas
            sort: false,                  // Permitir la ordenación
            autoFilter: false,            // Permitir el autofiltro
            pivotTables: false,           // Permitir las tablas dinámicas
            password: 'miPassword',    // Establecer la contraseña
        };

        // Generar nombre de archivo con fecha y hora
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
        const fileName = `${user.DISPLAYNAME}_${timestamp}.xlsx`;

        XLSX.utils.book_append_sheet(wb, ws, `${user.DISPLAYNAME}`);
        XLSX.writeFile(wb, fileName);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="10vh">
            <Button variant="contained" onClick={handleExportToExcel}>
                Exportar a Excel
            </Button>
        </Box>
    );
};