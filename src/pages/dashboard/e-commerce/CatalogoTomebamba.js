import PropTypes from 'prop-types';
import {useState, useCallback} from 'react';
// form
import {yupResolver} from '@hookform/resolvers/yup';
import FormProvider, {
    RHFEditor,
    RHFSelect,
    RHFUpload,
    RHFSwitch,
    RHFSlider,
    RHFCheckbox,
    RHFTextField,
    RHFRadioGroup,
    RHFMultiSelect,
    RHFAutocomplete,
    RHFMultiCheckbox,
} from '../../../components/hook-form';

import axios from '../../../utils/axios';
// @mui
import {
    Grid,
    Stack,
    Divider,
    MenuItem,
    Backdrop,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress, Container, Card, Box, Button, Autocomplete,
} from '@mui/material';
import {useForm} from "react-hook-form";
import {FormSchema} from "../../../sections/_examples/extra/form/schema";
import DashboardLayout from "../../../layouts/dashboard";
import {LoadingButton} from "@mui/lab";
import {PATH_DASHBOARD} from "../../../routes/paths";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import Head from "next/head";
import * as Yup from "yup";
import {DataGrid, GridToolbar} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import SearchNotFound from "../../../components/search-not-found";
import {CustomTextField} from "../../../components/custom-input";
import Iconify from "../../../components/iconify";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

const OPTIONS = [
    // {value: '1', label: 'NE'},
    {value: '2', label: 'Precio 30 unidades'},
    {value: '3', label: 'Precio 15 unidades'},
    {value: '4', label: 'Precio Retail'},
    {value: '5', label: 'Precio Mayorista'},
    {value: '6', label: 'Precio al Público'},
    {value: '7', label: 'Precio T/C'},
    {value: '8', label: 'Precio Militares'},
];

const BODEGAS = [
    {value: '019', label: 'CENTRO DE DISTRIBUCIÓN HT'},
    {value: '002', label: 'MAYORISTA CUENCA'},
    {value: '006', label: 'MAYORISTA QUITO'},
    {value: '015', label: 'MAYORISTA GUAYAQUIL'},
    {value: '024', label: 'MAYORISTA MANTA'},
];

const BODEGAS_ALPHACELL = [
    {value: '001', label: 'BODEGA'},
];


const CATEGORIAS = [
    {label: 'CELULARES', value: '108'},
    {label: 'ELECTRODOMÉSTICOS', value: '111'},
    {label: 'ACCESORIOS', value: '109'},
    {label: 'BELLEZA', value: '117'},
    {label: 'REPUESTOS', value: '100'},
    {label: 'ELECTROMENORES', value: '118'},
    {label: 'TECNOLOGIA', value: '116'},
    {label: 'VARIOS', value: '112'},
    {label: 'TABLETS', value: '110'},
];


export const MARCAS = [
    {label: 'SAMSUNG', value: '02'},
    {label: 'BLU', value: '03'},
    {label: 'XIAOMI', value: '19'},
    {label: 'TECNO', value: '20'},
    {label: 'HONOR', value: '22'},
    {label: 'INFINIX', value: '43'},
    {label: 'MOTOROLA', value: '06'},
    {label: 'OPPO', value: '67'},
    {label: 'TCL', value: '64'},
    {label: 'KIESLECT', value: '10'},
    {label: 'CLARO', value: '62'},
    {label: 'LG', value: '01'},
    {label: 'NOKIA', value: '04'},
    {label: 'APPLE', value: '09'},
    {label: 'VERYKOOL', value: '12'},
    {label: 'HUAWEI', value: '13'},
    {label: 'BAZZUKA', value: '27'},
    {label: 'BLACK&DECKER', value: '28'},
    {label: 'CONAIR', value: '29'},
    {label: 'DUREX', value: '32'},
    {label: 'EPSON', value: '33'},
    {label: 'FAST HAIR STRAIGHTENER', value: '34'},
    {label: 'LENOVO', value: '35'},
    {label: 'GO BIKE', value: '36'},
    {label: 'HACEB', value: '37'},
    {label: 'HP', value: '38'},
    {label: 'INNOVA', value: '40'},
    {label: 'KOMBO', value: '42'},
    {label: 'REMINGTON', value: '46'},
    {label: 'SANKEY', value: '47'},
    {label: 'WAHL', value: '48'},
    {label: 'ZEROSTOCKS', value: '51'},
    {label: 'KINGSTON', value: '52'},
    {label: 'SANDISK', value: '53'},
    {label: 'PARLANTE', value: '54'},
    {label: 'CABLE', value: '55'},
    {label: 'CARGADOR', value: '56'},
    {label: 'AUDIFONO', value: '57'},
    {label: 'GAME', value: '58'},
    {label: 'HUMIFICADOR', value: '59'},
    {label: 'GENERICO', value: '60'},
    {label: 'SEAGETE', value: '61'},
    {label: 'VARIOS', value: '63'},
];

