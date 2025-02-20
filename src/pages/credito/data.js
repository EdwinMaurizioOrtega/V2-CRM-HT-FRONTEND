import Head from "next/head";
import {ComponentHero} from "../../sections/_examples";
import MainLayout from "../../layouts/main";
import {
    Card,
    CardContent,
    CardHeader,
    Container, Divider,
    Grid, IconButton,
    InputAdornment, MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {UploadBox} from "../../components/upload";
import Iconify from "../../components/iconify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import React, {useCallback} from "react";
import {useRouter} from "next/router";
import FormProvider, {
    RHFAutocomplete, RHFCheckbox,
    RHFEditor, RHFMultiCheckbox,
    RHFMultiSelect, RHFRadioGroup,
    RHFSelect, RHFSlider, RHFSwitch,
    RHFTextField, RHFUpload
} from "../../components/hook-form";
import {Controller, useForm} from "react-hook-form";
import {LoadingButton} from "@mui/lab";

DataPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;



export const defaultValues = {
    age: 0,
    email: '',
    fullName: '',
    //
    editor: '',
    switch: false,
    radioGroup: '',
    autocomplete: null,
    //
    password: '',
    confirmPassword: '',
    //
    startDate: new Date(),
    endDate: null,
    //
    singleUpload: null,
    multiUpload: [],
    //
    singleSelect: '',
    multiSelect: [],
    //
    checkbox: false,
    multiCheckbox: [],
    //
    slider: 8,
    sliderRange: [15, 80],
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
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const onSubmit = async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('DATA', data);
        reset();
    };

    const handleDropSingleFile = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (newFile) {
                setValue('singleUpload', newFile, { shouldValidate: true });
            }
        },
        [setValue]
    );

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
                                            <Block>
                                                <RHFTextField name="fullName" label="Full Name" />
                                            </Block>

                                            <Block>
                                                <RHFTextField name="email" label="Email address" />
                                            </Block>

                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Block label="RHFUpload">
                                                <RHFUpload
                                                    name="singleUpload"
                                                    maxSize={3145728}
                                                    onDrop={handleDropSingleFile}
                                                    onDelete={() => setValue('singleUpload', null, { shouldValidate: true })}
                                                />
                                            </Block>




                                            <LoadingButton
                                                fullWidth
                                                color="info"
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                loading={isSubmitting}
                                            >
                                                Submit to check
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


function Block({ label = 'RHFTextField', sx, children }) {
    return (
        <Stack spacing={1} sx={{ width: 1, ...sx }}>
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