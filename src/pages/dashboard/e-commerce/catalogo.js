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
    {value: '030', label: 'MAYORISTA COLÓN'},
    {value: '024', label: 'MAYORISTA MANTA'},
];

const BODEGAS_ALPHACELL = [
    {value: '001', label: 'BODEGA'},
];

const BODEGAS_MOVILCELISTIC = [
    {value: 'DISTLF', label: 'CENTRO DISTRIBUCION MOVILCELISTIC'},
    {value: '003', label: 'MAYORISTAS MOVILCELISTIC MACHALA'},
    {value: '004', label: 'MAYORISTAS MOVILCELISTIC CUENCA'},
];

const CATEGORIAS_HT = [
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

const CATEGORIAS_MC = [
    {label: 'CELULARES', value: '105'},
    {label: 'ACCESORIOS', value: '107'},
];

export const MARCAS_HT = [
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

export const MARCAS_MC = [
    {label: 'XIAOMI', value: '71'},
]

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

    const methods = useForm({
        resolver: yupResolver(FormSchemaAAAAAA),
        defaultValues,
    });

    const TABLE_HEAD = [

        {field: 'CODIGO', headerName: 'CODIGO', width: 100},
        {field: 'NOMBRE', headerName: 'NOMBRE', width: 600},
        {field: 'CANTIDAD_ALIAS', headerName: 'STOCK', width: 100},
        {field: 'Price', headerName: 'PRECIO', width: 100},

    ];

    const {
        watch,
        reset,
        control,
        setValue,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const values = watch();

    let counter = 0;

    const getRowId = (row) => {
        counter += 1;
        return counter;
    };


    const [dataCatalog, setDataCatalog] = useState([]);
    const [dataCliente, setDataCliente] = useState([]);

    const onSubmit = async (data) => {

        // await new Promise((resolve) => setTimeout(resolve, 3000));
        //console.log('DATA', JSON.stringify(data));
        // reset();

        // Crear un cliente.
        const response = await axios.post('/hanadb/api/products/catalogo', {
            singleSelectTP: data.singleSelectTP,
            multiSelectB: data.multiSelectB,
            multiSelectC: data.multiSelectC,
            multiSelectM: data.multiSelectM,
            empresa: user.EMPRESA,
        });

        if (response.status === 200) {
            console.log(response);
            // La solicitud PUT se realizó correctamente
            setDataCatalog(response.data.catalogo)
        } else {
            // La solicitud POST no se realizó correctamente
            console.error('Error en la solicitud POST:', response.status);
        }

    };
    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);
    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {
                const response = await axios.get('/hanadb/api/customers/search', {
                    params: {query: value, empresa: user.EMPRESA},
                });

                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onCreateBilling = async (value) => {
        console.log("CLIENTE SELECCIONADO: " + JSON.stringify(value));
        setDataCliente(value);
    }

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            handleGotoProduct(searchProducts);
        }
    };

    const handleGotoProduct = (name) => {
        // push(PATH_DASHBOARD.eCommerce.view(paramCase(name)));
        // push(PATH_DASHBOARD.eCommerce.view(name));

        console.log(name);
    };

    return (
        <>
            <Head>
                <title> Catálogo: Productos | HT</title>
            </Head>
            <Container>

                <CustomBreadcrumbs
                    heading="Generar catálogo."
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Productos',
                            href: PATH_DASHBOARD.eCommerce.catalogo,
                        },
                        {name: 'Lista'},
                    ]}
                />

                <Autocomplete
                    size="small"
                    autoHighlight
                    popupIcon={null}
                    options={searchResults}
                    onInputChange={(event, value) => handleChangeSearch(value)}
                    getOptionLabel={(product) => product.Cliente}
                    noOptionsText={<SearchNotFound query={searchProducts}/>}
                    isOptionEqualToValue={(option, value) => option.ID === value.ID}
                    componentsProps={{
                        paper: {
                            sx: {
                                '& .MuiAutocomplete-option': {
                                    px: `8px !important`,
                                },
                            },
                        },
                    }}
                    renderInput={(params) => (
                        <CustomTextField
                            {...params}

                            placeholder="Buscar..."
                            onKeyUp={handleKeyUp}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Iconify icon="eva:search-fill" sx={{ml: 1, color: 'text.disabled'}}/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    renderOption={(props, product, {inputValue}) => {
                        const {ID, Cliente} = product;
                        const matches = match(Cliente, inputValue);
                        const parts = parse(Cliente, matches);

                        return (
                            <li {...props}>


                                <AddressItem
                                    key={ID}
                                    address={product}
                                    onCreateBilling={() => onCreateBilling(product)}
                                >
                                    {parts.map((part, index) => (
                                        <Typography
                                            key={index}
                                            component="span"
                                            variant="subtitle2"
                                            color={part.highlight ? 'primary' : 'textPrimary'}
                                        >
                                            {part.text}
                                        </Typography>
                                    ))}

                                </AddressItem>

                            </li>
                        );
                    }}
                />

                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Block label="Tipo Precio">
                                    <RHFSelect name="singleSelectTP" label="Selección única">
                                        <MenuItem value="">Ninguno</MenuItem>
                                        <Divider sx={{borderStyle: 'dashed'}}/>
                                        {OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </RHFSelect>
                                </Block>
                                <Block label="Bodega">
                                    <RHFMultiSelect
                                        chip
                                        checkbox
                                        name="multiSelectB"
                                        label="Selección multiple"
                                        options={

                                            user.EMPRESA === '1792161037001' ? BODEGAS_MOVILCELISTIC : BODEGAS

                                        }
                                    />
                                </Block>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>

                                <Block label="Categorias">
                                    <RHFMultiSelect
                                        chip
                                        checkbox
                                        name="multiSelectC"
                                        label="Selección multiple"
                                        options={ user.EMPRESA === '1792161037001' ? CATEGORIAS_MC : CATEGORIAS_HT}
                                    />
                                </Block>

                                <Block label="Marcas">
                                    <RHFMultiSelect
                                        chip
                                        checkbox
                                        name="multiSelectM"
                                        label="Selección multiple"
                                        options={user.EMPRESA === '1792161037001' ? MARCAS_MC : MARCAS_HT}
                                    />
                                </Block>
                                <LoadingButton
                                    fullWidth
                                    color="info"
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                    onClick={handleSubmit(onSubmit)}

                                >
                                    Buscar
                                </LoadingButton>
                            </Stack>
                        </Grid>

                    </Grid>

                </FormProvider>


                <Box sx={{height: 720}}>
                    {dataCatalog.length > 0 && dataCliente && <ExcelDownload data={dataCatalog} client={dataCliente}/>}
                    {/* <DataGrid */}
                    {/*     rows={dataCatalog} */}
                    {/*     columns={TABLE_HEAD} */}
                    {/*     getRowId={getRowId} */}
                    {/*     components={{ */}
                    {/*         Toolbar: GridToolbar, */}
                    {/*     }} */}
                    {/* /> */}

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

    console.log("data: " + data);
    console.log("client: " + JSON.stringify(client));

    const handleExportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Crear una nueva hoja de trabajo vacía con la fila de texto
        const ws = XLSX.utils.aoa_to_sheet([["CLIENTE: " + client.Cliente]]);

        // Combinar tres columnas (A, B, C) para centrar el texto
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: 2}}];

        // Establecer estilo para centrar el texto
        ws['A1'].s = {alignment: {horizontal: 'center'}};

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [{wch: 10}, {wch: 75}, {wch: 10}];

        // Crear una segunda fila con un texto de ejemplo
        const segundaFila = [["VENDEDOR: " + user.DISPLAYNAME]]; // Puedes ajustar el texto según tus necesidades
        XLSX.utils.sheet_add_aoa(ws, [segundaFila], {origin: 'A2'});
        // Combinar tres columnas (A, B, C) para centrar el texto
        ws['!merges'] = [{s: {r: 1, c: 0}, e: {r: 1, c: 2}}];

        // Establecer estilo para centrar el texto
        ws['A2'].s = {alignment: {horizontal: 'center'}};

        // Ajustar la anchura de la columna para la columna "Nombre"
        ws['!cols'] = [{wch: 10}, {wch: 75}, {wch: 10}];

        // Agregar los datos JSON a la hoja de trabajo según el mapeo
        XLSX.utils.sheet_add_json(
            ws,
            data.map((item) => ({
                CODIGO: item.CODIGO,
                NOMBRE: item.NOMBRE,
                STOCK: item.CANTIDAD_ALIAS,
                SUBTOTAL: item.Price,
                IVA: (item.Price * 0.15).toFixed(2),
                TOTAL: (item.Price * 1.15).toFixed(2),

            })),
            {origin: 'A3'}
        );

        for (let R = 3; R <= 25; ++R) {
            for (let C = 1; C <= 6; ++C) {
                const cell_address = {c: C, r: R};
                /* if an A1-style address is needed, encode the address */
                var cell_ref = XLSX.utils.encode_cell(cell_address);

                // Obtener la celda actual o crear una nueva si no existe
                var cell = ws[cell_ref] || (ws[cell_ref] = {});

                // Crear un estilo de borde negro
                var borderStyle = {
                    top: {style: "thin", color: {rgb: "000000"}}, // Negro
                    right: {style: "thin", color: {rgb: "000000"}}, // Negro
                    bottom: {style: "thin", color: {rgb: "000000"}}, // Negro
                    left: {style: "thin", color: {rgb: "000000"}} // Negro
                };

                // Aplicar el estilo de borde a la celda
                cell.s = {border: borderStyle};
            }
        }

        // Configurar todas las opciones de protección
        ws['!protect'] = {
            selectLockedCells: true,      // Permitir la selección de celdas bloqueadas
            selectUnlockedCells: true,    // Permitir la selección de celdas desbloqueadas
            formatCells: true,           // Permitir el formato de celdas
            formatColumns: true,         // Permitir el formato de columnas
            formatRows: true,            // Permitir el formato de filas
            insertRows: true,            // Permitir la inserción de filas
            insertColumns: true,         // Permitir la inserción de columnas
            insertHyperlinks: true,      // Permitir la inserción de hipervínculos
            deleteRows: true,            // Permitir la eliminación de filas
            deleteColumns: true,         // Permitir la eliminación de columnas
            sort: true,                  // Permitir la ordenación
            autoFilter: true,            // Permitir el autofiltro
            pivotTables: true,           // Permitir las tablas dinámicas
            password: 'miPassword',    // Establecer la contraseña
        };

        XLSX.utils.book_append_sheet(wb, ws, `${client.Cliente}`.substring(0, 31));
        XLSX.writeFile(wb, `${client.Cliente}.xlsx`);
    };

    return (
        <div>
            <Button variant="contained" onClick={handleExportToExcel}>Exportar a Excel</Button>
        </div>
    );
};

