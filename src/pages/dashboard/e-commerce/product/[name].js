import {useEffect, useState} from 'react';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {alpha} from '@mui/material/styles';
import {Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Stack} from '@mui/material';
// redux
import {useDispatch, useSelector} from '../../../../redux/store';
import {getProduct, addToCart, gotoStep, getPriceListProduct} from '../../../../redux/slices/product';
// routes
import {PATH_DASHBOARD} from '../../../../routes/paths';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import Iconify from '../../../../components/iconify';
import Markdown from '../../../../components/markdown';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
import {useSettingsContext} from '../../../../components/settings';
import {SkeletonProductDetails} from '../../../../components/skeleton';
// sections
import {
    ProductDetailsSummary,
    ProductDetailsReview,
    ProductDetailsCarousel,
} from '../../../../sections/@dashboard/e-commerce/details';
import CartWidget from '../../../../sections/@dashboard/e-commerce/CartWidget';
import {fNumber} from "../../../../utils/formatNumber";
import {useAuthContext} from "../../../../auth/useAuthContext";

// ----------------------------------------------------------------------

const SUMMARY = [
    {
        title: '100% Original',
        description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
        icon: 'ic:round-verified',
    },
    {
        title: '10 Day Replacement',
        description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
        icon: 'eva:clock-fill',
    },
    {
        title: 'Year Warranty',
        description: 'Cotton candy gingerbread cake I love sugar sweet.',
        icon: 'ic:round-verified-user',
    },
];

// ----------------------------------------------------------------------

EcommerceProductDetailsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceProductDetailsPage() {
    const {themeStretch} = useSettingsContext();

    const {user} = useAuthContext();

    const {
        query: {name},
    } = useRouter();

    const dispatch = useDispatch();

    const {product, pricelistproduct, isLoading, checkout} = useSelector((state) => state.product);

    const [currentTab, setCurrentTab] = useState('description');

    useEffect(() => {
        if (name) {
            dispatch(getProduct(name));

        }
    }, [dispatch, name]);

    useEffect(() => {
        if (name) {

            dispatch(getPriceListProduct(name, user.ID));
        }
    }, [dispatch, name, user.ID]);

    const handleAddCart = (newProduct) => {
        dispatch(addToCart(newProduct));
    };

    const handleGotoStep = (step) => {
        dispatch(gotoStep(step));
    };

    const TABS = [
        {
            value: 'description',
            label: 'description',
            component: product ?

                <>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            MAYORISTAS_CUENCA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.MAYORISTAS_CUENCA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            MAYORISTAS_QUITO
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.MAYORISTAS_QUITO)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            BLU_BAHIA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.BLU_BAHIA)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_BAHIA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_BAHIA)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            ME_COMPRAS_SAMSUNG_ORELLANA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.ME_COMPRAS_SAMSUNG_ORELLANA)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            CELISTIC
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.CELISTIC)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_CARACOL_QUITO
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_CARACOL_QUITO)}</Typography>

                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_CUENCA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_CUENCA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_MALL_GUAYAQUIL
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_MALL_GUAYAQUIL)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_MALL_CUENCA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_MALL_CUENCA)}</Typography>

                    </Stack>


                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_MANTA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_MANTA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            MAYORISTAS_MANTA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.MAYORISTAS_MANTA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            SAMSUNG_PORTOVIEJO
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.SAMSUNG_PORTOVIEJO)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            PADRE_AGUIRRE
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.PADRE_AGUIRRE)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            MATRIZ_CUENCA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.MATRIZ_CUENCA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            STOCK_DE_GARANTIAS_Y_REPUESTOS
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.STOCK_DE_GARANTIAS_Y_REPUESTOS)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            CONSIGNACION
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.CONSIGNACION)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            GADGETS
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.GADGETS)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">

                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            LUIS_CORDERO
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.LUIS_CORDERO)}</Typography>

                    </Stack>


                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            BODEGA_DE_CUARENTENA
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.BODEGA_DE_CUARENTENA)}</Typography>

                    </Stack>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{height: 40, lineHeight: '40px', flexGrow: 1}}>
                            ACCESORIOS
                        </Typography>
                        <Typography variant="subtitle2">{fNumber(product?.ACCESORIOS)}</Typography>

                    </Stack>

                </> : null

        },
        {
            value: 'reviews',
            label: 'Reviews',
            component: product ? <ProductDetailsReview product={product}/> : null,
        },
    ];

    return (
        <>
            <Head>
                <title>{`Ecommerce: ${product?.NOMBRE || ''} | HT`}</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Product Details"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {
                            name: 'E-Commerce',
                            href: PATH_DASHBOARD.eCommerce.root,
                        },
                        {
                            name: 'Shop',
                            href: PATH_DASHBOARD.eCommerce.shop,
                        },
                        {name: product?.NOMBRE},
                    ]}
                />

                <CartWidget totalItems={checkout.totalItems}/>

                {product && (
                    <>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} lg={7}>
                                <ProductDetailsCarousel product={product}/>
                            </Grid>

                            <Grid item xs={12} md={6} lg={5}>
                                <ProductDetailsSummary
                                    product={product}
                                    pricelistproduct={pricelistproduct}
                                    cart={checkout.cart}
                                    onAddCart={handleAddCart}
                                    onGotoStep={handleGotoStep}
                                />
                            </Grid>
                        </Grid>

                        <Box
                            gap={5}
                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                md: 'repeat(3, 1fr)',
                            }}
                            sx={{my: 10}}
                        >
                            {/* {SUMMARY.map((item) => ( */}
                            {/*   <Box key={item.title} sx={{ textAlign: 'center' }}> */}
                            {/*     <Stack */}
                            {/*       alignItems="center" */}
                            {/*       justifyContent="center" */}
                            {/*       sx={{ */}
                            {/*         width: 64, */}
                            {/*         height: 64, */}
                            {/*         mx: 'auto', */}
                            {/*         borderRadius: '50%', */}
                            {/*         color: 'primary.main', */}
                            {/*         bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.08)}`, */}
                            {/*       }} */}
                            {/*     > */}
                            {/*       <Iconify icon={item.icon} width={36} /> */}
                            {/*     </Stack> */}

                            {/*     <Typography variant="h6" sx={{ mb: 1, mt: 3 }}> */}
                            {/*       {item.title} */}
                            {/*     </Typography> */}

                            {/*     <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography> */}
                            {/*   </Box> */}
                            {/* ))} */}
                        </Box>

                        <Card>
                            <Tabs
                                value={currentTab}
                                onChange={(event, newValue) => setCurrentTab(newValue)}
                                sx={{px: 3, bgcolor: 'background.neutral'}}
                            >
                                {TABS.map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label}/>
                                ))}
                            </Tabs>

                            <Divider/>

                            {TABS.map(
                                (tab) =>
                                    tab.value === currentTab && (
                                        <Box
                                            key={tab.value}
                                            sx={{
                                                ...(currentTab === 'description' && {
                                                    p: 3,
                                                }),
                                            }}
                                        >
                                            {tab.component}
                                        </Box>
                                    )
                            )}
                        </Card>
                    </>
                )}

                {isLoading && <SkeletonProductDetails/>}
            </Container>
        </>
    );
}