export const defaultValues = {
    //
    singleSelectTP: '',
    multiSelectB: [],
    multiSelectC: [],
    multiSelectM: [],

};

// ----------------------------------------------------------------------

CatalogoForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------


const FormSchemaAAAAAA = Yup.object().shape({

    singleSelectTP: Yup.string().required('Una opción es requerida'),
    multiSelectB: Yup.array().min(1, 'Debe seleccionar al menos 1 opción'),
    multiSelectC: Yup.array().min(1, 'Debe seleccionar al menos 1 opción'),
    multiSelectM: Yup.array().min(1, 'Debe seleccionar al menos 1 opción'),
    //

});


export default function CatalogoForm() {

    const {user} = useAuthContext();


    const TABLE_HEAD = [

        {field: 'CODIGO', headerName: 'CODIGO', width: 100},
        {field: 'NOMBRE', headerName: 'NOMBRE', width: 600},
        {field: 'CANTIDAD_ALIAS', headerName: 'STOCK', width: 100},
        {field: 'Price', headerName: 'PRECIO', width: 100},

    ];


    let counter = 0;

    const getRowId = (row) => {
        counter += 1;
        return counter;
    };


    const [dataCatalog, setDataCatalog] = useState([]);
    const [dataCliente, setDataCliente] = useState([]);

    const onSubmit = async () => {

        // await new Promise((resolve) => setTimeout(resolve, 3000));
        //console.log('DATA', JSON.stringify(data));
        // reset();

        // Crear un cliente.
        const response = await axios.get('/hanadb/api/products/tomebamba_catalogo');

        if (response.status === 200) {
            console.log("data: "+JSON.stringify(response.data));
            // La solicitud PUT se realizó correctamente
            setDataCatalog(response.data.catalogo)
        } else {
            // La solicitud POST no se realizó correctamente
            console.error('Error en la solicitud POST:', response.status);
        }

    };

    return (
        <>
            <Head>
                <title> Catálogo: Productos | HT</title>
            </Head>
            <Container >

                <CustomBreadcrumbs
                    heading="Catálogo Tomebamba."
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Tomebamba',
                            href: PATH_DASHBOARD.eCommerce.catalogo,
                        },
                        {name: 'Catálogo'},
                    ]}
                />


                        <Grid item xs={12} md={12}>
                            <Stack spacing={2}>

                                <LoadingButton
                                    fullWidth
                                    color="info"
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    onClick={onSubmit}
                                >
                                    Generar
                                </LoadingButton>
                            </Stack>
                        </Grid>




                <Box sx={{height: 720}}>
                    {dataCatalog.length > 0 && dataCliente && <ExcelDownload data={dataCatalog} client={dataCliente}/>}

                </Box>

            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

Block.propTypes = {
    label: PropTypes.string,
    children: PropTypes.node,
    sx: PropTypes.object,
};

function Block({label = 'RHFTextField', sx, children}) {
    return (
        <Stack spacing={1} sx={{width: 1, ...sx}}>
            <Typography
                variant="caption"
                sx={{
                    textAlign: 'right',
                    fontStyle: 'italic',
                    color: 'text.disabled',
                }}
            >
                {label}
            </Typography>
            {children}
        </Stack>
    );
}

function ExcelDownload({data, client}) {

    const {user} = useAuthContext();

    console.log("data: "+data);
    console.log("client: "+JSON.stringify( client));

    const handleExportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Crear una nueva hoja de trabajo vacía con la fila de texto
        const ws = XLSX.utils.aoa_to_sheet([["TOMEBAMBA" ]]);

        // Combinar tres columnas (A, B, C) para centrar el texto
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

        // Establecer estilo para centrar el texto
        ws['A1'].s = { alignment: { horizontal: 'center' } };

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [{ wch: 10 }, { wch: 75 }, { wch: 10 }];

        // Crear una segunda fila con un texto de ejemplo
        const segundaFila = [["VENDEDOR: " + user.DISPLAYNAME]]; // Puedes ajustar el texto según tus necesidades
        XLSX.utils.sheet_add_aoa(ws, [segundaFila], { origin: 'A2' });
        // Combinar tres columnas (A, B, C) para centrar el texto
        ws['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }];

        // Establecer estilo para centrar el texto
        ws['A2'].s = { alignment: { horizontal: 'center' } };

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [{ wch: 10 }, { wch: 75 }, { wch: 10 }];

        // Agregar los datos JSON a la hoja de trabajo según el mapeo
        XLSX.utils.sheet_add_json(
            ws,
            data.map((item) => ({
                ITSA_CODE: item.ITSA_CODE,
                ITEM_NAME: item.ITEM_NAME,
                STOCK: item.CANTIDAD_ALIAS,
                TIPO_PRECIO: item.LIST_NAME,
                SUBTOTAL: item.PRICE,
                IVA: (item.PRICE * 0.15).toFixed(2),
                TOTAL: (item.PRICE * 1.15).toFixed(2),

            })),
            {origin: 'A3'}
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

