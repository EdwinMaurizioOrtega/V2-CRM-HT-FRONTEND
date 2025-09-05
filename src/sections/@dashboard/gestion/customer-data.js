import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { useAuthContext } from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
import Label from "../../../components/label";
import { fCurrency } from "../../../utils/formatNumber";
import { DOCUMENTACION, PAYMENT_OPTIONS_V2, TIPO_CREDITO, TIPO_PRECIO } from "../../../utils/constants";

// ----------------------------------------------------------------------

export default function CustomerData({ currentPartner, open, onClose }) {

    //console.log("partner.ID " + currentPartner?.Cliente || '');

    const searchResults = currentPartner || '';

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
                sx: { maxWidth: 1080 },
            }}
        >

            <DialogTitle>Datos del Cliente</DialogTitle>

            <DialogContent>
                {/* <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
                    Cliente: {searchResults?.Cliente || ''}
                </Alert> */}

                <Box
                >

                    {searchResults ? (
                        <>
                            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={2}>
                                        {searchResults.length > 0 ? (<Block label={searchResults[0].COMPANY}>
                                            <>
                                                <Label color="success">Tipo: {searchResults[0].Tipo} </Label>
                                                <Label color="success">Vendedor: {searchResults[0].SlpName} </Label>
                                                <Label color="success">Cliente: {searchResults[0].Cliente} </Label>
                                                <Label color="success">Lista
                                                    Precio: {tipoPrecio(searchResults[0].Lista)} </Label>
                                                <Label color="success">Saldo de
                                                    Cuenta: {fCurrency(searchResults[0].Balance)} </Label>
                                                <Label
                                                    color="success">DOCUMENTACIÓN: {documentacion(searchResults[0].U_SYP_DOCUMENTACION)} </Label>
                                                <Label color="success">Tipo de
                                                    Crédito: {tipoCredito(searchResults[0].U_SYP_CREDITO)} </Label>
                                                <Label color="success">Condicion de
                                                    Pago: {nameFormaPago(searchResults[0].GroupNum)} </Label>
                                                <Label color="success">Límte de
                                                    Crédito: {fCurrency(searchResults[0].CreditLine)} </Label>
                                                <Label color="success">Límite de
                                                    comprometido: {fCurrency(searchResults[0].DebtLine)} </Label>
                                                <Label color="success">Pedidos
                                                    Clientes: {fCurrency(searchResults[0].OrdersBal)} </Label>

                                                <Label color="success">Saldo en Crédito:
                                                    {"___"}
                                                    <span style={{ color: 'red' }}>
                                                        {fCurrency(searchResults[0].CreditLine - searchResults[0].Balance)}
                                                    </span>{"___"}
                                                    {
                                                        (searchResults[0].CreditLine - searchResults[0].Balance) > 0
                                                            ? "POR COLOCAR"
                                                            : "SOBRECUPO"
                                                    }

                                                </Label>
                                                <p style={{ color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)' }}>
                                                    Comentario: {searchResults[0].Free_Text}
                                                </p>
                                                {/* <Box
                                                    rowGap={1}
                                                    columnGap={1}
                                                >
                                                    {dataCliente ? (<>
                                                        <MapComponent markers={JSON.parse(dataCliente?.ENVIO)} />
                                                    </>) : (<Label color="error">Cliente no encontrado</Label>)}

                                                </Box> */}
                                            </>
                                        </Block>) : (<Label color="error">Cliente no encontrado</Label>)}
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Stack spacing={2}>
                                        {searchResults.length > 1 ? (<Block label={searchResults[1].COMPANY}>
                                            <>
                                                <Label color="success">Tipo: {searchResults[1].Tipo} </Label>
                                                <Label color="success">Vendedor: {searchResults[1].SlpName} </Label>
                                                <Label color="success">Cliente: {searchResults[1].Cliente} </Label>
                                                <Label color="success">Lista
                                                    Precio: {tipoPrecio(searchResults[1].Lista)} </Label>
                                                <Label color="success">Saldo de
                                                    Cuenta: {fCurrency(searchResults[1].Balance)} </Label>
                                                <Label
                                                    color="success">DOCUMENTACIÓN: {documentacion(searchResults[1].U_SYP_DOCUMENTACION)} </Label>
                                                <Label color="success">Tipo de
                                                    Crédito: {tipoCredito(searchResults[1].U_SYP_CREDITO)} </Label>
                                                <Label color="success">Condicion de
                                                    Pago: {nameFormaPago(searchResults[1].GroupNum)} </Label>
                                                <Label color="success">Límte de
                                                    Crédito: {fCurrency(searchResults[1].CreditLine)} </Label>
                                                <Label color="success">Límite de
                                                    comprometido: {fCurrency(searchResults[1].DebtLine)} </Label>
                                                <Label color="success">Pedidos
                                                    Clientes: {fCurrency(searchResults[1].OrdersBal)} </Label>
                                                <Label color="success">Saldo en Crédito:
                                                    {"___"}
                                                    <span style={{ color: 'red' }}>
                                                        {fCurrency(searchResults[1].CreditLine - searchResults[1].Balance)}
                                                    </span>{"___"}
                                                    {
                                                        (searchResults[1].CreditLine - searchResults[1].Balance) > 0
                                                            ? "POR COLOCAR"
                                                            : "SOBRECUPO"
                                                    }
                                                </Label>
                                                <p style={{ color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)' }}>
                                                    Comentario: {searchResults[1].Free_Text}
                                                </p>
                                                {/* <Box
                                                    rowGap={1}
                                                    columnGap={1}
                                                >
                                                    {dataCliente ? (<>
                                                        <MapComponent markers={JSON.parse(dataCliente?.ENVIO)} />
                                                    </>) : (<Label color="error">Cliente no encontrado</Label>)}
                                                </Box> */}
                                            </>
                                        </Block>
                                        ) : (<Label color="error">Cliente no encontrado</Label>)}
                                    </Stack>
                                </Grid>

                                {/* <Grid item xs={12} md={6}> */}
                                {/*     <Stack spacing={2}> */}
                                {/*         {searchResults.length > 1 ? (<Block label={searchResults[2].COMPANY}> */}
                                {/*                 <> */}
                                {/*                     <Label color="success">Tipo: {searchResults[2].Tipo} </Label> */}
                                {/*                     <Label color="success">Vendedor: {searchResults[2].SlpName} </Label> */}
                                {/*                     <Label color="success">Cliente: {searchResults[2].Cliente} </Label> */}
                                {/*                     <Label color="success">Lista */}
                                {/*                         Precio: {tipoPrecio(searchResults[2].Lista)} </Label> */}
                                {/*                     <Label color="success">Saldo de */}
                                {/*                         Cuenta: {fCurrency(searchResults[2].Balance)} </Label> */}
                                {/*                     <Label */}
                                {/*                         color="success">DOCUMENTACIÓN: {documentacion(searchResults[2].U_SYP_DOCUMENTACION)} </Label> */}
                                {/*                     <Label color="success">Tipo de */}
                                {/*                         Crédito: {tipoCredito(searchResults[2].U_SYP_CREDITO)} </Label> */}
                                {/*                     <Label color="success">Condicion de */}
                                {/*                         Pago: {nameFormaPago(searchResults[2].GroupNum)} </Label> */}
                                {/*                     <Label color="success">Límte de */}
                                {/*                         Crédito: {fCurrency(searchResults[2].CreditLine)} </Label> */}
                                {/*                     <Label color="success">Límite de */}
                                {/*                         comprometido: {fCurrency(searchResults[2].DebtLine)} </Label> */}
                                {/*                     <Label color="success">Pedidos */}
                                {/*                         Clientes: {fCurrency(searchResults[2].OrdersBal)} </Label> */}
                                {/*                     <p style={{color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)'}}> */}
                                {/*                         Comentario: {searchResults[2].Free_Text} */}
                                {/*                     </p> */}
                                {/*                     <Box */}
                                {/*                         rowGap={1} */}
                                {/*                         columnGap={1} */}
                                {/*                     > */}
                                {/*                         {dataCliente ? (<> */}
                                {/*                             <MapComponent markers={JSON.parse(dataCliente?.ENVIO)}/> */}
                                {/*                         </>) : (<Label color="error">Cliente no encontrado</Label>)} */}
                                {/*                     </Box> */}
                                {/*                 </> */}
                                {/*             </Block> */}
                                {/*         ) : (<Label color="error">Cliente no encontrado</Label>)} */}
                                {/*     </Stack> */}
                                {/* </Grid> */}
                            </Grid>

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

// ----------------------------------------------------------------------

Block.propTypes = {
    label: PropTypes.string, children: PropTypes.node, sx: PropTypes.object,
};

function Block({label = 'RHFTextField', sx, children}) {
    return (<Stack spacing={1} sx={{width: 1, ...sx}}>
        <Typography
            variant="caption"
            sx={{
                textAlign: 'right', fontStyle: 'italic', color: 'text.disabled',
            }}
        >
            {label}
        </Typography>
        {children}
    </Stack>);
}
