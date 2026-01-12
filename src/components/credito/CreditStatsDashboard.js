import React from 'react';
import { Box, Card, CardContent, Grid, Typography, alpha, Divider } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const CREDIT_STATES = [
    { value: 0, label: 'Firma Documentación', shortLabel: 'Firma Doc.', icon: '📝', color: '#FF6B6B' },
    { value: 1, label: 'Evaluación', shortLabel: 'Evaluación', icon: '⚖️', color: '#4ECDC4' },
    { value: 2, label: 'Firma Pagaré', shortLabel: 'Pagaré', icon: '✍️', color: '#95E1D3' },
    { value: 3, label: 'Nominado', shortLabel: 'Nominado', icon: '💼', color: '#F38181' },
    { value: 4, label: 'Innominado', shortLabel: 'Innominado', icon: '🏦', color: '#AA96DA' },
    { value: 5, label: 'Interno', shortLabel: 'Interno', icon: '✅', color: '#5CDB95' }
];

/**
 * Componente de tarjeta de estadísticas para cada estado
 */
function StatCard({ state, count, trend }) {
    const trendIsPositive = trend > 0;
    
    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                border: 2,
                borderColor: 'transparent',
                '&:hover': {
                    borderColor: state.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha(state.color, 0.3)}`,
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(state.color, 0.15),
                            fontSize: '28px',
                            mr: 2,
                        }}
                    >
                        {state.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {state.label}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: state.color }}>
                            {count || 0}
                        </Typography>
                    </Box>
                </Box>

                {trend !== undefined && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: trendIsPositive ? 'success.main' : 'error.main',
                        }}
                    >
                        {trendIsPositive ? (
                            <TrendingUp fontSize="small" />
                        ) : (
                            <TrendingDown fontSize="small" />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {Math.abs(trend)}% vs mes anterior
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Componente principal de dashboard de estadísticas
 * @param {Array} businessPartners - Lista de socios comerciales/prospectos
 */
export default function CreditStatsDashboard({ businessPartners = [] }) {
    // Calcular conteo por estado
    const getStateCount = (stateValue) => {
        return businessPartners.filter(
            (partner) => (partner.ESTADO_CREDITO ?? 0) === stateValue
        ).length;
    };

    // Calcular total
    const total = businessPartners.length;

    return (
        <Box sx={{ mb: 4 }}>
            {/* Resumen general */}
            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                }}
            >
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                📊 Dashboard de Créditos
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Gestión y control total del proceso crediticio
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                                {total}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Total de registros
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tarjetas de estadísticas por estado */}
            <Grid container spacing={3}>
                {CREDIT_STATES.map((state) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={state.value}>
                        <StatCard
                            state={state}
                            count={getStateCount(state.value)}
                            // trend={Math.floor(Math.random() * 30) - 10} // Simulado - conectar con datos reales
                        />
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ my: 3 }} />
        </Box>
    );
}
