import React from 'react';
import { Box, Step, StepLabel, Stepper, Typography, alpha } from '@mui/material';

// Estados del proceso de crédito
const CREDIT_STATES = [
    { value: 0, label: 'Firma de Documentación', icon: '📝', color: '#FF6B6B' },
    { value: 1, label: 'Evaluación y Aprobación', icon: '⚖️', color: '#4ECDC4' },
    { value: 2, label: 'Firma de Pagaré', icon: '✍️', color: '#95E1D3' },
    { value: 3, label: 'Crédito Nominado', icon: '💼', color: '#F38181' },
    { value: 4, label: 'Crédito Innominado', icon: '🏦', color: '#AA96DA' },
    { value: 5, label: 'Crédito Interno', icon: '✅', color: '#5CDB95' }
];

/**
 * Componente para mostrar el progreso del estado del crédito
 * @param {number} currentState - Estado actual del crédito (0-5)
 * @param {boolean} orientation - Orientación del stepper ('horizontal' | 'vertical')
 */
export default function CreditProgressStepper({ currentState = 0, orientation = 'horizontal' }) {
    return (
        <Box sx={{ width: '100%', py: 3 }}>
            <Stepper 
                activeStep={currentState} 
                orientation={orientation}
                alternativeLabel={orientation === 'horizontal'}
                sx={{
                    '& .MuiStepLabel-root .Mui-completed': {
                        color: 'success.main',
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                        color: CREDIT_STATES[currentState]?.color || 'primary.main',
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                        fontWeight: 'bold',
                    },
                }}
            >
                {CREDIT_STATES.map((state, index) => (
                    <Step key={state.value}>
                        <StepLabel
                            StepIconComponent={() => (
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        bgcolor: index <= currentState 
                                            ? alpha(state.color, 0.2)
                                            : 'grey.200',
                                        border: 2,
                                        borderColor: index === currentState 
                                            ? state.color 
                                            : index < currentState 
                                                ? 'success.main' 
                                                : 'grey.300',
                                        transition: 'all 0.3s ease',
                                        boxShadow: index === currentState 
                                            ? `0 0 20px ${alpha(state.color, 0.4)}` 
                                            : 'none',
                                    }}
                                >
                                    {state.icon}
                                </Box>
                            )}
                        >
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: index === currentState ? 'bold' : 'normal',
                                    color: index === currentState 
                                        ? state.color 
                                        : index < currentState 
                                            ? 'text.primary' 
                                            : 'text.disabled',
                                    mt: 1,
                                }}
                            >
                                {state.label}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
