import {useState, useEffect} from 'react';
import orderBy from 'lodash/orderBy';
// form
import {useForm} from 'react-hook-form';
// next
import Head from 'next/head';
// @mui
import {Container, Typography, Stack} from '@mui/material';
// redux
import {useDispatch, useSelector} from '../../../redux/store';
import {getProducts} from '../../../redux/slices/product';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import FormProvider from '../../../components/hook-form';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import {useSettingsContext} from '../../../components/settings';
// sections
import {
    ShopTagFiltered,
    ShopProductSort,
    ShopProductList,
    ShopFilterDrawer,
    ShopProductSearch,
} from '../../../sections/@dashboard/e-commerce/shop';
import CartWidget from '../../../sections/@dashboard/e-commerce/CartWidget';

// ----------------------------------------------------------------------

EcommerceShopPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceShopPage() {

    //Registrar el Service worker
    useEffect(() => {

        if (window.location.pathname === '/dashboard/e-commerce/shop/') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(function (registration) {
                        // Registro exitoso
                        console.log('Service Worker registrado con éxito:', registration.scope);
                    })
                    .catch(function (error) {
                        // Error en el registro
                        console.log('Error al registrar el Service Worker:', error);
                    });
            }
        }
    }, []);

    const {themeStretch} = useSettingsContext();

    const dispatch = useDispatch();

    const {checkout} = useSelector((state) => state.product);
    //cache
    const [products, setProducts] = useState([]);


    const [openFilter, setOpenFilter] = useState(false);

    const defaultValues = {
        gender: [],
        category: 'All',
        colors: [],
        priceRange: [0, 200],
        rating: '',
        sortBy: 'featured',
    };

    const methods = useForm({
        defaultValues,
    });

    const {
        reset,
        watch,
        formState: {dirtyFields},
    } = methods;

    const isDefault =
        (!dirtyFields.gender &&
            !dirtyFields.category &&
            !dirtyFields.colors &&
            !dirtyFields.priceRange &&
            !dirtyFields.rating) ||
        false;

    const values = watch();

    const dataFiltered = applyFilter(products, values);
    //
    // useEffect(() => {
    //   dispatch(getProducts());
    // }, [dispatch]);
    //


    useEffect(() => {
        const fetchData = async () => {
            try {
                const cache = await caches.open('cache-crm');
                const response = await cache.match('https://crm.lidenar.com/hanadb/api/products');

                if (response) {
                    // Si hay una respuesta en la caché, se obtiene su contenido
                    const cachedData = await response.json();
                    setProducts(cachedData.products);
                    console.log(cachedData);
                }

                // Independientemente de si hay una respuesta en la caché o no, se realiza la solicitud de red
                const networkResponse = await fetch('https://crm.lidenar.com/hanadb/api/products');
                const data = await networkResponse.json();

                // Se almacena la respuesta de red en la caché
                await cache.put('https://crm.lidenar.com/hanadb/api/products', new Response(JSON.stringify(data)));

                // Si había una respuesta en la caché, los productos ya se establecieron en el estado
                // Si no había respuesta en la caché, ahora se establecen los productos con los datos de la respuesta de red
                setProducts(data.products);
                console.log(data);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, []);


    const handleResetFilter = () => {
        reset();
    };

    const handleOpenFilter = () => {
        setOpenFilter(true);
    };

    const handleCloseFilter = () => {
        setOpenFilter(false);
    };

    return (
        <>
            <Head>
                <title> Ecommerce: Shop | HT</title>
            </Head>

            <FormProvider methods={methods}>
                <Container maxWidth={themeStretch ? false : 'lg'}>
                    <CustomBreadcrumbs
                        heading="Tienda"
                        links={[
                            {name: 'Dashboard', href: PATH_DASHBOARD.root},
                            {
                                name: 'E-Commerce',
                                href: PATH_DASHBOARD.eCommerce.root,
                            },
                            {name: 'Shop'},
                        ]}
                    />

                    <Stack
                        spacing={2}
                        direction={{xs: 'column', sm: 'row'}}
                        alignItems={{sm: 'center'}}
                        justifyContent="space-between"
                        sx={{mb: 2}}
                    >
                        <ShopProductSearch/>

                        <Stack direction="row" spacing={1} flexShrink={0} sx={{my: 1}}>
                            <ShopFilterDrawer
                                isDefault={isDefault}
                                open={openFilter}
                                onOpen={handleOpenFilter}
                                onClose={handleCloseFilter}
                                onResetFilter={handleResetFilter}
                            />

                            {/* <ShopProductSort /> */}
                        </Stack>
                    </Stack>

                    <Stack sx={{mb: 3}}>
                        {!isDefault && (
                            <>
                                <Typography variant="body2" gutterBottom>
                                    <strong>{dataFiltered.length}</strong>
                                    &nbsp;Products found
                                </Typography>

                                {/* <ShopTagFiltered isFiltered={!isDefault} onResetFilter={handleResetFilter} /> */}
                            </>
                        )}
                    </Stack>

                    <ShopProductList products={dataFiltered} loading={!products.length && isDefault}/>

                    <CartWidget totalItems={checkout.totalItems}/>
                </Container>
            </FormProvider>
        </>
    );
}

// ----------------------------------------------------------------------

function applyFilter(products, filters) {
    const {gender, category, colors, priceRange, rating, sortBy} = filters;

    const min = priceRange[0];

    const max = priceRange[1];

    // SORT BY
    if (sortBy === 'featured') {
        products = orderBy(products, ['sold'], ['desc']);
    }

    if (sortBy === 'newest') {
        products = orderBy(products, ['createdAt'], ['desc']);
    }

    if (sortBy === 'priceDesc') {
        products = orderBy(products, ['price'], ['desc']);
    }

    if (sortBy === 'priceAsc') {
        products = orderBy(products, ['price'], ['asc']);
    }

    // FILTER PRODUCTS
    if (gender.length) {
        products = products.filter((product) => gender.includes(product.MARCA));
    }

    if (category !== 'All') {
        products = products.filter((product) => product.CATEGORIA === category);
    }

    if (colors.length) {
        products = products.filter((product) => product.colors.some((color) => colors.includes(color)));
    }

    if (min !== 0 || max !== 200) {
        products = products.filter((product) => product.price >= min && product.price <= max);
    }

    if (rating) {
        products = products.filter((product) => {
            const convertRating = (value) => {
                if (value === 'up4Star') return 4;
                if (value === 'up3Star') return 3;
                if (value === 'up2Star') return 2;
                return 1;
            };
            return product.totalRating > convertRating(rating);
        });
    }

    return products;
}
