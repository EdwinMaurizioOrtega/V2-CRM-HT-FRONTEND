import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import {
    Link,
    Button,
    Divider,
    Typography,
    Stack,
    Box,
    LinearProgress,
    Fade,
    Zoom,
    Grow,
    alpha,
    Dialog,
    Backdrop,
    Slide
} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
// assets
import { OrderCompleteIllustration } from '../../../../assets/illustrations';

// ----------------------------------------------------------------------

CheckoutOrderComplete.propTypes = {
    open: PropTypes.bool,
    onReset: PropTypes.func,
    onDownloadPDF: PropTypes.func,
    loading: PropTypes.bool,
};

// Pasos del proceso
const PROCESS_STEPS = [
    {
        id: 1,
        icon: '☁️',
        title: 'Enviando datos al Data Center',
        color: '#00B8D9',
        duration: 1500,
    },
    {
        id: 2,
        icon: '📡',
        title: 'Recibiendo datos',
        color: '#7635dc',
        duration: 1200,
    },
    {
        id: 3,
        icon: '📝',
        title: 'Creando la orden de venta',
        color: '#FFAB00',
        duration: 1800,
    },
    {
        id: 4,
        icon: '💾',
        title: 'Guardando en la base de datos',
        color: '#00A76F',
        duration: 1500,
    },
    {
        id: 5,
        icon: '✅',
        title: 'Finalizado correctamente',
        color: '#22C55E',
        duration: 1000,
    },
];

