import Head from "next/head";
import MainLayout from "../../layouts/main";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import {Upload, UploadBox} from "../../components/upload";
import Iconify from "../../components/iconify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import React, {useCallback} from "react";
import {useRouter} from "next/router";
import FormProvider, {
    RHFTextField, RHFUpload
} from "../../components/hook-form";
import {useForm} from "react-hook-form";
import {LoadingButton} from "@mui/lab";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "../../utils/axios";

DataPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export const defaultValues = {

    nombre_de_la_empresa_o_compañia: '',
    ruc: '',
    nombre_del_representante: '',
    email: '',
    direccion_de_trabajo: '',
    direccion_de_domicilio: '',
    ciudad: '',
    provincia: '',

};

export default function DataPage() {

    const router = useRouter();
    const {id} = router.query; // Captura el parámetro "id"

    const methods = useForm({
        defaultValues,
    });

    const {
        watch,
        reset,
        control,
        setValue,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const values = watch();

    const onSubmit = async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('DATA', data);
        reset();
    };

    const handleDropSingleFile = useCallback(
        (acceptedFiles, fieldName) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            // Asignar el archivo según el campo correspondiente
            if (fieldName === 'planilla_servicio_basico') {
                setValue('planilla_servicio_basico', newFile, { shouldValidate: true });
            } else if (fieldName === 'escritura_constitucion_de_la_empresa') {
                setValue('escritura_constitucion_de_la_empresa', newFile, { shouldValidate: true });
            } else if (fieldName === 'ruc_upload') {
                setValue('ruc_upload', newFile, { shouldValidate: true });
            } else if (fieldName === 'cedula_de_identidad') {
                setValue('cedula_de_identidad', newFile, { shouldValidate: true });
            } else if (fieldName === 'estados_fiancieros_year_anterior') {
                setValue('estados_fiancieros_year_anterior', newFile, { shouldValidate: true });
            } else if (fieldName === 'nombramiento_del_representante_legal') {
                setValue('nombramiento_del_representante_legal', newFile, { shouldValidate: true });
            } else if (fieldName === 'declaracion_de_impuesto_a_la_renta_year_anterior') {
                setValue('declaracion_de_impuesto_a_la_renta_year_anterior', newFile, { shouldValidate: true });
            } else if (fieldName === 'certificado_bancario') {
                setValue('certificado_bancario', newFile, { shouldValidate: true });
            } else if (fieldName === 'foto_del_local_y_georeferencia') {
                setValue('foto_del_local_y_georeferencia', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        // setSelectedFile(file);

        if (file) {
            handleFileUpload(file, textFieldValues);
        }
    };

    const handleFileUpload = (file, cod) => {

        // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
        console.log('Archivo seleccionado:', file);
        console.log('Código producto:', cod);

        // Ejemplo de envío a un servidor (reemplaza con tu lógica)
        const formData = new FormData();
        formData.append('file', file);

        fetch(`https://imagen.hipertronics.us/ht/cloud/upload_web_files`, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (response.status === 200) {
                    return response.json();  // Convertir la respuesta a JSON si el estado es 200
                } else {
                    throw new Error('Failed to upload file');  // Lanzar un error si el estado no es 200
                }
            })
            .then(async data => {
                if (data.status === 'success') {
                    console.log('Archivo subido con éxito. Enlace:', data.link);

                    // Actualizar una orden.
                    const response = await axios.post('/hanadb/api/products/save_url_img_product', {
                        COD_PROD: cod,
                        URL: data.link,
                    });

                    console.log("Orden actualizada correctamente.");
                    console.log("Código de estado:", response.status);

                    // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
                    if (response.status === 200) {
                        router.reload();
                    }


                } else {
                    console.error('Error en la respuesta del servidor:', data);
                }
            })
            .catch(error => {
                console.error('Error al cargar el archivo:', error);
            });

    };


    return (
        <>
            <Head>
                <title> Crédito | HT</title>
            </Head>

            <Container sx={{pt: 10, pb: 15}}>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>

                            <h2>SOLICITUD DE CREACIÓN Y ACTUALIZACIÓN DE DATOS</h2>

                            <h3>1. PERSONA JURÍDICA IDENTIFICACION DEL CLIENTE</h3>

                            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                                <Grid container spacing={5}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Nombre de la empresa o compañia">
                                                <RHFTextField name="nombre_de_la_empresa_o_compañia"
                                                              label="Nombre de la empresa o compañia:"/>
                                            </Block>

                                            <Block label="RUC">
                                                <RHFTextField name="ruc" label="RUC:"/>
                                            </Block>

                                            <Block label="Nombre del representante">
                                                <RHFTextField name="nombre_del_representante"
                                                              label="Nombre del representante:"/>
                                            </Block>

                                            <Block label="E-mail">
                                                <RHFTextField name="email" label="E-mail:"/>
                                            </Block>

                                            <Block label="Dirección de trabajo">
                                                <RHFTextField name="direccion_de_trabajo"
                                                              label="Dirección de trabajo:"/>
                                            </Block>

                                            <Block label="Dirección de domicilio">
                                                <RHFTextField name="direccion_de_domicilio"
                                                              label="Dirección de domicilio:"/>
                                            </Block>

                                            <Block label="Ciudad">
                                                <RHFTextField name="ciudad" label="Ciudad:"/>
                                            </Block>

                                            <Block label="Provincia">
                                                <RHFTextField name="provincia" label="Provincia:"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Planilla Servicio básico.">
                                                <RHFUpload
                                                    name="planilla_servicio_basico"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'planilla_servicio_basico')}
                                                    onDelete={() => setValue('planilla_servicio_basico', null, {shouldValidate: true})}
                                                />
                                                {/* <Stack direction="row" spacing={1} alignItems="center"> */}
                                                {/*     <Button */}
                                                {/*         variant="contained" */}
                                                {/*         component="label" */}
                                                {/*         startIcon={<CloudUploadIcon/>} */}
                                                {/*     > */}
                                                {/*         Archivo */}
                                                {/*         <input */}
                                                {/*             type="file" */}
                                                {/*             hidden */}
                                                {/*             onChange={(event) => handleFileChange(event, 'planilla_servicio_basico')} */}
                                                {/*         /> */}
                                                {/*     </Button> */}
                                                {/* </Stack> */}
                                            </Block>

                                            <Block label="Escritura Constitucion de la Empresa.">
                                                <RHFUpload
                                                    name="escritura_constitucion_de_la_empresa"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'escritura_constitucion_de_la_empresa')}
                                                    onDelete={() => setValue('escritura_constitucion_de_la_empresa', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="RUC">
                                                <RHFUpload
                                                    name="ruc_upload"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'ruc_upload')}
                                                    onDelete={() => setValue('ruc_upload', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Cédula de Identidad">
                                                <RHFUpload
                                                    name="cedula_de_identidad"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'cedula_de_identidad')}
                                                    onDelete={() => setValue('cedula_de_identidad', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Estados Fiancieros (Año anterior)">
                                                <RHFUpload
                                                    name="estados_fiancieros_year_anterior)"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'estados_fiancieros_year_anterior')}
                                                    onDelete={() => setValue('estados_fiancieros_year_anterior', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Nombramiento del Representante Legal">
                                                <RHFUpload
                                                    name="nombramiento_del_representante_legal"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'nombramiento_del_representante_legal')}
                                                    onDelete={() => setValue('nombramiento_del_representante_legal', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Declaración de Impuesto a la Renta (Año anterior)">
                                                <RHFUpload
                                                    name="declaracion_de_impuesto_a_la_renta_year_anterior"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'declaracion_de_impuesto_a_la_renta_year_anterior')}
                                                    onDelete={() => setValue('declaracion_de_impuesto_a_la_renta_year_anterior', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Certificado Bancario">
                                                <RHFUpload
                                                    name="certificado_bancario"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'certificado_bancario')}
                                                    onDelete={() => setValue('certificado_bancario', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Foto del local y georeferencia">
                                                <RHFUpload
                                                    name="foto_del_local_y_georeferencia"
                                                    maxSize={3145728}
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'foto_del_local_y_georeferencia')}
                                                    onDelete={() => setValue('foto_del_local_y_georeferencia', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                </Grid>

                                <h3>2. REFERENCIAS COMERCIALES</h3>
                                <Grid container spacing={5}>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Compañía 1">
                                                <RHFTextField name="compania_1" label="Compañía 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 1">
                                                <RHFTextField name="tipo_de_credito_1"
                                                              label="Tipo de Crédito 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="persona_de_contacto_1"
                                                              label="Persona de Contacto 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 1">
                                                <RHFTextField name="r_c_telefono_1" label="Teléfono 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Compañía 2">
                                                <RHFTextField name="compania_2" label="Compañía 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 2">
                                                <RHFTextField name="tipo_de_credito_2"
                                                              label="Tipo de Crédito 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="persona_de_contacto_2"
                                                              label="Persona de Contacto 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 2">
                                                <RHFTextField name="r_c_telefono_2" label="Teléfono 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Compañía 3">
                                                <RHFTextField name="compania_3" label="Compañía 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 3">
                                                <RHFTextField name="tipo_de_credito_3"
                                                              label="Tipo de Crédito 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="persona_de_contacto_3"
                                                              label="Persona de Contacto 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 3">
                                                <RHFTextField name="r_c_telefono_3" label="Teléfono 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                </Grid>

                                <h3>3. DIRECCIONES ENVIOS AUTORIZADOS</h3>
                                <Grid container spacing={5}>

                                    {/* 1 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Block label="Dirección 1">
                                                <RHFTextField name="d_e_a_direccion_1" label="Dirección 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 2 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Block label="Dirección 2">
                                                <RHFTextField name="d_e_a_direccion_2" label="Dirección 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Block label="Dirección 3">
                                                <RHFTextField name="d_e_a_direccion_3" label="Dirección 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                </Grid>

                                <h3>4. REFERENCIAS BANCARIAS</h3>
                                <Grid container spacing={5}>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Entidad Financiera 1">
                                                <RHFTextField name="r_b_entidad_financiera_1" label="Entidad Financiera 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relacióno 1">
                                                <RHFTextField name="r_b_inicio_de_relacion_1"
                                                              label="Inicio de Relación 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_b_persona_de_contacto_1"
                                                              label="Persona de Contacto 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 1">
                                                <RHFTextField name="r_b_telefono_1" label="Teléfono 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Entidad Financiera 2">
                                                <RHFTextField name="r_b_entidad_financiera_2" label="Entidad Financiera 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 2">
                                                <RHFTextField name="r_b_inicio_de_relacion_2"
                                                              label="Inicio de Relación 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_b_persona_de_contacto_2"
                                                              label="Persona de Contacto 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 2">
                                                <RHFTextField name="r_b_telefono_2" label="Teléfono 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Entidad Financiera 3">
                                                <RHFTextField name="r_b_entidad_financiera_3" label="Entidad Financiera 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 3">
                                                <RHFTextField name="r_b_inicio_de_relacion_3"
                                                              label="Inicio de Relación 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_b_persona_de_contacto_3"
                                                              label="Persona de Contacto 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 3">
                                                <RHFTextField name="r_b_telefono_3" label="Teléfono 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                </Grid>

                                <Grid container spacing={5} sx={{ paddingTop: 3 }}>
                                    <Grid item xs={12} md={12} >
                                        <Stack spacing={2}>
                                            <LoadingButton
                                                fullWidth
                                                color="info"
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                loading={isSubmitting}
                                            >
                                                Guardar
                                            </LoadingButton>
                                        </Stack>
                                    </Grid>
                                </Grid>

                            </FormProvider>


                            <CardHeader title={'CLIENTE: ' + id}/>

                            <CardContent>
                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Planilla Servicio básico.</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Escritura Constitucion de la Empresa</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>RUC</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Cédula de Identidad</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Estados Fiancieros (Año anterior)</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Nombramiento del Representante Legal</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Declaración de Impuesto a la Renta (Año anterior)</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Certificado Bancario</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <h3 style={{color: 'black'}}>Foto del local y georeferencia</h3>
                                    <UploadBox
                                        placeholder={
                                            <Stack spacing={0.5} alignItems="center">
                                                <Iconify icon="eva:cloud-upload-fill" width={40}/>
                                                <Typography variant="body2">Upload file</Typography>
                                            </Stack>
                                        }
                                        sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}}
                                    />
                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                    <CancelIcon style={{color: "red", fontSize: 40}}/>
                                </Stack>

                            </CardContent>

                        </Card>
                    </Grid>
                </Grid>

            </Container>
        </>
    );
}


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