import Head from "next/head";
import MainLayout from "../../../layouts/main";
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
import {Upload, UploadBox} from "../../../components/upload";
import Iconify from "../../../components/iconify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import React, {useCallback} from "react";
import {useRouter} from "next/router";
import FormProvider, {
    RHFTextField, RHFUpload
} from "../../../components/hook-form";
import {useForm} from "react-hook-form";
import {LoadingButton} from "@mui/lab";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "../../../utils/axios";
import {yupResolver} from "@hookform/resolvers/yup";
import {FormSchema} from "../../../sections/_examples/extra/form/schema";
import * as Yup from "yup";

DataPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export const defaultValues = {

    nombre_de_la_empresa_o_compania: '_',
    ruc: '_',
    nombre_del_representante: '_',
    cedula_del_representante: '_',
    email: '_',
    telefono: '_',
    direccion_de_trabajo: '_',
    direccion_de_domicilio: '_',
    ciudad: '_',
    provincia: '_',

    planilla_servicio_basico: null,
    escritura_constitucion_de_la_empresa: null,
    ruc_upload: null,
    cedula_de_identidad: null,
    estados_fiancieros_year_anterior: null,
    nombramiento_del_representante_legal: null,
    declaracion_de_impuesto_a_la_renta_year_anterior: null,
    certificado_bancario: null,
    foto_del_local_y_georeferencia: null,

    r_c_compania_1: '_',
    r_c_tipo_de_credito_1: '_',
    r_c_persona_de_contacto_1: '_',
    r_c_telefono_1: '_',
    r_c_compania_2: '_',
    r_c_tipo_de_credito_2: '_',
    r_c_persona_de_contacto_2: '_',
    r_c_telefono_2: '_',
    r_c_compania_3: '_',
    r_c_tipo_de_credito_3: '_',
    r_c_persona_de_contacto_3: '_',
    r_c_telefono_3: '_',

    d_e_a_direccion_1: '_',
    d_e_a_direccion_2: '_',
    d_e_a_direccion_3: '_',

    r_b_entidad_financiera_1: '_',
    r_b_inicio_de_relacion_1: '_',
    r_b_persona_de_contacto_1: '_',
    r_b_telefono_1: '_',
    r_b_entidad_financiera_2: '_',
    r_b_inicio_de_relacion_2: '_',
    r_b_persona_de_contacto_2: '_',
    r_b_telefono_2: '_',
    r_b_entidad_financiera_3: '_',
    r_b_inicio_de_relacion_3: '_',
    r_b_persona_de_contacto_3: '_',
    r_b_telefono_3: '_',

};

