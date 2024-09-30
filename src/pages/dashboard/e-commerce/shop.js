import {useState, useEffect} from 'react';
import orderBy from 'lodash/orderBy';
// form
import {useForm} from 'react-hook-form';
// next
import Head from 'next/head';
// @mui
import {Container, Typography, Stack, TextField} from '@mui/material';
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
import {HOST_API_KEY} from "../../../config-global";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

EcommerceShopPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceShopPage() {

    const {user} = useAuthContext();

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

                // Independientemente de si hay una respuesta en la caché o no, se realiza la solicitud de red
                const networkResponse = await fetch(`${HOST_API_KEY}/hanadb/api/products/?empresa=${user.EMPRESA}`);
                const data = await networkResponse.json();
                setProducts(data.products);
                console.log("products: "+data);

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

    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar los productos según el término de búsqueda
    const filteredProducts = dataFiltered.filter(product =>
        product.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase())
    );


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
                        {/* <ShopProductSearch/> */}

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


                        <TextField
                            label="Buscar productos..."
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Stack>

                    <Stack sx={{mb: 3}}>
                        {!isDefault && (
                            <>
                                <Typography variant="body2" gutterBottom>
                                    <strong>{dataFiltered.length}</strong>
                                    &nbsp;Productos encontrados
                                </Typography>

                                {/* <ShopTagFiltered isFiltered={!isDefault} onResetFilter={handleResetFilter} /> */}
                            </>
                        )}
                    </Stack>

                    <ShopProductList products={filteredProducts} loading={!products.length && isDefault}/>

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
