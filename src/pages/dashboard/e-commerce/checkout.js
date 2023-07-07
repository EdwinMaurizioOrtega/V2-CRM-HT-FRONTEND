import {useEffect, useState} from 'react';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {Grid, Container, Button} from '@mui/material';
// routes
import {format} from "date-fns";
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// redux
import {useDispatch, useSelector} from '../../../redux/store';
import {
    resetCart,
    getCart,
    nextStep,
    backStep,
    gotoStep,
    deleteCart,
    createBilling,
    applyComment,
    applyShipping,
    applyWarehouse,
    applyMethod,
    applyDiscount,
    increaseQuantity,
    decreaseQuantity,
} from '../../../redux/slices/product';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import {useSettingsContext} from '../../../components/settings';
// sections
import {
    CheckoutCart,
    CheckoutSteps,
    CheckoutPayment,
    CheckoutOrderComplete,
    CheckoutBillingAddress,
} from '../../../sections/@dashboard/e-commerce/checkout';
// utils
import axios from "../../../utils/axios";
import {useAuthContext} from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

const STEPS = ['Mi carrito', 'Facturación & cliente', 'Pago'];

// ----------------------------------------------------------------------

EcommerceCheckoutPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceCheckoutPage() {
    const {replace} = useRouter();

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const dispatch = useDispatch();

    const {checkout} = useSelector((state) => state.product);

    const {cart, billing, activeStep} = checkout;

    const completed = activeStep === STEPS.length;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getCart(cart));
    }, [dispatch, cart]);

    useEffect(() => {
        if (activeStep === 1) {
            dispatch(createBilling(null));
        }
    }, [dispatch, activeStep]);

    const handleNextStep = () => {
        dispatch(nextStep());
    };

    const handleBackStep = () => {
        dispatch(backStep());
    };

    const handleGotoStep = (step) => {
        dispatch(gotoStep(step));
    };

    const handleApplyDiscount = (value) => {
        if (cart.length) {
            dispatch(applyDiscount(value));
        }
    };

    const handleDeleteCart = (productId) => {
        dispatch(deleteCart(productId));
    };

    const handleIncreaseQuantity = (productId) => {
        dispatch(increaseQuantity(productId));
    };

    const handleDecreaseQuantity = (productId) => {
        dispatch(decreaseQuantity(productId));
    };

    const handleCreateBilling = (address) => {
        dispatch(createBilling(address));
        dispatch(nextStep());
    };
// Comentario envío.
    const handleApplyComment = (value) => {
        dispatch(applyComment(value));
    };

    const handleApplyShipping = (value) => {
        dispatch(applyShipping(value));
    };

// Bodegas
    const handleApplyWarehouse = (value) => {
        dispatch(applyWarehouse(value));
    };
    // Formas de pago
    const handleApplyMethod = (value) => {
        dispatch(applyMethod(value));
    };

    // const fechaCreacion = format(new Date(), 'dd-MM-yyyy HH:mm:ss');

    const handleReset = async () => {
        if (completed) {
            console.log('DATA', checkout);

            try {

                setLoading(true); // Activar el estado de carga

                const response = await axios.post('/hanadb/api/orders/order', {
                    checkoutData: checkout,
                    checkoutUser: user
                });

                console.log('Status crear orden SAP:', response.status);
                if (response.status === 201) {
                    await Promise.all([dispatch(resetCart()), replace(PATH_DASHBOARD.invoice.list)]);
                } else {
                    console.log('La solicitud no devolvió un estado 201.');
                    // Realizar alguna acción adicional en caso de que el estado de respuesta no sea 201
                }
            } catch (error) {
                console.log('Error al crear la orden:', error);
                // Manejar el error al crear la orden
            } finally {
                setLoading(false); // Desactivar el estado de carga
            }
        }
    };


    const vaciarcarrito = () => {
        dispatch(resetCart());
    }

    return (
        <>
            <Head>
                <title> Ecommerce: Checkout | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Checkout"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {
                            name: 'E-Commerce',
                            href: PATH_DASHBOARD.eCommerce.root,
                        },
                        {name: 'Checkout'},
                    ]}
                />

                <Grid container justifyContent={completed ? 'center' : 'flex-start'}>
                    <Grid item xs={12} md={8}>
                        <CheckoutSteps activeStep={activeStep} steps={STEPS}/>
                    </Grid>
                </Grid>

                <Button variant="contained" onClick={vaciarcarrito}>Vaciar Carrito</Button>

                {completed ? (
                        <CheckoutOrderComplete loading={loading} open={completed} onReset={handleReset}/>
                ) : (
                    <>
                        {activeStep === 0 && (
                            <CheckoutCart
                                checkout={checkout}
                                onNextStep={handleNextStep}
                                onDeleteCart={handleDeleteCart}
                                onApplyDiscount={handleApplyDiscount}
                                onIncreaseQuantity={handleIncreaseQuantity}
                                onDecreaseQuantity={handleDecreaseQuantity}
                            />
                        )}
                        {activeStep === 1 && (
                            <CheckoutBillingAddress
                                checkout={checkout}
                                onBackStep={handleBackStep}
                                onCreateBilling={handleCreateBilling}
                            />
                        )}
                        {activeStep === 2 && billing && (
                            <CheckoutPayment
                                checkout={checkout}
                                onNextStep={handleNextStep}
                                onBackStep={handleBackStep}
                                onGotoStep={handleGotoStep}
                                onApplyComment={handleApplyComment}
                                onApplyShipping={handleApplyShipping}
                                onApplyWarehouse={handleApplyWarehouse}
                                onApplyMethod={handleApplyMethod}
                                onReset={handleReset}
                            />
                        )}
                    </>
                )}
            </Container>
        </>
    );
}
