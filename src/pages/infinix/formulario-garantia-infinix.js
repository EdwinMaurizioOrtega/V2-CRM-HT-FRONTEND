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
import {yupResolver} from "@hookform/resolvers/yup";
import {FormSchema} from "../../sections/_examples/extra/form/schema";
import * as Yup from "yup";



export const defaultValues = {

    nombre_de_la_empresa_o_compania: '',
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
        console.log('DATA', data);
        // reset();

        // Crear prospecto.
        const response = await axios.post('/hanadb/api/customers/create_prospecto_cartera', {
            data: data,
            //empresa: user?.EMPRESA,
        });

        if (response.status === 200) {
            //console.log(response);
            console.log("Se insertaron los datos.");
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
    };

    const handleDropSingleFile = useCallback((acceptedFiles, fieldName) => {

            const file = acceptedFiles[0];
            console.log('Archivo seleccionado:', file);

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
                    console.log('Archivo subido con éxito. Enlace:', data.link);
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

            <Container sx={{ pb: 15}}>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>


                            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                                <Grid container spacing={5}>
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={1}>
                                            <Block label="NOMBRES">
                                                <RHFTextField name="nombres"
                                                              label="NOMBRES"
                                                                    />
                                            </Block>

                                            <Block label="APELLIDOS">
                                                <RHFTextField name="apellidos" label="APELLIDOS"/>
                                            </Block>

                                            <Block label="CEDULA">
                                                <RHFTextField name="cedula"
                                                              label="CEDULA"/>
                                            </Block>

                                            <Block label="CORREO ELECTRONICO">
                                                <RHFTextField name="correo_electronico" label="CORREO ELECTRONICO"/>
                                            </Block>

                                            <Block label="NUMERO DE TELEFONO">
                                                <RHFTextField name="numero_de_telefono"
                                                              label="NUMERO DE TELEFONO"/>
                                            </Block>

                                            <Block label="MODELO DE EQUIPO">
                                                <RHFTextField name="modelo_de_equipo"
                                                              label="MODELO DE EQUIPO"/>
                                            </Block>

                                            <Block label="IMEI">
                                                <RHFTextField name="imei" label="IMEI"/>
                                            </Block>


                                            <Block label="ARCHIVO">
                                                <RHFUpload
                                                    name="archivo"
                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                    onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'archivo')}
                                                    onDelete={() => setValue('archivo', null, {shouldValidate: true})}
                                                />
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
    email: Yup.string().required('Se requiere el Email'),
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
    r_c_compania_3: Yup.string().required('Se requiere la Compañia 3'),
    r_c_tipo_de_credito_3: Yup.string().required('Se requiere el Tipo Crédito 3'),
    r_c_persona_de_contacto_3: Yup.string().required('Se requiere el Persona Contacto 3'),
    r_c_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),

    d_e_a_direccion_1: Yup.string().required('Se requiere la Dirección 1'),
    d_e_a_direccion_2: Yup.string().required('Se requiere la Dirección 2'),
    d_e_a_direccion_3: Yup.string().required('Se requiere ls Dirección 3'),

    r_b_entidad_financiera_1: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 1'),
    r_b_inicio_de_relacion_1: Yup.string().required('Se requiere el Año de Inicio de la Relación 1'),
    r_b_persona_de_contacto_1: Yup.string().required('Se requiere la Persona de Contacto 1'),
    r_b_telefono_1: Yup.string().required('Se requiere el Teléfono 1'),
    r_b_entidad_financiera_2: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 2'),
    r_b_inicio_de_relacion_2: Yup.string().required('Se requiere el Año de Inicio de la Relación 2'),
    r_b_persona_de_contacto_2: Yup.string().required('Se requiere la Persona de Contacto 2'),
    r_b_telefono_2: Yup.string().required('Se requiere el Teléfono 2'),
    r_b_entidad_financiera_3: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 3'),
    r_b_inicio_de_relacion_3: Yup.string().required('Se requiere el Año de Inicio de la Relación 3'),
    r_b_persona_de_contacto_3: Yup.string().required('Se requiere la Persona de Contacto 3'),
    r_b_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),
});