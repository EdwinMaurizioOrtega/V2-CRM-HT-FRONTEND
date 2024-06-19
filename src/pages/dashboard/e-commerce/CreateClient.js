import PropTypes from 'prop-types';
import React, {useState, useCallback, useEffect, useRef, useLayoutEffect} from 'react';
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
    CircularProgress,
    Container,
    Card,
    Box,
    Button,
    Autocomplete,
    List,
    ListItem,
    ListItemText, FormControl, RadioGroup, Radio, FormControlLabel,
} from '@mui/material';
import {useForm} from "react-hook-form";
import {FormSchema} from "../../../sections/_examples/extra/form/schema";
import DashboardLayout from "../../../layouts/dashboard";
import {LoadingButton} from "@mui/lab";
import {PATH_DASHBOARD} from "../../../routes/paths";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import Head from "next/head";
import * as Yup from "yup";
import {
    DataGrid,
    GridToolbar,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import SearchNotFound from "../../../components/search-not-found";
import {CustomTextField} from "../../../components/custom-input";
import Iconify from "../../../components/iconify";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import {useAuthContext} from "../../../auth/useAuthContext";
import Label from "../../../components/label";
import {fCurrency, fNumber} from "../../../utils/formatNumber";
import {useSnackbar} from "../../../components/snackbar";
import {DOCUMENTACION, PAYMENT_OPTIONS_V2, TIPO_CREDITO, TIPO_PRECIO} from "../../../utils/constants";
import {io} from "socket.io-client";
import {GoogleMap, InfoWindow, Marker, useJsApiLoader} from "@react-google-maps/api";
import EmptyContent from "../../../components/empty-content";
import {HOST_API_KEY} from "../../../config-global";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

ConsultClientForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const TAGS_OPTION = [
    'Toy Story 3',
    'Logan',
    'Full Metal Jacket',
    'Dangal',
    'The Sting',
    '2001: A Space Odyssey',
    "Singin' in the Rain",
    'Toy Story',
    'Bicycle Thieves',
    'The Kid',
    'Inglourious Basterds',
    'Snatch',
    '3 Idiots',
];


export default function ConsultClientForm() {

    const {user} = useAuthContext();

    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const {
        watch, reset, control, setValue, handleSubmit, formState: {isSubmitting},
    } = methods;

    const methods_second_form = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });


    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };


    const onSubmit = async (data) => {

        console.log('DATA', data);


        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);


        const payload = {
            CardName: `${data.nombre} ${data.apellido}`,
            CardCode: `CL${data.id}`,
            GroupCode: Number(data.tipo_cliente.CODE),
            SalesPersonCode: Number(data.vendedor.CODE),
            U_SYP_BPTD: "R",
            FatherType: "cDelivery_sum",
            U_SYP_BPAP: data.nombre,
            EmailAddress: user.EMPRESA,
            FederalTaxID: data.id,
            Cellular: data.telefono,
            U_LS_FECHA: `${formattedDate}`,
            CardType: "C",
            U_SYP_FPAGO: "20",
            U_SYP_TIPPROV: "01",
            FatherCard: "CE2201110519727",
            U_SYP_BPNO: data.apellido,
            BPAddresses: [
                {
                    AddressName: "MATRIZ",
                    U_SYP_PARROQ: data.parroquia.PARROQUIA,
                    ZipCode: "090106",
                    Street: data.direccion,
                    Country: "EC",
                    City: data.parroquia.PROVINCIA,
                    AddressType: "bo_BillTo",
                    County: "ECUADOR"
                }
            ]
        };

        console.log('PAYLOAD', payload);


        try {
            const response = await axios.post('/hanadb/api/customers/create_customer_sap', payload);
            console.log('RESPONSE', response);
            alert(response.data.data);
        } catch (error) {
            console.error('ERROR', error);
        }

    }




    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const onSnackbarAction = (data, color, anchor) => {
        enqueueSnackbar(`${data}`, {
            variant: color, anchorOrigin: anchor, action: (key) => (<>
                <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>
                    Cerrar
                </Button>
            </>),
        });
    };

    const [dataParroquias, setDataParroquias] = useState([]);
    const [dataTiposCliente, setDataTiposCliente] = useState([]);
    const [dataEmpladosVenta, setDataEmpleadosVenta] = useState([]);


    useEffect(() => {

        const fetchData = async () => {

            //Parroquias
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_parroquias`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataParroquias(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }

            //Tipo Clientes
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_tipo_cliente`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataTiposCliente(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }


            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_empleados_venta`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataEmpleadosVenta(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, []);

    const handleShowCoordinates = (position) => {
        if (position) {
            console.log("Coordenadas seleccionadas:", position);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario
            setDataCliente(position);

        } else {
            console.log("No se ha seleccionado ningún marcador.");
        }
    };


    return (<>
        <Head>
            <title> Catálogo: Cl | HT</title>
        </Head>
        <Container>

            <CustomBreadcrumbs
                heading="Crear Cliente"
                links={[{
                    name: 'Dashboard', href: PATH_DASHBOARD.root,
                }, {
                    name: 'SAP', href: PATH_DASHBOARD.eCommerce.catalogo,
                }, {name: 'Cliente'},]}
            />

            <Stack spacing={2}>
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={12}>


                            <RHFTextField name="nombre"
                                          label="Nombre"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('nombre', inputValue, {shouldValidate: true});
                                          }}
                            />

                            <RHFTextField name="apellido"
                                          label="Apellido"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('apellido', inputValue, {shouldValidate: true});
                                          }}
                            />

                            <RHFTextField name="id"
                                          label="RUC/Cédula"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('id', inputValue, {shouldValidate: true});
                                          }}
                            />

                            <RHFTextField name="telefono"
                                          label="Teléfono"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('telefono', inputValue, {shouldValidate: true});
                                          }}
                            />

                            <RHFTextField name="direccion"
                                          label="Dirección"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('direccion', inputValue, {shouldValidate: true});
                                          }}
                            />

                            <RHFTextField name="emmail"
                                          label="Correo"
                                          onChange={(event) => {
                                              const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                              setValue('emmail', inputValue, {shouldValidate: true});
                                          }}


                            />

                            <RHFAutocomplete
                                name="parroquia"
                                label="Parroquia"
                                single
                                freeSolo
                                options={dataParroquias}
                                getOptionLabel={(option) => option.PARROQUIA}
                                ChipProps={{size: 'small'}}
                            />

                            <RHFAutocomplete
                                name="tipo_cliente"
                                label="Tipo Cliente"
                                single
                                freeSolo
                                options={dataTiposCliente}
                                getOptionLabel={(option) => option.TIPO}
                                ChipProps={{size: 'small'}}
                            />

                            <RHFAutocomplete
                                name="vendedor"
                                label="Vendedor"
                                single
                                freeSolo
                                options={dataEmpladosVenta}
                                getOptionLabel={(option) => option.NOMBRE}
                                ChipProps={{size: 'small'}}
                            />

                            <LoadingButton
                                fullWidth
                                color="success"
                                size="large"
                                type="submit"
                                variant="contained"
                                loading={isSubmitting}
                            >
                                Crear
                            </LoadingButton>


                        </Grid>
                    </Grid>
                </FormProvider>
            </Stack>


        </Container>
    </>);
}

// ----------------------------------------------------------------------

const GENDER_OPTION = [
    {label: 'Ruc/Cédula', value: '0'},
    {label: 'Razón Social', value: '1'},

];