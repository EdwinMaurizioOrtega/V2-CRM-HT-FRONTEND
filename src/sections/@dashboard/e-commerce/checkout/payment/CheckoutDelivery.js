import PropTypes from 'prop-types';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import {
    Box,
    Card,
    Radio,
    Paper,
    Typography,
    RadioGroup,
    CardHeader,
    CardContent,
    FormControlLabel, Stack, Button, Divider,
} from '@mui/material';
// components
import Iconify from '../../../../../components/iconify';
import {RHFTextField} from "../../../../../components/hook-form";
import {resetCart} from "../../../../../redux/slices/product";
import {dispatch} from "../../../../../redux/store";

// ----------------------------------------------------------------------

CheckoutDelivery.propTypes = {
  onApplyShipping: PropTypes.func,
  deliveryOptions: PropTypes.array,
    onApplyComment: PropTypes.func,
};




export default function CheckoutDelivery({ billing, total, deliveryOptions, onApplyShipping, onApplyComment, ...other }) {
  const { control } = useFormContext();


    //Analisamos la cadena de texto y la convertimos en un arreglo valido.
    let billingEnvioArray = [];

    try {
        billingEnvioArray = JSON.parse(billing?.ENVIO || '[]');
    } catch (error) {
        console.error('Error al analizar la cadena JSON:', error);
    }


    const vaciarcarrito = () => {
        dispatch(resetCart());
    }

  return (
    <Card {...other}>

        <Button variant="contained" onClick={vaciarcarrito}>Eliminar Pedido</Button>

        <CardHeader title="Opciones de entrega" />

        {/* <Typography variant="h3" sx={{ mb: 5 }}> */}
        {/*     Valor total: ${total} */}
        {/* </Typography> */}
      <CardContent>
        <Controller
          name="delivery"
          control={control}
          render={({ field }) => (
            <RadioGroup
              {...field}
              onChange={(event) => {
                const { value } = event.target;
                field.onChange(Number(value));
                onApplyShipping(Number(value));
              }}
            >
              <Box
                gap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                  {/* V1 */}
                {deliveryOptions.map((option) => (
                  <DeliveryOption
                    key={option.value}
                    option={option}
                    isSelected={field.value === option.value}
                  />
                ))}


                {/* V2 */}
                  {/* { */}
                  {/*     deliveryOptions.map((option, index) => { */}
                  {/*         if (total < 1000 && (index === 1 || index === 2 || index === 3 || index === 4) ) { */}
                  {/*             return ( */}
                  {/*                 <DeliveryOption */}
                  {/*                     key={option.value} */}
                  {/*                     option={option} */}
                  {/*                     isSelected={field.value === option.value} */}
                  {/*                 /> */}
                  {/*             ); */}
                  {/*         } else if (total > 1000 && index === 0) { */}
                  {/*             return ( */}
                  {/*                 <DeliveryOption */}
                  {/*                     key={option.value} */}
                  {/*                     option={option} */}
                  {/*                     isSelected={field.value === option.value} */}
                  {/*                 /> */}
                  {/*             ); */}
                  {/*         } */}
                  {/*         return null; */}
                  {/*     }) */}
                  {/* } */}



              </Box>
            </RadioGroup>
          )}
        />


          <Stack >

              <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>

              </Typography>

              <Stack spacing={1}>
                  <RHFTextField
                      label="Comentario"
                      name="commentEnvio"
                      onKeyUp={(event) => {
                          const { value } = event.target;
                          onApplyComment(value);
                      }}
                  />
                  <Typography
                      variant="caption"
                      component="div"
                      sx={{ textAlign: 'right', color: 'text.secondary' }}
                  >
                      Observación por el vendedor.
                  </Typography>
              </Stack>
          </Stack>

          <Divider/>
          <Stack direction="row" justifyContent="space-evenly">
              <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
                  DIRECCIONES:
              </Typography>

              <Stack spacing={1}>


                  <RadioGroup>
                      {billingEnvioArray.map((item, index) => (
                          <FormControlLabel
                              key={index}
                              value={index}
                              control={<Radio />}
                              label={ item.TIPO +' | ' + item.DIRECCION}
                          />
                      ))}
                  </RadioGroup>


              </Stack>
          </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

DeliveryOption.propTypes = {
  option: PropTypes.object,
  isSelected: PropTypes.bool,
};

function DeliveryOption({ option, isSelected }) {
  const { value, title, description } = option;

  return (
    <Paper
      variant="outlined"
      key={value}
      sx={{
        display: 'flex',
        alignItems: 'center',
        transition: (theme) => theme.transitions.create('all'),
        ...(isSelected && {
          boxShadow: (theme) => theme.customShadows.z20,
        }),
      }}
    >
      <FormControlLabel
        value={value}
        control={<Radio checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />} />}
        label={
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle2">{title}</Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          </Box>
        }
        sx={{ py: 3, px: 2.5, flexGrow: 1, mr: 0 }}
      />
    </Paper>
  );
}
