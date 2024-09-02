import React, {useEffect, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card, CardContent,
    Container,
    Grid, InputAdornment,
    Stack, Switch, TextField,
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// ----------------------------------------------------------------------
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import {useRouter} from "next/router";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// ----------------------------------------------------------------------

GarantiaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GarantiaPage() {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const router = useRouter();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get('/hanadb/api/products/get_all_product_images');

                if (response.status === 200) {
                    console.log(response);
                    const businessPartnersWithId = response.data.images.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartners(businessPartnersWithId);
                    console.log("response.data.data: " + JSON.stringify(response.data.data));
                    console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }


            } catch (error) {
                console.error('Error fetching data:', error);
            }

        };

        BuscarPorRango()

    }, []);

    const [textFieldValues, setTextFieldValues] = useState('00.00.00');

    // Manejador del cambio del TextField
    const handleTextFieldChange = (event) => {
        setTextFieldValues(event.target.value);
    };

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

    const baseColumns = [

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'SKU',
            headerName: 'SKU',
            flex: 1,
            maxWidth: 100,
        },
        {
            field: 'URL',
            headerName: 'URL',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt="Image"
                    style={{
                        width: '100px',
                        height: 'auto',
                        objectFit: 'contain'
                    }} // Ajusta el estilo según tus necesidades
                />
            ),
        },
        {
            field: '',
            headerName: 'Acción',
            width: 200,
            renderCell: (params) => {

                return (
                    <>
                        <Button
                            variant="contained"
                            onClick={() => handleDeleteImage(params.row)}
                        >
                            ELIMINAR
                        </Button>
                    </>

                );
            }
        },

    ]

    const handleDeleteImage = async (data) => {
        //Enviar a la páguina de creación de la nota de credito
        if (data) {
            console.log("Fila seleccionada:", data);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario

            // Actualizar una orden.
            const response = await axios.delete(`/hanadb/api/products/delete_image_product?URL=${data.URL}`
            );

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } else {
            console.log("No se ha seleccionado ningún marcador.");
        }
    };


    return (
        <>
            <Head>
                <title> Garantías | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Gestión Imágenes"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Imágenes',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Gestión',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>

                            <CardContent>


                                <TextField
                                    name="precioProducto"
                                    label="Código del producto (07.06.1993)"
                                    value={textFieldValues} // Valor del TextField desde el estado
                                    onChange={handleTextFieldChange} // Actualiza el estado cuando cambia el valor
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Button
                                                        variant="contained"
                                                        component="label"
                                                        startIcon={<CloudUploadIcon/>}
                                                    >
                                                        Archivo
                                                        <input
                                                            type="file"
                                                            hidden
                                                            onChange={(event) => handleFileChange(event)}
                                                        />
                                                    </Button>
                                                </Stack>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{width: 525}} // Establece el ancho del TextField
                                />


                            </CardContent>

                            <Stack spacing={3}>
                                <DataGrid
                                    rows={businessPartners}
                                    columns={baseColumns}
                                    pagination
                                    rowHeight={150}
                                    slots={{
                                        toolbar: CustomToolbar,
                                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                    }}
                                />
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter/>
            <Box sx={{flexGrow: 1}}/>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}