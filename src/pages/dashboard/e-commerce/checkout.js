import { useEffect } from 'react';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Grid, Container } from '@mui/material';
// routes
import {format} from "date-fns";
import { PATH_DASHBOARD } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// redux
import { useDispatch, useSelector } from '../../../redux/store';
import {
  resetCart,
  getCart,
  nextStep,
  backStep,
  gotoStep,
  deleteCart,
  createBilling,
  applyShipping,
  applyWarehouse,
  applyMethod,
  applyDiscount,
  increaseQuantity,
  decreaseQuantity,
} from '../../../redux/slices/product';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
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
  const { replace } = useRouter();

    const { user } = useAuthContext();

  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const { checkout } = useSelector((state) => state.product);

  const { cart, billing, activeStep } = checkout;

  const completed = activeStep === STEPS.length;

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

  const fechaCreacion = format(new Date(), 'dd-MM-yyyy HH:mm:ss');

    const handleReset = async () => {
    if (completed) {

        console.log('DATA', checkout);

      // Crear un cliente.
      const response = await axios.post('/hanadb/api/orders/order', {

          checkoutData: checkout

          // CLIENTEID: checkout.billing.ID,
          // ESTADO: 6,
          // FECHA: "aaa",
          // FECHAACTUALIZACION: "aaa",
          // FECHACREACION: fechaCreacion,
          // FORMADEPAGO: checkout.method,
          // GUARDADO: 0,
          // HORA: "aaa",
          // LATITUD: 0.00,
          // LONGITUD: 0.00,
          // OBSERVACIONES: "",
          // ONLINE: false,
          // SUBTOTAL: 0.00,
          // TOTAL: 0.00,
          // TOTALIVA: 0.00,
          // USUARIOAACTUALIZACION: "aaa",
          // VENDEDOR: user.DISPLAYNAME,
          // ENDEDORID: user.ID,
          // LOCALCLIENTE_ID: checkout.billing.ID,
          // EMPRESA: "aaa",
          // FECHAFACTURACION: "aaa",
          // NUMEROFACTURAE4: "aaa",
          // NUMEROFACTURAHIPERTRONICS: "aaa",
          // NUMEROFACTURALIDENAR: "aaa",
          // NUMEROGUIA: "aaa",
          // OBSERVACIONESB: "aaa",
          // NOTACLIENTE: "aaa",
          // USUARIOAPROBO: "aaa",
          // PLANPAGOSTOMEBAMBA_ID: 0,
          // APLICACIONORIGEN: "aaa",
          // COMENTARIOENTREGA: "aaa",
          // FECHAENTREGA: "aaa",
          // NOMBREUSUARIOENTREGA: "aaa",
          // USUARIOENTREGA_ID: 0,
          // FECHAENTREGASOLICITADA: "aaa",
          // IDUSUARIOENTREGARA: 0,
          // NOMBREUSUARIOENTREGARA: "aaa",
          // COURIER: "aaa",
          // USUARIOENTREGABODEGA_ID: 0,
          // BODEGA: checkout.warehouse,
          // PEDIDOCATEGORIAPROPIA: 0,
          // IMAGENA: "aaa",
          // IMAGENB: "aaa",
          // IMAGEN: "aaa",
          // IMAGENGUIA: "aaa",
          // FECHAAPROBO: "aaa",
          // DOCNUM: 0

      });

      if (response.status === 200) {
        // La solicitud PUT se realizó correctamente
      } else {
        // La solicitud PUT no se realizó correctamente
      }

      // dispatch(resetCart());
      // replace(PATH_DASHBOARD.eCommerce.shop);
    }
  };

  return (
    <>
      <Head>
        <title> Ecommerce: Checkout | Minimal UI</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Checkout"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'E-Commerce',
              href: PATH_DASHBOARD.eCommerce.root,
            },
            { name: 'Checkout' },
          ]}
        />

        <Grid container justifyContent={completed ? 'center' : 'flex-start'}>
          <Grid item xs={12} md={8}>
            <CheckoutSteps activeStep={activeStep} steps={STEPS} />
          </Grid>
        </Grid>

        {completed ? (
          <CheckoutOrderComplete open={completed} onReset={handleReset} onDownloadPDF={() => {}} />
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
