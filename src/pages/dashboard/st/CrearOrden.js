import React, {useEffect, useCallback, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Grid, Button, Container, Stack, TextField, Card} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// sections
import {useSnackbar} from '../../../components/snackbar';

// ----------------------------------------------------------------------

import {HOST_API_KEY} from '../../../config-global';
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";

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
import {LoadingButton} from "@mui/lab";
import {useForm} from "react-hook-form";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {

    const {themeStretch} = useSettingsContext();

    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const {
        watch, reset, control, setValue, handleSubmit, formState: {isSubmitting},
    } = methods;

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY

    const [garantia, setGarantia] = useState(null);

    const {user} = useAuthContext();

    const showImei = async (enteredName) => {
        if (enteredName.length === 15) {
            try {
                console.log(`IMEI A CONSULTAR: ${enteredName}`);
                console.log("Buscando en el sistema Facturacion PAC");

                const responseFull = await fetch(`${HOST_API_KEY}/hanadb/api/technical_service/garantia_imei_sap?imei=${enteredName}`);
                console.log(" responseFull: " + JSON.stringify(responseFull));

                if (responseFull.status === 200) {
                    const data = await responseFull.json();
                    setGarantia(data);
                } else {
                    console.log(`Status ${responseFull.status}: Hubo un problema en la consulta.`);
                    setGarantia("NO FACTURADO EN LIDENAR");
                }
            } catch (error) {
                console.error("Error en la consulta:", error);
            }
        } else {
            onSnackbarAction('El IMEI debe tener 15 dígitos.', 'default', {
                vertical: 'top',
                horizontal: 'center',
            });
        }
    };

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

    const [dataEmpladosVenta, setDataEmpleadosVenta] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

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

    const onSubmit = async (data) => {

        console.log('DATA', data);
        //Enviar un correo electrónico + la creación de la guía

    }

    return (
        <>
            <Head>
                <title> Garantías | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>

                <CustomBreadcrumbs
                    heading="Servicio Técnico"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Servicio Técnico',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Crear Orden',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>

                                <TextField type="text" className="form-control email"
                                           name="email" id="email2"
                                           placeholder="IMEI" required

                                           onChange={e => {
                                               setEnteredName(e.currentTarget.value);
                                           }}
                                />
                                <Button variant="contained" onClick={() => {
                                    showImei(enteredName)
                                }}>
                                    BUSCAR
                                </Button>


                                <h2>Garantia Por Factura:</h2>
                                <span>{garantia?.garantia}</span>
                                <br></br>
                                <h2>Cliente:</h2>

                                <span>{garantia?.data.COD_CLIENTE}</span>
                                <span>{garantia?.data.NOM_CLIENTE}</span>
                                <span>{garantia?.data.FECHA_VENTA}</span>
                                <span>{garantia?.data.MARCA}</span>
                                <br></br>
                                <h2>Taller:</h2>
                                <span>{garantia?.taller.empresa}</span>
                                <span>{garantia?.taller.direccion}</span>
                                <span>{garantia?.taller.persona_contacto}</span>
                                <span>{garantia?.taller.correo_contacto}</span>
                                <span>{garantia?.taller.telefono_contacto}</span>
                                <br></br>
                            </Stack>


                        </Card>
                    </Grid>

                </Grid>


                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>

                            <Stack spacing={3}>
                                <h2>Crear Orden + Guía</h2>

                                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>

                                    <RHFAutocomplete
                                        name="vendedor"
                                        label="Vendedor"
                                        single
                                        freeSolo
                                        options={dataEmpladosVenta}
                                        getOptionLabel={(option) => option.NOMBRE}
                                        ChipProps={{size: 'small'}}
                                    />

                                    <RHFRadioGroup row spacing={4} name="tipo" options={GENDER_OPTION} />

                                    <LoadingButton
                                        fullWidth
                                        color="success"
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        loading={isSubmitting}
                                    >
                                        Crear Orden + Guía
                                    </LoadingButton>

                                </FormProvider>


                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

const GENDER_OPTION = [
    { label: 'Dentro de Garantía (Revisión Física)', value: '0' },
    { label: 'Fuera de Garantía (Revisión Física)', value: '1' },

];