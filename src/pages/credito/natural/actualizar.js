import Head from "next/head";
import MainLayout from "../../../layouts/main";
import {
    Box,
    Button,
    Card, CircularProgress,
    Container,
    Grid, IconButton,
    Stack, Tooltip,
    Typography
} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/router";
import FormProvider, {
    RHFTextField, RHFUpload
} from "../../../components/hook-form";
import {useForm} from "react-hook-form";
import axios from "../../../utils/axios";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PDFPreviewButtons from "../../../components/cartera/PDFPreviewButtons";

DataPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export const defaultValues = {

    nombre_de_la_empresa_o_compania: '',
    ruc: '',
    nombre_del_representante: '',
    cedula_del_representante: '',
    email: '',
    direccion_de_trabajo: '',
    direccion_de_domicilio: '',
    ciudad: '',
    provincia: '',

    planilla_servicio_basico: '',
    cedula_de_identidad: '',
    certificado_bancario: '',
    declaracion_de_impuesto_a_la_renta_year_anterior: '',
    escritura_constitucion_de_la_empresa: '',
    estados_fiancieros_year_anterior: '',
    foto_del_local_y_georeferencia: '',
    id_documento: '',
    nombramiento_del_representante_legal: '',
    ruc_upload: '',

    r_c_id_referencia_1: '',
    r_c_compania_1: '',
    r_c_tipo_de_credito_1: '',
    r_c_persona_de_contacto_1: '',
    r_c_telefono_1: '',
    r_c_id_referencia_2: '',
    r_c_compania_2: '',
    r_c_tipo_de_credito_2: '',
    r_c_persona_de_contacto_2: '',
    r_c_telefono_2: '',
    r_c_id_referencia_3: '',
    r_c_compania_3: '',
    r_c_tipo_de_credito_3: '',
    r_c_persona_de_contacto_3: '',
    r_c_telefono_3: '',

    d_e_a_id_direccion_1: '',
    d_e_a_direccion_1: '',
    d_e_a_id_direccion_2: '',
    d_e_a_direccion_2: '',
    d_e_a_id_direccion_3: '',
    d_e_a_direccion_3: '',

    r_b_id_ref_financiera_1: '',
    r_b_entidad_financiera_1: '',
    r_b_inicio_de_relacion_1: '',
    r_b_persona_de_contacto_1: '',
    r_b_telefono_1: '',
    r_b_id_ref_financiera_2: '',
    r_b_entidad_financiera_2: '',
    r_b_inicio_de_relacion_2: '',
    r_b_persona_de_contacto_2: '',
    r_b_telefono_2: '',
    r_b_id_ref_financiera_3: '',
    r_b_entidad_financiera_3: '',
    r_b_inicio_de_relacion_3: '',
    r_b_persona_de_contacto_3: '',
    r_b_telefono_3: '',

};

