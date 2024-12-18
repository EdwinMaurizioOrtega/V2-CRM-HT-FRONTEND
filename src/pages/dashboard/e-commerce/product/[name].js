import {useEffect, useState} from 'react';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
import {Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Stack, CardHeader} from '@mui/material';
// redux
import {useDispatch, useSelector} from '../../../../redux/store';
import {
    addToCart,
    gotoStep,
} from '../../../../redux/slices/product';
// routes
import {PATH_DASHBOARD} from '../../../../routes/paths';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
import {useSettingsContext} from '../../../../components/settings';
// sections
import {
    ProductDetailsSummary,
    ProductDetailsCarousel,
} from '../../../../sections/@dashboard/e-commerce/details';
import CartWidget from '../../../../sections/@dashboard/e-commerce/CartWidget';
import {useAuthContext} from "../../../../auth/useAuthContext";
import BasicTable from "../../../../sections/_examples/mui/table/BasicTable";
import {HOST_API_KEY} from "../../../../config-global";

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
    console.log("user_data: "+ JSON.stringify( user));

    const {
        query: {name},
    } = useRouter();

    const dispatch = useDispatch();

    //const {pricelistproduct, isLoading, checkout} = useSelector((state) => state.product);
    const {checkout} = useSelector((state) => state.product);
    const [pricelistproduct, setPricelistproduct] = useState([]);
    const [pricelisttomebambaproduct, setPricelisttomebambaproduct] = useState([]);

    const [product, setProduct] = useState(null); // Initial state

    const [currentTab, setCurrentTab] = useState('bodegas');

    //V1
    // useEffect(() => {
    //     if (name) {
    //         dispatch(getProduct(name));
    //
    //     }
    // }, [dispatch, name]);

    //V2
    useEffect(() => {
        async function fetchData() {
            try {
                if (name) {

                    //Perfil cliente mayorista en HT
                    if (user.ROLE === "31") {
                        // Independientemente de si hay una respuesta en la caché o no, se realiza la solicitud de red
                        const networkResponse = await fetch(`${HOST_API_KEY}/hanadb/api/products/customers`);
                        const data = await networkResponse.json();
                        const searchResultsAux = data.products.filter(product => product.CODIGO === name.trim());
                        setProduct(searchResultsAux[0]);

                    } else {
                        //Otro perfil de cualquier compañia.
                        const cache = await caches.open('cache-crm');
                        const response = await cache.match(`${HOST_API_KEY}/hanadb/api/products/?empresa=${user.EMPRESA}`);

                        if (response) {
                            const cachedData = await response.json();
                            const searchResultsAux = cachedData.products.filter(product => product.CODIGO === name.trim());
                            setProduct(searchResultsAux[0]);
                            console.log('Producto encontrado en la caché:', searchResultsAux[0]);
                        }

                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, [name]);

    const [loading, setLoading] = useState(true);


    //Lista de precios por producto
    useEffect(() => {
        //1. Eliminar la lista anterior.
        // dispatch(getClearPriceListProduct());

        // if (name) {
        //     //2. consultar nuevamente.
        //     dispatch(getPriceListProduct(name, user.ID));
        // }

        //V2
        async function fetchData() {
            if (name) {

                try {

                    //Clientes mayoristas
                    if (user.ROLE === "31") {

                        const response = await fetch(`${HOST_API_KEY}/hanadb/api/products/customer_price_list_product?card_code=${user.CARD_CODE}&code_product=${name}`);
                        if (response.status === 200) {
                            const data = await response.json();
                            setPricelistproduct(data.data);
                            console.log("pricelistproduct: " + JSON.stringify(pricelistproduct));

                            // Eliminar el estado de carga aquí, ya que la respuesta es exitosa (código 200).
                            setLoading(false);
                        } else {
                            // Mantener el estado de carga aquí, ya que la respuesta no fue exitosa (código diferente de 200).
                            setLoading(true);
                        }
                    } else {
                        const response = await fetch(`${HOST_API_KEY}/hanadb/api/products/price_list_product?name=${name}&idUser=${user.ID}&empresa=${user.EMPRESA}`);
                        if (response.status === 200) {
                            const data = await response.json();
                            setPricelistproduct(data.data);
                            console.log("pricelistproduct: " + JSON.stringify(pricelistproduct));

                            // Eliminar el estado de carga aquí, ya que la respuesta es exitosa (código 200).
                            setLoading(false);
                        } else {
                            // Mantener el estado de carga aquí, ya que la respuesta no fue exitosa (código diferente de 200).
                            setLoading(true);
                        }
                    }

                    if (user.COMPANY === "TOMEBAMBA") {
                        console.log("La empresa es Tomebamba...")

                        const response = await fetch(`${HOST_API_KEY}/hanadb/api/products/price_list_tomebamba_product?code_product=${name}`);
                        if (response.status === 200) {
                            const data = await response.json();
                            setPricelisttomebambaproduct(data.data);
                            console.log("PriceListTomebambaProduct: " + JSON.stringify(data.data));

                            // Eliminar el estado de carga aquí, ya que la respuesta es exitosa (código 200).
                            setLoading(false);
                        } else {
                            // Mantener el estado de carga aquí, ya que la respuesta no fue exitosa (código diferente de 200).
                            setLoading(true);
                        }


                    }

                } catch (error) {
                    console.error('Error fetching data:', error);
                    setPricelistproduct([]);
                    // Eliminar el estado de carga en caso de error también.
                    setLoading(false);
                }

            }
        }

        // Call the async function immediately
        fetchData();

    }, [dispatch, name, user.ID]);

    const handleAddCart = (newProduct) => {
        dispatch(addToCart(newProduct));
    };

    const handleGotoStep = (step) => {
        dispatch(gotoStep(step));
    };

    const [resultado, setResultado] = useState(null);

    const functionStock = (dato) => {
        console.log("dato: " + dato);
        setResultado(dato);
    }

    const TABS = [
        {
            value: 'bodegas',
            label: 'bodegas',
            component: product ?

                <>
                    <Container sx={{my: 10}}>
                        <Stack spacing={3}>

                            <Card>
                                <CardHeader title="Stockk"/>
                                <BasicTable code={name}
                                            validateStock={functionStock}
                                />
                            </Card>

                        </Stack>
                    </Container>

                </> : null

        },
        // {
        //     value: 'reviews',
        //     label: 'Reviews',
        //     component: product ? <ProductDetailsReview product={product}/> : null,
        // },
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
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root
                        },
                        {
                            name: 'E-Commerce',
                            href: user.ROLE !== '31' ? PATH_DASHBOARD.eCommerce.list : PATH_DASHBOARD.eCommerce.shop,
                        },
                        {
                            name: user.ROLE !== '31' ? 'List' : 'Shop',
                            href: user.ROLE !== '31' ? PATH_DASHBOARD.eCommerce.list : PATH_DASHBOARD.eCommerce.shop,
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
                                    loading={loading}
                                    pricelistproduct={pricelistproduct}
                                    pricelisttomebambaproduct={pricelisttomebambaproduct}
                                    cart={checkout.cart}
                                    onAddCart={handleAddCart}
                                    onGotoStep={handleGotoStep}
                                    user={user}
                                    onStockValidate={resultado}
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

                        {/*{*/}
                        {/*    user.COMPANY !== 'TOMEBAMBA' ? (*/}

                        {user.ROLE !== '31' && (

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


                        )}


                    </>
                )}

                {/* {isLoading && <SkeletonProductDetails/>} */}
            </Container>
        </>
    );
}
