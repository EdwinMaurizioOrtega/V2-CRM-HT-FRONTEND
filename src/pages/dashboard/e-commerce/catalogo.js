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
    CircularProgress, Container, Card, Box,
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

// ----------------------------------------------------------------------

const OPTIONS = [
    {value: '1', label: 'NE'},
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


const CATEGORIAS = [
    {label: 'CELULARES', value: '108'},
    {label: 'ELECTRODOMÉSTICOS', value: '111'},
    {label: 'ACCESORIOS', value: '109'},
    {label: 'BELLEZA', value: '117'},
    {label: 'REPUESTOS', value: '100'},
    {label: 'ELECTROMENORES', value: '118'},
    {label: 'TECNOLOGIA', value: '116'},
    {label: 'VARIOS', value: '112'},
];

export const MARCAS = [
    {label: 'LG', value: '01'},
    {label: 'SAMSUNG', value: '02'},
    {label: 'BLU', value: '03'},
    {label: 'NOKIA', value: '04'},
    {label: 'APPLE', value: '09'},
    {label: 'VERYKOOL', value: '12'},
    {label: 'HUAWEI', value: '13'},
    {label: 'XIAOMI', value: '19'},
    {label: 'TECNO', value: '20'},
    {label: 'HONOR', value: '22'},
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
    {label: 'INFINIX', value: '43'},
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
    {label: 'CLARO', value: '62'},
    {label: 'VARIOS', value: '63'},
    {label: 'TCL', value: '64'},
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

    const onSubmit = async (data) => {

        // await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('DATA', data);
        // reset();

        // Crear un cliente.
        const response = await axios.post('/hanadb/api/catalogo', {
            singleSelectTP: data.singleSelectTP,
            multiSelectB: data.multiSelectB,
            multiSelectC: data.multiSelectC,
            multiSelectM: data.multiSelectM,
        });

        if (response.status === 200) {
            console.log(response);
            // La solicitud PUT se realizó correctamente
            setDataCatalog(response.data.catalogo)
        } else {
            // La solicitud POST no se realizó correctamente
            console.error('Error en la solicitud POST:', response.status);        }

    };

    return (
        <>
            <Head>
                <title> Catálogo: Productos | HT</title>
            </Head>
            <Container sx={{my: 10}}>

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
                        { name: 'Lista' },
                    ]}
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
                                        options={BODEGAS}
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
                                        options={CATEGORIAS}
                                    />
                                </Block>

                                <Block label="Marcas">
                                    <RHFMultiSelect
                                        chip
                                        checkbox
                                        name="multiSelectM"
                                        label="Selección multiple"
                                        options={MARCAS}
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
                    <DataGrid
                        rows={dataCatalog}
                        columns={TABLE_HEAD}
                        getRowId={getRowId}
                        components={{
                            Toolbar: GridToolbar,
                        }}
                    />

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
