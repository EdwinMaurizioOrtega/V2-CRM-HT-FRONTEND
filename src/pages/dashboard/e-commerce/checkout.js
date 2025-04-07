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

    console.log('user: ' + JSON.stringify(user));

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


        // Bodegas
        if (user.EMPRESA === '0992537442001') {
            //Lidenar
            dispatch(applyWarehouse("019"));
        } else {
            //MC
            dispatch(applyWarehouse("DISTLF"));
        }

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
        // dispatch(nextStep());
        console.log(address);
        if (address.TIENE_PLATAFORMA_CREDITO === 'NO') {
            handleOpen();
        } else {
            dispatch(nextStep());
        }
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

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const handleSave = async () => {

        console.log('DataX', checkout.billing.ID);

        console.log("Opciones seleccionadas:", selectedOptions);
        if (selectedOptions.some((option) => option.id === 6)) {
            console.log("Motivo de 'Otro':", otroMotivo);
        }

        const otroSeleccionado = selectedOptions.some((option) => option.title === "Otro");

        if (otroSeleccionado) {
            console.log("Motivo de 'Otro':", otroMotivo);
        }

        try {

            const response = await axios.post('/hanadb/api/orders/save_credit_platforms_selected_customer', {
                empresa: user.EMPRESA,
                card_code: checkout.billing.ID, // La cédula del cliente
                selected_options: selectedOptions,
                reason: otroSeleccionado ? otroMotivo : null,
                nro_locales: Number(numeroLocales),
            });

            console.log('Status: ', response.status);
            if (response.status === 200) {
                console.log('La solicitud devolvió un estado 200.');
                handleClose();
                dispatch(nextStep());
            } else {
                console.log('La solicitud no devolvió un estado 200.');
                // Realizar alguna acción adicional en caso de que el estado de respuesta no sea 201
            }
        } catch (error) {
            console.log('Error al crear la orden:', error);
            // Manejar el error al crear la orden
        }

    };


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


                        <Modal open={open} onClose={handleClose}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 600,
                                    bgcolor: "background.paper",
                                    borderRadius: 2,
                                    boxShadow: 24,
                                    p: 4,
                                }}
                            >
                                <Typography variant="h6"> EL CLIENTE CON QUE PLATAFORMA DE CRÉDITO TRABAJA</Typography>

                                <TextField
                                    required
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    label="¿Cuantos locales tienes su cliente?"
                                    value={numeroLocales}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setNumeroLocales(value);
                                        }
                                    }}
                                    error={numeroLocales === ''}
                                    helperText={numeroLocales === '' ? 'Este campo es requerido' : ''}
                                />

                                <Autocomplete
                                    fullWidth
                                    multiple
                                    options={plataformas_de_credito}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.title}
                                    onChange={(_, newValue) => setSelectedOptions(newValue)}
                                    renderOption={(props, option, {selected}) => (
                                        <li {...props}>
                                            <Checkbox checked={selected}/>
                                            {option.title}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Opciones"/>
                                    )}
                                />

                                {/* Input adicional si se selecciona "Otro" */}
                                {selectedOptions.some((option) => option.id === 6) && (
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        label="Motivo (si seleccionó 'Otro')"
                                        value={otroMotivo}
                                        onChange={(e) => setOtroMotivo(e.target.value)}
                                    />
                                )}

                                <Box sx={{display: "flex", justifyContent: "space-between", mt: 2}}>
                                    <Button onClick={handleClose} variant="outlined">
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleDespuesSave} variant="outlined">
                                        Contestar después
                                    </Button>
                                    <Button onClick={handleSave} variant="contained">
                                        Guardar
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>

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