import {useEffect, useState} from 'react';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {
    Grid,
    Container,
    Button,
    Typography,
    Box,
    Modal,
    Checkbox,
    FormControlLabel,
    Autocomplete,
    TextField
} from '@mui/material';
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
    applyServientrega,
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
import {Block} from "../../../sections/_examples/Block";

// ----------------------------------------------------------------------

const STEPS = ['Mi carrito', 'Cliente', 'Finalizar'];

// ----------------------------------------------------------------------

EcommerceCheckoutPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceCheckoutPage() {
    const {replace} = useRouter();

    const {user} = useAuthContext();

    //console.log('user: ' + JSON.stringify(user));

    const {themeStretch} = useSettingsContext();

    const dispatch = useDispatch();

    const {checkout} = useSelector((state) => state.product);

    const {cart, billing, activeStep} = checkout;

    const completed = activeStep === STEPS.length;

    const [loading, setLoading] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState([]);

    const [otroMotivo, setOtroMotivo] = useState("");
    const [numeroLocales, setNumeroLocales] = useState("");


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

    const handleTomebambaNextStep = () => {
        //Ir al paso de selección de dirección (Step 1)
        dispatch(nextStep());
    };

    const handleTomebambaFinalize = (direccion) => {
        //Envio
        dispatch(applyShipping(0))

        //Servientrega con la dirección seleccionada
        dispatch(applyServientrega(direccion))

        // Bodegas Mayoristas para Tomebamba
        if (user.EMPRESA === '0992537442001') {
            dispatch(applyWarehouse("030"));
        } else {
            dispatch(applyWarehouse("030"));
        }

        //Opciones de pago
        dispatch(applyMethod(4))

        //Finalizar
        dispatch(gotoStep(STEPS.length))
    };

    const handleCustomerNextStep = () => {

        //console.log("Crear Orden Customer Mayorista.")

        //Saltarse a finalizar la orden.
        dispatch(gotoStep(3));

        //Cliente
        dispatch(createBilling({
            ID: user.CARD_CODE,
        }))

        //Envio
        dispatch(applyShipping(0))

        //Servientrega
        dispatch(applyServientrega())

        //Bodegas
        dispatch(applyWarehouse("019"))

        //Opciones de pago
        dispatch(applyMethod(4))
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
        // dispatch(nextStep());
        //console.log(address);
        // if (address.TIENE_PLATAFORMA_CREDITO === 'NO') {
        //     handleOpen();
        // } else {
        //     dispatch(nextStep());
        // }
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

    const handleApplyServientrega = (value) => {
        dispatch(applyServientrega(value));
    };

    // const fechaCreacion = format(new Date(), 'dd-MM-yyyy HH:mm:ss');

    //Crear el pedido y enviar al área de aprobación
    const handleReset = async () => {
        if (completed) {
            //console.log('DATA', checkout);

            try {

                setLoading(true); // Activar el estado de carga

                const response = await axios.post('/hanadb/api/orders/order', {
                    checkoutData: checkout,
                    checkoutUser: user
                });

                //console.log('Status crear orden SAP:', response.status);
                if (response.status === 201) {
                    await Promise.all([dispatch(resetCart()), replace(PATH_DASHBOARD.invoice.list)]);
                } else {
                    //console.log('La solicitud no devolvió un estado 201.');
                    // Realizar alguna acción adicional en caso de que el estado de respuesta no sea 201
                }
            } catch (error) {
                //console.log('Error al crear la orden:', error);
                // Manejar el error al crear la orden
            } finally {
                setLoading(false); // Desactivar el estado de carga
            }
        }
    };

    // const vaciarcarrito = () => {
    //     dispatch(resetCart());
    // }

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);





    const handleDespuesSave = async () => {
        dispatch(nextStep());
        handleClose()
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

                {/* <Button variant="contained" onClick={vaciarcarrito}>Vaciar Carrito</Button> */}

                {completed ? (
                    <CheckoutOrderComplete loading={loading} open={completed} onReset={handleReset}/>
                ) : (
                    <>
                        {activeStep === 0 && (
                            <CheckoutCart
                                checkout={checkout}
                                onNextStep={handleNextStep}
                                onTomebambaNextStep={handleTomebambaNextStep}
                                onCustomerNextStep={handleCustomerNextStep}
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
                                onNextStep={handleNextStep}
                                onTomebambaFinalize={handleTomebambaFinalize}
                                deliveryOptions={[
                                    {
                                        value: 0,
                                        title: 'Gratis',
                                        description: 'Retiro en oficina o entrega sin costo'
                                    },
                                    {
                                        value: 1,
                                        title: 'Servientrega',
                                        description: 'Envío por courier'
                                    },
                                ]}
                                onApplyShipping={handleApplyShipping}
                                onApplyServientrega={handleApplyServientrega}
                                onApplyComment={handleApplyComment}
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
                                onApplyServientrega={handleApplyServientrega}
                                onReset={handleReset}
                            />
                        )}

                    </>
                )}
            </Container>
        </>
    );
}

export const plataformas_de_credito = [
    {title: 'Ninguna', id: 1},
    {title: 'PayJoy', id: 2},
    {title: 'HappyPay', id: 3},
    {title: 'Uphone', id: 4},
    {title: 'Propio', id: 5},
    {title: 'Otro', id: 6}
];