import Head from "next/head";
import MainLayout from "../../../../layouts/main";
import {
    Box, Button,
    Card, CircularProgress,
    Container,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import React, {useCallback, useState} from "react";
import {useRouter} from "next/router";
import FormProvider, {
    RHFTextField, RHFUpload
} from "../../../../components/hook-form";
import {useForm} from "react-hook-form";
import {LoadingButton} from "@mui/lab";
import axios from "../../../../utils/axios";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {useAuthContext} from "../../../../auth/useAuthContext";
import DashboardLayout from "../../../../layouts/dashboard";

DataPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

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
    geolocalizacion: '_',

    planilla_servicio_basico: null,
    escritura_constitucion_de_la_empresa: null,
    ruc_upload: null,
    cedula_de_identidad: null,
    //estados_fiancieros_year_anterior: null,
    nombramiento_del_representante_legal: null,
    // declaracion_de_impuesto_a_la_renta_year_anterior: null,
    certificado_bancario: null,
    foto_del_local: null,
    carta_vendedores: null,

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

    const {user} = useAuthContext();

    const router = useRouter();

    const [loadingFields, setLoadingFields] = useState({});

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

        console.log("data: " + data);

        // Crear prospecto.
        const response = await axios.post('/hanadb/api/customers/create_prospecto_cartera', {
            data: data,
            tipo_persona: 'J',
            user_id: user?.ID,
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

            // Activar loading para el campo actual
            setLoadingFields(prev => ({...prev, [fieldName]: true}));

            const upload = (name) => {
                return handleFileUpload(file, name)
                    .finally(() => {
                        // Desactivar loading cuando termine
                        setLoadingFields(prev => ({...prev, [fieldName]: false}));
                    });
            };

            switch (fieldName) {
                case 'planilla_servicio_basico':
                case 'escritura_constitucion_de_la_empresa':
                case 'ruc_upload':
                case 'cedula_de_identidad':
                //case 'estados_fiancieros_year_anterior':
                case 'nombramiento_del_representante_legal':
                // case 'declaracion_de_impuesto_a_la_renta_year_anterior':
                case 'certificado_bancario':
                case 'foto_del_local':
                case 'carta_vendedores':
                    upload(fieldName)
                        .then(response => {
                            // Puedes manejar el resultado aquí si necesitas
                            console.log(`Archivo ${fieldName} subido correctamente`);
                        })
                        .catch(error => {
                            console.error(`Error subiendo ${fieldName}:`, error);
                        })
                        .finally(() => {
                            setLoadingFields(prev => ({...prev, [fieldName]: false}));
                        });
                    break;
                default:
                    console.warn(`Campo desconocido: ${fieldName}`);
            }

        },
        [setValue]
    );

    const handleFileUpload = (file, tipo_campo) => {

        // Ejemplo de envío a un servidor (reemplaza con tu lógica)
        const formData = new FormData();
        formData.append('file', file);

        return fetch(`https://imagen.hipertronics.us/ht/cloud/upload_web_files`, {
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

    const handleUpper = (fieldName) => (e) => {
        const value = e.target.value.toUpperCase();
        setValue(fieldName, value, {
            shouldValidate: true,
            shouldDirty: true,
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
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('nombre_de_la_empresa_o_compania')}
                                                />
                                            </Block>

                                            <Block label="RUC">
                                                <RHFTextField name="ruc" label="RUC"
                                                              onKeyPress={(e) => {
                                                                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                                                              }}
                                                              inputProps={{
                                                                  maxLength: 13,
                                                                  inputMode: 'numeric',
                                                                  pattern: '[0-9]*',
                                                              }}
                                                              onBlur={(e) => {
                                                                  const value = e.target.value.trim();
                                                                  if (value.length !== 13 || !/^\d{13}$/.test(value)) {
                                                                      methods.setError('ruc', {
                                                                          type: 'manual',
                                                                          message: 'El RUC debe tener exactamente 13 dígitos numéricos',
                                                                      });
                                                                  } else {
                                                                      methods.clearErrors('ruc');
                                                                  }
                                                              }}
                                                />
                                            </Block>

                                            <Block label="Representante (Dos Nombres - Dos Apellidos)">
                                                <RHFTextField name="nombre_del_representante"
                                                              label="Representante (Dos Nombres - Dos Apellidos)"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('nombre_del_representante')}
                                                />
                                            </Block>

                                            <Block label="Cédula del representante">
                                                <RHFTextField name="cedula_del_representante"
                                                              label="Cédula del representante"
                                                              onKeyPress={(e) => {
                                                                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                                                              }}
                                                              inputProps={{
                                                                  maxLength: 10,
                                                                  inputMode: 'numeric',
                                                                  pattern: '[0-9]*',
                                                              }}
                                                              onBlur={(e) => {
                                                                  const value = e.target.value.trim();
                                                                  if (value.length !== 10 || !/^\d{10}$/.test(value)) {
                                                                      methods.setError('cedula_del_representante', {
                                                                          type: 'manual',
                                                                          message: 'La CÉDULA debe tener exactamente 10 dígitos numéricos',
                                                                      });
                                                                  } else {
                                                                      methods.clearErrors('cedula_del_representante');
                                                                  }
                                                              }}
                                                />
                                            </Block>

                                            <Block label="E-mail">
                                                <RHFTextField name="email" label="E-mail"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('email')}
                                                />
                                            </Block>

                                            <Block label="Teléfono">
                                                <RHFTextField name="telefono" label="Teléfono"
                                                              onKeyPress={(e) => {
                                                                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                                                              }}
                                                              inputProps={{
                                                                  maxLength: 10,
                                                                  inputMode: 'numeric',
                                                                  pattern: '[0-9]*',
                                                              }}
                                                              onBlur={(e) => {
                                                                  const value = e.target.value.trim();
                                                                  if (value.length !== 10 || !/^\d{10}$/.test(value)) {
                                                                      methods.setError('telefono', {
                                                                          type: 'manual',
                                                                          message: 'El TELÉFONO debe tener exactamente 10 dígitos numéricos',
                                                                      });
                                                                  } else {
                                                                      methods.clearErrors('telefono');
                                                                  }
                                                              }}
                                                />
                                            </Block>

                                            <Block label="Dirección completa de trabajo - referencias">
                                                <RHFTextField name="direccion_de_trabajo"
                                                              label="Dirección completa de trabajo - referencias"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('direccion_de_trabajo')}
                                                />
                                            </Block>

                                            <Block label="Dirección completa de domicilio - referencias">
                                                <RHFTextField name="direccion_de_domicilio"
                                                              label="Dirección completa de domicilio - referencias"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('direccion_de_domicilio')}
                                                />
                                            </Block>

                                            <Block label="Ciudad">
                                                <RHFTextField name="ciudad" label="Ciudad"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('ciudad')}
                                                />
                                            </Block>

                                            <Block label="Provincia">
                                                <RHFTextField name="provincia" label="Provincia"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('provincia')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Planilla Servicio básico">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="planilla_servicio_basico"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'planilla_servicio_basico')}
                                                        onDelete={() => setValue('planilla_servicio_basico', null, {shouldValidate: true})}
                                                    />
                                                    {watch("planilla_servicio_basico") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("planilla_servicio_basico");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['planilla_servicio_basico'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Escritura Constitucion de la Empresa">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="escritura_constitucion_de_la_empresa"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'escritura_constitucion_de_la_empresa')}
                                                        onDelete={() => setValue('escritura_constitucion_de_la_empresa', null, {shouldValidate: true})}
                                                    />
                                                    {watch("escritura_constitucion_de_la_empresa") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("escritura_constitucion_de_la_empresa");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['escritura_constitucion_de_la_empresa'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Certificado RUC">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="ruc_upload"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'ruc_upload')}
                                                        onDelete={() => setValue('ruc_upload', null, {shouldValidate: true})}
                                                    />
                                                    {watch("ruc_upload") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("ruc_upload");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['ruc_upload'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Cédula de Identidad">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="cedula_de_identidad"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'cedula_de_identidad')}
                                                        onDelete={() => setValue('cedula_de_identidad', null, {shouldValidate: true})}
                                                    />
                                                    {watch("cedula_de_identidad") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("cedula_de_identidad");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['cedula_de_identidad'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Nombramiento del Representante Legal">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="nombramiento_del_representante_legal"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'nombramiento_del_representante_legal')}
                                                        onDelete={() => setValue('nombramiento_del_representante_legal', null, {shouldValidate: true})}
                                                    />
                                                    {watch("nombramiento_del_representante_legal") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("nombramiento_del_representante_legal");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['nombramiento_del_representante_legal'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Certificado Bancario">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="certificado_bancario"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'certificado_bancario')}
                                                        onDelete={() => setValue('certificado_bancario', null, {shouldValidate: true})}
                                                    />
                                                    {watch("certificado_bancario") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("certificado_bancario");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['certificado_bancario'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Foto del local">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="foto_del_local"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'foto_del_local')}
                                                        onDelete={() => setValue('foto_del_local', null, {shouldValidate: true})}
                                                    />
                                                    {watch("foto_del_local") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("foto_del_local");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['foto_del_local'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Block>

                                            <Block label="Geolocalización">
                                                <RHFTextField name="geolocalizacion" label="Geolocalización"
                                                              onChange={(e) => {
                                                                  const value = e.target.value;
                                                                  setValue('geolocalizacion', value)
                                                              }}
                                                />
                                            </Block>

                                            <Block label="Carta Vendedores">
                                                <Box position="relative">
                                                    <RHFUpload
                                                        name="carta_vendedores"
                                                        maxSize={5 * 1024 * 1024}  // 5 MB
                                                        accept={{ 'application/pdf': ['.pdf'] }} // solo PDF
                                                        onDrop={(acceptedFiles) => handleDropSingleFile(acceptedFiles, 'carta_vendedores')}
                                                        onDelete={() => setValue('carta_vendedores', null, {shouldValidate: true})}
                                                    />
                                                    {watch("carta_vendedores") ? (
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("carta_vendedores");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                        ) :
                                                        null
                                                    }
                                                    {loadingFields['carta_vendedores'] && (
                                                        <Box
                                                            position="absolute"
                                                            top={0}
                                                            left={0}
                                                            width="100%"
                                                            height="100%"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            bgcolor="rgba(255, 255, 255, 0.6)"
                                                            zIndex={2}
                                                        >
                                                            <CircularProgress size={36}/>
                                                        </Box>
                                                    )}
                                                </Box>
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
                                                <RHFTextField name="r_c_compania_1" label="Compañía 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_compania_1')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 1">
                                                <RHFTextField name="r_c_tipo_de_credito_1"
                                                              label="Tipo de Crédito 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_tipo_de_credito_1')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_c_persona_de_contacto_1"
                                                              label="Persona de Contacto 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_persona_de_contacto_1')}
                                                />
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
                                                <RHFTextField name="r_c_compania_2" label="Compañía 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_compania_2')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 2">
                                                <RHFTextField name="r_c_tipo_de_credito_2"
                                                              label="Tipo de Crédito 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_tipo_de_credito_2')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_c_persona_de_contacto_2"
                                                              label="Persona de Contacto 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_persona_de_contacto_2')}
                                                />
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
                                                <RHFTextField name="r_c_compania_3" label="Compañía 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_compania_3')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 3">
                                                <RHFTextField name="r_c_tipo_de_credito_3"
                                                              label="Tipo de Crédito 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_tipo_de_credito_3')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_c_persona_de_contacto_3"
                                                              label="Persona de Contacto 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_c_persona_de_contacto_3')}
                                                />
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
                                                <RHFTextField name="d_e_a_direccion_1" label="Dirección 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('d_e_a_direccion_1')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 2 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Block label="Dirección 2">
                                                <RHFTextField name="d_e_a_direccion_2" label="Dirección 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('d_e_a_direccion_2')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Block label="Dirección 3">
                                                <RHFTextField name="d_e_a_direccion_3" label="Dirección 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('d_e_a_direccion_3')}
                                                />
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
                                                              label="Entidad Financiera 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_entidad_financiera_1')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relacióno 1">
                                                <RHFTextField name="r_b_inicio_de_relacion_1"
                                                              label="Inicio de Relación 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_inicio_de_relacion_1')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_b_persona_de_contacto_1"
                                                              label="Persona de Contacto 1"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_persona_de_contacto_1')}
                                                />
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
                                                              label="Entidad Financiera 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_entidad_financiera_2')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 2">
                                                <RHFTextField name="r_b_inicio_de_relacion_2"
                                                              label="Inicio de Relación 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_inicio_de_relacion_2')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_b_persona_de_contacto_2"
                                                              label="Persona de Contacto 2"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_persona_de_contacto_2')}
                                                />
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
                                                              label="Entidad Financiera 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_entidad_financiera_3')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 3">
                                                <RHFTextField name="r_b_inicio_de_relacion_3"
                                                              label="Inicio de Relación 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_inicio_de_relacion_3')}
                                                />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_b_persona_de_contacto_3"
                                                              label="Persona de Contacto 3"
                                                              inputProps={{ style: { textTransform: 'uppercase' } }}
                                                              onChange={handleUpper('r_b_persona_de_contacto_3')}
                                                />
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
    nombre_del_representante: Yup.string().required('Se requiere el representante (Dos Nombres - Dos Apellidos)'),
    cedula_del_representante: Yup.string().required('Se requiere la Cédula'),
    email: Yup.string().required('Se requiere el Email'),
    telefono: Yup.string().required('Se requiere el teléfono'),
    direccion_de_trabajo: Yup.string().required('Se requiere la Direccion de trabajo'),
    direccion_de_domicilio: Yup.string().required('Se requiere la Direccion de domicilio'),
    ciudad: Yup.string().required('Se requiere la Ciudad'),
    provincia: Yup.string().required('Se requiere la Provincia'),
    geolocalizacion: Yup.string().required('Se requiere la Geolocalización'),

    planilla_servicio_basico: Yup.string().required('Se requiere la Planilla servicio basico'),
    escritura_constitucion_de_la_empresa: Yup.string().required('Se requiere la Escritura constitucion de la empresa'),
    ruc_upload: Yup.string().required('Se requiere el RUC upload'),
    cedula_de_identidad: Yup.string().required('Se requiere la Cédula de identidad'),
    //estados_fiancieros_year_anterior: Yup.string().required('Se requiere los Estados fiancieros años anterior'),
    nombramiento_del_representante_legal: Yup.string().required('Se requiere el Nombramiento del representante legal'),
    // declaracion_de_impuesto_a_la_renta_year_anterior: Yup.string().required('Se requiere la Declaracion de impuesto a la renta año anterior'),
    certificado_bancario: Yup.string().required('Se requiere el Certificado bancario'),
    foto_del_local: Yup.string().required('Se requiere la Foto del local'),
    carta_vendedores: Yup.string().required('Se requiere la Carta del Vendedor'),

    r_c_compania_1: Yup.string().required('Se requiere la Compañia 1'),
    r_c_tipo_de_credito_1: Yup.string().required('Se requiere el Tipo Crédito 1'),
    r_c_persona_de_contacto_1: Yup.string().required('Se requiere el Persona Contacto 1'),
    r_c_telefono_1: Yup.string().required('Se requiere el Teléfono 1'),
    // r_c_compania_2: Yup.string().required('Se requiere la Compañia 2'),
    // r_c_tipo_de_credito_2: Yup.string().required('Se requiere el Tipo Crédito 2'),
    // r_c_persona_de_contacto_2: Yup.string().required('Se requiere el Persona Contacto 2'),
    // r_c_telefono_2: Yup.string().required('Se requiere el Teléfono 2'),
    // r_c_compania_3: Yup.string().required('Se requiere la Compañia 3'),
    // r_c_tipo_de_credito_3: Yup.string().required('Se requiere el Tipo Crédito 3'),
    // r_c_persona_de_contacto_3: Yup.string().required('Se requiere el Persona Contacto 3'),
    // r_c_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),

    d_e_a_direccion_1: Yup.string().required('Se requiere la Dirección 1'),
    //d_e_a_direccion_2: Yup.string().required('Se requiere la Dirección 2'),
    // d_e_a_direccion_3: Yup.string().required('Se requiere ls Dirección 3'),

    r_b_entidad_financiera_1: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 1'),
    r_b_inicio_de_relacion_1: Yup.string().required('Se requiere el Año de Inicio de la Relación 1'),
    r_b_persona_de_contacto_1: Yup.string().required('Se requiere la Persona de Contacto 1'),
    r_b_telefono_1: Yup.string().required('Se requiere el Teléfono 1'),
    // r_b_entidad_financiera_2: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 2'),
    // r_b_inicio_de_relacion_2: Yup.string().required('Se requiere el Año de Inicio de la Relación 2'),
    // r_b_persona_de_contacto_2: Yup.string().required('Se requiere la Persona de Contacto 2'),
    // r_b_telefono_2: Yup.string().required('Se requiere el Teléfono 2'),
    // r_b_entidad_financiera_3: Yup.string().required('Se requiere el Nombre de la Entidad Financiera 3'),
    // r_b_inicio_de_relacion_3: Yup.string().required('Se requiere el Año de Inicio de la Relación 3'),
    // r_b_persona_de_contacto_3: Yup.string().required('Se requiere la Persona de Contacto 3'),
    // r_b_telefono_3: Yup.string().required('Se requiere el Teléfono 3'),
});