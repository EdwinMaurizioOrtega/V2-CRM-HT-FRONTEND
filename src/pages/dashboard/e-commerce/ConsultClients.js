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
import Label from "../../../components/label";
import {fCurrency} from "../../../utils/formatNumber";
import {useSnackbar} from "../../../components/snackbar";

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

ConsultClientForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ConsultClientForm() {

    const {user} = useAuthContext();


    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const {
        watch,
        reset,
        control,
        setValue,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const methods_second_form = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const [dataCliente, setDataCliente] = useState(null);

    const onSubmit = async (data) => {

        console.log('DATA', data);
        console.log('Usuario: ', user.ID);

        const ci_ruc = data.ci_ruc || ""; // Si data.ci_ruc es undefined, asigna una cadena vacía


        if (ci_ruc.length == 10 || ci_ruc.length == 13) {

            reset();

            // Crear un cliente.
            const response = await axios.post('/hanadb/api/customers/BusinessPartners/ByRucCI', {
                CI_RUC: data.ci_ruc,
                USUARIO_ID: user.ID,

            });

            if (response.status === 200) {
                console.log("DATA: " + JSON.stringify(response.data.data));
                // La solicitud PUT se realizó correctamente
                setDataCliente(response.data.data);
            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }

        } else {
            onSnackbarAction('Número de caracteres invalido.', 'default', {
                vertical: 'top',
                horizontal: 'center',
            });
        }
    }

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const onSnackbarAction = (data, color, anchor) => {
        enqueueSnackbar(`${data}`, {
            variant: color,
            anchorOrigin: anchor,
            action: (key) => (
                <>
                    <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>
                        Cerrar
                    </Button>
                </>
            ),
        });
    };

    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);
    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {
                const response = await axios.get('/hanadb/api/customers/search', {
                    params: {query: value},
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


    const onSubmitSend = async (data) => {

        console.log('DATA', data);
        console.log('Usuario: ', user.ID);


    }

    return (
        <>
            <Head>
                <title> Catálogo: Productos | HT</title>
            </Head>
            <Container>

                <CustomBreadcrumbs
                    heading="Buscar Cliente."
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'SAP',
                            href: PATH_DASHBOARD.eCommerce.catalogo,
                        },
                        {name: 'Cliente'},
                    ]}
                />

                {user.ROLE != 'infinix' ? (

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

                ) : null }

                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Block label="Cliente">
                                    <RHFTextField name="ci_ruc"
                                                  label="RUC/Cédula"
                                                  onChange={(event) => {
                                                      const inputValue = event.target.value.replace(/\D/g, ''); // Solo números
                                                      if (/^\d{10,13}$/.test(inputValue)) {
                                                          setValue('ci_ruc', inputValue, {shouldValidate: true});
                                                      }
                                                  }}
                                                  InputProps={{
                                                      type: 'number',
                                                      pattern: '[0-9]*', // Asegura que solo se ingresen números
                                                  }}
                                    />

                                </Block>

                                <Block label="Acción">
                                    <LoadingButton
                                        fullWidth
                                        color="success"
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        loading={isSubmitting}
                                    >
                                        Buscar
                                    </LoadingButton>

                                </Block>

                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Block label="Detalle">

                                    {dataCliente ? (
                                        <>
                                            <Label color="success">Vendedor: {dataCliente.SlpName} </Label>
                                            <Label color="success">Cliente: {dataCliente.Cliente} </Label>
                                            <Label color="success">Crédito aprobado: {dataCliente.ValidComm} </Label>
                                            <Label color="success">Tipo crédito: {dataCliente.GLN} </Label>
                                            <Label color="success">Cupo
                                                utilizado: {fCurrency(dataCliente.Balance)} </Label>
                                        </>

                                    ) : (
                                        <Label color="error">Cliente no encontrado</Label>
                                    )}

                                </Block>

                            </Stack>
                        </Grid>

                    </Grid>

                </FormProvider>

                {/* <h2>Solicitud Creación Cliente</h2> */}

                {/* <form onSubmit={methods_second_form.handleSubmit(onSubmitSend)}> */}
                {/*     <Grid container spacing={5}> */}
                {/*         <Grid item xs={12} md={6}> */}
                {/*             <Stack spacing={2}> */}
                {/*                 <Block label="Cliente"> */}
                {/*                     <RHFTextField name="ci_ruc_send" */}
                {/*                                   label="RUC/Cédula" */}
                {/*                                   onChange={(event) => { */}
                {/*                                       const inputValue = event.target.value.replace(/\D/g, ''); // Solo números */}
                {/*                                       if (/^\d{10,13}$/.test(inputValue)) { */}
                {/*                                           setValueSecond('ci_ruc', inputValue, {shouldValidate: true}); */}
                {/*                                       } */}
                {/*                                   }} */}
                {/*                                   InputProps={{ */}
                {/*                                       type: 'number', */}
                {/*                                       pattern: '[0-9]*', // Asegura que solo se ingresen números */}
                {/*                                   }} */}
                {/*                     /> */}

                {/*                 </Block> */}

                {/*                 <Block label="Cliente"> */}
                {/*                     <RHFTextField name="nombre_send" */}
                {/*                                   label="Nombre/Razón Social" */}
                {/*                     /> */}

                {/*                 </Block> */}


                {/*                 <Block label="Acción"> */}
                {/*                     <LoadingButton */}
                {/*                         fullWidth */}
                {/*                         color="success" */}
                {/*                         size="large" */}
                {/*                         type="submit" */}
                {/*                         variant="contained" */}
                {/*                     > */}
                {/*                         Enviar */}
                {/*                     </LoadingButton> */}

                {/*                 </Block> */}

                {/*             </Stack> */}
                {/*         </Grid> */}

                {/*         <Grid item xs={12} md={6}> */}
                {/*             <Stack spacing={2}> */}
                {/*                 <Block label="Cliente"> */}
                {/*                     <RHFTextField name="celular_send" */}
                {/*                                   label="Celular" */}

                {/*                     /> */}

                {/*                 </Block> */}
                {/*                 <Block label="Cliente"> */}
                {/*                     <RHFTextField name="direccion_send" */}
                {/*                                   label="Direccion" */}
                {/*                     /> */}

                {/*                 </Block> */}

                {/*             </Stack> */}
                {/*         </Grid> */}

                {/*     </Grid> */}

                {/* </form> */}




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

