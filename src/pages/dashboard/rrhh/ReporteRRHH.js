import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Box, Button, Card, Container, Grid, LinearProgress, Stack} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// ----------------------------------------------------------------------
import {useSettingsContext} from "../../../components/settings";
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
import {LoadingButton} from "@mui/lab";
import {useAuthContext} from "../../../auth/useAuthContext";
import * as XLSX from "xlsx";

// ----------------------------------------------------------------------

ReporteRRhhPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ReporteRRhhPage() {
    const {themeStretch} = useSettingsContext();

    // Estado para almacenar los datos y el estado de carga
    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define las columnas para el DataGrid
    const baseColumns = [
        { field: 'ID', headerName: 'ID', width: 90 },
        { field: 'COMPANY', headerName: 'EMPRESA', width: 100 },
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

    // Cargar datos del endpoint cuando el componente se monta
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/hanadb/api/rrhh/get_all_registros_reloj_biometrico_online');
                setBusinessPartners(response.data);  // Suponiendo que el response.data contiene los registros
                console.log("response.data ", response.data);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false); // Deja de mostrar el loading cuando termine
            }
        };

        fetchData();
    }, []); // Se ejecuta solo una vez al montar el componente

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




                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>
                                {businessPartners.length > 0 && <ExcelDownload data={businessPartners}/>}
                            <DataGrid
                                rows={businessPartners?.map((partner, index) => ({
                                    ...partner,
                                    id: partner.ID || index + 1, // Usa el ID real si existe, de lo contrario, el índice
                                })) || []}
                                columns={baseColumns}
                                rowHeight={100} // Define la altura de las filas
                                pagination
                                pageSize={10} // Número de filas por página
                                slots={{
                                    toolbar: CustomToolbar,
                                    noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                    noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                    loadingOverlay: LinearProgress, // Usa LinearProgress como indicador de carga

                                }}
                                loading={loading} // Activa el loading
                            />
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
            <GridToolbarQuickFilter/>
            <Box sx={{flexGrow: 1}}/>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}


function ExcelDownload({data}) {

    const {user} = useAuthContext();

    //console.log("data: "+data);

    const handleExportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Crear una nueva hoja de trabajo vacía con la fila de texto
        const ws = XLSX.utils.aoa_to_sheet([]);

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [
            { wch: 10 },   // A - ID
            { wch: 10 },   // B - EMPRESA
            { wch: 10 },   // C - USER_ID
            { wch: 15 },   // D - MARKED_DATE
            { wch: 15 },   // E - MARKED_TIME
            { wch: 45 },   // F - DISPLAYNAME
            { wch: 20 },   // F - LATITUDE
            { wch: 20 },   // F - LONGITUDE
            { wch: 50 },   // G - UBICACION (¡Aquí se agranda!)
        ];

        // Agregar los datos JSON a la hoja de trabajo según el mapeo
        XLSX.utils.sheet_add_json(
            ws,
            data.map((item) => ({
                ID: item.ID,
                EMPRESA: item.COMPANY,
                USER_ID: item.USER_ID,
                MARKED_DATE: item.MARKED_DATE,
                MARKED_TIME: item.MARKED_TIME,
                DISPLAYNAME: item.DISPLAYNAME,
                LATITUDE: `${item.LATITUDE}`,
                LONGITUDE: `${item.LONGITUDE}`,
                UBICACION: { f: `HYPERLINK("https://www.google.com/maps?q=${item.LATITUDE},${item.LONGITUDE}", "Ver en Google Map")` },

            })),
            {origin: 'A1'}
        );

        for(let R = 3; R <= 25; ++R) {
            for(let C = 1; C <= 6; ++C) {
                const cell_address = {c: C, r: R};
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

        XLSX.utils.book_append_sheet(wb, ws, `${user.DISPLAYNAME}`);
        XLSX.writeFile(wb, `${user.DISPLAYNAME}.xlsx`);
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="10vh">
            <Button variant="contained" onClick={handleExportToExcel}>
                Exportar a Excel
            </Button>
        </Box>
    );
};