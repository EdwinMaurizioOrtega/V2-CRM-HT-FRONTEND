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

// ----------------------------------------------------------------------

const STEPS = ['Mi carrito', 'Cliente', 'Finalizar'];

// ----------------------------------------------------------------------

EcommerceCheckoutPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceCheckoutPage() {
    const {replace} = useRouter();

    const {user} = useAuthContext();

    console.log('user: '+JSON.stringify( user));

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

    const handleTomebambaNextStep = () => {

        console.log("Crear Orden Tomebamba.")

        //Saltarse a finalizar la orden.
        dispatch(gotoStep(3));

        //Cliente
        dispatch(createBilling({
            Apellidos: null,
            Balance: '124152.280000',
            'Capacidad de Pago': '0.000000',
            Celular: '0999147893',
            Ciudad: 'CUENCA',
            Cliente: 'IMPORTADORA TOMEBAMBA S.A.',
            CreditLine: '120000.000000',
            Cupo: '120000.000000',
            DebtLine: '120000.000000',
            Direccion: 'AV. ESPAÑA 17-30 Y TURUHUAICO',
            ENVIO: '[{"CANTON":"CUENCA","CARDCODE":"CL0190003701001","CODE_SERVIENTREGA":"4","DIRECCION":"AV. ESPAÑA 17-30 Y TURUHUAICO","NAME_SERVIENTREGA":"CUENCA (AZUAY)","PROVINCIA":"AZUAY","TIPO":"MATRIZ","U_LS_LATITUD":"-2.8853418","U_LS_LONGITUD":"-78.9833596","ZIPCODE":"010105"}]',
            Endeudamiento: '0.000000',
            Free_Text: 'CLIENTE TIENE DEMANDAS EN EL 2015 Y 2016 POR CONTRAVENCIONES DE TRÁNSITO DE CUARTA CLASE, EN EL 2017 POR EL COBRO DE PAGARÉ A LA ORDEN,  EL 2018 POR DEFECTOS Y VICIOS OCULTOS Y POR  INDEMNIZACIÓN, REPARACIÓN, RESPOSICIÓN Y DEVOLUCIÓN POR GARANTÍAS DE LOS PRODUCTOS, EN EL 2022 POR INDEMNIZACIÓN POR DESPIDO INTEMPESTIVO Y EN EL 2023 UNA DEMANDA POR NULIDAD DE SENTENCIA. (02/04/2024)\r\rSEGUN WHATSAPP G.GENERAL APRUEBA VENTA DE 500 CHIPS (10/04/2024)',
            GLN: null,
            GroupNum: '4',
            ID: 'CL0190003701001',
            Lista: '6',
            NOM_PADRE: null,
            Nombres: null,
            OrdersBal: '173877.250000',
            PADRE: null,
            Score: '0.000000',
            SlpCode: '25',
            SlpName: 'HENRY AGUILAR',
            Tipo: 'Master Dealer',
            U_SYP_CREDITO: '3',
            U_SYP_DOCUMENTACION: '3',
            ValidComm: null,
            ZipCode: '010105'
        }))

        //Envio
        dispatch(applyShipping(0))

        //Servientrega
        dispatch(applyServientrega({
            CANTON: 'CUENCA',
            CARDCODE: 'CL0190003701001',
            CODE_SERVIENTREGA: '4',
            DIRECCION: 'AV. ESPAÑA 17-30 Y TURUHUAICO',
            NAME_SERVIENTREGA: 'CUENCA (AZUAY)',
            PROVINCIA: 'AZUAY',
            TIPO: 'MATRIZ',
            U_LS_LATITUD: '-2.8853418',
            U_LS_LONGITUD: '-78.9833596',
            ZIPCODE: '010105'
        }))

        //Bodegas
        dispatch(applyWarehouse("019"))

        //Opciones de pago
        dispatch(applyMethod(4))
    };

    const handleCustomerNextStep = () => {

        console.log("Crear Orden Customer Mayorista.")

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

    const handleApplyServientrega = (value) => {
        dispatch(applyServientrega(value));
    };

    // const fechaCreacion = format(new Date(), 'dd-MM-yyyy HH:mm:ss');

    //Crear el pedido y enviar al área de aprobación
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

    // const vaciarcarrito = () => {
    //     dispatch(resetCart());
    // }

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
