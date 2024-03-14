import {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
import Label from "../../../components/label";
import {fCurrency} from "../../../utils/formatNumber";
import {DOCUMENTACION, PAYMENT_OPTIONS_V2, TIPO_CREDITO, TIPO_PRECIO} from "../../../utils/constants";

// ----------------------------------------------------------------------

export default function CustomerData({currentPartner, open, onClose}) {

    console.log("partner.ID " + currentPartner?.SlpName || '');

    function nameFormaPago(pay) {
        const payActual = PAYMENT_OPTIONS_V2.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function documentacion(pay) {
        const payActual = DOCUMENTACION.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function tipoPrecio(pay) {
        const payActual = TIPO_PRECIO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    return (
        <Dialog
            fullWidth
            maxWidth={false}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {maxWidth: 720},
            }}
        >

            <DialogTitle>Datos del Cliente</DialogTitle>

            <DialogContent>
                <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                    Cliente: {currentPartner?.SlpName || ''}
                </Alert>

                <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                    }}
                >

                    {currentPartner ? (
                        <>
                            <Label color="success">Tipo: {currentPartner.Tipo} </Label>
                            <Label color="success">Vendedor: {currentPartner.SlpName} </Label>
                            <Label color="success">Cliente: {currentPartner.Cliente} </Label>
                            <Label color="success">Lista Precio: {tipoPrecio(currentPartner.Lista)} </Label>
                            <Label color="success">Saldo de Cuenta: {fCurrency(currentPartner.Balance)} </Label>
                            <Label
                                color="success">DOCUMENTACIÓN: {documentacion(currentPartner.U_SYP_DOCUMENTACION)} </Label>
                            <Label color="success">Tipo de Crédito: {tipoCredito(currentPartner.U_SYP_CREDITO)} </Label>
                            <Label color="success">Condicion de Pago: {nameFormaPago(currentPartner.GroupNum)} </Label>
                            <Label color="success">Límte de Crédito: {fCurrency(currentPartner.CreditLine)} </Label>
                            <Label color="success">Límite de comprometido: {fCurrency(currentPartner.DebtLine)} </Label>
                            <Label color="success">Pedidos Clientes: {fCurrency(currentPartner.OrdersBal)} </Label>
                            <Label color="success">Comentario: {currentPartner.Free_Text} </Label>
                        </>

                    ) : (
                        <Label color="error">Cliente no encontrado</Label>
                    )}


                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cerrar
                </Button>

            </DialogActions>

        </Dialog>
    );
}

CustomerData.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentUser: PropTypes.object,
};
