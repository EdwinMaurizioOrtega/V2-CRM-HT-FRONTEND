import PropTypes from 'prop-types';
import {paramCase} from 'change-case';
// next
import NextLink from 'next/link';
// @mui
import {Box, Card, Link, Stack, Fab, Typography} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../../routes/paths';
// utils
import {fCurrency, fNumber} from '../../../../utils/formatNumber';
// redux
import {useDispatch} from '../../../../redux/store';
import {addToCart} from '../../../../redux/slices/product';
// components
import Iconify from '../../../../components/iconify';
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import {ColorPreview} from '../../../../components/color-utils';

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
    product: PropTypes.object,
};

export default function ShopProductCard({product}) {
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
        IMAGES
    } = product;

    const dispatch = useDispatch();

    // const linkTo = PATH_DASHBOARD.eCommerce.view(paramCase(CODIGO));
    const linkTo = PATH_DASHBOARD.eCommerce.view(CODIGO);

    const handleAddCart = async () => {
        const newProduct = {
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
            // cover,
            // available,
            // price,
            // colors: [colors[0]],
            // size: sizes[0],
            quantity: 1,
        };
        try {
            dispatch(addToCart(newProduct));
        } catch (error) {
            console.error(error);
        }
    };

    let jsonArrayImages = [];
    if (IMAGES !== null) {
        jsonArrayImages = JSON.parse(IMAGES);
    }

    return (
        <Card
            sx={{
                '&:hover .add-cart-btn': {
                    opacity: 1,
                },
            }}
        >
            <Box sx={{position: 'relative', p: 1}}>

                <Label
                    variant="filled"

                    sx={{
                        top: 16,
                        right: 16,
                        zIndex: 9,
                        position: 'absolute',
                        textTransform: 'uppercase',
                    }}
                >
                    SALE
                </Label>


                {/* <Fab */}
                {/*     color="warning" */}
                {/*     size="medium" */}
                {/*     className="add-cart-btn" */}
                {/*     onClick={handleAddCart} */}
                {/*     sx={{ */}
                {/*         right: 16, */}
                {/*         bottom: 16, */}
                {/*         zIndex: 9, */}
                {/*         opacity: 0, */}
                {/*         position: 'absolute', */}
                {/*         transition: (theme) => */}
                {/*             theme.transitions.create('all', { */}
                {/*                 easing: theme.transitions.easing.easeInOut, */}
                {/*                 duration: theme.transitions.duration.shorter, */}
                {/*             }), */}
                {/*     }} */}
                {/* > */}
                {/*     <Iconify icon="ic:round-add-shopping-cart"/> */}
                {/* </Fab> */}

                {/* <Image alt={NOMBRE} src={jsonArrayImages?.map((img) => img.URL)} ratio="1/1" sx={{borderRadius: 1.5}}/> */}

                {jsonArrayImages && jsonArrayImages.length > 0 ? (
                    // Mostrar las imágenes si existen
                    jsonArrayImages.map((img, index) => (
                        <Image key={index} alt={NOMBRE} src={img.URL} ratio="1/1" sx={{borderRadius: 1.5}} />
                    ))
                ) : (
                    // Mostrar una imagen alternativa en caso contrario
                    <img src="/assets/images/sin_imagen.jpg" alt="Imagen alternativa" />
                )}

            </Box>

            <Stack spacing={2.5} sx={{p: 3}}>
                <Link component={NextLink} href={linkTo} color="inherit" variant="subtitle2" noWrap>
                    {NOMBRE}
                </Link>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    {/* <ColorPreview colors={colors} /> */}

                    <Stack direction="row" spacing={0.5} sx={{typography: 'subtitle1'}}>
                        Stock:&nbsp;<Box component="span">{fNumber(TOTAL)}</Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{typography: 'subtitle1'}}>
                        SAP:&nbsp;<Box component="span">{CODIGO}</Box>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    );
}
