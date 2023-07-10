import PropTypes from 'prop-types';
// @mui
import { Box, Stack, Divider, TableRow, TableCell, Typography, IconButton } from '@mui/material';
// utils
import { fCurrency } from '../../../../../utils/formatNumber';
// components
import Image from '../../../../../components/image';
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
import { ColorPreview } from '../../../../../components/color-utils';
import { IncrementerButton } from '../../../../../components/custom-input';

// ----------------------------------------------------------------------

CheckoutCartProduct.propTypes = {
  row: PropTypes.object,
  onDelete: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
};

export default function CheckoutCartProduct({ row, onDelete, onDecrease, onIncrease }) {
  const { NOMBRE, CODIGO, quantity, tipo_precio, size, price } = row;

    function namePriceType(pri) {
        const strings = {
            1: "NE",
            2: "30 U.",
            3: "15 U.",
            4: "Reatil",
            5: "Mayorista",
            6: "PVP",
            7: "TC",
            8: "Militares",
            9: "09",
            10: "10",
        };

        const payActual = strings[pri];
        return payActual || "Tipo no definido.";

    }

  return (
    <TableRow>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <Image */}
        {/*   alt="product image" */}
        {/*   src={cover} */}
        {/*   sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }} */}
        {/* /> */}

        <Stack spacing={0.5}>
          <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
            {NOMBRE}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            sx={{ typography: 'body2', color: 'text.secondary' }}
          >
            CÓDIGO:
            <Divider orientation="vertical" sx={{ mx: 1, height: 16 }} />
              <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
                  {CODIGO}
              </Typography>
          </Stack>
        </Stack>
      </TableCell>

        <TableCell>{namePriceType(price.PriceList)}</TableCell>

      <TableCell>{fCurrency(price.Price)}</TableCell>

      <TableCell>
        <Box sx={{ width: 96, textAlign: 'right' }}>
          <IncrementerButton
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            disabledDecrease={quantity <= 1}
            disabledIncrease={quantity >= 100}
          />

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              disponible: ...
          </Typography>
        </Box>
      </TableCell>

      <TableCell align="right">{fCurrency(price.Price * quantity)}</TableCell>

      <TableCell align="right">
        <IconButton onClick={onDelete}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
