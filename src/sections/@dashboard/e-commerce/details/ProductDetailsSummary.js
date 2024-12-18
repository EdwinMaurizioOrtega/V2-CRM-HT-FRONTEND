import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
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
import {useSnackbar} from "../../../../components/snackbar";
import {useAuthContext} from "../../../../auth/useAuthContext";

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
    cart: PropTypes.array,
    onAddCart: PropTypes.func,
    product: PropTypes.object,
    onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({
                                                  cart,
                                                  product,
                                                  loading,
                                                  pricelistproduct,
                                                  pricelisttomebambaproduct,
                                                  onAddCart,
                                                  onGotoStep,
                                                  user,
                                                  onStockValidate,
                                                  ...other
                                              }) {
    const {push} = useRouter();

    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedTomebambaPrice, setSelectedTomebambaPrice] = useState(null);

    const {
        CODIGO,
        SKU,
        STATUS,
        NOMBRE,
        MAYORISTAS_CUENCA,
        MAYORISTAS_QUITO,
        MAYORISTAS_GUAYAQUIL,
        SAMSUNG_BAHIA,
        ME_COMPRAS_SAMSUNG_ORELLANA,
        CENTRO_DE_DISTRIBUCION_HT,
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
        SKU,
        STATUS,
        NOMBRE,
        MAYORISTAS_CUENCA,
        MAYORISTAS_QUITO,
        MAYORISTAS_GUAYAQUIL,
        SAMSUNG_BAHIA,
        ME_COMPRAS_SAMSUNG_ORELLANA,
        CENTRO_DE_DISTRIBUCION_HT,
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
        price: '',
        comment: 'Ninguno..'
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
        //console.log("data: "+ data);
        try {
            if (!alreadyProduct) {
                console.log("data: " + data);
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
        // //console.log("values: "+ values.price.Price);

        console.log("user: " + JSON.stringify(user));

        //Hipertronics
        if (user.EMPRESA === '0992537442001') {

            if (user.COMPANY === "TOMEBAMBA") {

                if (selectedTomebambaPrice) {
                    const primerObjeto = pricelistproduct[0];
                    console.log("primerObjeto: " + JSON.stringify(primerObjeto));

                    try {
                        onAddCart({
                            ...values,
                            // colors: [values.colors],
                            price: primerObjeto,
                            priceTomebamba: selectedTomebambaPrice,
                            subtotal: values.price.Price * values.quantity,
                        });
                    } catch (error) {
                        console.error(error);
                    }

                } else {
                    alert("Te falto seleccionar un tipo de precio. 😅")
                }

            } else {

                if (selectedPrice) {
                    try {
                        onAddCart({
                            ...values,
                            // colors: [values.colors],
                            price: selectedPrice,
                            subtotal: values.price.Price * values.quantity,
                        });
                    } catch (error) {
                        console.error(error);
                    }

                } else {
                    alert("Te falto seleccionar un tipo de precio. 😅")
                }

            }

            //Solo para lidenar
            if (user.COMPANY === 'HT' && user.ROLE !== '31') {

                const sumaDisponible = onStockValidate.reduce((total, producto) => total + Number(producto.DISPONIBLE), 0);

                if (sumaDisponible >= values.quantity) {
                    alert("🙂Stock disponible. ✅")

                } else {
                    alert(`😤El stock disponible ${sumaDisponible} ✅ es menor al número ${values.quantity} 🙄 de unidades ingresadas.😮‍💨
                        ${onStockValidate[0].BODEGA == '019' ? " CD-HT" : null}  ${Number(onStockValidate[0].DISPONIBLE)}
                        ${onStockValidate[1].BODEGA == '002' ? "CUENCA" : null}  ${Number(onStockValidate[1].DISPONIBLE)}
                        ${onStockValidate[2].BODEGA == '024' ? " MANTA" : null}  ${Number(onStockValidate[2].DISPONIBLE)}
                        ${onStockValidate[3].BODEGA == '030' ? " COLÓN" : null}  ${Number(onStockValidate[3].DISPONIBLE)}
                        `);
                }
            }
        }

        //MovilCelistic
        if (user.EMPRESA === '1792161037001') {
            if (selectedPrice) {
                try {
                    onAddCart({
                        ...values,
                        // colors: [values.colors],
                        price: selectedPrice,
                        subtotal: values.price.Price * values.quantity,
                    });
                } catch (error) {
                    console.error(error);
                }

            } else {
                alert("Te falto seleccionar un tipo de precio. 😅")
            }
        }

        //console.log("onStockValidate: "+JSON.stringify( onStockValidate));
        // console.log("onValueQuality: "+JSON.stringify(values.quantity));

    };

    // useEffect(() => {
    //     // Simulamos un tiempo de carga de 2 segundos para la animación
    //     const loadingTimeout = setTimeout(() => {
    //         setLoading(false);
    //     }, 5000);
    //
    //     return () => clearTimeout(loadingTimeout);
    // }, []);

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
                        sx={{textTransform: 'uppercase', mr: 'auto'}}
                    >
                        {sentenceCase(CATEGORIA || '')}
                    </Label>

                    <Typography
                        variant="overline"
                        component="div"
                        sx={{
                            color: 'error.main',
                        }}
                    >
                        {MARCA}
                    </Typography>

                    <Typography variant="h5">{NOMBRE}</Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        {/* <Rating value={totalRating} precision={0.1} readOnly /> */}

                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                            SAP: {CODIGO} SKU: {SKU}
                        </Typography>
                    </Stack>


                </Stack>

                <Divider sx={{borderStyle: 'dashed'}}/>

                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{height: 36, lineHeight: '36px'}}>
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
                    <Typography variant="subtitle2" sx={{height: 36, lineHeight: '36px'}}>
                        {user.ROLE === '31' ? 'Precio sugerido' : 'Comentario'}
                    </Typography>

                    <Stack spacing={1}>
                        <RHFTextField
                            name="comment"
                            onChange={(event) => setValue('comment', event.target.value)}
                        />

                        <Typography
                            variant="caption"
                            component="div"
                            sx={{textAlign: 'right', color: 'text.secondary'}}
                        >
                            Observación por el vendedor.
                        </Typography>
                    </Stack>
                </Stack>

                {user.COMPANY !== "TOMEBAMBA" ? (
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            Lista Precios
                        </Typography>


                        {loading ? (
                            <LoadingComponent/>
                        ) : (

                            <RHFSelect
                                name="price"
                                size="small"
                                helperText={
                                    <Link underline="always" color="inherit">
                                        Precio: {selectedPrice && (
                                        <>{fCurrency(selectedPrice.Price)}</>
                                    )}
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
                                onChange={(event) => setSelectedPrice(event.target.value)}
                                value={selectedPrice}
                            >

                                {
                                    pricelistproduct.map((price) => (
                                        <MenuItem key={price.PriceList} value={price}>
                                            {price.ListName} | {fCurrency(price.Price)}+
                                            {CODIGO !== '15.60.09' ?
                                                fCurrency(price.Price * 0.15)
                                                : 0
                                            }
                                            = {CODIGO !== '15.60.09' ?
                                            fCurrency(price.Price * 1.15)
                                            : fCurrency(price.Price)
                                        }
                                        </MenuItem>

                                    ))}


                            </RHFSelect>

                        )}

                    </Stack>

                ) : (

                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            Tomebamba Price
                        </Typography>

                        {loading ? (
                            <LoadingComponent/>
                        ) : (

                            <RHFSelect
                                name="price"
                                size="small"
                                helperText={
                                    <Link underline="always" color="inherit">
                                        Precio: {selectedTomebambaPrice && (
                                        <>{fCurrency(selectedTomebambaPrice.PRICE)}</>
                                    )}
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
                                onChange={(event) => setSelectedTomebambaPrice(event.target.value)}
                                value={selectedTomebambaPrice}
                            >

                                {
                                    pricelisttomebambaproduct.map((price) => (
                                        <MenuItem key={price.PRICE_LIST} value={price}>
                                            {price.LIST_NAME} | {fCurrency(price.PRICE)}+{fCurrency(price.PRICE * 0.15)} = {fCurrency(price.PRICE * 1.15)}
                                        </MenuItem>

                                    ))}


                            </RHFSelect>

                        )}

                    </Stack>

                )
                }

                <Divider sx={{borderStyle: 'dashed'}}/>

                <Stack direction="row" spacing={2}>


                    <Button
                        fullWidth
                        disabled={isMaxQuantity}
                        size="large"
                        color="warning"
                        variant="contained"
                        startIcon={<Iconify icon="ic:round-add-shopping-cart"/>}
                        onClick={handleAddCart}
                        sx={{whiteSpace: 'nowrap'}}
                    >
                        Agregar
                    </Button>


                    {/* <Button fullWidth size="large" type="submit" variant="contained"> */}
                    {/*     Comprar */}
                    {/* </Button> */}
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


const LoadingComponent = () => {
    return (
        <>
            {/* <p className="ml-2 mb-0">Cargando...</p> */}
            <img src="/assets/images/loading.gif" height="75px" alt="Loading"/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </>

    );
};
