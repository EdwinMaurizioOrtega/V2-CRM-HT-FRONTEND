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
                console.log("DATA: "+ JSON.stringify(response.data.data));
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
