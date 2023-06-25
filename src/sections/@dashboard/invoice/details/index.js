import PropTypes from 'prop-types';
// @mui
import {styled} from '@mui/material/styles';
import {
    Box,
    Card,
    Grid,
    Table,
    Divider,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
    Typography,
    TableContainer, IconButton, MenuItem, Button, Stack, TextField, Autocomplete, Snackbar, Alert,
} from '@mui/material';

import Link from 'next/link';
// utils
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {fDate} from '../../../../utils/formatTime';
import {fCurrency} from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Scrollbar from '../../../../components/scrollbar';
//
import InvoiceToolbar from './InvoiceToolbar';
import Iconify from "../../../../components/iconify";
import MenuPopover from "../../../../components/menu-popover";
import ConfirmDialog from "../../../../components/confirm-dialog";
import {RHFTextField} from "../../../../components/hook-form";
import {useTable} from "../../../../components/table";
import axios from "../../../../utils/axios";
import {Block} from "../../../_examples/Block";
import {useAuthContext} from "../../../../auth/useAuthContext";

import React from 'react';
import {useSnackbar} from "../../../../components/snackbar";
import {PATH_DASHBOARD} from "../../../../routes/paths";


// ----------------------------------------------------------------------

const StyledRowResult = styled(TableRow)(({theme}) => ({
    '& td': {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

// ----------------------------------------------------------------------

InvoiceDetails.propTypes = {
    onEditRow: PropTypes.func,
    onViewRow: PropTypes.func,
    onDeleteRow: PropTypes.func,

};

export default function InvoiceDetails({invoice}) {

    const router = useRouter();

    const {user} = useAuthContext();

    const [selected, setSelected] = useState(false);

    const [valueNew, setValueNew] = useState('');

    const [valueGuia, setValueGuia] = useState('');
    const [valueFactura, setValueFactura] = useState('');
    const [valueValorFactura, setValueValorFactura] = useState('');

    const [openConfirm, setOpenConfirm] = useState(false);

    const [openPriceUnit, setOpenPriceUnit] = useState(false);

    const [openQty, setOpenQty] = useState(false);

    const [openDiscountPercentage, setOpenDiscountPercentage] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleOpenDiscountPercentage = () => {
        setOpenDiscountPercentage(true);
    };

    const handleCloseDiscountPercentage = () => {
        setOpenDiscountPercentage(false);
    };

    const handleOpenQty = () => {
        setOpenQty(true);
    };

    const handleCloseQty = () => {
        setOpenQty(false);
    };

    const handleOpenPriceUnit = () => {
        setOpenPriceUnit(true);
    };

    const handleClosePriceUnit = () => {
        setOpenPriceUnit(false);
    };

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleOpenPopover = (event, rowData) => {
        setOpenPopover(event.currentTarget);

        console.log("ID seleccionado:", rowData);
        setSelected(rowData);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };


    const {
        items = [],
        ID,
        ESTADO,
        FECHACREACION,
        CLIENTEID,
        Nombres,
        Cliente,
        Ciudad,
        Celular,
        Tipo,
        VENDEDOR,
        BODEGA,
        FORMADEPAGO,
        CITY
    } = invoice;


    const handleChange = (event) => {
        setValueNew(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeGuia = (event) => {
        setValueGuia(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeFactura = (event) => {
        setValueFactura(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeValorFactura = (event) => {
        setValueValorFactura(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };


    const handleChangePriceUnit = async () => {

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            await axios.put('/hanadb/api/orders/order/detail/priceunit', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_PRICE_UNIT: valueNew

            });
        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeQuantity = async () => {

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            await axios.put('/hanadb/api/orders/order/detail/quantity', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_QUANTITY: valueNew

            });
        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeDiscount = async () => {

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            await axios.put('/hanadb/api/orders/order/detail/discount', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_DISCOUNT: valueNew

            });
        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeDelete = async () => {
        try {
            await axios.delete('/hanadb/api/orders/order/detail/delete', {
                params: {
                    ID: selected.ID
                }
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            console.log('La orden se eliminó correctamente');
        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al eliminar la orden:', error);
        }
    };


    // Cambiar de bodega en la base de datos GRUPO_EMPRESARIAL_HT
    const handleChangeWarehouse = async (event, value) => {
        console.log(value.id); // Log the selected element
        console.log(ID); // Log ID de la orden
        try {
            // Actualizar una orden.
            await axios.put('/hanadb/api/orders/order/change_warehouse', {
                ID_ORDER: ID,
                NEW_WAREHOUSE: value.id

            });

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    // Cambiar la forma de pago en la base de datos GRUPO_EMPRESARIAL_HT
    const handleChangePayment = async (event, value) => {
        console.log(value.id); // Log the selected element
        console.log(ID); // Log ID de la orden
        try {
            // Actualizar una orden.
            await axios.put('/hanadb/api/orders/order/change_payment', {
                ID_ORDER: ID,
                NEW_PAYMENT: value.id
            });

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    // La  mejor forma de crear un CASE
    function nameWarehouse(ware) {
        console.log(`Bodega: ${ware}`);
        const strings = {
            "002": "Cuenca",
            "006": "Quito",
            "015": "Guayaquil",
            "024": "Manta",
        };

        const bodegaActual = strings[ware];
        return bodegaActual || "Bodega no definida.";

    }

    function nameFormaPago(pay) {
        const strings = {
            "-1": "CONTADO",
            1: "CONTADO 5 DÍAS",
            2: "CONTADO 7 DÍAS",
            3: "15 DÍAS",
            4: "30 DÍAS",
            5: "45 DÍAS",
            6: "60 DÍAS",
            7: "90 DÍAS",
            8: "120 DÍAS",
            9: "30-60 DÍAS",
            10: "30-60-90 DÍAS",
            11: "30-60-90-120 DÍAS",
            12: "60-90-120 DÍAS",
            13: "36 MESES",
            14: "6 MESES",
            15: "12 MESES",
            16: "9 MESES",
            17: "18 MESES",
            18: "24 MESES",
            19: "CONTADO / RET",
            20: "CONTADO 8 DÍAS",
            21: "180 DIAS",
            22: "*",
            23: "CONTADO 2 DIAS",
        };

        const payActual = strings[pay];
        return payActual || "Pago no definido.";

    }

    const ivaPorcentaje = 0.12; // Porcentaje de IVA (12% en Ecuador)
    let subtotalTotal = 0;

    items.forEach((row) => {
        const subtotal = row.PRECIOUNITARIOVENTA * row.CANTIDAD;
        subtotalTotal += subtotal;
    });

    const ivaTotal = subtotalTotal * ivaPorcentaje;
    const totalConIva = subtotalTotal + ivaTotal;

    console.log('Subtotal: ', subtotalTotal);
    console.log('IVA: ', ivaTotal);
    console.log('Total incluido IVA: ', totalConIva);

    const enviarOrdenSAP = async () => {
        console.log(ID); // Log ID de la orden
        console.log(user.ID) // Log ID del usuario

        try {
            // Actualizar una orden.
            await axios.post('/hanadb/api/orden_venta_sap', {
                ID_ORDER: ID,
                ID_USER: user.ID

            });

            router(PATH_DASHBOARD.invoice.list);

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }


    const handleChangePedidoFactura = async () => {

        // console.log(ID);
        // console.log('Filanalizar pedido.');

        if (valueFactura || valueValorFactura) {
            try {
                // Actualizar una orden.
                await axios.put('/hanadb/api/orders/order/facturar', {
                    ID_ORDER: ID,
                    NUMERO_FACTURA: `${valueFactura}`,
                    VALOR_FACTURA: `${valueValorFactura}`,
                    NUMERO_GUIA: `${valueGuia}`
                });

                router.push('/dashboard/invoice/list/');

            } catch (error) {
                // Manejar el error de la petición PUT aquí
                console.error('Error al actualizar la orden:', error);
            }

        } else {
            enqueueSnackbar('Los campos con * son obligatorios.', { variant: 'error' })
        }

    }

    return (
        <>
            {/* <InvoiceToolbar invoice={invoice} /> */}

            <Card sx={{pt: 5, px: 5}}>
                <Grid container>
                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Image disabledEffect alt="logo" src="/logo/logo_full.svg" sx={{maxWidth: 120}}/>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Box sx={{textAlign: {sm: 'right'}}}>
                            {/* <Label */}
                            {/*   variant="soft" */}
                            {/*   color={ */}
                            {/*     (status === 'paid' && 'success') || */}
                            {/*     (status === 'unpaid' && 'warning') || */}
                            {/*     (status === 'overdue' && 'error') || */}
                            {/*     'default' */}
                            {/*   } */}
                            {/*   sx={{ textTransform: 'uppercase', mb: 1 }} */}
                            {/* > */}
                            {/*   {status} */}
                            {/* </Label> */}

                            <Typography variant="h6">{`INV-${ID}`}</Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                            Orden de
                        </Typography>

                        <Typography variant="body2">{VENDEDOR}</Typography>

                        <Typography variant="body2">{CITY}</Typography>

                        {/* <Typography variant="body2">Phone: {invoiceFrom.phone}</Typography> */}
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                            FACTURA A
                        </Typography>

                        <Typography variant="body2">{Cliente}</Typography>
                        <Typography variant="body2">CI/RUC: {CLIENTEID}</Typography>

                        <Typography variant="body2">{Ciudad}</Typography>

                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                            fecha de creación
                        </Typography>

                        <Typography variant="body2">{FECHACREACION}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                            opciones
                        </Typography>

                        <Grid container>

                            <Grid item xs={12} sm={5} sx={{mb: 1}}>

                                {/* <Typography variant="body2">{fDate(dueDate)}</Typography> */}
                                <Typography variant="body2">Bodega actual: {nameWarehouse(BODEGA)}</Typography>

                                {user.ROLE === "aprobador" &&

                                    <Autocomplete
                                        fullWidth
                                        options={top100Films}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(event, value) => {
                                            handleChangeWarehouse(event, value);
                                            router.reload();
                                        }
                                        } // Add onChange event handler
                                        renderInput={(params) => <TextField {...params} label="-_-" margin="none"/>}
                                    />
                                }

                            </Grid>

                            <Grid item xs={12} sm={7} sx={{mb: 1}}>

                                <Typography variant="body2">Forma de pago
                                    actual: {nameFormaPago(FORMADEPAGO)}</Typography>

                                {user.ROLE === "aprobador" &&
                                    <Autocomplete
                                        fullWidth
                                        options={topFormaPago}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(event, value) => {
                                            handleChangePayment(event, value);
                                            router.reload();
                                        }}
                                        renderInput={(params) => <TextField {...params} label="-_-" margin="none"/>}
                                    />
                                }

                            </Grid>
                        </Grid>


                    </Grid>
                </Grid>

                <TableContainer sx={{overflow: 'unset'}}>
                    <Scrollbar>
                        <Table sx={{minWidth: 960}}>
                            <TableHead
                                sx={{
                                    borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                                    '& th': {backgroundColor: 'transparent'},
                                }}
                            >
                                <TableRow>
                                    <TableCell width={40}>#</TableCell>
                                    <TableCell align="left">Descripción</TableCell>
                                    {/* <TableCell align="left">Tipo Precio</TableCell> */}
                                    <TableCell align="left">Comentario Precio</TableCell>
                                    <TableCell align="left">%Desc.</TableCell>
                                    <TableCell align="left">Cantidad</TableCell>
                                    <TableCell align="right">Precio unitario</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="left">Acciones</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {items.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                                        }}
                                    >
                                        <TableCell>{index + 1}</TableCell>

                                        <TableCell align="left">
                                            <Box sx={{maxWidth: 560}}>
                                                <Typography
                                                    variant="subtitle2">{row.NOMBRE !== null ? row.NOMBRE : 'VALOR DEL ENVIO'}</Typography>

                                                {/* <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap> */}
                                                {/*   {row.NOMBRE} */}
                                                {/* </Typography> */}
                                            </Box>
                                        </TableCell>

                                        {/* <TableCell align="left">{row.TIPOPRECIO}</TableCell> */}
                                        <TableCell align="left">{row.COMENTARIOPRECIO}</TableCell>
                                        <TableCell align="left">{row.DISCOUNTPERCENTSAP}</TableCell>

                                        <TableCell align="left">{row.CANTIDAD}</TableCell>

                                        <TableCell align="right">{fCurrency(row.PRECIOUNITARIOVENTA)}</TableCell>

                                        <TableCell
                                            align="right">{fCurrency(row.PRECIOUNITARIOVENTA * row.CANTIDAD)}</TableCell>

                                        <TableCell align="right">
                                            <IconButton color={openPopover ? 'inherit' : 'default'}
                                                        onClick={(event) => handleOpenPopover(event, row)}>
                                                <Iconify icon="eva:more-vertical-fill"/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                ))}


                                <StyledRowResult>
                                    <TableCell colSpan={3}/>

                                    <TableCell align="right" sx={{typography: 'body1'}}>
                                        <Box sx={{mt: 2}}/>
                                        Subtotal
                                    </TableCell>

                                    <TableCell align="right" width={120} sx={{typography: 'body1'}}>
                                        <Box sx={{mt: 2}}/>
                                        {fCurrency(subtotalTotal)}
                                    </TableCell>
                                </StyledRowResult>

                                {/* <StyledRowResult> */}
                                {/*   <TableCell colSpan={3} /> */}

                                {/*   <TableCell align="right" sx={{ typography: 'body1' }}> */}
                                {/*     Discount */}
                                {/*   </TableCell> */}

                                {/*   /!* <TableCell *!/ */}
                                {/*   /!*   align="right" *!/ */}
                                {/*   /!*   width={120} *!/ */}
                                {/*   /!*   sx={{ color: 'error.main', typography: 'body1' }} *!/ */}
                                {/*   /!* > *!/ */}
                                {/*   /!*   {discount && fCurrency(-discount)} *!/ */}
                                {/*   /!* </TableCell> *!/ */}
                                {/* </StyledRowResult> */}

                                <StyledRowResult>
                                    <TableCell colSpan={3}/>

                                    <TableCell align="right" sx={{typography: 'body1'}}>
                                        IVA
                                    </TableCell>

                                    <TableCell align="right" width={120} sx={{typography: 'body1'}}>
                                        {fCurrency(ivaTotal)}
                                    </TableCell>
                                </StyledRowResult>

                                <StyledRowResult>
                                    <TableCell colSpan={3}/>

                                    <TableCell align="right" sx={{typography: 'h6'}}>
                                        Total
                                    </TableCell>

                                    <TableCell align="right" width={140} sx={{typography: 'h6'}}>
                                        {fCurrency(totalConIva)}
                                    </TableCell>
                                </StyledRowResult>
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>

                <Divider sx={{mt: 5}}/>

                <Grid container>
                    <Grid item xs={12} md={9} sx={{py: 3}}>
                        <Typography variant="subtitle2">NOTAS</Typography>

                        <Typography variant="body2">
                            Una vez que su pedido haya sido aprobado, le solicitamos que en caso de requerir algún
                            cambio de
                            bodega o modificación en la orden, se comunique amablemente con el responsable del área
                            correspondiente. Agradecemos su colaboración. </Typography>
                    </Grid>

                    <Grid item xs={12} md={3} sx={{py: 3, textAlign: 'right'}}>
                        <Typography variant="subtitle2">¿Tengo una pregunta?</Typography>

                        <Link href="https://chat.whatsapp.com/JSLQG7XaGCT1wq7wLNbWJl">
                            WhatsApp
                        </Link>

                        {/* <Typography variant="body2">support@minimals.cc</Typography> */}
                    </Grid>
                </Grid>

                <Divider sx={{mt: 5}}/>

                {user.ROLE === "aprobador" &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{py: 3, textAlign: 'center'}}>
                            <Button onClick={enviarOrdenSAP}>CREAR ORDEN DE VENTA SAP</Button>
                        </Grid>
                    </Grid>
                }

                {user.ROLE === "bodega" &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{py: 6}}>

                            <TextField
                                label=" Número de guia."
                                value={valueGuia}
                                onChange={handleChangeGuia}
                            />
                            <TextField
                                required
                                label="Número de factura."
                                value={valueFactura}
                                onChange={handleChangeFactura}
                            />
                            <TextField
                                required
                                label="Valor total."
                                value={valueValorFactura}
                                onChange={handleChangeValorFactura}
                            />
                            <Button variant="contained" color="success" onClick={() => {
                                handleChangePedidoFactura();
                            }}>
                                Guardar Factura
                            </Button>

                        </Grid>

                    </Grid>
                }
            </Card>

            {user.ROLE === "aprobador" &&

                <MenuPopover
                    open={openPopover}
                    onClose={handleClosePopover}
                    arrow="right-top"
                    sx={{width: 160}}
                >
                    <MenuItem
                        onClick={() => {
                            handleOpenPriceUnit();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill"/>
                        Precio Unitario.
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleOpenQty();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill"/>
                        Cantidad.
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            handleOpenDiscountPercentage();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill"/>
                        %Desc.
                    </MenuItem>

                    <Divider sx={{borderStyle: 'dashed'}}/>

                    <MenuItem
                        onClick={() => {
                            handleOpenConfirm();
                            handleClosePopover();
                        }}
                        sx={{color: 'error.main'}}
                    >
                        <Iconify icon="eva:trash-2-outline"/>
                        Borrar
                    </MenuItem>
                </MenuPopover>
            }

            <ConfirmDialog
                open={openPriceUnit}
                onClose={handleClosePriceUnit}
                title="Nuevo precio unitario"
                content={`¿Estás seguro de que quieres cambiar el precio unitario? ${selected.PRECIOUNITARIOVENTA}`}
                action={
                    <>
                        <TextField
                            label="Nuevo precio."
                            value={valueNew}
                            onChange={handleChange}
                        />
                        <Button variant="contained" color="error" onClick={() => {
                            handleChangePriceUnit();
                            router.reload();
                        }}
                        >
                            Cambiar P.U.
                        </Button>
                    </>
                }
            />

            <ConfirmDialog
                open={openQty}
                onClose={handleCloseQty}
                title="Nueva cantidad"
                content={`¿Estás seguro de que quieres cambiar la cantidad? ${selected.CANTIDAD}`}
                action={
                    <>
                        <TextField
                            label="Nueva cantidad."
                            value={valueNew}
                            onChange={handleChange}
                        />
                        <Button variant="contained" color="error" onClick={() => {
                            handleChangeQuantity();
                            router.reload();
                        }}>
                            Cambiar Qty.
                        </Button>
                    </>
                }
            />

            <ConfirmDialog
                open={openDiscountPercentage}
                onClose={handleCloseDiscountPercentage}
                title="Nuevo porcentaje de descuento."
                content={`¿Estás seguro de que quieres cambiar el porcentaje? ${selected.DISCOUNTPERCENTSAP}`}
                action={
                    <>
                        <TextField
                            label="Nuevo porcentaje."
                            value={valueNew}
                            onChange={handleChange}
                        />
                        <Button variant="contained" color="error" onClick={() => {
                            handleChangeDiscount();
                            router.reload();
                        }}>
                            Cambiar Porcentaje.
                        </Button>
                    </>
                }
            />

            <ConfirmDialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                title="Borrar"
                content={`¿Estás seguro de que quieres eliminar? ${selected.PRODUCTO_ID}`}
                action={
                    <Button variant="contained" color="error" onClick={() => {
                        handleChangeDelete();
                        router.reload();
                    }}>
                        Borrar
                    </Button>
                }
            />
        </>
    );
}


export const top100Films = [
    {title: 'Cuenca', id: "002"},
    {title: 'Quito', id: "006"},
    {title: 'Guayaquil', id: "015"},
    {title: 'Manta', id: "024"}
]


export const topFormaPago = [
    {title: 'CONTADO', id: -1},
    {title: 'CONTADO 5 DÍAS', id: 1},
    {title: 'CONTADO 7 DÍAS', id: 2},
    {title: '15 DÍAS', id: 3},
    {title: '30 DÍAS', id: 4},
    {title: '45 DÍAS', id: 5},
    {title: '60 DÍAS', id: 6},
    {title: '90 DÍAS', id: 7},
    {title: '120 DÍAS', id: 8},
    {title: '30-60 DÍAS', id: 9},
    {title: '30-60-90 DÍAS', id: 10},
    {title: '30-60-90-120 DÍAS', id: 11},
    {title: '60-90-120 DÍAS', id: 12},
    {title: '36 MESES', id: 13},
    {title: '6 MESES', id: 14},
    {title: '12 MESES', id: 15},
    {title: '9 MESES', id: 16},
    {title: '18 MESES', id: 17},
    {title: '24 MESES', id: 18},
    {title: 'CONTADO / RET', id: 19},
    {title: 'CONTADO 8 DÍAS', id: 20},
    {title: '180 DIAS', id: 21},
    {title: '*', id: 22},
    {title: 'CONTADO 2 DIAS', id: 23}
]