function AddressItem({address, onCreateBilling}) {
    // const {Cliente, Direccion, Celular, receiver, fullAddress, addressType, phoneNumber, isDefault} = address;
    const {Cliente, Direccion, Celular, ID, Tipo} = address;
    const receiver = Cliente;
    const tipo = Tipo;
    const id = ID;

    return (
        <Card onClick={onCreateBilling}
              sx={{
                  p: 3,
                  mb: 3,
              }}
        >
            <Stack
                spacing={2}
                alignItems={{
                    md: 'flex-end',
                }}
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
            >
                <Stack flexGrow={1} spacing={1}>
                    <Stack direction="row" alignItems="center">
                        <Typography variant="subtitle1">
                            {receiver}
                            {/* <Box component="span" sx={{ml: 0.5, typography: 'body2', color: 'text.secondary'}}> */}
                            {/*     ({addressType}) */}
                            {/* </Box> */}
                        </Typography>

                        {/* {isDefault && ( */}
                        {/*     <Label color="info" sx={{ml: 1}}> */}
                        {/*         Default */}
                        {/*     </Label> */}
                        {/* )} */}
                    </Stack>

                    <Typography variant="body2">{tipo}</Typography>

                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                        {id}
                    </Typography>
                </Stack>

                {/* <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}> */}
                {/*     /!* {!isDefault && ( *!/ */}
                {/*     /!*     <Button variant="outlined" size="small" color="inherit" sx={{mr: 1}}> *!/ */}
                {/*     /!*         Borrar *!/ */}
                {/*     /!*     </Button> *!/ */}
                {/*     /!* )} *!/ */}

                {/*     <Button variant="outlined" size="small" onClick={onCreateBilling}> */}
                {/*         Entregar a esta dirección */}
                {/*     </Button> */}
                {/* </Stack> */}
            </Stack>
        </Card>
    );
}

