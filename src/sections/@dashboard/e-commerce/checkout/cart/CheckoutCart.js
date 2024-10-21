import PropTypes from 'prop-types';
import {sum} from 'lodash';
// next
import NextLink from 'next/link';
// @mui
import {Grid, Card, Button, CardHeader, Typography, Stack, TextField} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../../../routes/paths';
// components
import Iconify from '../../../../../components/iconify';
import EmptyContent from '../../../../../components/empty-content';
import CheckoutSummary from '../CheckoutSummary';
import CheckoutCartProductList from './CheckoutCartProductList';
import {applyComment, resetCart} from "../../../../../redux/slices/product";
import {dispatch} from "../../../../../redux/store";
import {useAuthContext} from "../../../../../auth/useAuthContext";
import React from "react";

// ----------------------------------------------------------------------

CheckoutCart.propTypes = {
    checkout: PropTypes.object,
    onNextStep: PropTypes.func,
    onDeleteCart: PropTypes.func,
    onApplyDiscount: PropTypes.func,
    onDecreaseQuantity: PropTypes.func,
    onIncreaseQuantity: PropTypes.func,
};

export default function CheckoutCart({
                                         checkout,
                                         onTomebambaNextStep,
                                         onCustomerNextStep,
                                         onNextStep,
                                         onApplyDiscount,
                                         onDeleteCart,
                                         onIncreaseQuantity,
                                         onDecreaseQuantity,
                                     }) {

    const {user} = useAuthContext();

    const {cart, total, discount, subtotal, iva} = checkout;

    const totalItems = sum(cart.map((item) => +item.quantity));

    const isEmptyCart = !cart.length;

    const vaciarcarrito = () => {
        dispatch(resetCart());
    }

    // Comentario envío solo Tomebamba.
    const handleApplyComment = (value) => {
        dispatch(applyComment(value));
    };

    return (
        <Grid container spacing={3}>

            <Grid item xs={12} md={8}>
                <Card sx={{mb: 3}}>

                    <Button variant="contained" onClick={vaciarcarrito}>Vaciar Carrito</Button>

                    <CardHeader
                        title={
                            <Typography variant="h6">
                                Mi carrito
                                <Typography component="span" sx={{color: 'text.secondary'}}>
                                    &nbsp;({totalItems} item)
                                </Typography>
                            </Typography>
                        }
                        sx={{mb: 3}}
                    />

                    {!isEmptyCart ? (
                        <CheckoutCartProductList
                            products={cart}
                            onDelete={onDeleteCart}
                            onIncreaseQuantity={onIncreaseQuantity}
                            onDecreaseQuantity={onDecreaseQuantity}
                            user={user}
                        />
                    ) : (
                        <EmptyContent
                            title="El carrito esta vacío."
                            description="Parece que no tiene artículos en su carrito de compras."
                            img="/assets/illustrations/illustration_empty_cart.svg"
                        />
                    )}
                </Card>

                <Button
                    component={NextLink}
                    href={PATH_DASHBOARD.eCommerce.root}
                    color="inherit"
                    startIcon={<Iconify icon="eva:arrow-ios-back-fill"/>}
                >
                    Seguir comprando
                </Button>
            </Grid>

            <Grid item xs={12} md={4}>

                {user.ROLE === '0' || user.ROLE === '31' ? (
                    <>
                        <Stack spacing={1}>
                            <TextField
                                multiline
                                label="Comentario"
                                name="commentEnvio"
                                onKeyUp={(event) => {
                                    const {value} = event.target;
                                    handleApplyComment(value);
                                }}
                            />
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{textAlign: 'right', color: 'text.secondary'}}
                            >
                                Observación por el vendedor.
                            </Typography>
                        </Stack>
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={!cart.length}
                            onClick={user.ROLE === '0' ? onTomebambaNextStep : onCustomerNextStep}
                        >
                            {user.ROLE === '0' ? 'Tomebamba' : 'Finalizar'}
                        </Button>

                    </>

                ) : (
                    <>
                        <CheckoutSummary
                            enableDiscount
                            total={total}
                            discount={discount}
                            subtotal={subtotal}
                            iva={iva}
                            onApplyDiscount={onApplyDiscount}
                        />
                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={!cart.length}
                            onClick={onNextStep}
                        >
                            Finalizar compra
                        </Button>
                    </>
                )
                }
            </Grid>
        </Grid>
    );
}