export default function DataPage() {

    const router = useRouter();

    const methods = useForm({
        resolver: yupResolver(FormSchemaCartera),
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

        // await new Promise((resolve) => setTimeout(resolve, 3000));
        //console.log('DATA', data);
        // reset();

        // Verificar existencia cédula prospecto.
        const response = await axios.post(`/hanadb/api/customers/get_prospecto_cartera_by_ruc?ruc=${data.ruc}`);

        if (response.status === 200) {
            alert("El cliente ya se encuentra en proceso de firma electrónica.")
        } else {

            // Crear prospecto.
            const response = await axios.post('/hanadb/api/customers/create_prospecto_cartera', {
                data: data,
                tipo_persona: 'J',
            });

            if (response.status === 200) {
                ////console.log(response);
                //console.log("Se insertaron los datos.");
                alert("Solicitud enviada correctamente.")
                // Esperar a que el usuario cierre la alerta antes de recargar
                setTimeout(() => {
                    router.reload();
                }, 100);
            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
                alert("Ocurrio un error en la solicitud.")
            }
        }


    };

    const handleDropSingleFile = useCallback((acceptedFiles, fieldName) => {

            const file = acceptedFiles[0];
            //console.log('Archivo seleccionado:', file);

            if (!file) return; // Si no hay archivo, salir

            const maxSize = 5 * 1024 * 1024; // 5 MB

            if (file.size > maxSize) {
                console.error("El archivo excede el tamaño permitido (5 MB):", file.name);
                alert("El archivo seleccionado es demasiado grande. Por favor, selecciona un archivo de máximo 5 MB.");
                return;
            }


            // Asignar el archivo según el campo correspondiente
            if (fieldName === 'planilla_servicio_basico') {
                //setValue('planilla_servicio_basico', newFile, { shouldValidate: true });
                handleFileUpload(file, 'planilla_servicio_basico');
            } else if (fieldName === 'escritura_constitucion_de_la_empresa') {
                //setValue('escritura_constitucion_de_la_empresa', newFile, { shouldValidate: true });
                handleFileUpload(file, 'escritura_constitucion_de_la_empresa');
            } else if (fieldName === 'ruc_upload') {
                //setValue('ruc_upload', newFile, { shouldValidate: true });
                handleFileUpload(file, 'ruc_upload');
            } else if (fieldName === 'cedula_de_identidad') {
                //setValue('cedula_de_identidad', newFile, { shouldValidate: true });
                handleFileUpload(file, 'cedula_de_identidad');
            } else if (fieldName === 'estados_fiancieros_year_anterior') {
                //setValue('estados_fiancieros_year_anterior', newFile, { shouldValidate: true });
                handleFileUpload(file, 'estados_fiancieros_year_anterior');
            } else if (fieldName === 'nombramiento_del_representante_legal') {
                //setValue('nombramiento_del_representante_legal', newFile, { shouldValidate: true });
                handleFileUpload(file, 'nombramiento_del_representante_legal');
            } else if (fieldName === 'declaracion_de_impuesto_a_la_renta_year_anterior') {
                //setValue('declaracion_de_impuesto_a_la_renta_year_anterior', newFile, { shouldValidate: true });
                handleFileUpload(file, 'declaracion_de_impuesto_a_la_renta_year_anterior');
            } else if (fieldName === 'certificado_bancario') {
                //setValue('certificado_bancario', newFile, { shouldValidate: true });
                handleFileUpload(file, 'certificado_bancario');
            } else if (fieldName === 'foto_del_local_y_georeferencia') {
                //setValue('foto_del_local_y_georeferencia', newFile, { shouldValidate: true });
                handleFileUpload(file, 'foto_del_local_y_georeferencia');
            }
        },
        [setValue]
    );

    const handleFileUpload = (file, tipo_campo) => {

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
                    //console.log('Archivo subido con éxito. Enlace:', data.link);
                    //Guardamos el enlace por cada archivo cargado.
                    setValue(tipo_campo, data.link, {shouldValidate: true});
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

                            <h2>SOLICITUD DE CREACIÓN DE DATOS</h2>

                            <h3>1. PERSONA JURÍDICA IDENTIFICACION DEL CLIENTE</h3>

                            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                                <Grid container spacing={5}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Nombre de la empresa o compañia">
                                                <RHFTextField name="nombre_de_la_empresa_o_compania"
                                                              label="Nombre de la empresa o compania"
                                                                    />
                                            </Block>

                                            <Block label="RUC">
                                                <RHFTextField name="ruc" label="RUC"/>
                                            </Block>

                                            <Block label="Nombre del representante">
                                                <RHFTextField name="nombre_del_representante"
                                                              label="Nombre del representante"/>
                                            </Block>

                                            <Block label="Cédula del representante">
                                                <RHFTextField name="cedula_del_representante"
                                                              label="Cédula del representante"/>
                                            </Block>

                                            <Block label="E-mail">
                                                <RHFTextField name="email" label="E-mail"/>
                                            </Block>

                                            <Block label="Teléfono">
                                                <RHFTextField name="telefono" label="Teléfono"/>
                                            </Block>

                                            <Block label="Dirección de trabajo">
                                                <RHFTextField name="direccion_de_trabajo"
                                                              label="Dirección de trabajo"/>
                                            </Block>

                                            <Block label="Dirección de domicilio">
                                                <RHFTextField name="direccion_de_domicilio"
                                                              label="Dirección de domicilio"/>
                                            </Block>

                                            <Block label="Ciudad">
                                                <RHFTextField name="ciudad" label="Ciudad"/>
                                            </Block>

                                            <Block label="Provincia">
                                                <RHFTextField name="provincia" label="Provincia"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Planilla Servicio básico">
                                                <RHFUpload
                                                    name="planilla_servicio_basico"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'planilla_servicio_basico')}
                                                    onDelete={() => setValue('planilla_servicio_basico', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Escritura Constitucion de la Empresa">
                                                <RHFUpload
                                                    name="escritura_constitucion_de_la_empresa"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'escritura_constitucion_de_la_empresa')}
                                                    onDelete={() => setValue('escritura_constitucion_de_la_empresa', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="RUC">
                                                <RHFUpload
                                                    name="ruc_upload"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'ruc_upload')}
                                                    onDelete={() => setValue('ruc_upload', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Cédula de Identidad">
                                                <RHFUpload
                                                    name="cedula_de_identidad"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'cedula_de_identidad')}
                                                    onDelete={() => setValue('cedula_de_identidad', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Estados Fiancieros (Año anterior)">
                                                <RHFUpload
                                                    name="estados_fiancieros_year_anterior"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'estados_fiancieros_year_anterior')}
                                                    onDelete={() => setValue('estados_fiancieros_year_anterior', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Nombramiento del Representante Legal">
                                                <RHFUpload
                                                    name="nombramiento_del_representante_legal"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'nombramiento_del_representante_legal')}
                                                    onDelete={() => setValue('nombramiento_del_representante_legal', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Declaración de Impuesto a la Renta (Año anterior)">
                                                <RHFUpload
                                                    name="declaracion_de_impuesto_a_la_renta_year_anterior"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'declaracion_de_impuesto_a_la_renta_year_anterior')}
                                                    onDelete={() => setValue('declaracion_de_impuesto_a_la_renta_year_anterior', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Certificado Bancario">
                                                <RHFUpload
                                                    name="certificado_bancario"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'certificado_bancario')}
                                                    onDelete={() => setValue('certificado_bancario', null, {shouldValidate: true})}
                                                />
                                            </Block>

                                            <Block label="Foto del local y georeferencia">
                                                <RHFUpload
                                                    name="foto_del_local_y_georeferencia"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
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
                                                <RHFTextField name="r_c_compania_1" label="Compañía 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 1">
                                                <RHFTextField name="r_c_tipo_de_credito_1"
                                                              label="Tipo de Crédito 1"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_c_persona_de_contacto_1"
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
                                                <RHFTextField name="r_c_compania_2" label="Compañía 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 2">
                                                <RHFTextField name="r_c_tipo_de_credito_2"
                                                              label="Tipo de Crédito 2"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_c_persona_de_contacto_2"
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
                                                <RHFTextField name="r_c_compania_3" label="Compañía 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 3">
                                                <RHFTextField name="r_c_tipo_de_credito_3"
                                                              label="Tipo de Crédito 3"/>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_c_persona_de_contacto_3"
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
                                                <RHFTextField name="r_b_entidad_financiera_1"
                                                              label="Entidad Financiera 1"/>
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
                                                <RHFTextField name="r_b_entidad_financiera_2"
                                                              label="Entidad Financiera 2"/>
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
                                                <RHFTextField name="r_b_entidad_financiera_3"
                                                              label="Entidad Financiera 3"/>
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

                                <Grid container spacing={5} sx={{paddingTop: 3}}>
                                    <Grid item xs={12} md={12}>
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


                            {/* <CardHeader title={'CLIENTE: ' + id}/> */}

                            {/* <CardContent> */}
                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Planilla Servicio básico.</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Escritura Constitucion de la Empresa</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>RUC</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Cédula de Identidad</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Estados Fiancieros (Año anterior)</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Nombramiento del Representante Legal</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Declaración de Impuesto a la Renta (Año anterior)</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Certificado Bancario</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/*     <Stack direction="row" spacing={2}> */}
                            {/*         <h3 style={{color: 'black'}}>Foto del local y georeferencia</h3> */}
                            {/*         <UploadBox */}
                            {/*             placeholder={ */}
                            {/*                 <Stack spacing={0.5} alignItems="center"> */}
                            {/*                     <Iconify icon="eva:cloud-upload-fill" width={40}/> */}
                            {/*                     <Typography variant="body2">Upload file</Typography> */}
                            {/*                 </Stack> */}
                            {/*             } */}
                            {/*             sx={{flexGrow: 1, height: 'auto', py: 2.5, mb: 3}} */}
                            {/*         /> */}
                            {/*         <CheckCircleIcon style={{color: "green", fontSize: 40}}/> */}
                            {/*         <CancelIcon style={{color: "red", fontSize: 40}}/> */}
                            {/*     </Stack> */}

                            {/* </CardContent> */}

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