export default function CheckoutOrderComplete({ loading, open, onReset, onDownloadPDF }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(true);
    const [hasCalledReset, setHasCalledReset] = useState(false);

    // Llamar a onReset solo una vez cuando se abre el diálogo
    useEffect(() => {
        if (open && !hasCalledReset && onReset) {
            setHasCalledReset(true);
            setIsProcessing(true);
            setCurrentStep(0);
            setProgress(0);
            onReset();
        }
        
        // Reset cuando se cierra el diálogo
        if (!open) {
            setHasCalledReset(false);
            setIsProcessing(true);
            setCurrentStep(0);
            setProgress(0);
        }
    }, [open, hasCalledReset, onReset]);

    useEffect(() => {
        if (!isProcessing || !loading) return;

        if (currentStep < PROCESS_STEPS.length) {
            const step = PROCESS_STEPS[currentStep];
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        setTimeout(() => {
                            if (currentStep < PROCESS_STEPS.length - 1) {
                                setCurrentStep((prev) => prev + 1);
                                setProgress(0);
                            } else {
                                setIsProcessing(false);
                            }
                        }, 300);
                        return 100;
                    }
                    return prev + (100 / (step.duration / 50));
                });
            }, 50);

            return () => clearInterval(progressInterval);
        }
    }, [currentStep, isProcessing, loading]);

    const showSuccess = !loading && !isProcessing;

    return (
        <Dialog
            fullScreen
            open={open}
            TransitionComponent={Slide}
            TransitionProps={{ direction: 'up' }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(10px)',
                },
            }}
            PaperProps={{
                sx: {
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'auto',
                },
            }}
        >
            <Stack
                spacing={5}
                sx={{
                    m: 'auto',
                    maxWidth: 600,
                    textAlign: 'center',
                    px: { xs: 2, sm: 3 },
                    py: 5,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #00B8D9, #7635dc, #FFAB00, #00A76F, #22C55E)',
                        backgroundSize: '200% 100%',
                        animation: 'gradient 3s ease infinite',
                        '@keyframes gradient': {
                            '0%, 100%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' },
                        },
                    },
                }}
            >
                {/* Título principal */}
                <Fade in timeout={500}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {loading || isProcessing ? '⚡ Procesando su pedido' : '🎉 ¡Pedido Completado!'}
                    </Typography>
                </Fade>

                {/* Animación de pasos del proceso */}
                {(loading || isProcessing) && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        {PROCESS_STEPS.map((step, index) => (
                            <Grow
                                key={step.id}
                                in={index <= currentStep}
                                timeout={500}
                                style={{ transformOrigin: '0 0 0' }}
                            >
                                <Box
                                    sx={{
                                        mb: 3,
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '2px solid',
                                        borderColor: index === currentStep ? step.color : 'divider',
                                        boxShadow: index === currentStep
                                            ? `0 8px 24px ${alpha(step.color, 0.25)}`
                                            : 'none',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Indicador de progreso de fondo */}
                                    {index === currentStep && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                height: '100%',
                                                width: `${progress}%`,
                                                bgcolor: alpha(step.color, 0.1),
                                                transition: 'width 0.05s linear',
                                                zIndex: 0,
                                            }}
                                        />
                                    )}

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                        sx={{ position: 'relative', zIndex: 1 }}
                                    >
                                        {/* Icono del paso */}
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '50%',
                                                bgcolor: index < currentStep
                                                    ? step.color
                                                    : index === currentStep
                                                        ? alpha(step.color, 0.2)
                                                        : 'background.neutral',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.75rem',
                                                flexShrink: 0,
                                                transition: 'all 0.3s ease',
                                                ...(index === currentStep && {
                                                    animation: 'pulse 1.5s ease-in-out infinite',
                                                    '@keyframes pulse': {
                                                        '0%, 100%': {
                                                            transform: 'scale(1)',
                                                        },
                                                        '50%': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    },
                                                }),
                                            }}
                                        >
                                            {index < currentStep ? (
                                                <Iconify
                                                    icon="eva:checkmark-circle-2-fill"
                                                    sx={{ width: 32, height: 32, color: 'white' }}
                                                />
                                            ) : (
                                                step.icon
                                            )}
                                        </Box>

                                        {/* Texto del paso */}
                                        <Box sx={{ flex: 1, textAlign: 'left' }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: index === currentStep ? 700 : 500,
                                                    color: index <= currentStep ? 'text.primary' : 'text.disabled',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                {step.title}
                                            </Typography>

                                            {/* Barra de progreso del paso actual */}
                                            {index === currentStep && (
                                                <Box sx={{ mt: 1.5 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            bgcolor: alpha(step.color, 0.2),
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: step.color,
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 0.5,
                                                            color: step.color,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {Math.round(progress)}%
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Checkmark para pasos completados */}
                                            {index < currentStep && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 0.5,
                                                        color: step.color,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ✓ Completado
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Estado del paso */}
                                        {index === currentStep && (
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: step.color,
                                                    animation: 'blink 1s ease-in-out infinite',
                                                    '@keyframes blink': {
                                                        '0%, 100%': { opacity: 1 },
                                                        '50%': { opacity: 0.3 },
                                                    },
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Grow>
                        ))}
                    </Box>
                )}

                {/* Vista de éxito */}
                {showSuccess && (
                    <Zoom in timeout={800}>
                        <Box>
                            <OrderCompleteIllustration sx={{ height: 280, mb: 3 }} />

                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                ¡Gracias por su compra!
                            </Typography>

                            <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                                Gracias por hacer el pedido
                                <br />
                                <br />
                                Le enviaremos una notificación dentro de los 5 días posteriores al envío.
                                <br />
                                Si tiene alguna pregunta o consulta, no dude en ponerse en contacto con nosotros.
                                <br />
                                <br />
                                Mis mejores deseos,
                            </Typography>
                        </Box>
                    </Zoom>
                )}

                {/* Botón de acción - Mensaje informativo */}
                <Stack
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ mt: 4 }}
                >
                    <Fade in timeout={500}>
                        <Box sx={{ textAlign: 'center' }}>
                            {(loading || isProcessing) ? (
                                <Stack spacing={2} alignItems="center">
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        🚀 Enviando la orden al área de aprobación...
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            border: '4px solid',
                                            borderColor: 'primary.main',
                                            borderTopColor: 'transparent',
                                            animation: 'spin 1s linear infinite',
                                            '@keyframes spin': {
                                                '0%': { transform: 'rotate(0deg)' },
                                                '100%': { transform: 'rotate(360deg)' },
                                            },
                                        }}
                                    />
                                </Stack>
                            ) : (
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                                        ✅ Orden enviada exitosamente
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        La orden ha sido enviada al área de aprobación
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    </Fade>
                </Stack>
            </Stack>
        </Dialog>
    );
}
