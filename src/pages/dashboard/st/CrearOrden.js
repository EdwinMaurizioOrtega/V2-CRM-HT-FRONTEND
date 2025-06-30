import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Grid, Button, Container, Stack, TextField, Card, Switch, FormControlLabel, FormControl} from '@mui/material';
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
    RHFTextField,
    RHFRadioGroup,
} from '../../../components/hook-form';
import {LoadingButton} from "@mui/lab";
import {useForm} from "react-hook-form";
import {useRouter} from "next/router";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {

    const {themeStretch} = useSettingsContext();

    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const router = useRouter();

    const {
        watch, reset, control, setValue, handleSubmit, formState: {isSubmitting},
    } = methods;

    const [enteredName, setEnteredName] = useState(''); //INIT TO EMPTY

    const [garantia, setGarantia] = useState(null);

    const {user} = useAuthContext();

    //Para la sección de la Fecha de Creación y Fecha de Facturación
    const [isChecked, setIsChecked] = useState(false);
    const [isCheckedGuia, setIsCheckedGuia] = useState(false);

    const handleSwitchChange = (event) => {
        setIsChecked(event.target.checked);
        //console.log(event.target.checked ? 'Activo' : 'Inactivo');
    };

    const handleSwitchChangeGuia = (event) => {
        setIsCheckedGuia(event.target.checked);
        //console.log(event.target.checked ? 'Activo' : 'Inactivo');
    };


    const showImei = async (enteredName) => {
        if (enteredName.length === 16 || enteredName.length === 15 || enteredName.length === 11 || enteredName.length === 14 || enteredName.length === 10 || enteredName.length === 20) {
            try {
                //console.log(`IMEI A CONSULTAR: ${enteredName}`);
                //console.log("Buscando en el sistema Facturacion PAC");

                const responseFull = await fetch(`${HOST_API_KEY}/hanadb/api/technical_service/garantia_imei_sap?imei=${enteredName}&empresa=${user.EMPRESA}`);
                //console.log(" responseFull: " + JSON.stringify(responseFull));

                if (responseFull.status === 200) {
                    const data = await responseFull.json();
                    setGarantia(data);
                } else {
                    //console.log(`Status ${responseFull.status}: Hubo un problema en la consulta.`);
                    alert("IMEI NO FACTURADO EN LIDENAR");
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
                    //console.log("DATA: " + JSON.stringify(response.data.data));
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


        try {
            //console.log("hola");

            //console.log('DATA', data);
            //console.log('EMPRESA', user.EMPRESA);
            //console.log('enteredName', enteredName);
            //console.log('isChecked', isChecked);
            //console.log('garantia', garantia);
            //console.log('isCheckedGuia', isCheckedGuia);
            //Enviar un correo electrónico + la creación de la guía
            const response = await axios.post('/hanadb/api/technical_service/create_warranty_sap', {
                IMEI_SERIE: enteredName,
                GARANTIA_L1: isChecked,
                CIUDAD_ORIGEN: Number(data.ciudad_origen),
                OBS_VENDEDOR: data.obs,
                // CODE_EMPLEADO_X_FACTURACION: Number(data.CODE_EMPLEADO_X_FACTURACION),
                // NAME_EMPLEADO_X_FACTURACION: data.NAME_EMPLEADO_X_FACTURACION,
                // EMAIL_EMPLEADO_X_FACTURACION: data.EMAIL_EMPLEADO_X_FACTURACION,
                // EMAIL_CLIENTE: data.EMAIL,
                INFO: garantia,
                ID_USUARIO: Number(user.ID),
                create_guide: isCheckedGuia,
                empresa: user.EMPRESA,
            });

            //console.log("response status: " + response.status);

            if (response.status === 200) {
                //console.log(response);
                // La solicitud PUT se realizó correctamente
                //setDataCatalog(response.data.catalogo)

                if (response.data.guia_pdf) {
                    const pdfDecode = response.data.guia_pdf;
                    //console.log("pdfDecode: " + pdfDecode)

                    const byteCharacters = atob(pdfDecode);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const pdfBlob = new Blob([byteArray], {type: 'application/pdf'});
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, '_blank');

                    alert("Se ha creado la guia correctamente")

                    router.reload();

                } else {
                    // Manejo del caso en el que `guia_pdf` está vacío o indefinido
                    console.error("Datos guardados correctamente. Sin Guia Servientrega");
                    alert("Datos guardados correctamente.");

                    router.reload();

                }

            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }

        } catch (error) {
            console.error('Error al enviar la solicitud:', error);

            if (error.response) {
                // El servidor respondió con un estado de error
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                // La solicitud fue realizada pero no se recibió respuesta
                console.error('Request:', error.request);
            } else {
                // Algo pasó al configurar la solicitud
                console.error('Mensaje de error:', error.message);
            }
        }

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
                            href: PATH_DASHBOARD.st.ingresarOrden,
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
                                           placeholder="IMEI/SERIE" required

                                           onChange={e => {
                                               setEnteredName(e.currentTarget.value.toUpperCase());
                                           }}
                                />
                                <Button variant="contained" onClick={() => {
                                    showImei(enteredName)
                                }}>
                                    BUSCAR
                                </Button>


                                <h3>Garantia Por Factura:</h3>
                                <span>{garantia?.garantia}</span>
                                <span>{garantia?.data.NOM_PRODUCTO}</span>
                                <span>{garantia?.data.MARCA}</span>
                                <br></br>
                                <h3>Cliente:</h3>
                                <span>{garantia?.data.COD_CLIENTE}</span>
                                <span>{garantia?.data.NOM_CLIENTE}</span>
                                <span>{garantia?.data.FECHA_VENTA}</span>
                                <br></br>
                                <h3>Empleado Ventas X Facturación:</h3>
                                <span>{garantia?.data.NAME_EMPLEADO_X_FACTURACION}</span>
                                <span>{garantia?.data.EMAIL_EMPLEADO_X_FACTURACION}</span>
                                <br></br>
                                <h3>Taller:</h3>
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
                {/* Para los clientes mayoristas. */}
                {user.ROLE !== '31' &&
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Card sx={{p: 3}}>

                                <Stack spacing={3}>
                                    <h2>Crear Orden (Datos Adicionales)</h2>

                                    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>

                                        {/* <RHFAutocomplete */}
                                        {/*     name="vendedor" */}
                                        {/*     label="Vendedor" */}
                                        {/*     single */}
                                        {/*     freeSolo */}
                                        {/*     options={dataEmpladosVenta} */}
                                        {/*     getOptionLabel={(option) => option.NOMBRE} */}
                                        {/*     ChipProps={{size: 'small'}} */}
                                        {/* /> */}

                                        <h3>Garantía (Revisión Física)</h3>
                                        <FormControlLabel
                                            control={<Switch checked={isChecked} onChange={handleSwitchChange}/>}
                                            label="Garantía (Revisión Física)"/>

                                        <h3>Observación del Vendedor</h3>
                                        <RHFTextField name="obs"
                                                      label="Observación del Vendedor"
                                                      multiline
                                                      rows={3}
                                                      required
                                        />

                                        <h2>Crear Guía Servientrega</h2>

                                        <FormControlLabel
                                            control={<Switch checked={isCheckedGuia}
                                                             onChange={handleSwitchChangeGuia}/>}
                                            label="Crear Guia"/>

                                        <h3>Ciudad Origen</h3>
                                        <RHFRadioGroup row
                                                       spacing={4}
                                                       name="ciudad_origen"
                                                       options={CIUDAD_ORIGEN}
                                                       required
                                        />

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
                }
            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

const GENDER_OPTION = [
    {label: 'Dentro de Garantía (Revisión Física)', value: '0'},
    {label: 'Fuera de Garantía (Revisión Física)', value: '1'},

];

const CIUDAD_ORIGEN = [
    {value: 1, label: 'GUAYAQUIL (GUAYAS)'},
    {value: 2, label: 'QUITO (PICHINCHA)'},
    {value: 4, label: 'CUENCA (AZUAY)'},
    {value: 13, label: 'MANTA (MANABI)'},


];