export const FormSchemaCartera = Yup.object().shape({
    nombre_de_la_empresa_o_compania: Yup.string().required('Se requiere el Nombre de la empresa o compañia'),
    ruc: Yup.string().required('Se requiere el RUC'),
    nombre_del_representante: Yup.string().required('Se requiere el Nombre del representante'),
    cedula_del_representante: Yup.string().required('Se requiere la Cédula'),
    email: Yup.string().required('Se requiere el Email'),
    telefono: Yup.string().required('Se requiere el teléfono'),
    direccion_de_trabajo: Yup.string().required('Se requiere la Direccion de trabajo'),
    direccion_de_domicilio: Yup.string().required('Se requiere la Direccion de domicilio'),
    ciudad: Yup.string().required('Se requiere la Ciudad'),
    provincia: Yup.string().required('Se requiere la Provincia'),

    planilla_servicio_basico: Yup.string().required('Se requiere la Planilla servicio basico'),
    escritura_constitucion_de_la_empresa: Yup.string().required('Se requiere la Escritura constitucion de la empresa'),
    ruc_upload: Yup.string().required('Se requiere el RUC upload'),
    cedula_de_identidad: Yup.string().required('Se requiere la Cédula de identidad'),
    estados_fiancieros_year_anterior: Yup.string().required('Se requiere los Estados fiancieros años anterior'),
    nombramiento_del_representante_legal: Yup.string().required('Se requiere el Nombramiento del representante legal'),
    declaracion_de_impuesto_a_la_renta_year_anterior: Yup.string().required('Se requiere la Declaracion de impuesto a la renta año anterior'),
    certificado_bancario: Yup.string().required('Se requiere el Certificado bancario'),
    foto_del_local_y_georeferencia: Yup.string().required('Se requiere la Foto del local y georeferencia'),

    r_c_compania_1: Yup.string().required('Se requiere la Compañia 1'),
    r_c_tipo_de_credito_1: Yup.string().required('Se requiere el Tipo Crédito 1'),
    r_c_persona_de_contacto_1: Yup.string().required('Se requiere el Persona Contacto 1'),
    r_c_telefono_1: Yup.string().required('Se requiere el Teléfono 1'),
    r_c_compania_2: Yup.string().required('Se requiere la Compañia 2'),
    r_c_tipo_de_credito_2: Yup.string().required('Se requiere el Tipo Crédito 2'),
    r_c_persona_de_contacto_2: Yup.string().required('Se requiere el Persona Contacto 2'),
    r_c_telefono_2: Yup.string().required('Se requiere el Teléfono 2'),
    // r_c_compania_3: Yup.string().required('Se requiere la Compañia 3'),
    // r_c_tipo_de_credito_3: Yup.string().required('Se requiere el Tipo Crédito 3'),
    // r_c_persona_de_contacto_3: Yup.string().required('Se requiere el Persona Contacto 3'),
    // r_c_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),

    d_e_a_direccion_1: Yup.string().required('Se requiere la Dirección 1'),
    d_e_a_direccion_2: Yup.string().required('Se requiere la Dirección 2'),
    // d_e_a_direccion_3: Yup.string().required('Se requiere ls Dirección 3'),

    r_b_entidad_financiera_1: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 1'),
    r_b_inicio_de_relacion_1: Yup.string().required('Se requiere el Año de Inicio de la Relación 1'),
    r_b_persona_de_contacto_1: Yup.string().required('Se requiere la Persona de Contacto 1'),
    r_b_telefono_1: Yup.string().required('Se requiere el Teléfono 1'),
    r_b_entidad_financiera_2: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 2'),
    r_b_inicio_de_relacion_2: Yup.string().required('Se requiere el Año de Inicio de la Relación 2'),
    r_b_persona_de_contacto_2: Yup.string().required('Se requiere la Persona de Contacto 2'),
    r_b_telefono_2: Yup.string().required('Se requiere el Teléfono 2'),
    // r_b_entidad_financiera_3: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 3'),
    // r_b_inicio_de_relacion_3: Yup.string().required('Se requiere el Año de Inicio de la Relación 3'),
    // r_b_persona_de_contacto_3: Yup.string().required('Se requiere la Persona de Contacto 3'),
    // r_b_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),
});