import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
// @mui
import {Grid, Button} from '@mui/material';
import {LoadingButton} from '@mui/lab';
// components
import Iconify from '../../../../../components/iconify';
import FormProvider from '../../../../../components/hook-form';
//
import CheckoutSummary from '../CheckoutSummary';
import CheckoutDelivery from './CheckoutDelivery';
import CheckoutBillingInfo from './CheckoutBillingInfo';
import CheckoutPaymentMethods from './CheckoutPaymentMethods';
import CheckoutWarehouse from './CheckoutWarehouse';
import {useState} from "react";
import {useSnackbar} from "../../../../../components/snackbar";
import {useAuthContext} from "../../../../../auth/useAuthContext";

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS = [
    {
        id: 48212,
        codigo: '06.04.15',
        value: 0,
        title: 'GRATIS | RETIRO EN OFICINA',
        description: 'Entrega estándar (Gratis)',
    },
    {
        id: 48213,
        codigo: '06.04.16',
        value: 3,
        title: 'ENVIO ($3,00)',
        description: 'ENVIO ($3,00)',
    },
    {
        id: 48214,
        codigo: '06.04.17',
        value: 5,
        title: 'ENVIO ($5,00)',
        description: 'ENVIO ($5,00)',
    },
    {
        id: 48215,
        codigo: '06.04.18',
        value: 7,
        title: 'ENVIO ($7,00)',
        description: 'ENVIO ($7,00)',
    },
    {
        id: 48216,
        codigo: '06.04.19',
        value: 13,
        title: 'ENVIO ($13,00)',
        description: 'ENVIO ($13,00)',
    },
];

const WAREHOUSE_OPTIONS = [

    {
        id: '019',
        value: '019',
        title: 'CENTRO DE DISTRIBUCIÓN HT',
        description: 'Matriz en la ciudad de Quito.',
    },

    {
        id: '002',
        value: '002',
        title: 'MAYORISTA CUENCA',
        description: 'Matriz en la ciudad de Cuenca.',
    },
    {
        id: '006',
        value: '006',
        title: 'MAYORISTA QUITO',
        description: 'Sucursal en la ciudad de Quito.',
    },
    {
        id: '015',
        value: '015',
        title: 'MAYORISTA GUAYAQUIL',
        description: 'SUCURSAL en la ciudad de Guayaquil.',
    },
    {
        id: '024',
        value: '024',
        title: 'MAYORISTA MANTA',
        description: 'SUCURSAL en la ciudad de Manta.',
    },
    {
        id: '030',
        value: '030',
        title: 'PARQUE EMP. COLÓN',
        description: 'SUCURSAL en la ciudad de GUAYAQUIL.',
    },
];

const WAREHOUSE_OPTIONS_ALPACELL = [

    {
        id: '001',
        value: '001',
        title: 'BODEGA MATRIZ',
        description: 'GUAYAQUIL ALPHACELL',
    },
    {
        id: '007',
        value: '007',
        title: 'BODEGA CDHT',
        description: 'QUITO ALPHACELL',
    },
    {
        id: '009',
        value: '009',
        title: 'GUAYAQUIL SERVIENTREGA',
        description: 'GUAYAQUIL SERVIENTREGA',
    },
]

const WAREHOUSE_OPTIONS_MOVILCELISTIC = [
    {
        id: 'DISTLF',
        value: 'DISTLF',
        title: 'DISTRIBUIDOR TELEFONOS',
        description: 'CARAPUNGO',
    },
    {
        id: 'T1MACHAL',
        value: 'T1MACHAL',
        title: 'XIAOMI TERMINALES',
        description: 'MACHALA',
    },
    {
        id: 'T1CUENCA',
        value: 'T1CUENCA',
        title: 'XIAOMI TERMINALES',
        description: 'CUENCA',
    },
    {
        id: 'T1CARACO',
        value: 'T1CARACO',
        title: 'XIAOMI TERMINALES',
        description: 'QUITO',
    },
]


const PAYMENT_OPTIONS = [
    {
        value: -1,
        title: 'CONTADO',
        description: 'CONTADO.',
        icons: [],
    },
    {
        value: 30,
        title: '2 DÍAS',
        description: 'CRÉDITO 2 DÍAS.',
        icons: [],
    },
    {
        value: 2,
        title: '7',
        description: 'CRÉDITO 7 DÍAS.',
        icons: [],
    },
    {
        value: 3,
        title: '15',
        description: 'CRÉDITO 15 DÍAS.',
        icons: [],
    },
    // {
    //     value: 20,
    //     title: '20',
    //     description: 'CRÉDITO 20 DÍAS.',
    //     icons: [],
    // },
    {
        value: 26,
        title: '21',
        description: 'CRÉDITO 21 DÍAS.',
        icons: [],
    },
    {
        value: 32,
        title: '32',
        description: 'CRÉDITO 60-90 DÍAS.',
        icons: [],
    },
    {
        value: 27,
        title: '25',
        description: 'CRÉDITO 25 DÍAS.',
        icons: [],
    },
    {
        value: 4,
        title: '30',
        description: 'CRÉDITO 30 DÍAS.',
        icons: [],
    },
    {
        value: 5,
        title: '45',
        description: 'CRÉDITO 45 DÍAS.',
        icons: [],
    },
    {
        value: 6,
        title: '60',
        description: 'CRÉDITO 60 DÍAS.',
        icons: [],
    },
    {
        value: 28,
        title: '75',
        description: 'CRÉDITO 75 DÍAS.',
        icons: [],
    },
    {
        value: 9,
        title: '30-60',
        description: 'CRÉDITO 30-60 DÍAS.',
        icons: [],
    },
    {
        value: 10,
        title: '30-60-90',
        description: 'CRÉDITO 30-60-90 DÍAS.',
        icons: [],
    },
    {
        value: 25,
        title: '90',
        description: 'CRÉDITO 90 DÍAS.',
        icons: [],
    },
    {
        value: 11,
        title: '30-60-90-120',
        description: 'CRÉDITO 30-60-90-120 DÍAS.',
        icons: [],
    },
];

