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

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS = [
    {
        id: 48212,
        codigo: '06.04.15',
        value: 0,
        title: 'Entrega estándar (Gratis)',
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
];

const PAYMENT_OPTIONS = [
    {
        value: 2,
        title: '2 DIAS',
        description: 'Contado 2 días.',
        icons: [],
    },
    {
        value: 7,
        title: '7',
        description: 'Crédito 7 días.',
        icons: [],
    },
    {
        value: 15,
        title: '15',
        description: 'Crédito 15 días.',
        icons: [],
    },
    {
        value: 20,
        title: '20',
        description: 'Crédito 20 días.',
        icons: [],
    },
    {
        value: 21,
        title: '21',
        description: 'Crédito 21 días.',
        icons: [],
    },
    {
        value: 30,
        title: '30',
        description: 'Crédito 30 días.',
        icons: [],
    },
    {
        value: 45,
        title: '45',
        description: 'Crédito 45 días.',
        icons: [],
    },
    {
        value: 60,
        title: '60',
        description: 'Crédito 60 días.',
        icons: [],
    },
    {
        value: 90,
        title: '90',
        description: 'Crédito 90 días.',
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
    onApplyMethod: PropTypes.func,
};

export default function CheckoutPayment({checkout, onReset, onNextStep, onBackStep, onGotoStep, onApplyComment, onApplyShipping, onApplyWarehouse, onApplyMethod, }) {
    const {total, discount, subtotal, iva, comment, shipping, warehouse, method, billing} = checkout;

    const PaymentSchema = Yup.object().shape({
        payment: Yup.string().required('¡Se requiere forma de pago!'),
    });

    const defaultValues = {
        commentEnvio: comment,
        delivery: shipping,
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

    const onSubmit = async () => {
        try {
            onNextStep();
            onReset();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <CheckoutDelivery onApplyComment={onApplyComment} onApplyShipping={onApplyShipping} deliveryOptions={DELIVERY_OPTIONS}/>

                    <CheckoutWarehouse onApplyWarehouse={onApplyWarehouse} warehouseOptions={WAREHOUSE_OPTIONS}/>

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
