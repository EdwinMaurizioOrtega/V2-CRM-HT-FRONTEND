import PropTypes from 'prop-types';
import {useEffect} from 'react';
import {sentenceCase} from 'change-case';
// next
import {useRouter} from 'next/router';
// form
import {Controller, useForm} from 'react-hook-form';
// @mui
import {
    Box,
    Link,
    Stack,
    Button,
    Rating,
    Divider,
    MenuItem,
    Typography,
    IconButton,
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../../routes/paths';
// utils
import {fShortenNumber, fCurrency, fNumber} from '../../../../utils/formatNumber';
// _mock
import {_socials} from '../../../../_mock/arrays';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import {IncrementerButton} from '../../../../components/custom-input';
import {ColorSinglePicker} from '../../../../components/color-utils';
import FormProvider, {RHFSelect, RHFTextField} from '../../../../components/hook-form';
import CustomTextField from "../../../../components/custom-input/CustomTextField";

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
    cart: PropTypes.array,
    onAddCart: PropTypes.func,
    product: PropTypes.object,
    pricelistproduct: PropTypes.object,
    onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({cart, product, pricelistproduct, onAddCart, onGotoStep, ...other}) {
    const {push} = useRouter();

    const {
        CODIGO,
        STATUS,
        NOMBRE,
        MAYORISTAS_CUENCA,
        MAYORISTAS_QUITO,
        BLU_BAHIA,
        SAMSUNG_BAHIA,
        ME_COMPRAS_SAMSUNG_ORELLANA,
        CELISTIC,
        SAMSUNG_CARACOL_QUITO,
        SAMSUNG_CUENCA,
        SAMSUNG_MALL_GUAYAQUIL,
        SAMSUNG_MALL_CUENCA,
        SAMSUNG_MANTA,
        MAYORISTAS_MANTA,
        SAMSUNG_PORTOVIEJO,
        PADRE_AGUIRRE,
        MATRIZ_CUENCA,
        STOCK_DE_GARANTIAS_Y_REPUESTOS,
        CONSIGNACION,
        GADGETS,
        LUIS_CORDERO,
        BODEGA_DE_CUARENTENA,
        ACCESORIOS,
        CATEGORIA,
        MARCA,
        TOTAL,
        quantity,
        sizes,
    } = product;

    const alreadyProduct = cart.map((item) => item.CODIGO).includes(CODIGO);

    const isMaxQuantity =
      cart.filter((item) => item.CODIGO === CODIGO).map((item) => item.quantity)[0] >= 100;

    const defaultValues = {
        CODIGO,
        STATUS,
        NOMBRE,
        MAYORISTAS_CUENCA,
        MAYORISTAS_QUITO,
        BLU_BAHIA,
        SAMSUNG_BAHIA,
        ME_COMPRAS_SAMSUNG_ORELLANA,
        CELISTIC,
        SAMSUNG_CARACOL_QUITO,
        SAMSUNG_CUENCA,
        SAMSUNG_MALL_GUAYAQUIL,
        SAMSUNG_MALL_CUENCA,
        SAMSUNG_MANTA,
        MAYORISTAS_MANTA,
        SAMSUNG_PORTOVIEJO,
        PADRE_AGUIRRE,
        MATRIZ_CUENCA,
        STOCK_DE_GARANTIAS_Y_REPUESTOS,
        CONSIGNACION,
        GADGETS,
        LUIS_CORDERO,
        BODEGA_DE_CUARENTENA,
        ACCESORIOS,
        CATEGORIA,
        MARCA,
        TOTAL,
        quantity: 1,
        price: pricelistproduct[1],
        comment: 'Ninguno.'

    };

    const methods = useForm({
        defaultValues,
    });

    const {reset, watch, control, setValue, handleSubmit} = methods;

    const values = watch();

    useEffect(() => {
        if (product) {
            reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product]);

    const onSubmit = async (data) => {
        try {
          if (!alreadyProduct) {
            onAddCart({
              ...data,
              // colors: [values.colors],
              subtotal: data.price * data.quantity,
            });
          }
          onGotoStep(0);
          push(PATH_DASHBOARD.eCommerce.checkout);
        } catch (error) {
          console.error(error);
        }
    };

    const handleAddCart = async () => {
        try {
          onAddCart({
            ...values,
            // colors: [values.colors],
            subtotal: values.price * values.quantity,
          });
        } catch (error) {
          console.error(error);
        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack
                spacing={3}
                sx={{
                    p: (theme) => ({
                        md: theme.spacing(5, 5, 0, 2),
                    }),
                }}
                {...other}
            >
                <Stack spacing={2}>
                    <Label
                      variant="soft"
                      color="success"
                      sx={{ textTransform: 'uppercase', mr: 'auto' }}
                    >
                      {sentenceCase(CATEGORIA || '')}
                    </Label>

                    <Typography
                      variant="overline"
                      component="div"
                      sx={{
                        color:'error.main',
                      }}
                    >
                      {MARCA}
                    </Typography>

                    <Typography variant="h5">{NOMBRE}</Typography>

                    {/* <Stack direction="row" alignItems="center" spacing={1}> */}
                    {/*   <Rating value={totalRating} precision={0.1} readOnly /> */}

                    {/*   <Typography variant="body2" sx={{ color: 'text.secondary' }}> */}
                    {/*     ({fShortenNumber(totalReview)} */}
                    {/*     reviews) */}
                    {/*   </Typography> */}
                    {/* </Stack> */}


                </Stack>

                <Divider sx={{borderStyle: 'dashed'}}/>

                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                        Lista Precios
                    </Typography>

                    <RHFSelect
                        name="price"
                        size="small"
                        helperText={
                            <Link underline="always" color="inherit">
                                Precio
                            </Link>
                        }
                        sx={{
                            maxWidth: '60%',
                            '& .MuiFormHelperText-root': {
                                mx: 0,
                                mt: 1,
                                textAlign: 'right',
                            },
                        }}
                    >
                        {pricelistproduct.map((price) => (
                          <MenuItem key={price.PriceList} value={price.Price}>
                            {fCurrency(price.Price)} | {price.ListName}
                          </MenuItem>
                        ))}
                    </RHFSelect>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
                        Cantidad
                    </Typography>

                    <Stack spacing={1}>

                        <RHFTextField
                            name="quantity"
                            onChange={(event) => setValue('quantity', Number(event.target.value))}
                            InputProps={{
                                type: 'number',
                            }}
                        />
                        {/* <IncrementerButton */}
                        {/*   name="quantity" */}
                        {/*   quantity={values.quantity} */}
                        {/*   disabledDecrease={values.quantity <= 1} */}
                        {/*   disabledIncrease={values.quantity >= 100} */}
                        {/*   onIncrease={() => setValue('quantity', values.quantity + 1)} */}
                        {/*   onDecrease={() => setValue('quantity', values.quantity - 1)} */}
                        {/* /> */}

                        {/* <Typography */}
                        {/*   variant="caption" */}
                        {/*   component="div" */}
                        {/*   sx={{ textAlign: 'right', color: 'text.secondary' }} */}
                        {/* > */}
                        {/*     Disponible: ... */}
                        {/* </Typography> */}
                    </Stack>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
                        Comentario
                    </Typography>

                    <Stack spacing={1}>
                        <RHFTextField
                            name="comment"
                            onChange={(event) => setValue('comment', event.target.value)}
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

                <Divider sx={{borderStyle: 'dashed'}}/>

                <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      disabled={isMaxQuantity}
                      size="large"
                      color="warning"
                      variant="contained"
                      startIcon={<Iconify icon="ic:round-add-shopping-cart" />}
                      onClick={handleAddCart}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                        Agregar al carrito
                    </Button>

                    <Button fullWidth size="large" type="submit" variant="contained">
                        Comprar
                    </Button>
                </Stack>

                {/* <Stack direction="row" alignItems="center" justifyContent="center"> */}
                {/*   {_socials.map((social) => ( */}
                {/*     <IconButton key={social.name}> */}
                {/*       <Iconify icon={social.icon} /> */}
                {/*     </IconButton> */}
                {/*   ))} */}
                {/* </Stack> */}
            </Stack>
        </FormProvider>
    );
}
