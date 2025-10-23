import React, {useEffect, useRef, useState} from 'react';
// next
import Head from 'next/head';
// @mui
import {Button, Card, CircularProgress, Container, Grid, Box, Typography, Alert} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
//
import {useSettingsContext} from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useAuthContext} from "../../../auth/useAuthContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
// utils
import axios from "../../../utils/axios";


// ----------------------------------------------------------------------

MarcarPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------






export default function MarcarPage() {
    const { themeStretch } = useSettingsContext();
    const { user } = useAuthContext();

    const [dateTime, setDateTime] = useState(new Date());
    const [coordinates, setCoordinates] = useState(null);
    const [markedDate, setMarkedDate] = useState(null);
    const [markedTime, setMarkedTime] = useState(null);
    const [dataValid, setDataValid] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Estados para la cámara y foto
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [photoTaken, setPhotoTaken] = useState(null);
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [videoReady, setVideoReady] = useState(false);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Limpiar stream de cámara al desmontar componente
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const formatTime24 = (date) => {
        return date.toLocaleTimeString("es-ES", { hour12: false });
    };

    // Abrir cámara
    const openCamera = async () => {
        setCameraError(null);
        setVideoReady(false);
        
        try {
            console.log("🎥 Solicitando acceso a la cámara...");
            
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: false 
            });
            
            console.log("✓ Cámara autorizada!");
            console.log("Stream activo:", mediaStream.active);
            console.log("Video tracks:", mediaStream.getVideoTracks().length);
            
            if (mediaStream.getVideoTracks().length === 0) {
                throw new Error("No hay tracks de video en el stream");
            }
            
            setStream(mediaStream);
            setIsCameraOpen(true);
            
            // Esperar un momento antes de asignar el stream al video
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!videoRef.current) {
                console.error("❌ videoRef.current es null!");
                setCameraError("Error: No se pudo acceder al elemento de video");
                return;
            }
            
            console.log("📹 Asignando stream al elemento video...");
            videoRef.current.srcObject = mediaStream;
            
            console.log("🎬 Intentando reproducir video...");
            
            // Forzar reproducción
            try {
                await videoRef.current.play();
                console.log("✓ Video.play() exitoso");
            } catch (playError) {
                console.error("Error en play():", playError);
            }
            
            // Verificar estado del video repetidamente
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            
            const checkVideoReady = () => {
                attempts++;
                
                if (!videoRef.current) {
                    console.error("videoRef se perdió");
                    return;
                }
                
                const width = videoRef.current.videoWidth;
                const height = videoRef.current.videoHeight;
                const readyState = videoRef.current.readyState;
                
                console.log(`Intento ${attempts}: ${width}x${height}, readyState: ${readyState}`);
                
                if (width > 0 && height > 0) {
                    console.log("✅ VIDEO LISTO:", width, "x", height);
                    setVideoReady(true);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkVideoReady, 100);
                } else {
                    console.error("❌ Timeout esperando video");
                    setCameraError("El video no se inició correctamente. Intenta de nuevo.");
                }
            };
            
            checkVideoReady();
            
        } catch (error) {
            console.error("❌ Error al acceder a la cámara:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            setCameraError(`Error: ${error.message || 'No se pudo acceder a la cámara'}`);
            setIsCameraOpen(false);
        }
    };

    // Tomar foto
    const takePhoto = () => {
        try {
            setCameraError(null);
            
            if (!videoRef.current || !canvasRef.current) {
                setCameraError("Error: Referencias no disponibles");
                console.error("videoRef or canvasRef is null");
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            console.log("=== CAPTURANDO FOTO ===");
            console.log("Video readyState:", video.readyState);
            console.log("Video width:", video.videoWidth);
            console.log("Video height:", video.videoHeight);
            console.log("Video paused:", video.paused);
            
            // Verificar que el video tenga dimensiones válidas
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                setCameraError("El video no está listo. Espera un momento e intenta nuevamente.");
                return;
            }
            
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                setCameraError("El video aún está cargando. Espera un momento.");
                return;
            }
            
            const context = canvas.getContext('2d');
            
            if (!context) {
                setCameraError("Error al obtener contexto del canvas");
                return;
            }
            
            // Establecer dimensiones del canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
            
            // APLICAR EFECTO ESPEJO: voltear horizontalmente
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            
            // Dibujar frame actual del video en el canvas (ya volteado)
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Resetear transformación para futuras operaciones
            context.setTransform(1, 0, 0, 1, 0, 0);
            
            // Convertir canvas a base64
            const photoData = canvas.toDataURL('image/jpeg', 0.9);
            console.log("Photo data length:", photoData.length);
            console.log("Photo data starts with:", photoData.substring(0, 30));
            
            if (photoData && photoData.length > 100) {
                console.log("✓ Foto guardada correctamente");
                console.log("Tamaño de la foto:", photoData.length, "caracteres");
                console.log("Tipo de dato:", typeof photoData);
                
                // Detener la cámara primero
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                setIsCameraOpen(false);
                setVideoReady(false);
                
                // Establecer la foto al final para asegurar que se renderice
                setPhotoTaken(photoData);
                console.log("Estado photoTaken actualizado");
            } else {
                setCameraError("Error: La foto capturada está vacía");
                console.error("photoData length:", photoData ? photoData.length : "null");
            }
            
        } catch (error) {
            console.error("Error en takePhoto:", error);
            setCameraError("Error al capturar la foto: " + error.message);
        }
    };

    // Retomar foto
    const retakePhoto = () => {
        setPhotoTaken(null);
        setVideoReady(false);
        openCamera();
    };

    const handleMark = async () => {
        // Validar que se haya tomado la foto
        if (!photoTaken) {
            setCameraError("Debes tomar una foto antes de marcar la asistencia");
            return;
        }

        setLoading(true); // Desactivar botón y mostrar loading
        const now = new Date();
        setMarkedDate(now.toLocaleDateString());
        setMarkedTime(formatTime24(now));

        try {
            // 1. Primero subir la foto al servidor de imágenes
            console.log("📤 Subiendo foto al servidor...");
            const photoUrl = await uploadPhotoToServer(photoTaken);
            console.log("✅ Foto subida exitosamente:", photoUrl);

            // 2. Luego obtener coordenadas GPS
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCoordinates({ latitude, longitude });
                        setDataValid(true);

                        // 3. Enviar datos a la API con la URL de la foto
                        sendToAPI(latitude, longitude, photoUrl);
                    },
                    (error) => {
                        console.error("Error obteniendo ubicación:", error);
                        setDataValid(false);
                        setLoading(false);
                    }
                );
            } else {
                console.error("Geolocalización no soportada en este navegador");
                setDataValid(false);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error al subir la foto:", error);
            setCameraError("Error al subir la foto. Por favor, intenta de nuevo.");
            setLoading(false);
        }
    };

    // Función para subir la foto al servidor y obtener la URL
    const uploadPhotoToServer = async (base64Photo) => {
        // Convertir base64 a Blob
        const response = await fetch(base64Photo);
        const blob = await response.blob();
        
        // Crear archivo con nombre único usando timestamp
        const timestamp = new Date().getTime();
        const fileName = `asistencia_${user.ID}_${timestamp}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // Crear FormData
        const formData = new FormData();
        formData.append('file', file);

        // Subir archivo
        const uploadResponse = await fetch('https://imagen.hipertronics.us/ht/cloud/upload_web_files', {
            method: 'POST',
            body: formData,
        });

        if (uploadResponse.status !== 200) {
            throw new Error('Failed to upload file');
        }

        const data = await uploadResponse.json();

        if (data.status === 'success') {
            return data.link; // Retornar la URL de la imagen
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    };

    const sendToAPI = async (latitude, longitude, photoUrl) => {
        try {
            const response = await axios.post('/hanadb/api/rrhh/crear_registro_reloj_biometrico_online', {
                user_id: user.ID,
                latitude: latitude,
                longitude: longitude,
                image_url_evidencia: photoUrl, // Enviar URL de la foto en lugar de base64
            });

            console.log('Status crear registro:', response.status);
            if (response.status === 200) {
                console.log('✅ Asistencia marcada correctamente');
            } else {
                console.log('⚠️ La solicitud no devolvió un estado 200.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            setCameraError('Error al registrar asistencia. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false); // Ocultar loading después de enviar los datos
        }
    };

    return (
        <>
            <Head>
                <title> RRHH | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Reloj Biométrico Online"
                    links={[
                        { name: 'Dashboard', href: PATH_DASHBOARD.root },
                        { name: 'RRHH', href: PATH_DASHBOARD.blog.root },
                        { name: 'Reloj Biométrico' },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{ p: 3, textAlign: "center" }}>
                            <h2>Reloj Biométrico Grupo HT</h2>
                            <p>Fecha y Hora actual: {dateTime.toLocaleString("es-ES")}</p>

                            {/* Mostrar errores */}
                            {cameraError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {cameraError}
                                </Alert>
                            )}

                            {/* Sección de cámara */}
                            {!photoTaken && !coordinates && (
                                <Box sx={{ mb: 3 }}>
                                    {!isCameraOpen ? (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<CameraAltIcon />}
                                            onClick={openCamera}
                                            size="large"
                                        >
                                            ABRIR CÁMARA PARA MARCAR ASISTENCIA
                                        </Button>
                                    ) : (
                                        <Box>
                                            <Box sx={{ 
                                                mb: 2, 
                                                p: 2, 
                                                backgroundColor: '#f5f5f5',
                                                borderRadius: 2,
                                                border: '2px dashed #ccc'
                                            }}>
                                                <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
                                                    Estado: {isCameraOpen ? '🎥 Cámara abierta' : '📷 Cámara cerrada'} | 
                                                    Video: {videoReady ? '✅ Listo' : '⏳ Cargando...'} | 
                                                    Stream: {stream ? '✓ Activo' : '✗ Inactivo'}
                                                </Typography>
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '500px',
                                                        height: 'auto',
                                                        minHeight: '300px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#000',
                                                        border: '3px solid #2196f3',
                                                        display: 'block',
                                                        margin: '0 auto',
                                                        transform: 'scaleX(-1)'
                                                    }}
                                                />
                                            </Box>
                                            {!videoReady && (
                                                <Alert severity="info" sx={{ mb: 2 }}>
                                                    ⏳ Preparando cámara... Por favor espera.
                                                </Alert>
                                            )}
                                            {videoReady && (
                                                <Alert severity="success" sx={{ mb: 2 }}>
                                                    ✅ Cámara lista - Puedes capturar la foto
                                                </Alert>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<PhotoCameraIcon />}
                                                onClick={takePhoto}
                                                size="large"
                                                disabled={!videoReady}
                                            >
                                                CAPTURAR FOTO
                                            </Button>
                                        </Box>
                                    )}
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </Box>
                            )}

                            {/* Vista previa de la foto tomada */}
                            {photoTaken && !coordinates && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                                        ✓ Foto capturada correctamente
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                        Debug: Foto existe = {photoTaken ? 'Sí' : 'No'}, 
                                        Tamaño = {photoTaken ? `${Math.round(photoTaken.length / 1024)}KB` : '0KB'}
                                    </Typography>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        mb: 2,
                                        backgroundColor: '#f5f5f5',
                                        padding: 2,
                                        borderRadius: 2
                                    }}>
                                        {photoTaken ? (
                                            <img
                                                src={photoTaken}
                                                alt="Foto capturada"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '400px',
                                                    borderRadius: '8px',
                                                    border: '2px solid #4caf50',
                                                    display: 'block'
                                                }}
                                                onError={(e) => {
                                                    console.error("❌ Error loading image:", e);
                                                    console.error("Image src length:", photoTaken ? photoTaken.length : 0);
                                                    console.error("Image src preview:", photoTaken ? photoTaken.substring(0, 100) : 'null');
                                                    setCameraError("Error al cargar la imagen capturada");
                                                }}
                                                onLoad={() => {
                                                    console.log("✅ Image loaded successfully!");
                                                }}
                                            />
                                        ) : (
                                            <Typography color="error">No hay foto disponible</Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        onClick={retakePhoto}
                                        sx={{ mr: 2 }}
                                    >
                                        RETOMAR FOTO
                                    </Button>
                                </Box>
                            )}

                            {/* Botón MARCAR o Loading */}
                            {loading ? (
                                <CircularProgress color="primary" />
                            ) : (
                                photoTaken && !coordinates && ( // Solo mostrar si hay foto y no se ha marcado
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleMark}
                                        disabled={loading}
                                        size="large"
                                        sx={{ mt: 2 }}
                                    >
                                        MARCAR ASISTENCIA
                                    </Button>
                                )
                            )}

                            {/* Información después de marcar */}
                            {coordinates && (
                                <Box sx={{ mt: 3 }}>
                                    <img
                                        src={photoTaken}
                                        alt="Foto registrada"
                                        style={{
                                            width: '100%',
                                            maxWidth: '300px',
                                            borderRadius: '8px',
                                            marginBottom: '16px'
                                        }}
                                    />
                                    <p><strong>Usuario:</strong> {user.DISPLAYNAME}</p>
                                    {markedDate && markedTime && (
                                        <p>
                                            <strong>Fecha de la marca:</strong> {markedDate} <br /> 
                                            <strong>Hora de la marca:</strong> {markedTime}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Coordenadas:</strong> Lat: {coordinates.latitude}, Lng: {coordinates.longitude}
                                        <br />
                                        <a
                                            href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#1976d2', textDecoration: 'underline' }}
                                        >
                                            Ver en Google Maps
                                        </a>
                                    </p>
                                </Box>
                            )}

                            <div style={{ marginTop: "10px" }}>
                                {dataValid ? (
                                    <CheckCircleIcon style={{ color: "green", fontSize: 40 }} />
                                ) : (
                                    <CancelIcon style={{ color: "red", fontSize: 40 }} />
                                )}
                            </div>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
