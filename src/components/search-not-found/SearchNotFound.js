import PropTypes from 'prop-types';
// @mui
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  query: PropTypes.string,
  sx: PropTypes.object,
};

export default function SearchNotFound({ query, sx, ...other }) {
  return query ? (
    <Paper
      sx={{
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" paragraph>
        Buscando...
      </Typography>

      <Typography variant="body2">
          resultados para: &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> Intente verificar errores tipográficos o usar palabras completas.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
        Por favor ingrese una palabras clave
    </Typography>
  );
}
