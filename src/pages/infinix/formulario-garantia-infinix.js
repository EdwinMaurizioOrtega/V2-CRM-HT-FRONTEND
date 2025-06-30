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

    nombres: '',
    apellidos: '',
    cedula: '',
    correo_electronico: '',
    numero_de_telefono: '',
    modelo_de_equipo: '',
    imei: '',

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
        //console.log('DATA', data);
        // reset();

        // Crear prospecto.
        const response = await axios.post('/hanadb/api/infinix/create_formulario_infinix', {
            data: data,
            //empresa: user?.EMPRESA,
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
            if (fieldName === 'archivo') {
                //setValue('planilla_servicio_basico', newFile, { shouldValidate: true });
                handleFileUpload(file, 'archivo');
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
    nombres: Yup.string().required('Se requieren los Nombres'),
    apellidos: Yup.string().required('Se requieren los Apellidos'),
    cedula: Yup.string().required('Se requiere la Cédula'),
    correo_electronico: Yup.string().required('Se requiere el Email'),
    numero_de_telefono: Yup.string().required('Se requiere el Número de Telefono'),
    modelo_de_equipo: Yup.string().required('Se requiere el Modelo del Equipo'),
    imei: Yup.string().required('Se requiere el IMEI'),

    // archivo: Yup.string().required('Se requiere un archivo.'),

});