export default function DataPage() {

    const router = useRouter();
    const {id} = router.query; // Captura el parámetro "id"

    const [dataProspectoAux, setDataProspectoAux] = useState(null);
    const [formValues, setFormValues] = useState(defaultValues);
    const [idEmpresa, setIdEmpresa] = useState(null);

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

    useEffect(() => {

        if (!id) return; // Evita ejecutar si 'id' es undefined

        const Buscar = async () => {

            try {
                const response = await axios.get(`/hanadb/api/customers/get_prospecto_cartera_by_ruc?ruc=${id}`);

                if (response.status === 200) {
                    //console.log(response);

                    //setDataProspecto(response.data.events);
                    //console.log("Response: " + JSON.stringify(response.data.events));

                    const dataProspecto = response.data.events;

                    setDataProspectoAux(response.data.events)

                    if (dataProspecto) {

                        //id de la empresa
                        setIdEmpresa(dataProspecto.empresa.ID_EMPRESA || null),

                            reset({

                                nombre_de_la_empresa_o_compania: dataProspecto.empresa.NOMBRE || '',
                                ruc: dataProspecto.empresa.RUC || '',
                                nombre_del_representante: dataProspecto.empresa.NOMBRE_REPRESENTANTE || '',
                                cedula_del_representante: dataProspecto.empresa.CEDULA_REPRESENTANTE || '',
                                provincia: dataProspecto.empresa.PROVINCIA || '',
                                ciudad: dataProspecto.empresa.CIUDAD || '',
                                direccion_de_domicilio: dataProspecto.empresa.DIRECCION_DOMICILIO || '',
                                direccion_de_trabajo: dataProspecto.empresa.DIRECCION_TRABAJO || '',
                                email: dataProspecto.empresa.EMAIL || '',

                                planilla_servicio_basico: dataProspecto.documentos?.PLANILLA_SERVICIO_BASICO || '',
                                cedula_de_identidad: dataProspecto.documentos?.CEDULA_IDENTIDAD || '',
                                certificado_bancario: dataProspecto.documentos?.CERTIFICADO_BANCARIO || '',
                                declaracion_de_impuesto_a_la_renta_year_anterior: dataProspecto.documentos?.DECLARACION_IMPUESTOS || '',
                                escritura_constitucion_de_la_empresa: dataProspecto.documentos?.ESCRITURA_CONSTITUCION || '',
                                estados_fiancieros_year_anterior: dataProspecto.documentos?.ESTADOS_FINANCIEROS || '',
                                foto_del_local_y_georeferencia: dataProspecto.documentos?.FOTO_LOCAL_GEOREFERENCIA || '',
                                id_documento: dataProspecto.documentos?.ID_DOCUMENTO || '',
                                nombramiento_del_representante_legal: dataProspecto.documentos?.NOMBRAMIENTO_REPRESENTANTE || '',
                                ruc_upload: dataProspecto.documentos?.RUC_UPLOAD || '',

                                r_c_id_referencia_1: dataProspecto.referencias_comerciales?.[0]?.ID_REFERENCIA || '',
                                r_c_compania_1: dataProspecto.referencias_comerciales?.[0]?.COMPANIA || '',
                                r_c_tipo_de_credito_1: dataProspecto.referencias_comerciales?.[0]?.TIPO_CREDITO || '',
                                r_c_persona_de_contacto_1: dataProspecto.referencias_comerciales?.[0]?.PERSONA_CONTACTO || '',
                                r_c_telefono_1: dataProspecto.referencias_comerciales?.[0]?.TELEFONO || '',

                                r_c_id_referencia_2: dataProspecto.referencias_comerciales?.[1]?.ID_REFERENCIA || '',
                                r_c_compania_2: dataProspecto.referencias_comerciales?.[1]?.COMPANIA || '',
                                r_c_tipo_de_credito_2: dataProspecto.referencias_comerciales?.[1]?.TIPO_CREDITO || '',
                                r_c_persona_de_contacto_2: dataProspecto.referencias_comerciales?.[1]?.PERSONA_CONTACTO || '',
                                r_c_telefono_2: dataProspecto.referencias_comerciales?.[1]?.TELEFONO || '',

                                r_c_id_referencia_3: dataProspecto.referencias_comerciales?.[2]?.ID_REFERENCIA || '',
                                r_c_compania_3: dataProspecto.referencias_comerciales?.[2]?.COMPANIA || '',
                                r_c_tipo_de_credito_3: dataProspecto.referencias_comerciales?.[2]?.TIPO_CREDITO || '',
                                r_c_persona_de_contacto_3: dataProspecto.referencias_comerciales?.[2]?.PERSONA_CONTACTO || '',
                                r_c_telefono_3: dataProspecto.referencias_comerciales?.[2]?.TELEFONO || '',

                                d_e_a_id_direccion_1: dataProspecto.direcciones_adicionales?.[0]?.ID_DIRECCION || '',
                                d_e_a_direccion_1: dataProspecto.direcciones_adicionales?.[0]?.DIRECCION || '',
                                d_e_a_id_direccion_2: dataProspecto.direcciones_adicionales?.[1]?.ID_DIRECCION || '',
                                d_e_a_direccion_2: dataProspecto.direcciones_adicionales?.[1]?.DIRECCION || '',
                                d_e_a_id_direccion_3: dataProspecto.direcciones_adicionales?.[2]?.ID_DIRECCION || '',
                                d_e_a_direccion_3: dataProspecto.direcciones_adicionales?.[2]?.DIRECCION || '',

                                // Agregamos las referencias bancarias
                                r_b_id_ref_financiera_1: dataProspecto.referencias_bancarias?.[0]?.ID_REFERENCIA || '',
                                r_b_entidad_financiera_1: dataProspecto.referencias_bancarias?.[0]?.ENTIDAD_FINANCIERA || '',
                                r_b_inicio_de_relacion_1: dataProspecto.referencias_bancarias?.[0]?.INICIO_RELACION || '',
                                r_b_persona_de_contacto_1: dataProspecto.referencias_bancarias?.[0]?.PERSONA_CONTACTO || '',
                                r_b_telefono_1: dataProspecto.referencias_bancarias?.[0]?.TELEFONO || '',

                                r_b_id_ref_financiera_2: dataProspecto.referencias_bancarias?.[1]?.ID_REFERENCIA || '',
                                r_b_entidad_financiera_2: dataProspecto.referencias_bancarias?.[1]?.ENTIDAD_FINANCIERA || '',
                                r_b_inicio_de_relacion_2: dataProspecto.referencias_bancarias?.[1]?.INICIO_RELACION || '',
                                r_b_persona_de_contacto_2: dataProspecto.referencias_bancarias?.[1]?.PERSONA_CONTACTO || '',
                                r_b_telefono_2: dataProspecto.referencias_bancarias?.[1]?.TELEFONO || '',

                                r_b_id_ref_financiera_3: dataProspecto.referencias_bancarias?.[2]?.ID_REFERENCIA || '',
                                r_b_entidad_financiera_3: dataProspecto.referencias_bancarias?.[2]?.ENTIDAD_FINANCIERA || '',
                                r_b_inicio_de_relacion_3: dataProspecto.referencias_bancarias?.[2]?.INICIO_RELACION || '',
                                r_b_persona_de_contacto_3: dataProspecto.referencias_bancarias?.[2]?.PERSONA_CONTACTO || '',
                                r_b_telefono_3: dataProspecto.referencias_bancarias?.[2]?.TELEFONO || '',

                            });
                    }
                } else {
                    console.error('Error en la solicitud GET: ', response.status);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        Buscar();
    }, [id, reset]); // Agrega reset como dependencia para evitar problemas con el cierre sobre `reset`


    const onSubmit = async (data) => {

        // await new Promise((resolve) => setTimeout(resolve, 3000));
        //console.log('DATA', data);
        // reset();

        // Crear prospecto.
        const response = await axios.post('/hanadb/api/customers/create_prospecto_cartera', {
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

    const handleDropSingleFileActualizar = useCallback((acceptedFiles, fieldName) => {

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
                handleFileUploadActualizar(file, 'planilla_servicio_basico');
            } else if (fieldName === 'escritura_constitucion_de_la_empresa') {
                //setValue('escritura_constitucion_de_la_empresa', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'escritura_constitucion_de_la_empresa');
            } else if (fieldName === 'ruc_upload') {
                //setValue('ruc_upload', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'ruc_upload');
            } else if (fieldName === 'cedula_de_identidad') {
                //setValue('cedula_de_identidad', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'cedula_de_identidad');
            } else if (fieldName === 'estados_fiancieros_year_anterior') {
                //setValue('estados_fiancieros_year_anterior', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'estados_fiancieros_year_anterior');
            } else if (fieldName === 'nombramiento_del_representante_legal') {
                //setValue('nombramiento_del_representante_legal', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'nombramiento_del_representante_legal');
            } else if (fieldName === 'declaracion_de_impuesto_a_la_renta_year_anterior') {
                //setValue('declaracion_de_impuesto_a_la_renta_year_anterior', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'declaracion_de_impuesto_a_la_renta_year_anterior');
            } else if (fieldName === 'certificado_bancario') {
                //setValue('certificado_bancario', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'certificado_bancario');
            } else if (fieldName === 'foto_del_local_y_georeferencia') {
                //setValue('foto_del_local_y_georeferencia', newFile, { shouldValidate: true });
                handleFileUploadActualizar(file, 'foto_del_local_y_georeferencia');
            }
        },
        [setValue]
    );

    const handleFileUploadActualizar = (file, tipo_campo) => {

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
                    //setValue(tipo_campo, data.link, {shouldValidate: true});

                    let resultado_final;

                    switch (tipo_campo) {
                        case "planilla_servicio_basico":
                            resultado_final = "PLANILLA_SERVICIO_BASICO";
                            break;
                        case "escritura_constitucion_de_la_empresa":
                            resultado_final = "ESCRITURA_CONSTITUCION";
                            break;
                        case "nombre_del_representante":
                            resultado_final = "NOMBRE_REPRESENTANTE";
                            break;
                        case "cedula_del_representante":
                            resultado_final = "CEDULA_REPRESENTANTE";
                            break;
                        case "ruc_upload":
                            resultado_final = "RUC_UPLOAD";
                            break;
                        case "cedula_de_identidad":
                            resultado_final = "CEDULA_IDENTIDAD";
                            break;
                        case "estados_fiancieros_year_anterior":
                            resultado_final = "ESTADOS_FINANCIEROS";
                            break;
                        case "nombramiento_del_representante_legal":
                            resultado_final = "NOMBRAMIENTO_REPRESENTANTE";
                            break;
                        case "declaracion_de_impuesto_a_la_renta_year_anterior":
                            resultado_final = "DECLARACION_IMPUESTOS";
                            break;
                        case "certificado_bancario":
                            resultado_final = "CERTIFICADO_BANCARIO";
                            break;
                        case "foto_del_local_y_georeferencia":
                            resultado_final = "FOTO_LOCAL_GEOREFERENCIA";
                            break;
                        default:
                            //console.log("Revisar...");
                            return null; // Devuelve `null` si no hay coincidencia
                    }

                    //console.log("columna: " + resultado_final);
                    //console.log("link: " + data.link);

                    const id_documento = watch("id_documento")

                    //Enviar un correo electrónico + la creación de la guía
                    const response = await axios.post('/hanadb/api/customers/actualizar_documento_prospecto_cartera', {

                        tipo: resultado_final,
                        valor: data.link,
                        id_documento: id_documento,

                    });

                    //console.log("response status: " + response.status);

                    if (response.status === 200) {
                        //console.log(response);
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

    const ActualizarInfoEmpresa = async (tipo, valor) => {

        //console.log(tipo);
        //console.log(valor);
        //console.log(idEmpresa);

        let resultado;

        switch (tipo) {
            case "nombre_de_la_empresa_o_compania":
                resultado = "NOMBRE";
                break;
            case "ruc":
                resultado = "RUC";
                break;
            case "nombre_del_representante":
                resultado = "NOMBRE_REPRESENTANTE";
                break;
            case "cedula_del_representante":
                resultado = "CEDULA_REPRESENTANTE";
                break;
            case "provincia":
                resultado = "PROVINCIA";
                break;
            case "ciudad":
                resultado = "CIUDAD";
                break;
            case "direccion_de_domicilio":
                resultado = "DIRECCION_DOMICILIO";
                break;
            case "direccion_de_trabajo":
                resultado = "DIRECCION_TRABAJO";
                break;
            case "email":
                resultado = "EMAIL";
                break;
            case "telefono":
                resultado = "NUM_TELEFONO";
                break;
            default:
                //console.log("Revisar...");
                return null; // Devuelve `null` si no hay coincidencia
        }

        const response = await axios.post('/hanadb/api/customers/actualizar_valor_prospecto_cartera', {

            tipo: resultado,
            valor: valor,
            idEmpresa: idEmpresa,

        });

        //console.log("response status: " + response.status);

        if (response.status === 200) {
            //console.log(response);
            router.reload();
        }
    }

    const ActualizarReferenciasComerciales = async (tipo, valor, id_referencia) => {

        //console.log("tipo: " + tipo);
        //console.log("valor: " + valor);
        //console.log("id_referencia: " + id_referencia);

        let resultado;

        switch (tipo) {
            case "r_c_compania_1":
            case "r_c_compania_2":
            case "r_c_compania_3":
                resultado = "COMPANIA";
                break;
            case "r_c_tipo_de_credito_1":
            case "r_c_tipo_de_credito_2":
            case "r_c_tipo_de_credito_3":
                resultado = "TIPO_CREDITO";
                break;
            case "r_c_persona_de_contacto_1":
            case "r_c_persona_de_contacto_2":
            case "r_c_persona_de_contacto_3":
                resultado = "PERSONA_CONTACTO";
                break;
            case "r_c_telefono_1":
            case "r_c_telefono_2":
            case "r_c_telefono_3":
                resultado = "TELEFONO";
                break;
            default:
                //console.log("Revisar...");
                return null; // Devuelve `null` si no hay coincidencia
        }

        const response = await axios.post('/hanadb/api/customers/actualizar_referencias_comerciales_prospecto_cartera', {

            tipo: resultado,
            valor: valor,
            id_referencia: id_referencia,

        });

        //console.log("response status: " + response.status);

        if (response.status === 200) {
            //console.log(response);
            router.reload();
        }
    }

    const ActualizarDireccionesAutorizadas = async (tipo, valor, id_direccion_au) => {

        //console.log("tipo: " + tipo);
        //console.log("valor: " + valor);
        //console.log("id_direccion_au: " + id_direccion_au);

        let resultado;

        switch (tipo) {
            case "d_e_a_direccion_1":
            case "d_e_a_direccion_2":
            case "d_e_a_direccion_3":
                resultado = "DIRECCION";
                break;
            default:
                //console.log("Revisar...");
                return null; // Devuelve `null` si no hay coincidencia
        }

        const response = await axios.post('/hanadb/api/customers/actualizar_direcciones_envios_autorizados_prospecto_cartera', {

            tipo: resultado,
            valor: valor,
            id_direccion_au: id_direccion_au,

        });

        //console.log("response status: " + response.status);

        if (response.status === 200) {
            //console.log(response);
            router.reload();
        }
    }

    const ActualizarReferenciasBancarias = async (tipo, valor, id_referencia) => {

        //console.log("tipo: " + tipo);
        //console.log("valor: " + valor);
        //console.log("id_referencia: " + id_referencia);

        let resultado;

        switch (tipo) {
            case "r_b_entidad_financiera_1":
            case "r_b_entidad_financiera_2":
            case "r_b_entidad_financiera_3":
                resultado = "ENTIDAD_FINANCIERA";
                break;
            case "r_b_inicio_de_relacion_1":
            case "r_b_inicio_de_relacion_2":
            case "r_b_inicio_de_relacion_3":
                resultado = "INICIO_RELACION";
                break;
            case "r_b_persona_de_contacto_1":
            case "r_b_persona_de_contacto_2":
            case "r_b_persona_de_contacto_3":
                resultado = "PERSONA_CONTACTO";
                break;
            case "r_b_telefono_1":
            case "r_b_telefono_2":
            case "r_b_telefono_3":
                resultado = "TELEFONO";
                break;
            default:
                //console.log("Revisar...");
                return null; // Devuelve `null` si no hay coincidencia
        }

        const response = await axios.post('/hanadb/api/customers/actualizar_referencias_bancarias_prospecto_cartera', {

            tipo: resultado,
            valor: valor,
            id_ref_financiera: id_referencia,

        });

        //console.log("response status: " + response.status);

        if (response.status === 200) {
            //console.log(response);
            router.reload();
        }
    }


    const EliminarDocumento = async (columna_eliminar) => {

        //console.log("Eliminar...: " + columna_eliminar);
        const id_documento = watch("id_documento");
        //console.log("id_documento: " + id_documento);

        const response = await axios.delete('/hanadb/api/customers/eliminar_documento_prospecto_cartera', {
            params: {
                columna: columna_eliminar,
                id_documento: id_documento,
            }
        });

        //console.log("response status: " + response.status);

        if (response.status === 200) {
            //console.log(response);
            router.reload();
        }
    }

    const GenerarPDF = () => {
        //console.log("GenerarPDF");


    }

    return (
        <>
            <Head>
                <title> Crédito | HT</title>
            </Head>i

            <Container sx={{pt: 10, pb: 15}}>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>

                            <h2>SOLICITUD DE ACTUALIZACIÓN DE DATOS {id}</h2>

                            <h3>1. PERSONA NATURAL IDENTIFICACION DEL CLIENTE</h3>

                            <FormProvider methods={methods} onSubmit={handleSubmit()}>
                                <Grid container spacing={5}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Nombre de la empresa o compañia">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="nombre_de_la_empresa_o_compania"
                                                                  label="Nombre de la empresa o compania"
                                                    />
                                                    {watch("nombre_de_la_empresa_o_compania") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        // Obtener el valor actualizado del campo
                                                        const campoValor = watch("nombre_de_la_empresa_o_compania");
                                                        ActualizarInfoEmpresa("nombre_de_la_empresa_o_compania", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="RUC">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="ruc" label="RUC"
                                                    />
                                                    {watch("ruc") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        // Obtener el valor actualizado del campo
                                                        const campoValor = watch("ruc");
                                                        ActualizarInfoEmpresa("ruc", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Nombre del representante">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="nombre_del_representante"
                                                                  label="Nombre del representante"
                                                    />
                                                    {watch("nombre_del_representante") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("nombre_del_representante");
                                                        ActualizarInfoEmpresa("nombre_del_representante", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Cédula del representante">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="cedula_del_representante"
                                                                  label="Cédula del representante"
                                                    />
                                                    {watch("cedula_del_representante") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("cedula_del_representante");
                                                        ActualizarInfoEmpresa("cedula_del_representante", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="E-mail">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="email" label="E-mail"
                                                    />
                                                    {watch("email") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("email");
                                                        ActualizarInfoEmpresa("email", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Teléfono">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="telefono" label="Teléfono"
                                                    />
                                                    {watch("email") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("telefono");
                                                        ActualizarInfoEmpresa("telefono", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Dirección de trabajo">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="direccion_de_trabajo"
                                                                  label="Dirección de trabajo"
                                                    />
                                                    {watch("direccion_de_trabajo") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("direccion_de_trabajo");
                                                                ActualizarInfoEmpresa("direccion_de_trabajo", campoValor)
                                                            }}>
                                                                Actualizar
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("direccion_de_trabajo");
                                                        ActualizarInfoEmpresa("direccion_de_trabajo", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Dirección de domicilio">
                                                <Stack direction="row" alignItems="center" spacing={2}>

                                                    <RHFTextField name="direccion_de_domicilio"
                                                                  label="Dirección de domicilio"

                                                    />
                                                    {watch("direccion_de_domicilio") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("direccion_de_domicilio");
                                                        ActualizarInfoEmpresa("direccion_de_domicilio", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Ciudad">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="ciudad" label="Ciudad"
                                                    />
                                                    {watch("ciudad") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("ciudad");
                                                        ActualizarInfoEmpresa("ciudad", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                            <Block label="Provincia">
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <RHFTextField name="provincia" label="Provincia"
                                                    />
                                                    {watch("provincia") ? (
                                                        <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                    ) : (
                                                        <>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                        </>
                                                    )}
                                                    <Button variant="contained" color="primary" onClick={() => {
                                                        const campoValor = watch("provincia");
                                                        ActualizarInfoEmpresa("provincia", campoValor)
                                                    }}>
                                                        Actualizar
                                                    </Button>
                                                </Stack>
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="Planilla Servicio básico">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("planilla_servicio_basico") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("PLANILLA_SERVICIO_BASICO")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>

                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="planilla_servicio_basico"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'planilla_servicio_basico')}
                                                                    onDelete={() => setValue('planilla_servicio_basico', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}

                                                </Stack>
                                            </Block>

                                            <Block label="Escritura Constitucion de la Empresa">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("escritura_constitucion_de_la_empresa") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("ESCRITURA_CONSTITUCION")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="escritura_constitucion_de_la_empresa"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'escritura_constitucion_de_la_empresa')}
                                                                    onDelete={() => setValue('escritura_constitucion_de_la_empresa', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("escritura_constitucion_de_la_empresa"); */}
                                                    {/*     ActualizarDocumentos("escritura_constitucion_de_la_empresa", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}
                                                </Stack>
                                            </Block>

                                            <Block label="RUC">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>
                                                    {watch("ruc_upload") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>

                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("RUC_UPLOAD")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="ruc_upload"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'ruc_upload')}
                                                                    onDelete={() => setValue('ruc_upload', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Block>

                                            <Block label="Cédula de Identidad">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("cedula_de_identidad") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("CEDULA_IDENTIDAD")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="cedula_de_identidad"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'cedula_de_identidad')}
                                                                    onDelete={() => setValue('cedula_de_identidad', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("cedula_de_identidad"); */}
                                                    {/*     ActualizarDocumentos("cedula_de_identidad", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}

                                                </Stack>
                                            </Block>

                                            <Block label="Estados Fiancieros (Año anterior)">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("estados_fiancieros_year_anterior") ? (

                                                        <>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("estados_fiancieros_year_anterior");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("ESTADOS_FINANCIEROS")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="estados_fiancieros_year_anterior"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'estados_fiancieros_year_anterior')}
                                                                    onDelete={() => setValue('estados_fiancieros_year_anterior', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("estados_fiancieros_year_anterior"); */}
                                                    {/*     ActualizarDocumentos("estados_fiancieros_year_anterior", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}

                                                </Stack>
                                            </Block>

                                            <Block label="Nombramiento del Representante Legal">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("nombramiento_del_representante_legal") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("NOMBRAMIENTO_REPRESENTANTE")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="nombramiento_del_representante_legal"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'nombramiento_del_representante_legal')}
                                                                    onDelete={() => setValue('nombramiento_del_representante_legal', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("nombramiento_del_representante_legal"); */}
                                                    {/*     ActualizarDocumentos("nombramiento_del_representante_legal", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}

                                                </Stack>
                                            </Block>

                                            <Block label="Declaración de Impuesto a la Renta (Año anterior)">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("declaracion_de_impuesto_a_la_renta_year_anterior") ? (
                                                        <>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("declaracion_de_impuesto_a_la_renta_year_anterior");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("DECLARACION_IMPUESTOS")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="declaracion_de_impuesto_a_la_renta_year_anterior"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'declaracion_de_impuesto_a_la_renta_year_anterior')}
                                                                    onDelete={() => setValue('declaracion_de_impuesto_a_la_renta_year_anterior', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("declaracion_de_impuesto_a_la_renta_year_anterior"); */}
                                                    {/*     ActualizarDocumentos("declaracion_de_impuesto_a_la_renta_year_anterior", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}

                                                </Stack>
                                            </Block>

                                            <Block label="Certificado Bancario">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("certificado_bancario") ? (
                                                        <>
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
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("CERTIFICADO_BANCARIO")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="certificado_bancario"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'certificado_bancario')}
                                                                    onDelete={() => setValue('certificado_bancario', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}

                                                </Stack>
                                            </Block>

                                            <Block label="Foto del local y georeferencia">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center"
                                                       spacing={2}>

                                                    {watch("foto_del_local_y_georeferencia") ? (
                                                        <>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                const campoValor = watch("foto_del_local_y_georeferencia");
                                                                if (campoValor) {
                                                                    window.open(campoValor, "_blank");
                                                                } else {
                                                                    console.error("No hay una URL válida");
                                                                }
                                                            }}>
                                                                Abrir
                                                            </Button>
                                                            <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                            <Button variant="contained" color="primary" onClick={() => {
                                                                //console.log("Eliminando...")
                                                                EliminarDocumento("FOTO_LOCAL_GEOREFERENCIA")
                                                            }}>
                                                                Eliminar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{width: '80%'}}>
                                                                <RHFUpload
                                                                    name="foto_del_local_y_georeferencia"
                                                                    maxSize={5 * 1024 * 1024}  // 5 MB
                                                                    onDrop={(acceptedFiles) => handleDropSingleFileActualizar(acceptedFiles, 'foto_del_local_y_georeferencia')}
                                                                    onDelete={() => setValue('foto_del_local_y_georeferencia', null, {shouldValidate: true})}
                                                                />
                                                            </div>
                                                            <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                        </>
                                                    )}
                                                    {/* <Button variant="contained" color="primary" onClick={() => { */}
                                                    {/*     const campoValor = watch("foto_del_local_y_georeferencia"); */}
                                                    {/*     ActualizarDocumentos("foto_del_local_y_georeferencia", campoValor) */}
                                                    {/* }}> */}
                                                    {/*     Actualizar */}
                                                    {/* </Button> */}

                                                </Stack>
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
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_compania_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_compania_1");
                                                    const idValor = watch("r_c_id_referencia_1");
                                                    ActualizarReferenciasComerciales("r_c_compania_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 1">
                                                <RHFTextField name="r_c_tipo_de_credito_1"
                                                              label="Tipo de Crédito 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_tipo_de_credito_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_tipo_de_credito_1");
                                                    const idValor = watch("r_c_id_referencia_1");
                                                    ActualizarReferenciasComerciales("r_c_tipo_de_credito_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_c_persona_de_contacto_1"
                                                              label="Persona de Contacto 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_persona_de_contacto_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_persona_de_contacto_1");
                                                    const idValor = watch("r_c_id_referencia_1");
                                                    ActualizarReferenciasComerciales("r_c_persona_de_contacto_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 1">
                                                <RHFTextField name="r_c_telefono_1" label="Teléfono 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_telefono_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_telefono_1");
                                                    const idValor = watch("r_c_id_referencia_1");
                                                    ActualizarReferenciasComerciales("r_c_telefono_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Compañía 2">
                                                <RHFTextField name="r_c_compania_2" label="Compañía 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_compania_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_compania_2");
                                                    const idValor = watch("r_c_id_referencia_2");
                                                    ActualizarReferenciasComerciales("r_c_compania_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 2">
                                                <RHFTextField name="r_c_tipo_de_credito_2"
                                                              label="Tipo de Crédito 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_tipo_de_credito_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_tipo_de_credito_2");
                                                    const idValor = watch("r_c_id_referencia_2");
                                                    ActualizarReferenciasComerciales("r_c_tipo_de_credito_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_c_persona_de_contacto_2"
                                                              label="Persona de Contacto 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_persona_de_contacto_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_persona_de_contacto_2");
                                                    const idValor = watch("r_c_id_referencia_2");
                                                    ActualizarReferenciasComerciales("r_c_persona_de_contacto_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 2">
                                                <RHFTextField name="r_c_telefono_2" label="Teléfono 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_telefono_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_telefono_2");
                                                    const idValor = watch("r_c_id_referencia_2");
                                                    ActualizarReferenciasComerciales("r_c_telefono_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Compañía 3">
                                                <RHFTextField name="r_c_compania_3" label="Compañía 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_compania_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_compania_3");
                                                    const idValor = watch("r_c_id_referencia_3");
                                                    ActualizarReferenciasComerciales("r_c_compania_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Tipo de Crédito 3">
                                                <RHFTextField name="r_c_tipo_de_credito_3"
                                                              label="Tipo de Crédito 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_tipo_de_credito_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_tipo_de_credito_3");
                                                    const idValor = watch("r_c_id_referencia_3");
                                                    ActualizarReferenciasComerciales("r_c_tipo_de_credito_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_c_persona_de_contacto_3"
                                                              label="Persona de Contacto 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_persona_de_contacto_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_persona_de_contacto_3");
                                                    const idValor = watch("r_c_id_referencia_3");
                                                    ActualizarReferenciasComerciales("r_c_persona_de_contacto_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 3">
                                                <RHFTextField name="r_c_telefono_3" label="Teléfono 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_c_telefono_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_c_telefono_3");
                                                    const idValor = watch("r_c_id_referencia_3");
                                                    ActualizarReferenciasComerciales("r_c_telefono_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                </Grid>

                                <h3>3. DIRECCIONES ENVIOS AUTORIZADOS</h3>
                                <Grid container spacing={5}>

                                    {/* 1 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Block label="Dirección 1">
                                                    <RHFTextField name="d_e_a_direccion_1" label="Dirección 1"/>
                                                </Block>
                                                {watch("d_e_a_direccion_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    // Obtener el valor actualizado del campo
                                                    const campoValor = watch("d_e_a_direccion_1");
                                                    const idValor = watch("d_e_a_id_direccion_1");
                                                    ActualizarDireccionesAutorizadas("d_e_a_direccion_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>

                                        </Stack>
                                    </Grid>

                                    {/* 2 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Block label="Dirección 2">
                                                    <RHFTextField name="d_e_a_direccion_2" label="Dirección 2"/>
                                                </Block>
                                                {watch("d_e_a_direccion_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    // Obtener el valor actualizado del campo
                                                    const campoValor = watch("d_e_a_direccion_2");
                                                    const idValor = watch("d_e_a_id_direccion_2");
                                                    ActualizarDireccionesAutorizadas("d_e_a_direccion_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={12}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Block label="Dirección 3">
                                                    <RHFTextField name="d_e_a_direccion_3" label="Dirección 3"/>
                                                </Block>
                                                {watch("d_e_a_direccion_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>
                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    // Obtener el valor actualizado del campo
                                                    const campoValor = watch("d_e_a_direccion_3");
                                                    const idValor = watch("d_e_a_id_direccion_3");
                                                    ActualizarDireccionesAutorizadas("d_e_a_direccion_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
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

                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_entidad_financiera_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_entidad_financiera_1");
                                                    const idValor = watch("r_b_id_ref_financiera_1");
                                                    ActualizarReferenciasBancarias("r_b_entidad_financiera_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relacióno 1">
                                                <RHFTextField name="r_b_inicio_de_relacion_1"
                                                              label="Inicio de Relación 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_inicio_de_relacion_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_inicio_de_relacion_1");
                                                    const idValor = watch("r_b_id_ref_financiera_1");
                                                    ActualizarReferenciasBancarias("r_b_inicio_de_relacion_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 1">
                                                <RHFTextField name="r_b_persona_de_contacto_1"
                                                              label="Persona de Contacto 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_persona_de_contacto_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_persona_de_contacto_1");
                                                    const idValor = watch("r_b_id_ref_financiera_1");
                                                    ActualizarReferenciasBancarias("r_b_persona_de_contacto_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 1">
                                                <RHFTextField name="r_b_telefono_1" label="Teléfono 1"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_telefono_1") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_telefono_1");
                                                    const idValor = watch("r_b_id_ref_financiera_1");
                                                    ActualizarReferenciasBancarias("r_b_telefono_1", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    {/* 1 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Entidad Financiera 2">
                                                <RHFTextField name="r_b_entidad_financiera_2"
                                                              label="Entidad Financiera 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_entidad_financiera_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_entidad_financiera_2");
                                                    const idValor = watch("r_b_id_ref_financiera_2");
                                                    ActualizarReferenciasBancarias("r_b_entidad_financiera_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 2">
                                                <RHFTextField name="r_b_inicio_de_relacion_2"
                                                              label="Inicio de Relación 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_inicio_de_relacion_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_inicio_de_relacion_2");
                                                    const idValor = watch("r_b_id_ref_financiera_2");
                                                    ActualizarReferenciasBancarias("r_b_inicio_de_relacion_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 2">
                                                <RHFTextField name="r_b_persona_de_contacto_2"
                                                              label="Persona de Contacto 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_persona_de_contacto_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_persona_de_contacto_2");
                                                    const idValor = watch("r_b_id_ref_financiera_2");
                                                    ActualizarReferenciasBancarias("r_b_persona_de_contacto_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 2">
                                                <RHFTextField name="r_b_telefono_2" label="Teléfono 2"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_telefono_2") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_telefono_2");
                                                    const idValor = watch("r_b_id_ref_financiera_2");
                                                    ActualizarReferenciasBancarias("r_b_telefono_2", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    {/* 3 */}
                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Entidad Financiera 3">
                                                <RHFTextField name="r_b_entidad_financiera_3"
                                                              label="Entidad Financiera 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_entidad_financiera_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_entidad_financiera_3");
                                                    const idValor = watch("r_b_id_ref_financiera_3");
                                                    ActualizarReferenciasBancarias("r_b_entidad_financiera_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Inicio de Relación 3">
                                                <RHFTextField name="r_b_inicio_de_relacion_3"
                                                              label="Inicio de Relación 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_inicio_de_relacion_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_inicio_de_relacion_3");
                                                    const idValor = watch("r_b_id_ref_financiera_3");
                                                    ActualizarReferenciasBancarias("r_b_inicio_de_relacion_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Persona de Contacto 3">
                                                <RHFTextField name="r_b_persona_de_contacto_3"
                                                              label="Persona de Contacto 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_persona_de_contacto_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_persona_de_contacto_3");
                                                    const idValor = watch("r_b_id_ref_financiera_3");
                                                    ActualizarReferenciasBancarias("r_b_persona_de_contacto_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <Stack spacing={2}>
                                            <Block label="Teléfono 3">
                                                <RHFTextField name="r_b_telefono_3" label="Teléfono 3"/>
                                            </Block>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {watch("r_b_telefono_3") ? (
                                                    <CheckCircleIcon style={{color: "green", fontSize: 40}}/>
                                                ) : (
                                                    <>
                                                        <CancelIcon style={{color: "red", fontSize: 40}}/>

                                                    </>
                                                )}
                                                <Button variant="contained" color="primary" onClick={() => {
                                                    const campoValor = watch("r_b_telefono_3");
                                                    const idValor = watch("r_b_id_ref_financiera_3");
                                                    ActualizarReferenciasBancarias("r_b_telefono_3", campoValor, idValor)
                                                }}>
                                                    Actualizar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Grid>


                                </Grid>

                                {/* <Grid container spacing={5} sx={{paddingTop: 3}}> */}
                                {/*     <Grid item xs={12} md={12}> */}
                                {/*         <Stack spacing={2}> */}
                                {/*             <LoadingButton */}
                                {/*                 fullWidth */}
                                {/*                 color="info" */}
                                {/*                 size="large" */}
                                {/*                 type="submit" */}
                                {/*                 variant="contained" */}
                                {/*                 loading={isSubmitting} */}
                                {/*             > */}
                                {/*                 Guardar */}
                                {/*             </LoadingButton> */}
                                {/*         </Stack> */}
                                {/*     </Grid> */}
                                {/* </Grid> */}

                            </FormProvider>

                            {/* Generar los PDFs */}
                            <PDFPreviewButtons data={dataProspectoAux} />

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