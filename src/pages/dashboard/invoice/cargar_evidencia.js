import React, {useEffect, useRef, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card,
    Container,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Grid, Link,
    Stack
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// sections
import {useSnackbar} from '../../../components/snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';



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

// ----------------------------------------------------------------------

EvidenciaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EvidenciaPage() {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const router = useRouter();

    const [businessPartners, setBusinessPartners] = useState([]);

    useEffect(() => {

        const BuscarPorRango = async () => {

            try {
                const response = await axios.get(`/hanadb/api/orders/get_invoices_for_upload_evidencia_by_usuario?user_id=${user.ID}`);

                if (response.status === 200) {
                    console.log(response);
                    const businessPartnersWithId = response.data.orders.map((partner, index) => ({
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

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event, row) => {
        const file = event.target.files[0];
        // setSelectedFile(file);

        if (file) {
            handleFileUpload(file, row);
        }
    };

    const handleFileUpload = (file, row) => {


        // Aquí puedes manejar la carga del archivo, por ejemplo, enviándolo a un servidor
        console.log('Archivo seleccionado:', file);
        console.log('Número de orden:', row.ID);

        //Ejemplo de envío a un servidor (reemplaza con tu lógica)
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
                    const response = await axios.put('/hanadb/api/orders/api_save_url_file', {
                        ID_ORDER: Number(row.ID),
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

    const [dialogOpen, setDialogOpen] = useState(false);

    const [photo, setPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [selectedRow, setSelectedRow] = useState(null);

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
    };

    const capturePhoto = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 794, 1123);
        // Convertir el canvas a una URL de imagen y actualizar el estado con la foto capturada
        const imageURL = canvasRef.current.toDataURL('image/png');
        setPhoto(imageURL);

        // Crear un archivo a partir del Blob generado
        canvasRef.current.toBlob((blob) => {
            if (blob && selectedRow) {
                const file = new File([blob], "captured_image.png", { type: "image/png" });
                handleFileChange({ target: { files: [file] } }, selectedRow);
            }
        }, 'image/png');

    };

    const stopCamera = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;

    };

    const handleOpenDialog = (row) => {
        setDialogOpen(true);
        setSelectedRow(row); // Guardar la fila seleccionada

    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const baseColumns = [

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'ID',
            headerName: 'ID_ORDEN',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {
                const id = params.row.ID; // Accede al ID de la fila
                const path = PATH_DASHBOARD.invoice.view(id);

                return (
                    <Link
                        noWrap
                        variant="body2"
                        onClick={() => push(path)} // Usa una función anónima para manejar el evento de clic
                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                    >
                        {`INV-${id}`} {/* Muestra el ID con el prefijo */}
                    </Link>
                );
            }
        },
        {
            field: 'CLIENTEID',
            headerName: 'CARD_CODE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'Cliente',
            headerName: 'CLIENTE',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'VENDEDOR',
            headerName: 'VENDEDOR',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'ESTADO',
            headerName: 'ESTADO',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'NUMEROGUIA',
            headerName: 'NUMEROGUIA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NUMEROFACTURALIDENAR',
            headerName: 'NUMEROFACTURALIDENAR',
            flex: 1,
            minWidth: 260,
        },
        {
            field: 'GUIA_SERVIENTREGA',
            headerName: 'GUIA_SERVIENTREGA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHAFACTURACION',
            headerName: 'FECHAFACTURACION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'COMENTARIOENTREGA',
            headerName: 'COMENTARIOENTREGA',
            flex: 1,
            minWidth: 360,
        },
        {
            field: 'UPLOAD EVIDENCIA',
            headerName: 'UPLOAD EVIDENCIA',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {

                return (

                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<CloudUploadIcon/>}
                        >
                            Factura
                            <input
                                type="file"
                                hidden
                                onChange={(event) => handleFileChange(event, params.row)}
                            />
                        </Button>

                );
            },
        },
        // {
        //     field: 'UPLOAD EVIDENCIA_V2',
        //     headerName: 'UPLOAD EVIDENCIA_V2',
        //     flex: 1,
        //     minWidth: 160,
        //     renderCell: (params) => (
        //         <Button variant="contained" color="primary"
        //                 onClick={() => handleOpenDialog(params.row)}
        //                 startIcon={<CameraAltIcon />}
        //         >
        //             Factura
        //         </Button>
        //     ),
        // },
    ]





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


    return (
        <>
            <Head>
                <title> Garantías | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Cargar Evidencia"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Invoices',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Cargar Evidencia',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>
                                <DataGrid
                                    rows={businessPartners}
                                    columns={baseColumns}
                                    pagination
                                    slots={{
                                        toolbar: CustomToolbar,
                                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                    }}
                                />


                                <VideoCaptureDialog
                                    open={dialogOpen}
                                    handleClose={handleCloseDialog}
                                    videoRef={videoRef}
                                    canvasRef={canvasRef}
                                    photo={photo}
                                    startCamera={startCamera}
                                    stopCamera={stopCamera}
                                    capturePhoto={capturePhoto}
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


const VideoCaptureDialog = ({ open, handleClose, videoRef, canvasRef, photo, startCamera, stopCamera, capturePhoto }) => {
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Video Capture</DialogTitle>
            <DialogContent>
                <div style={{width: '794px', height: '1123px', position: 'relative'}}>
                    <video ref={videoRef} width="794" height="1123"/>
                    <canvas ref={canvasRef} width="794" height="1123" style={{display: 'none'}}/>
                    {photo && <img src={photo} alt="Captured"/>}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={startCamera}>Iniciar Cámara</Button>
                <Button onClick={capturePhoto}>Capturar Foto</Button>
                <Button onClick={stopCamera}>Detener Cámara</Button>
                <Button onClick={handleClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};