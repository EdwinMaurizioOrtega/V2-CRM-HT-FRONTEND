import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
// utils
import { bgGradient } from '../../../../utils/cssStyles';
import { fShortenNumber } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

export default function AnalyticsWidgetSummary({
                                                   title,
                                                   total,
                                                   icon,
                                                   color = 'primary',
                                                   sx,
                                                   ...other
                                               }) {
    const theme = useTheme();

    return (
        <Stack
            alignItems="center"
            sx={{
                ...bgGradient({
                    direction: '135deg',
                    startColor: alpha(theme.palette[color].light, 0.25),
                    endColor: alpha(theme.palette[color].main, 0.85),
                }),
                py: 5,
                borderRadius: 3,
                textAlign: 'center',
                color: theme.palette.common.white,
                boxShadow: `0 8px 20px ${alpha(theme.palette[color].main, 0.35)}`,
                position: 'relative',
                overflow: 'hidden',
                // efecto glassmorphism
                backdropFilter: 'blur(8px)',
                ...sx,
            }}
            {...other}
        >
            {/* Icono con circulo brillante */}
            {icon && (
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        mb: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette[color].dark, 0.4)}`,
                    }}
                >
                    {icon}
                </Box>
            )}

            <Typography variant="h3" sx={{ fontWeight: 'bold', letterSpacing: -0.5 }}>
                {fShortenNumber(total)}
            </Typography>

            <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                {title}
            </Typography>
        </Stack>
    );
}

AnalyticsWidgetSummary.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    sx: PropTypes.object,
    title: PropTypes.string,
    total: PropTypes.number,
};
