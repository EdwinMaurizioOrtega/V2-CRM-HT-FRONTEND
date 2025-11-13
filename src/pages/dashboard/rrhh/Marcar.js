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
                        <Card sx={{ 
                            p: 4, 
                            textAlign: "center",
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            borderRadius: 3
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                mb: 2,
                                gap: 2
                            }}>
                                <CameraAltIcon sx={{ fontSize: 40, color: 'white' }} />
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    Reloj Biométrico Grupo HT
                                </Typography>
                            </Box>

                            <Box sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                borderRadius: 2,
                                p: 2,
                                mb: 3,
                                display: 'inline-block',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                                    📅 {dateTime.toLocaleDateString("es-ES", { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </Typography>
                                <Typography variant="h4" sx={{ color: '#764ba2', fontWeight: 'bold', mt: 1 }}>
                                    🕐 {dateTime.toLocaleTimeString("es-ES")}
                                </Typography>
                            </Box>
                        </Card>

                        <Card sx={{ 
                            p: 4, 
                            textAlign: "center",
                            mt: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            borderRadius: 3
                        }}>

                            {/* Políticas de Marcación */}
                            {!photoTaken && !coordinates && (
                                <>
                                    <Box sx={{ 
                                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                        borderRadius: 3,
                                        p: 3,
                                        mb: 2,
                                        textAlign: 'left',
                                        border: '2px solid #2196f3',
                                        boxShadow: '0 4px 12px rgba(33,150,243,0.2)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ 
                                                backgroundColor: '#2196f3',
                                                borderRadius: '50%',
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <Typography variant="h5">📋</Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                Políticas de Marcación
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" component="div" sx={{ color: '#1565c0' }}>
                                            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                                                <li><strong>✓ La foto debe mostrar claramente tu rostro.</strong></li>
                                                <li><strong>✓ El fondo de la imagen debe ser en el punto de venta (con la pared de marca de fondo).</strong></li>
                                                <li>✓ Asegúrate de estar en un lugar bien iluminado</li>
                                                <li>✓ No uses accesorios que oculten tu rostro (gafas oscuras, gorras, etc.)</li>
                                                <li>✓ La foto será registrada con tus coordenadas GPS y hora exacta.</li>
                                            </ul>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                                        borderRadius: 3,
                                        p: 3,
                                        mb: 3,
                                        textAlign: 'left',
                                        border: '3px solid #ff9800',
                                        boxShadow: '0 4px 12px rgba(255,152,0,0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Box sx={{ 
                                                backgroundColor: '#ff9800',
                                                borderRadius: '50%',
                                                width: 40,
                                                height: 40,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <Typography variant="h5">⚠️</Typography>
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                                                ADVERTENCIA IMPORTANTE
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                                            Cualquier alteración en el GPS o la hora del sistema será penalizada según las políticas de la empresa.
                                        </Typography>
                                    </Box>
                                </>
                            )}

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
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<CameraAltIcon sx={{ fontSize: 28 }} />}
                                                onClick={openCamera}
                                                size="large"
                                                sx={{
                                                    py: 2,
                                                    px: 4,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    borderRadius: 3,
                                                    boxShadow: '0 8px 20px rgba(156,39,176,0.4)',
                                                    background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                                                    '&:hover': {
                                                        boxShadow: '0 12px 28px rgba(156,39,176,0.6)',
                                                        transform: 'translateY(-2px)',
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                MARCAR ASISTENCIA
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Box sx={{ 
                                                mb: 3, 
                                                p: 3, 
                                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                                borderRadius: 3,
                                                border: '3px solid #667eea',
                                                boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                                            }}>
                                                <Box sx={{ 
                                                    backgroundColor: 'rgba(102,126,234,0.1)',
                                                    borderRadius: 2,
                                                    p: 1.5,
                                                    mb: 2,
                                                    border: '2px dashed #667eea'
                                                }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                                        {isCameraOpen ? '🎥 Cámara Abierta' : '📷 Cámara Cerrada'} | 
                                                        {videoReady ? ' ✅ Video Listo' : ' ⏳ Cargando Video...'} | 
                                                        {stream ? ' ✓ Stream Activo' : ' ✗ Sin Stream'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    position: 'relative',
                                                    borderRadius: 3,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                                    border: '4px solid #667eea'
                                                }}>
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '600px',
                                                            height: 'auto',
                                                            minHeight: '400px',
                                                            backgroundColor: '#000',
                                                            display: 'block',
                                                            margin: '0 auto',
                                                            transform: 'scaleX(-1)'
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                            {!videoReady && (
                                                <Box sx={{
                                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
                                                    borderRadius: 2,
                                                    p: 2,
                                                    mb: 2,
                                                    border: '2px solid #2196f3'
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                                                        ⏳ Preparando cámara... Por favor espera.
                                                    </Typography>
                                                </Box>
                                            )}
                                            {videoReady && (
                                                <Box sx={{
                                                    background: 'linear-gradient(135deg, #e8f5e9 0%, #81c784 100%)',
                                                    borderRadius: 2,
                                                    p: 2,
                                                    mb: 3,
                                                    border: '2px solid #4caf50'
                                                }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                        ✅ Cámara lista - Puedes capturar la foto
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<PhotoCameraIcon sx={{ fontSize: 28 }} />}
                                                onClick={takePhoto}
                                                size="large"
                                                disabled={!videoReady}
                                                sx={{
                                                    py: 2,
                                                    px: 4,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 'bold',
                                                    borderRadius: 3,
                                                    boxShadow: '0 8px 20px rgba(33,150,243,0.4)',
                                                    background: videoReady ? 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' : undefined,
                                                    '&:hover': {
                                                        boxShadow: videoReady ? '0 12px 28px rgba(33,150,243,0.6)' : undefined,
                                                        transform: videoReady ? 'translateY(-2px)' : undefined,
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
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
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
                                        borderRadius: 3,
                                        p: 3,
                                        mb: 3,
                                        border: '3px solid #4caf50',
                                        boxShadow: '0 8px 24px rgba(76,175,80,0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                            <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                Foto Capturada Correctamente
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ 
                                            color: '#1b5e20', 
                                            display: 'block',
                                            textAlign: 'center',
                                            mb: 2
                                        }}>
                                            Tamaño: {photoTaken ? `${Math.round(photoTaken.length / 1024)}KB` : '0KB'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        mb: 3,
                                        p: 3,
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                        borderRadius: 3,
                                        border: '3px solid #667eea',
                                        boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                                    }}>
                                        {photoTaken ? (
                                            <img
                                                src={photoTaken}
                                                alt="Foto capturada"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '500px',
                                                    borderRadius: '12px',
                                                    border: '4px solid #4caf50',
                                                    display: 'block',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
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
                                        sx={{ 
                                            mr: 2,
                                            py: 1.5,
                                            px: 3,
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            borderRadius: 2,
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderWidth: '2px',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 12px rgba(255,152,0,0.3)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        🔄 RETOMAR FOTO
                                    </Button>
                                </Box>
                            )}

                            {/* Botón MARCAR o Loading */}
                            {loading ? (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 3
                                }}>
                                    <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
                                    <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                                        📤 Registrando asistencia...
                                    </Typography>
                                </Box>
                            ) : (
                                photoTaken && !coordinates && ( // Solo mostrar si hay foto y no se ha marcado
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleMark}
                                        disabled={loading}
                                        size="large"
                                        startIcon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
                                        sx={{ 
                                            mt: 2,
                                            py: 2,
                                            px: 5,
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            borderRadius: 3,
                                            boxShadow: '0 8px 20px rgba(76,175,80,0.4)',
                                            background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                                            '&:hover': {
                                                boxShadow: '0 12px 28px rgba(76,175,80,0.6)',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        MARCAR ASISTENCIA
                                    </Button>
                                )
                            )}

                            {/* Información después de marcar */}
                            {coordinates && (
                                <Box sx={{ 
                                    mt: 4,
                                    p: 4,
                                    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                    borderRadius: 3,
                                    border: '4px solid #4caf50',
                                    boxShadow: '0 12px 32px rgba(76,175,80,0.4)'
                                }}>
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                                            ¡Asistencia Registrada!
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                            Tu marcación ha sido guardada exitosamente
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        backgroundColor: 'white',
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 3,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <img
                                            src={photoTaken}
                                            alt="Foto registrada"
                                            style={{
                                                width: '100%',
                                                maxWidth: '400px',
                                                borderRadius: '12px',
                                                border: '3px solid #4caf50',
                                                display: 'block',
                                                margin: '0 auto',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        borderRadius: 2,
                                        p: 3
                                    }}>
                                        <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, fontWeight: 'bold' }}>
                                            📋 Detalles de la Marcación
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                                <strong>👤 Usuario:</strong> {user.DISPLAYNAME}
                                            </Typography>
                                        </Box>

                                        {markedDate && markedTime && (
                                            <>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                                        <strong>📅 Fecha:</strong> {markedDate}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                                        <strong>🕐 Hora:</strong> {markedTime}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="body1" sx={{ color: '#1b5e20' }}>
                                                <strong>📍 Coordenadas:</strong> Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude.toFixed(6)}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            size="large"
                                            href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: 2,
                                                py: 1.5,
                                                px: 3,
                                                '&:hover': {
                                                    boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            🗺️ Ver Ubicación en Google Maps
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
