import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];

export default function Progress(theme) {
  const rootStyle = (ownerState) => {
    const bufferVariant = ownerState.variant === 'buffer';

    const defaultStyle = {
      borderRadius: 16,
      '& .MuiLinearProgress-bar': {
        borderRadius: 16,
      },
      ...(bufferVariant && {
        backgroundColor: 'transparent',
      }),
    };

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        backgroundColor: alpha(theme.palette[color].main, 0.24),
      }),
    }));

    return [...colorStyle, defaultStyle];
  };

  return {
    MuiLinearProgress: {
      defaultProps: {
        color: 'inherit',
      },
      styleOverrides: {
        root: ({ ownerState }) => rootStyle(ownerState),
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        color: 'inherit',
      },
    },
  };
}
