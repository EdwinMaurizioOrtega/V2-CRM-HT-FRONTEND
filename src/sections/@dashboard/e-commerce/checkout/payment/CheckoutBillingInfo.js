import PropTypes from 'prop-types';
// @mui
import { Card, Button, Typography, CardHeader, CardContent } from '@mui/material';
// components
import Iconify from '../../../../../components/iconify';

// ----------------------------------------------------------------------

CheckoutBillingInfo.propTypes = {
  billing: PropTypes.object,
  onBackStep: PropTypes.func,
};

export default function CheckoutBillingInfo({ billing, onBackStep }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Dirección de Envio"
        action={
          <Button size="small" startIcon={<Iconify icon="eva:edit-fill" />} onClick={onBackStep}>
              Editar
          </Button>
        }
      />
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          {billing?.Cliente}&nbsp;
          {/* <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}> */}
          {/*   ({billing?.addressType}) */}
          {/* </Typography> */}
        </Typography>

        <Typography variant="body2" gutterBottom>
          {billing?.Direccion}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {billing?.Celular}
        </Typography>
      </CardContent>
    </Card>
  );
}