const CARDS_OPTIONS = [
    {value: 'ViSa1', label: '**** **** **** 1212 - Jimmy Holland'},
    {value: 'ViSa2', label: '**** **** **** 2424 - Shawn Stokes'},
    {value: 'MasterCard', label: '**** **** **** 4545 - Cole Armstrong'},
];

CheckoutPayment.propTypes = {
    onReset: PropTypes.func,
    checkout: PropTypes.object,
    onBackStep: PropTypes.func,
    onGotoStep: PropTypes.func,
    onNextStep: PropTypes.func,
    onApplyComment: PropTypes.func,
    onApplyShipping: PropTypes.func,
    onApplyWarehouse: PropTypes.func,
    onApplyServientrega: PropTypes.func,
    onApplyMethod: PropTypes.func,
};

export default function CheckoutPayment({
                                            checkout,
                                            onReset,
                                            onNextStep,
                                            onBackStep,
                                            onGotoStep,
                                            onApplyComment,
                                            onApplyShipping,
                                            onApplyServientrega,
                                            onApplyWarehouse,
                                            onApplyMethod,
                                        }) {

    const {user} = useAuthContext();

    const {total, discount, subtotal, iva, comment, shipping, servientrega, warehouse, method, billing} = checkout;

    const PaymentSchema = Yup.object().shape({
        payment: Yup.string().required('¡Se requiere forma de pago!'),
    });

    const defaultValues = {
        commentEnvio: comment,
        delivery: shipping,
        servientrega: servientrega,
        store: warehouse,
        payment: method,
    };

    const methods = useForm({
        resolver: yupResolver(PaymentSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const onSnackbarAction = (data, color, anchor) => {
        enqueueSnackbar(`${data}`, {
            variant: color,
            anchorOrigin: anchor,
            action: (key) => (
                <>
                    <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>
                        Cerrar
                    </Button>
                </>
            ),
        });
    };

    const onSubmit = async () => {
        try {

            //V1
            onNextStep();
            onReset();

            //V2
            // //console.log("Valor envío... "+ shipping);
            // if (shipping == 3 || shipping == 5 || shipping == 7 || shipping == 13) {
            //     // console.error("Debe de seleccionar una ciudad destino y una dirección")
            //     if (servientrega && servientrega.CODE_SERVIENTREGA != null) {
            //         console.log("Se va ha crear una guia de servientrega")
            //         onNextStep();
            //         onReset();
            //
            //     } else {
            //         console.error("Debe de seleccionar una ciudad destino y una dirección.")
            //         onSnackbarAction('Debe de seleccionar una ciudad destino y una dirección.','default', {
            //             vertical: 'top',
            //             horizontal: 'center',
            //         })
            //
            //     }
            //
            // } else {
            //     //console.error("El retiro será en oficina.")
            //     onSnackbarAction('El retiro será en oficina.','default', {
            //         vertical: 'top',
            //         horizontal: 'center',
            //     })
            //     onNextStep();
            //     onReset();
            // }

        } catch (error) {
            console.error(error);
        }
    };

    const warehouseOptions = (() => {
        if (user.EMPRESA === '0992537442001') {
            return WAREHOUSE_OPTIONS; // Hipertronics
        }
        if (user.EMPRESA === '0992264373001') {
            return WAREHOUSE_OPTIONS_ALPACELL; // Alphacell
        }
        if (user.EMPRESA === '1792161037001') {
            return WAREHOUSE_OPTIONS_MOVILCELISTIC; // MovilCelistic
        }
        return []; // Opciones por defecto si no coincide con ninguna empresa
    })();

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <CheckoutDelivery billing={billing} total={total} onApplyComment={onApplyComment}
                                      onApplyShipping={onApplyShipping} onApplyServientrega={onApplyServientrega}
                                      deliveryOptions={DELIVERY_OPTIONS}/>

                    <CheckoutWarehouse
                        onApplyWarehouse={onApplyWarehouse}
                        warehouseOptions={warehouseOptions}
                    />

                    <CheckoutPaymentMethods onApplyMethod={onApplyMethod} paymentOptions={PAYMENT_OPTIONS}
                                            sx={{my: 3}}
                    />

                    <Button
                        size="small"
                        color="inherit"
                        onClick={onBackStep}
                        startIcon={<Iconify icon="eva:arrow-ios-back-fill"/>}
                    >
                        Atrás
                    </Button>
                </Grid>

                <Grid item xs={12} md={4}>
                    <CheckoutBillingInfo onBackStep={onBackStep} billing={billing}/>

                    <CheckoutSummary
                        enableEdit
                        total={total}
                        subtotal={subtotal}
                        iva={iva}
                        discount={discount}
                        shipping={shipping}
                        onEdit={() => onGotoStep(0)}
                    />

                    <LoadingButton
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        Orden completa
                    </LoadingButton>
                </Grid>
            </Grid>
        </FormProvider>
    );
}
