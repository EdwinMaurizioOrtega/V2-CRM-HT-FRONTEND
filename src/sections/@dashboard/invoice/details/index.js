import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
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
    TableContainer,
    IconButton,
    MenuItem,
    Button,
    TextField,
    Autocomplete,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogContent, Toolbar, AppBar, LinearProgress,
    SvgIcon,
    Alert,
    Checkbox,
    FormControlLabel
} from '@mui/material';

import Link from 'next/link';
// utils
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fCurrency, fNumberSin } from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Scrollbar from '../../../../components/scrollbar';
import Iconify from "../../../../components/iconify";
import MenuPopover from "../../../../components/menu-popover";
import ConfirmDialog from "../../../../components/confirm-dialog";
import axios from "../../../../utils/axios";
import { useAuthContext } from "../../../../auth/useAuthContext";
import React from 'react';
import { useSnackbar } from "../../../../components/snackbar";
import { HOST_API_KEY } from "../../../../config-global";
import { useBoolean } from "../../../../hooks/use-boolean";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PedidoInvoicePDF from "./PedidoInvoicePDF";
import {
    DOCUMENTACION,
    PAYMENT_OPTIONS_V2,
    TIPO_CREDITO,
    TIPO_PRECIO,
    BANCOS_LIDENAR,
    BANCOS_MOVILCELISTIC,
    ROLE
} from "../../../../utils/constants";

import datos from '/data/datos.json'; // Ajusta la ruta según la ubicación de tu archivo JSON
import datos_promo from '/data/promo.json'; // JSON Promoción
import { set } from 'lodash';
import { el } from 'date-fns/locale';

// ----------------------------------------------------------------------

const StyledRowResult = styled(TableRow)(({ theme }) => ({
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

function insertLineBreaks(text, maxLength) {
    if (!text) return ''; // Si el texto no está definido, retorna una cadena vacía
    let result = '';
    let currentLine = '';
    let words = text.split(' '); // Dividir el texto en palabras

    //console.log(`Palabras: ${words}`)

    for (let i = 0; i < words.length; i++) {
        if (currentLine.length + words[i].length <= maxLength) {
            // Si la palabra cabe en la línea actual, agregala
            currentLine += words[i] + ' ';
        } else {
            // Si no cabe, inicia una nueva línea
            result += currentLine.trim() + '\n';
            currentLine = words[i] + ' ';
        }
    }

    // Agregar la última línea
    result += currentLine.trim();
    //console.log(`Última línea: ${result}`)
    return result;
}


export default function InvoiceDetails({ invoice }) {

    //console.log("InvoiceDetail: " + JSON.stringify(invoice));

    const [loading, setLoading] = useState(false); // Variable de estado para rastrear el estado de carga

    const router = useRouter();

    const { user } = useAuthContext();

    const [selected, setSelected] = useState(false);

    const [valueNew, setValueNew] = useState('');

    const [seriesDisponibles, setSeriesDisponibles] = useState([]);

    const [valueGuia, setValueGuia] = useState('');
    const [valueFactura, setValueFactura] = useState('');
    const [valueValorFactura, setValueValorFactura] = useState('');
    const [empleadoEntregar, setEmpleadoEntregar] = useState('');

    const [openConfirm, setOpenConfirm] = useState(false);

    const [openCargarSeries, setOpenCargarSeries] = useState(false);
    const [openVerListaSeries, setOpenVerListaSeries] = useState(false);
    const [seriesGuardadas, setSeriesGuardadas] = useState([]);

    const [openPriceUnit, setOpenPriceUnit] = useState(false);

    const [openChangeProduct, setOpenChangeProduct] = useState(false);

    const [openQty, setOpenQty] = useState(false);

    const [openDiscountPercentage, setOpenDiscountPercentage] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [pedidoRetenido, setPedidoRetenido] = useState(false);

    const [textArrayCount, setTextArrayCount] = useState(0);
    const [uniqueTextArrayCount, setUniqueTextArrayCount] = useState(0);

    const [errorMessage, setErrorMessage] = useState('');


    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const handleOpenDiscountPercentage = () => {
        setOpenDiscountPercentage(true);
    };

    const handleCloseDiscountPercentage = () => {
        setOpenDiscountPercentage(false);
    };

    const FileCopySvgIcon = (props) => (
        <SvgIcon {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"></path>
        </SvgIcon>
    );

    const handleOpenQty = () => {
        setOpenQty(true);
    };

    const handleCloseQty = () => {
        setOpenQty(false);
    };

    const handleOpenPriceUnit = () => {
        setOpenPriceUnit(true);
    };

    const handleOpenChangeProduct = () => {
        setOpenChangeProduct(true);
    };

    const handleClosePriceUnit = () => {
        setOpenPriceUnit(false);
    };

    const handleCloseChangeProduct = () => {
        setOpenChangeProduct(false);
    };

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleOpenPopover = (event, rowData) => {
        setOpenPopover(event.currentTarget);

        //console.log("ID seleccionado:", rowData);
        setSelected(rowData);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const handleOpenCargarSeries = () => {
        setOpenCargarSeries(true);
    };

    const handleCloseCargarSeries = () => {
        setOpenCargarSeries(false);
    };


    const handleOpenVerListaSeries = async () => {
        setOpenVerListaSeries(true);

        // Llamar a la API cuando se abre el dialog
        await obtenerSeriesGuardadas();
    };

    const handleCloseVerListaSeries = () => {
        setOpenVerListaSeries(false);
    };


    const vaciarListaSeriesProducto = async () => {

        //console.log("Vaciar lista series producto: " + selected.ID)

        // Actualizar una orden.
        const response = await axios.delete(`/hanadb/api/orders/vaciar_series_por_id_detalle_orden?empresa=${user.EMPRESA}&id_detalle_orden=${selected.ID}`
        );

        // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
        if (response.status === 200) {
            router.reload();
        }


    };

    // Nueva función para eliminar una serie individual
    const eliminarSerieIndividual = async (internalSerial) => {
        try {
            const response = await axios.delete(
                `/hanadb/api/orders/delete_single_serie?empresa=${user.EMPRESA}&internal_serial=${internalSerial}&id_detalle_orden=${selected.ID}`
            );

            if (response.status === 200) {
                enqueueSnackbar('Serie eliminada exitosamente', {
                    variant: 'success',
                    autoHideDuration: 2000
                });
                // Refrescar la lista de series después de eliminar
                await obtenerSeriesGuardadas();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al eliminar la serie';
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 3000
            });
            console.error('Error al eliminar serie:', error);
        }
    };

    // Nueva función para marcar una serie como nota de crédito
    const marcarSerieComoNotaCredito = async (internalSerial) => {
        try {
            const response = await axios.put(
                `/hanadb/api/orders/mark_serie_nota_credito?empresa=${user.EMPRESA}&internal_serial=${internalSerial}&id_detalle_orden=${selected.ID}`
            );

            if (response.status === 200) {
                enqueueSnackbar('Serie marcada como nota de crédito exitosamente', {
                    variant: 'success',
                    autoHideDuration: 2000
                });
                // Refrescar la lista de series después de marcar
                await obtenerSeriesGuardadas();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al marcar la serie como nota de crédito';
            enqueueSnackbar(errorMessage, {
                variant: 'error',
                autoHideDuration: 3000
            });
            console.error('Error al marcar serie como nota de crédito:', error);
        }
    };

    // Nueva función para obtener las series guardadas de la API
    const obtenerSeriesGuardadas = async () => {
        try {

            //console.log("ID de orden:", selected.ID);

            const response = await axios.post(`/hanadb/api/orders/series_by_id_detalle_orden`, {
                empresa: user.EMPRESA,
                id_detalle_orden: Number(selected.ID),
            });

            if (response.status === 200) {
                //console.log("Series obtenidas exitosamente:", response.data.data);
                setSeriesGuardadas(response.data.data);
            } else {
                console.error('Error al obtener las series:', response.status);
                setSeriesGuardadas([]);
            }

        } catch (error) {
            console.error('Error en la solicitud para obtener series:', error);
            setSeriesGuardadas([]);
        }
    };

    const {
        items = [],
        ID,
        ESTADO,
        FECHACREACION,
        CLIENTEID,
        Nombres,
        Apellidos,
        Cliente,
        Ciudad,
        Celular,
        Tipo,
        VENDEDOR,
        BODEGA,
        FORMADEPAGO,
        CITY,
        ValidComm,
        GLN,
        Balance,
        Lista,
        U_SYP_DOCUMENTACION,
        U_SYP_CREDITO,
        GroupNum,
        CreditLine,
        DebtLine,
        OrdersBal,
        Free_Text,
        OBSERVACIONESB,
        OBSERVACIONES,
        DOCNUM,
        DISCOUNT,
        U_LS_ASEGURADORA,
        PEDIDO_RETENIDO
    } = invoice;

    //console.log("Pedido retenido: " + PEDIDO_RETENIDO)

    //console.log("OBSERVACIONES: " + OBSERVACIONES)
    //console.log("Row Detail Order: " + JSON.stringify(items))

    const [observacionA, setObservacionA] = useState('Ninguno...');
    const [transferAccount, setTransferAccount] = useState(null);
    const [transferReference, setTransferReference] = useState(null);
    const [totalDolaresReferencia, setTotalDolaresReferencia] = useState(0);

    const [showAutocomplete, setShowAutocomplete] = useState(false);

    useEffect(() => {
        // Aquí se ejecuta después del montaje del componente
        setObservacionA(OBSERVACIONES !== '' ? OBSERVACIONES : 'Ninguno...');

        // También puedes poner otros efectos secundarios aquí si es necesario

    }, [OBSERVACIONES]); // Este efecto se ejecutará cada vez que invoice.OBSERVACIONES cambie


    const handleChange = (event) => {
        setValueNew(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeGuia = (event) => {
        setValueGuia(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);

        //Comprobar si el valor del campo tiene exactamente 9 ceros. Si es así, se actualiza el estado showAutocomplete para mostrar el Autocomplete.
        // Determinar si se debe mostrar el Autocomplete
        if (/^0{9}$/.test(event.target.value)) {
            setShowAutocomplete(true);
            if (CLIENTEID === 'CL1791251237001') {
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }

    };

    const handleChangeFactura = (event) => {
        setValueFactura(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeValorFactura = (event) => {
        setValueValorFactura(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeEmpleadoEntregar = (event, newValue) => {
        setEmpleadoEntregar(newValue);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };


    const handleChangePriceUnit = async () => {

        // //console.log(selected.ID);
        // //console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/priceunit', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_PRICE_UNIT: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeProduct = async () => {

        // //console.log(selected.ID);
        // //console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/change_product', {
                ID_DETALLE_ORDEN: selected.ID,
                PRODUCTO_ID: valueNew,
                empresa: user.EMPRESA
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeQuantity = async () => {

        // //console.log(selected.ID);
        // //console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/quantity', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_QUANTITY: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeDiscount = async () => {

        // //console.log(selected.ID);
        // //console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/discount', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_DISCOUNT: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeLevelOrderDiscount = async () => {

        // //console.log(selected.ID);
        // //console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/discount', {
                NEW_DISCOUNT: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    const handleChangeDelete = async () => {
        try {
            const response = await axios.delete('/hanadb/api/orders/order/detail/delete', {
                params: {
                    ID_DETALLE_ORDEN: selected.ID,
                    empresa: user.EMPRESA,
                    id_order: ID
                }
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('La orden se eliminó correctamente');

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al eliminar la orden:', error);
        }
    };


    // Cambiar de bodega en la base de datos GRUPO_EMPRESARIAL_HT
    const handleChangeWarehouse = async (event, value) => {

        try {

            //console.log("Cambio de bodega.")
            //console.log(value.id); // Log the selected element
            //console.log(ID); // Log ID de la orden

            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/change_warehouse', {
                ID_ORDER: ID,
                NEW_WAREHOUSE: value.id,
                ID_USER: user.ID,
                empresa: user.EMPRESA
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }
    };

    // Cambiar la forma de pago en la base de datos GRUPO_EMPRESARIAL_HT
    const handleChangePayment = async (event, value) => {

        try {
            //console.log(value.id); // Log the selected element
            //console.log(ID); // Log ID de la orden
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/change_payment', {
                ID_ORDER: ID,
                NEW_PAYMENT: value.id,
                empresa: user.EMPRESA
            });

            //console.log("Orden actualizada correctamente.");
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }


    // Cambiar la forma de pago en la base de datos GRUPO_EMPRESARIAL_HT
    const handleBancoSeleccionado = async (event, value) => {

        try {
            //console.log(value.AcctCode); // Log the selected element
            //console.log(ID); // Log ID de la orden
            // Actualizar una orden.
            // const response = await axios.put('/hanadb/api/orders/order/change_payment', {
            //     ID_ORDER: ID,
            //     NEW_PAYMENT: value.id,
            //     empresa: user.EMPRESA
            // });

            // //console.log("Orden actualizada correctamente.");
            // //console.log("Código de estado:", response.status);

            // // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            // if (response.status === 200) {
            //     router.reload();
            // }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    // La  mejor forma de crear un CASE
    function nameWarehouse(ware) {
        //console.log(`Bodega: ${ware}`);
        const strings = {
            "019": "Centro Distribución HT",
            "002": "Cuenca Turi",
            "006": "Quito",
            // "015": "Guayaquil",
            "024": "Manta",
            "030": "Colón",
            "008": "Consignación",
            "039": "Bodega Claro",
            "010": "Cuenca Centro"
        };

        const bodegaActual = strings[ware];
        return bodegaActual || "Bodega no definida.";

    }

    function nameWarehouseAlphacell(ware) {
        //console.log(`Bodega: ${ware}`);
        const strings = {
            "001": "BODEGA",
            "002": "MOVISTAR RESERVA",
            "003": "MOVISTAR ENTREGADO",
            "004": "DEPRATI",
            "005": "CRESA CONSIGNACIÓN",
            "006": "COMPUTRONSA CONSIGNACIÓN",
            "007": "BODEGA CDHT QUITO",
            "009": "GUAYAQUIL SERVIENTREGA",
            "099": "INVENTARIO TRANSITO IMPORTACIONES"
        };

        const bodegaActual = strings[ware];
        return bodegaActual || "Bodega no definida.";

    }

    function nameWarehouseMovilCelistic(ware) {
        //console.log(`Bodega: ${ware}`);
        const strings = {
            "DISTLF": "CARAPUNGO - CENTRO DISTRIBUCION MOVILCELISTIC",
            "003": "MACHALA - MAYORISTAS MOVILCELISTIC MACHALA",
            "004": "CUENCA - MAYORISTAS MOVILCELISTIC TURI",
            "030": "COLON - MAYORISTAS MOVILCELISTIC COLON",
            "024": "MANTA - MAYORISTAS MOVILCELISTIC MANTA",
            "005": "CARAPUNGO - ⚠️ PENDIENTE OPERADORAS CARRIERS",
            "CARRIERS": "CARAPUNGO - ⚠️ OPERADORAS CARRIERS",
            "010": "CUENCA - MAYORISTAS MOVILCELISTIC CENTRO",
            "EA": "CONSIGNACION EA"
            // "T1CARACO": "QUITO - XIAOMI TERMINALES"
        };

        const bodegaActual = strings[ware];
        return bodegaActual || "Bodega no definida.";

    }

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

    function namePriceType(pri) {
        const strings = {
            1: "NE",
            2: "30 U.",
            3: "15 U.",
            4: "Reatil",
            5: "Mayorista",
            6: "PVP",
            7: "TC",
            8: "Militares",
            9: "09",
            10: "10",
        };

        const payActual = strings[pri];
        return payActual || "-";

    }

    const ivaPorcentaje = 0.15; // Porcentaje de IVA (15% en Ecuador)
    let subtotalTotal = 0;

    //TOMEBAMBA: VENDEDOR Y EJECUTIVO SOPORTE
    if (user.ROLE === '0' || user.ROLE === '2') {

        items.forEach((row) => {
            const subtotal = row.TM_PRECIO_UNITARIO_VENTA * row.CANTIDAD;
            subtotalTotal += subtotal;
        });

    } else {

        items.forEach((row) => {
            const descuento = (row.DISCOUNTPERCENTSAP || 0) / 100;
            const precioConDescuento = row.PRECIOUNITARIOVENTA * (1 - descuento);
            const subtotal = precioConDescuento * row.CANTIDAD;
            subtotalTotal += subtotal;
        });

    }

    const ivaTotal = (subtotalTotal - DISCOUNT) * ivaPorcentaje;
    const totalConIva = (subtotalTotal - DISCOUNT) + ivaTotal;

    //console.log('Subtotal: ', subtotalTotal);
    //console.log('IVA: ', ivaTotal);
    //console.log('Total incluido IVA: ', totalConIva);

    const enviarOrdenSAP = async () => {
        try {
            //console.log(ID); // Log ID de la orden
            //console.log(user.ID); // Log ID del usuario

            setLoading(true); // Establecer loading a true antes de hacer la llamada a la API

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/orders/orden_venta_sap', {
                ID_ORDER: ID,
                ID_USER: user.ID,
                OBSERVACION_APROBACION: observacionA,
                empresa: user.EMPRESA,
            });

            //console.log("Orden Creada en el SAP.");
            //console.log("Código de estado:", response.status);

            // Se completó con éxito (código de estado 200)
            if (response.status === 200) {
                //await router.push('/dashboard/invoice/list/');
                //setTimeout(() => {
                window.location.href = '/dashboard/invoice/list/';
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }
        } catch (error) {
            // Manejar el error de la petición POST aquí
            console.error('Error al actualizar la orden:', error);
        }

        // finally {
        //     setLoading(false); // Restablecer loading a false después de que se completa la llamada a la API, independientemente de si fue exitosa o falló
        // }
    };

    const enviarOrdenPendienteCargaSeries = async () => {

        if (FORMADEPAGO === '-1') {

            //console.log("Código de cuenta de transferencia: " + transferAccount.AcctCode);
            //console.log("Número de referencia: " + transferReference);
            //console.log("Total en dólares de referencia: " + totalDolaresReferencia);


            // Validar que todos los campos requeridos estén presentes
            if (!transferAccount || !transferAccount.AcctCode) {
                alert("Por favor selecciona una cuenta de transferencia");
                return;
            }

            if (!transferReference || transferReference.trim() === '') {
                alert("Por favor ingresa un número de referencia");
                return;
            }

            if (!totalDolaresReferencia || totalDolaresReferencia <= 0) {
                alert("Por favor ingresa un monto válido para el total en dólares");
                return;
            }

            const montoIngresado = parseFloat(totalDolaresReferencia);
            const montoMinimo = totalConIva - 1;
            const montoMaximo = totalConIva + 1;

            if (montoIngresado < montoMinimo || montoIngresado > montoMaximo) {
                alert(`El monto ingresado ($${totalDolaresReferencia}) debe estar entre $${montoMinimo.toFixed(2)} y $${montoMaximo.toFixed(2)}. Total de la orden: $${totalConIva.toFixed(2)}`);
                return;
            }

        }

        try {
            //console.log(ID); // Log ID de la orden
            //console.log(user.ID); // Log ID del usuario

            setLoading(true); // Establecer loading a true antes de hacer la llamada a la API

            // Convertir totalDolaresReferencia a número
            const totalDolaresNumerico = parseFloat(totalDolaresReferencia);

            // Preparar los datos base
            const requestData = {
                ID_ORDER: ID,
                ID_USER: user.ID,
                OBSERVACION_APROBACION: observacionA,
                empresa: user.EMPRESA,
                pedido_retenido: pedidoRetenido
            };

            // Agregar datos adicionales si es transferencia
            if (FORMADEPAGO === '-1') {
                requestData.CUENTA_TRANSFERENCIA = `${transferAccount.AcctCode}`;
                requestData.NUMERO_REFERENCIA = `${transferReference}`;
                requestData.TOTAL_DOLARES_REFERENCIA = totalDolaresNumerico;
            }


            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/orders/enviar_cargar_series', requestData);

            //console.log("Orden Creada en el SAP.");
            //console.log("Código de estado:", response.status);

            // Se completó con éxito (código de estado 200)
            if (response.status === 200) {
                //await router.push('/dashboard/invoice/list/');
                //setTimeout(() => {
                window.location.href = '/dashboard/invoice/list/';
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }
        } catch (error) {
            // Manejar el error de la petición POST aquí
            console.error('Error al actualizar la orden:', error);
        }

        // finally {
        //     setLoading(false); // Restablecer loading a false después de que se completa la llamada a la API, independientemente de si fue exitosa o falló
        // }
    };


    const crearFacturaSAP = async () => {

        try {
            setLoading(true);

            //console.log("Enviando datos a la API:");
            //console.log("- ID_ORDER:", ID);

            // Preparar los datos base
            const requestData = {
                ID_ORDER: ID,
                ID_USER: user.ID,
                empresa: user.EMPRESA,
            };

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/orders/factura_sap', requestData);

            //console.log("Factura creada en el SAP.");
            //console.log("Código de estado:", response.status);

            // Se completó con éxito (código de estado 200)
            if (response.status === 200) {
                // Verificar si la respuesta tiene un mensaje de éxito
                const responseData = response.data;

                if (responseData?.status === 'success') {
                    // Mostrar mensaje de éxito con Snackbar
                    enqueueSnackbar(
                        `✅ Factura creada exitosamente | Orden: ${responseData.data?.order_id || ID} | Factura SAP: ${responseData.data?.numero_factura || 'N/A'}`,
                        {
                            variant: 'success',
                            autoHideDuration: 5000,
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'center',
                            },
                        }
                    );

                    // Esperar un momento antes de redirigir para que el usuario vea el mensaje
                    //setTimeout(() => {
                    window.location.href = '/dashboard/invoice/list/';
                    //}, 2000);

                } else if (responseData?.status === 'fail') {
                    // Error del backend en formato fail
                    enqueueSnackbar(
                        responseData.message || '❌ Error al crear la factura',
                        {
                            variant: 'error',
                            autoHideDuration: 8000,
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'center',
                            },
                        }
                    );
                } else {
                    // Respuesta inesperada pero exitosa
                    enqueueSnackbar('Factura procesada correctamente', { variant: 'success' });
                    ///setTimeout(() => {
                    window.location.href = '/dashboard/invoice/list/';
                    //}, 2000);
                }
            }

        } catch (error) {
            console.error('Error al crear la factura:', error);

            // Extraer el mensaje de error más descriptivo posible
            let errorMessage = '❌ Error al crear la factura en SAP';
            let errorDetails = '';

            if (error.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                console.error('Respuesta de error del servidor:', error.response);

                if (error.response.data) {
                    if (typeof error.response.data === 'string') {
                        // Si la respuesta es un string simple
                        errorMessage = error.response.data;
                    } else if (error.response.data.message) {
                        // Si hay un campo message en el objeto
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.error) {
                        // Si hay un campo error en el objeto
                        errorMessage = error.response.data.error;
                    } else {
                        // Intentar mostrar el objeto completo
                        errorMessage = 'Error del servidor';
                        errorDetails = JSON.stringify(error.response.data, null, 2);
                    }
                }

                // Agregar el código de estado HTTP como detalle
                errorDetails = errorDetails ? `${errorDetails}\n\nCódigo HTTP: ${error.response.status}` : `Código HTTP: ${error.response.status}`;

            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                errorMessage = '❌ No se recibió respuesta del servidor';
                errorDetails = 'Verifica tu conexión a internet o contacta con el administrador';
            } else {
                // Algo pasó al configurar la solicitud
                errorMessage = '❌ Error al enviar la solicitud';
                errorDetails = error.message;
            }

            // Mostrar el error con enqueueSnackbar
            enqueueSnackbar(
                errorMessage,
                {
                    variant: 'error',
                    autoHideDuration: 10000,
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                }
            );

            // Si hay detalles adicionales, mostrarlos en un segundo snackbar
            if (errorDetails) {
                //setTimeout(() => {
                enqueueSnackbar(
                    errorDetails,
                    {
                        variant: 'info',
                        autoHideDuration: 8000,
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                    }
                );
                //}, 500);
            }

        } finally {
            setLoading(false);
        }
    };


    const handleChangePedidoPendienteFacturar = async () => {

        // //console.log(ID);
        //console.log(JSON.stringify(user));

        //=========For All Companys=========
        let idEmpleadoEntregar = 0;
        let nombreUsuarioEntregara = '';
        let estadoInvoice = 0

        if (user.COMPANY === 'HT') {

            //console.log("Empleado Entregar: " + JSON.stringify(empleadoEntregar))

            if (valueGuia === '000000000' && empleadoEntregar === '') {
                if (valueGuia === '000000000' && CLIENTEID === 'CL1791251237001') {
                    idEmpleadoEntregar = 0;
                    nombreUsuarioEntregara = '';
                    // estadoInvoice = 22
                } else {
                    alert("Seleccionar un empleado es obligatorio cuando la guía es => 000000000")
                    return; // Stop the execution of the function if the condition is met
                }
            }

            if (empleadoEntregar !== '') {
                idEmpleadoEntregar = empleadoEntregar.CODE
                nombreUsuarioEntregara = empleadoEntregar.NOMBRE
                //Facturado - Pendiente de cargar evidencia vendedor
                // estadoInvoice = 22;
            }

            if (valueGuia !== '000000000') {
                idEmpleadoEntregar = 0;
                nombreUsuarioEntregara = '';
                // estadoInvoice = 1
            }

            //console.log("ID empleado seleccionado: " + idEmpleadoEntregar)
        }


        //Enviamos los datos al servidor,
        if (valueGuia.length === 9) {

            setLoading(true); // Establecer loading a true antes de hacer la llamada a la API

            try {
                // Actualizar una orden.
                const response = await axios.put('/hanadb/api/orders/order/pendiente_facturar', {
                    ID_ORDER: ID,
                    NUMERO_GUIA: `${valueGuia}`,
                    empresa: user.EMPRESA,
                    ID_USER: user.ID,
                    IDUSUARIOENTREGARA: Number(idEmpleadoEntregar),
                    NOMBREUSUARIOENTREGARA: nombreUsuarioEntregara,
                    ESTADO: Number(estadoInvoice),
                });

                // Se completó con éxito (código de estado 200)
                if (response.status === 200) {
                    setErrorMessage('');
                    enqueueSnackbar('Orden facturada correctamente', { variant: 'success' });
                    router.push('/dashboard/invoice/list/');
                }

            } catch (error) {
                console.error('Error al facturar la orden:', error);

                // Extraer el mensaje de error del backend
                let errorMessage = 'Error al facturar la orden. Por favor, intenta de nuevo.';

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (typeof error.response?.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Mostrar el error con enqueueSnackbar
                setErrorMessage(errorMessage);
                enqueueSnackbar(errorMessage, { variant: 'error' });

            } finally {
                setLoading(false);
            }

        } else {
            enqueueSnackbar('El número de guía debe tener 9 caracteres.', { variant: 'error' })
        }

    }


    const [decodedString, setDecodedString] = useState('');

    const handleServiEntrega = async () => {

        //console.log("OBSERVACIONESB: " + OBSERVACIONESB);

        var cadenaSinCL = CLIENTEID.replace("CL", "");

        var ciuidadDestino = parseInt(JSON.parse(OBSERVACIONESB).CODE_SERVIENTREGA, 10);

        var dataToSend = {

            num_pedido: ID,

            // GuiaWebs
            id_tipo_logistica: 1,
            detalle_envio_1: '',
            detalle_envio_2: '',
            detalle_envio_3: '',
            // Ciudades
            id_ciudad_origen: selectedCityOrigen.id,
            id_ciudad_destino: ciuidadDestino,
            // Datos Destino
            id_destinatario_ne_cl: `${cadenaSinCL}`,
            razon_social_desti_ne: `${Cliente}`,
            nombre_destinatario_ne: `${Nombres}`,
            apellido_destinatar_ne: `${Apellidos}`,
            //MUY IMPORTANTE
            direccion1_destinat_ne: `${(JSON.parse(OBSERVACIONESB)).DIRECCION}`,
            sector_destinat_ne: '',
            telefono1_destinat_ne: `${Celular}`,
            telefono2_destinat_ne: `${Celular}`,
            codigo_postal_dest_ne: '000000',
            // Datos Remitente || BODEGA
            id_remitente_cl: '0992537442001',
            razon_social_remite: 'LIDENAR S.A.',
            nombre_remitente: `'${user.DISPLAYNAME}'`,
            apellido_remite: '',
            direccion1_remite: `'${user.ADDRESS}'`,
            sector_remite: '',
            telefono1_remite: `${user.PHONENUMBER}`,
            telefono2_remite: '',
            codigo_postal_remi: '',

            // 1 DOCUMENTO UNITARIO
            // 2 MERCANCIA PREMIER
            // 3 DOCUMENTO MASIVO
            // 6 MERCANCIA INDUSTRIAL
            // 8 VALIJA EMPRESARIAL 71 FARMA
            id_producto: 2,
            //
            contenido: 'CELULARES',
            //Cajas - Bultos
            numero_piezas: selectedCityBoxes.id,
            // Valor total int
            valor_mercancia: fNumberSin(totalConIva),
            // Valor 40% int
            //valor_asegurado: fNumberSin((totalConIva * 40) / 100),
            valor_asegurado: fNumberSin(totalConIva),
            largo: 0,
            ancho: 0,
            alto: 0,
            //El peso en nuestro caso es por bultos
            peso_fisico: 0.0,
            login_creacion: 'lidenar.sa',
            password: 'lidenar'
        };

        //console.log(JSON.stringify(dataToSend));

        // URL del servidor al que deseas enviar los datos
        const url = `${HOST_API_KEY}/hanadb/api/orders/order/ServiEntrega`;

        // Configuración de la solicitud
        const requestOptions = {
            method: "POST", // Método de la solicitud (POST en este caso)
            headers: {
                "Content-Type": "application/json", // Tipo de contenido de los datos enviados (JSON en este caso)
            },
            body: JSON.stringify(dataToSend), // Convertir el objeto en una cadena JSON y usarlo como cuerpo de la solicitud
        };

        // Realizar la solicitud Fetch
        fetch(url, requestOptions)
            .then((response) => response.json()) // Convertir la respuesta en formato JSON
            .then((data) => {
                // Aquí puedes manejar la respuesta del servidor (data)
                //console.log("Respuesta del servidor:", data);

                var pdfDecode = data.base64File;

                setDecodedString(atob(pdfDecode))

            })
            .catch((error) => {
                // Aquí puedes manejar errores en la solicitud
                console.error("Error en la solicitud:", error);
            });

    }

    const [dataCities, setDataCities] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            // try {
            //     const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/order/ServiEntrega/ciudades`);
            //     const result = await response.json();
            //     setDataCities(result.data);
            //     //console.log(dataCities);
            // } catch (error) {
            //     //console.log('error', error);
            // }


            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_crm_empleados_venta`);

                if (response.status === 200) {
                    //console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataEmpleadosVenta(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }


        };

        fetchData();

        // Si necesitas hacer algo al desmontar el componente, puedes retornar una función desde useEffect
        return () => {
            // Por ejemplo, limpiar intervalos, cancelar solicitudes, etc.
        };
    }, []); // El segundo argumento es un array de dependencias, en este caso, está vacío para que se ejecute solo una vez


    const [selectedCityOrigen, setSelectedCityOrigen] = useState('');
    const handleCityChangeOrigen = (event, value) => {
        if (value) {
            setSelectedCityOrigen(value)
        }
    };

    const [selectedCityDestino, setSelectedCityDestino] = useState('');
    const handleCityChangeDestino = (event, value) => {
        if (value) {
            setSelectedCityDestino(value)
        }
    };


    const [selectedCityBoxes, setSelectedCityBoxes] = useState('');
    const handleCityChangeBoxes = (event, value) => {
        if (value) {
            setSelectedCityBoxes(value)
        }
    };


    //Para imprimir
    useEffect(() => {
        //console.log("Origen ID:", selectedCityOrigen.id);
        //console.log("Destino ID:", selectedCityDestino.id);
        //console.log("Boxes ID:", selectedCityBoxes.id);
    }, [selectedCityOrigen, selectedCityDestino, selectedCityBoxes]);


    const openPDFInNewTab = () => {
        const byteCharacters = decodedString;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };


    const handleButtonClick = () => {
        //console.log('Contenido del texto:', observacion);
        // Puedes realizar otras acciones con el contenido del texto aquí
    };

    const handleDownloadClick = async (id) => {
        // Your method or logic to execute after the download icon is clicked
        //console.log('Download icon clicked!');
        //console.log("Número de orden: " + id);

        try {
            const response = await axios.put('/hanadb/api/orders/order/imprimir', {
                params: {
                    ID: id,
                    empresa: user?.EMPRESA
                }
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                //console.log('Impresión de la orden en PDF.');
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al colocar la fecha de impresión en la orden:', error);
        }

    };

    ////console.log("USUARIO: "+ JSON.stringify( user));

    const orderAprobarEjecutivoSoporte = async () => {
        //console.log("Número de orden Tomebamba: " + ID);

        try {
            const response = await axios.put('/hanadb/api/orders/order/importadora_tomebamba_approve', {
                ID_ORDER: ID,
                STATUS: 13,
                empresa: user.EMPRESA,
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('Cambiando estado');
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {

                //setTimeout(() => {
                router.reload();
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al cambiar el status de la orden: ', error);
        }

    }

    const orderAprobarComercial = async () => {
        //console.log("Número de orden Tomebamba: " + ID);

        try {
            const response = await axios.put('/hanadb/api/orders/order/importadora_tomebamba_approve', {
                ID_ORDER: ID,
                STATUS: 6,
                empresa: user.EMPRESA,
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('Cambiando estado');
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {

                //setTimeout(() => {
                router.reload();
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al cambiar el status de la orden:', error);
        }

    }

    const [openConfirmAnular, setOpenConfirmAnular] = useState(false);


    const handleOpenConfirmAnular = () => {
        setOpenConfirmAnular(true);
    };

    const handleCloseConfirmAnular = () => {
        setOpenConfirmAnular(false);
    };

    //Anúla una orden
    const onAnularRow = async () => {
        //console.log("Número de orden: " + ID);
        //console.log("Observación anulación orden: " + valueNew);

        try {
            const response = await axios.put('/hanadb/api/orders/order/anular', {
                params: {
                    ID_ORDER: ID,
                    OBSERVACION_ANULACION: valueNew,
                    ID_USER: user.ID,
                    empresa: user.EMPRESA
                }
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('Estado de orden anulado.');
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {

                //setTimeout(() => {
                router.reload();
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al eliminar la orden:', error);
        }

    };

    const [dataEmpladosVenta, setDataEmpleadosVenta] = useState([]);

    const [preciosActualizados, setPreciosActualizados] = useState({});

    const handlePrecioChange = (id, nuevoValor) => {
        const valorNumerico = parseFloat(nuevoValor);

        if (!nuevoValor || isNaN(valorNumerico) || valorNumerico === 0) {
            // Eliminar si es 0 o inválido
            const { [id]: omitido, ...resto } = preciosActualizados;
            setPreciosActualizados(resto);
        } else {
            // Quitar el IVA del 15% - si el valor viene con IVA incluido (ej: 115), dividimos entre 1.15 para obtener el valor base (100)
            const valorSinIVA = valorNumerico / 1.15;
            // Agregar o actualizar valor
            setPreciosActualizados(prev => ({
                ...prev,
                [id]: valorSinIVA,
            }));
        }
        ////console.log("JSON actualizado:", JSON.stringify(preciosActualizados, null, 2));
    };

    const enviarPrecios = async () => {
        ////console.log("JSON actualizado:", JSON.stringify(preciosActualizados));
        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/massive_priceunit', {
                empresa: user.EMPRESA,
                id_order: ID,
                massive_price_update: preciosActualizados
            });

            ////console.log("Orden actualizada correctamente.");
            ////console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            //console.error('Error al actualizar la orden:', error);
        }

    };

    //const [openChangeProduct, setOpenChangeProduct] = useState(false);

    // const handleOpenChangeProduct = (row) => {
    //     setOpenChangeProduct(true);
    //     //console.log(row);
    //     setSelected(row)
    // };

    // const handleCloseChangeProduct = () => {
    //     setOpenChangeProduct(false);
    // };

    const handlePrintClick = () => {

        setButtonDisabled(true);

        const textArray = valueNew.split('\n').map((item) => item.trim()).filter(Boolean); // Eliminar líneas vacías

        setTextArrayCount(textArray.length);

        const uniqueTextArray = [...new Set(textArray)]; // Eliminar duplicados usando un Set

        // var validIMEIs = uniqueTextArray.filter(function (imei) {
        //     return luhn_validate(imei);
        // });


        // function luhn_validate(fullcode) {
        //     return luhn_checksum(fullcode) == 0
        // }

        // function luhn_checksum(code) {
        //     var len = code.length
        //     var parity = len % 2
        //     var sum = 0
        //     for (var i = len - 1; i >= 0; i--) {
        //         var d = parseInt(code.charAt(i))
        //         if (i % 2 == parity) {
        //             d *= 2
        //         }
        //         if (d > 9) {
        //             d -= 9
        //         }
        //         sum += d
        //     }
        //     return sum % 10
        // }


        setUniqueTextArrayCount(uniqueTextArray.length); // Contar solo los IMEIs válidos

        const validatedIMEIs = uniqueTextArray.join(',\n');

        setValueNew(validatedIMEIs);
        //console.log(validatedIMEIs);
        // Puedes agregar aquí una lógica adicional después de imprimir en la consola, si es necesario

    };

    const handleTextChange = (event) => {
        const inputText = event.target.value;
        const textArray = inputText.split('\n').map((item) => item.trim());
        setTextArrayCount(textArray.length);
        setValueNew(event.target.value);
        //setText(textArray.join('\n'));
    };

    const handleCargarSeriesSAP = async () => {

        // Reemplazar los saltos de línea (\n) por una cadena vacía
        const sinSaltosDeLinea = valueNew.replace(/\n/g, '');
        //console.log("SinSaltosDeLinea: " + sinSaltosDeLinea);
        // Convertir la cadena a un array de strings
        const listaDeStrings = sinSaltosDeLinea.split(',').map(String);
        //console.log("ListaDeStrings: " + listaDeStrings);

        //console.log("Selected: " + JSON.stringify(selected));
        //console.log("Selected: " + JSON.stringify(selected.PRODUCTO_ID));
        //console.log("User: " + JSON.stringify(user.WAREHOUSE));

        try {
            const response = await axios.post(`/hanadb/api/orders/sap/validate_series_by_bodega_producto_in_sap`, {
                empresa: user.EMPRESA,
                bodega: BODEGA,
                cod_producto: selected.PRODUCTO_ID,
                series: `${listaDeStrings}`,
            });

            if (response.status === 200) {
                //console.log(response);
                //console.log("hola.......");
                alert(JSON.stringify(response.data));

                setSeriesDisponibles(JSON.stringify(response.data));
            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleClearClick = () => {
        setValueNew('');
        setTextArrayCount(0);
        setUniqueTextArrayCount(0);
        setButtonDisabled(false); // Asegúrate de habilitar el botón después de limpiar.
        setSeriesDisponibles('{"data": []}');
        setSelected(false);
        setOpenCargarSeries(false);

        // Recargar la página
        window.location.reload();
    };


    const handleGuardarSeriesDisponiblesSAP = async () => {
        //console.log("selected.ID: " + selected.ID);


        const parsedData = JSON.parse(seriesDisponibles);
        const dataArray = parsedData?.data || [];
        const seriesList = dataArray.map(item => item.IntrSerial);

        //console.log("Lista de Series:", seriesList);
        //console.log("Total de series:", seriesList.length);

        // Si quieres solo la lista como string separado por comas:
        //console.log("Series separadas por comas:", seriesList.join(', '));
        const seriesListPorComa = seriesList.join(', ');


        try {
            const response = await axios.post(`/hanadb/api/orders/save_series_by_id_detalle_orden`, {
                empresa: user.EMPRESA,
                id_usuario: Number(user.ID),
                series: seriesList,
                id_detalle_orden: Number(selected.ID)
            });

            if (response.status === 200) {
                //console.log(response);

                //alert(JSON.stringify(response.data));

                setSeriesDisponibles(JSON.stringify(response.data));

                //Recargar la página
                window.location.reload();
            } else {
                //
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
                alert(JSON.stringify(response.status));

            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }

    }

    const liberarOrden = async () => {

        try {
            const response = await axios.put('/hanadb/api/orders/order/liberar_orden_retenida', {
                ID_ORDER: ID,
                empresa: user.EMPRESA,
            });

            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            console.error('Error al liberar la orden:', error);
        }

    }

    const handleDespacharOrden = async () => {
        try {
            setLoading(true);
            const response = await axios.put('/hanadb/api/orders/order/despachar_orden', {
                ID_ORDER: ID,
                empresa: user.EMPRESA,
                ID_USER: user.ID,
            });

            if (response.status === 200) {
                enqueueSnackbar('Orden despachada exitosamente', { variant: 'success' });
                window.location.href = '/dashboard/invoice/list/';
            }
        } catch (error) {
            console.error('Error al despachar la orden:', error);
            enqueueSnackbar(
                error?.response?.data?.message || 'Error al despachar la orden',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* <InvoiceToolbar invoice={invoice} /> */}
            <Card sx={{ pt: 5, px: 5 }}>
                <Grid container>

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                        <Image disabledEffect alt="logo" src="/logo/logo_full.svg" sx={{ maxWidth: 120 }} />

                        {/*{user.COMPANY === 'HT' || user.COMPANY === 'ALPHACELL' ? (*/}
                        <PDFDownloadLink
                            document={<PedidoInvoicePDF invoice={invoice} user={user} empresa="LD" />}
                            fileName={`PEDIDO_CLIENTE_${invoice.ID}`}
                            style={{ textDecoration: 'none' }}
                        >
                            {({ loading }) => (
                                <Tooltip title="Descargar LD">
                                    <IconButton
                                        onClick={user.ROLE === "8" ? () => handleDownloadClick(ID) : undefined}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            <Iconify icon="eva:download-fill" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </PDFDownloadLink>


                        {
                            user.ROLE === '1' ? (

                                <PDFDownloadLink
                                    document={<PedidoInvoicePDF invoice={invoice} user={user} empresa="TM" />}
                                    fileName={`PEDIDO_CLIENTE_${invoice.ID}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {({ loading }) => (
                                        <Tooltip title="Descargar TM">
                                            <IconButton
                                                onClick={user.ROLE === "8" ? () => handleDownloadClick(ID) : undefined}
                                            >
                                                {loading ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                    <Iconify icon="eva:download-fill" />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </PDFDownloadLink>
                            ) : null

                        }

                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                        <Box sx={{ textAlign: { sm: 'right' } }}>
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

                            <Typography variant="h6">{`INV-${ID}`} {`OV-${DOCNUM}`}</Typography>

                            {ESTADO === 10 && user.ROLE === "2" ? (
                                <Grid container direction="column" alignItems="right" spacing={1}>
                                    <Grid item>
                                        <Button
                                            onClick={() => {
                                                orderAprobarEjecutivoSoporte();
                                            }}
                                            variant="contained">
                                            Aprobar Ejec.S.
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            onClick={() => {
                                                handleOpenConfirmAnular();
                                                handleClosePopover();
                                            }}
                                            variant="contained">
                                            Anular Ejec.S.
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : null
                            }

                            {ESTADO === 13 && user.ROLE === "1" ? (
                                <Grid container direction="column" alignItems="right" spacing={1}>
                                    <Grid item>
                                        <Button
                                            onClick={() => {
                                                orderAprobarComercial();
                                            }}
                                            variant="contained">
                                            Aprobar Com..
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            onClick={() => {
                                                handleOpenConfirmAnular();
                                                handleClosePopover();
                                            }}
                                            variant="contained">
                                            Anular Com..
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : null
                            }
                        </Box>
                    </Grid>

                    {user.ROLE !== '0' ? (
                        user.ROLE !== '2' ? (
                            <>

                                <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                                    <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
                                        FACTURA A:
                                    </Typography>
                                    <Label color="success">{Cliente}</Label>
                                    <Typography variant="body2">CI/RUC: {CLIENTEID}</Typography>

                                    {/* 31 => Clientes Mayoristas || 8 => Bodega */}
                                    {(user.ROLE !== '31' && user.ROLE !== '8') ? (

                                        <>
                                            <Label color="success">{Ciudad}</Label>
                                            <Typography variant="body2">TIPO: {Tipo}</Typography>
                                            <Label color="success">Lista Precio: {tipoPrecio(Lista)}</Label>
                                            <Typography variant="body2">Saldo de
                                                Cuenta: {fCurrency(Balance)}</Typography>
                                            <Label
                                                color="success">DOCUMENTACIÓN: {documentacion(U_SYP_DOCUMENTACION)}</Label>
                                            <Typography variant="body2">Tipo de
                                                Crédito: {tipoCredito(U_SYP_CREDITO)}</Typography>
                                            <Label color="success">Condicion de Pago: {nameFormaPago(GroupNum)}</Label>
                                            <Typography variant="body2">Límte de
                                                Crédito: {fCurrency(CreditLine)}</Typography>
                                            <Label color="success">Límite de comprometido: {fCurrency(DebtLine)}</Label>
                                            <Typography variant="body2">Pedidos
                                                Clientes: {fCurrency(OrdersBal)}</Typography>
                                            <Label color="success">Aseguradora: {U_LS_ASEGURADORA}</Label>

                                            <div style={{ whiteSpace: 'pre-line', fontSize: '15px' }}>
                                                <span>
                                                    Comentario: {insertLineBreaks(Free_Text, 40)}
                                                </span>
                                            </div>
                                        </>

                                    ) : null}


                                </Grid>

                                <Grid item xs={12} sm={6} sx={{ mb: 5 }}>
                                    <Typography paragraph variant="overline" sx={{ color: 'text.disabled' }}>
                                        Orden de
                                    </Typography>

                                    <Typography variant="body2">{VENDEDOR}</Typography>

                                    <Typography variant="body2">{CITY}</Typography>

                                    {/* <Typography variant="body2">Phone: {invoiceFrom.phone}</Typography> */}
                                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                                        fecha de creación
                                    </Typography>

                                    <Typography variant="body2">{FECHACREACION}</Typography>

                                    <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                                        opciones
                                    </Typography>

                                    {user.ROLE !== '31' ? (
                                        <>
                                            <Grid item xs={12} sm={5} sx={{ mb: 1 }}>

                                                {/* <Typography variant="body2">{fDate(dueDate)}</Typography> */}

                                                <Typography variant="body2">Bodega actual: {
                                                    user.EMPRESA === '0992537442001' ? (
                                                        nameWarehouse(BODEGA) // Hipertronics
                                                    ) : user.EMPRESA === '0992264373001' ? (
                                                        nameWarehouseAlphacell(BODEGA) // Alphacell
                                                    ) : user.EMPRESA === '1792161037001' ? (
                                                        nameWarehouseMovilCelistic(BODEGA) // MovilCelistic
                                                    ) : (
                                                        'No disponible' // Caso por defecto
                                                    )
                                                }</Typography>

                                                {(user.ROLE === "9" || user.ROLE === "10") && (ESTADO === 6) && (
                                                    <Autocomplete
                                                        fullWidth
                                                        options={
                                                            // Hipertronics
                                                            user.EMPRESA == '0992537442001' ? (
                                                                top100Films
                                                            ) : user.EMPRESA === '0992264373001' ? (
                                                                //Alphacell
                                                                top100FilmsAlphacell
                                                            ) : user.EMPRESA === '1792161037001' ? (
                                                                top100FilmsMovilCelistic // MovilCelistic
                                                            ) : (
                                                                'No disponible' // Caso por defecto
                                                            )
                                                        }
                                                        getOptionLabel={(option) => option.title}
                                                        onChange={(event, value) => {
                                                            handleChangeWarehouse(event, value);
                                                        }} // Add onChange event handler
                                                        renderInput={(params) => <TextField {...params} label="-_-"
                                                            margin="none" />}
                                                    />
                                                )}

                                            </Grid>

                                            <Grid item xs={12} sm={7} sx={{ mb: 1 }}>

                                                <Typography variant="body2">Forma de pago
                                                    actual: {nameFormaPago(FORMADEPAGO)}</Typography>

                                                {((user.ROLE === "9" || user.ROLE === "10") || (ESTADO === 15 && ['7', '10'].includes(user.ROLE))) && (ESTADO === 6) && (
                                                    <>

                                                        <Autocomplete
                                                            fullWidth
                                                            options={PAYMENT_OPTIONS_V2}
                                                            getOptionLabel={(option) => option.title}
                                                            onChange={(event, value) => {
                                                                handleChangePayment(event, value);
                                                            }}
                                                            renderInput={(params) => <TextField {...params} label="-_-"
                                                                margin="none" />}
                                                        />
                                                    </>
                                                )}


                                                {/* CONTADO */}
                                                {(FORMADEPAGO === '-1' && ESTADO === 6) && (
                                                    <>
                                                        {/* Hipertronics */}
                                                        {user.EMPRESA === '0992537442001' && (
                                                            <Autocomplete
                                                                fullWidth
                                                                options={BANCOS_LIDENAR}
                                                                getOptionLabel={(option) => option.AcctName}
                                                                onChange={(event, value) => {
                                                                    setTransferAccount(value);
                                                                    //console.log("Banco seleccionado:", value);
                                                                }}
                                                                renderInput={(params) => <TextField {...params}
                                                                    label="Seleccionar Banco"
                                                                    margin="none" />}
                                                            />
                                                        )}

                                                        {/* MovilCelistic */}
                                                        {user.EMPRESA === '1792161037001' && (
                                                            <Autocomplete
                                                                fullWidth
                                                                options={BANCOS_MOVILCELISTIC}
                                                                getOptionLabel={(option) => option.AcctName}
                                                                onChange={(event, value) => {
                                                                    setTransferAccount(value);
                                                                    //console.log("Banco seleccionado:", value);
                                                                }}
                                                                renderInput={(params) => <TextField {...params}
                                                                    label="Seleccionar Banco"
                                                                    margin="none" />}
                                                            />
                                                        )}


                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            placeholder="Número de referencia."
                                                            label="Número de referencia."
                                                            value={transferReference}
                                                            onChange={(e) => setTransferReference(e.target.value)}
                                                        />

                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            placeholder="Total dólares referencia."
                                                            label="Total dólares referencia."
                                                            value={totalDolaresReferencia}
                                                            onChange={(e) => setTotalDolaresReferencia(e.target.value)}
                                                        />
                                                    </>
                                                )}


                                            </Grid>

                                        </>) : null
                                    }
                                </Grid>
                            </>
                        ) : null
                    ) : null}

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>

                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ mb: 5 }}>

                    </Grid>


                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            color: PEDIDO_RETENIDO ? 'error.main' : 'success.main',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: PEDIDO_RETENIDO ? 'error.lighter' : 'success.lighter',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {PEDIDO_RETENIDO ? '🚫' : '✅'}
                        </Box>
                        {PEDIDO_RETENIDO ? 'ORDEN RETENIDA' : 'ORDEN NO RETENIDA'}
                    </Typography>
                </Grid>

                <TableContainer sx={{ overflow: 'unset' }}>
                    <Scrollbar>
                        <Table sx={{ minWidth: 960 }}>
                            <TableHead
                                sx={{
                                    borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
                                    '& th': { backgroundColor: 'transparent' },
                                }}
                            >
                                <TableRow>
                                    <TableCell width={40}>#</TableCell>
                                    <TableCell align="left">Descripción</TableCell>


                                    {
                                        (user.ROLE === "9" || user.ROLE === "10") && (
                                            <>
                                                <TableCell align="left">Tipo Precio</TableCell>
                                            </>

                                        )}


                                    {
                                        (user.ROLE === "9" || user.ROLE === "10") && (
                                            <>
                                                <TableCell align="left">%Desc.</TableCell>
                                            </>
                                        )
                                    }
                                    <TableCell align="left">Cantidad</TableCell>

                                    {
                                        (user.ROLE === "9" || user.ROLE === "10") ? (
                                            <>
                                                {/* <TableCell align="left">Stock SAP</TableCell>
                                            <TableCell align="left">R/PorCargarSeries</TableCell>
                                            <TableCell align="left">R/PorFacturar</TableCell> */}
                                                <TableCell align="left">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        Disponible
                                                        <Tooltip
                                                            title="Cantidad disponible en inventario para esta bodega (Stock SAP - Reservado Por Facturar - Reservado Por Cargar Series).">
                                                            <IconButton
                                                                size="small"
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    color: 'text.secondary',
                                                                    '&:hover': {
                                                                        color: 'primary.main'
                                                                    }
                                                                }}
                                                            >
                                                                <Iconify icon="eva:question-mark-circle-outline"
                                                                    width={16} height={16} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>

                                            </>
                                        ) : null
                                    }

                                    {(user.ROLE === "9" || user.ROLE === "10") && (<>

                                        <TableCell align="left">Costo</TableCell>
                                    </>
                                    )}
                                    <TableCell align="left">Comentario Precio</TableCell>

                                    {(user.ROLE === "9" || user.ROLE === "10") && (<>

                                        <TableCell align="right">Precio unitario</TableCell>
                                        <TableCell align="right">Total</TableCell>

                                    </>
                                    )}

                                    {(user.ROLE === "0" || user.ROLE === "1" || user.ROLE === "2") && (<>

                                        <TableCell align="right">Precio unitario</TableCell>
                                        <TableCell align="right">Total</TableCell>

                                    </>
                                    )}

                                    {user.ROLE !== '0' ? (
                                        user.ROLE !== '2' ? (
                                            <>
                                                <TableCell align="left">Acciones</TableCell>
                                            </>
                                        ) : null
                                    ) : null
                                    }

                                    {/* <TableCell align="left">ID Detalle</TableCell> */}

                                    {(user.ROLE === "8") && (
                                        <TableCell align="left">Nro. Series Cargadas</TableCell>
                                    )}

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
                                            <Box sx={{ maxWidth: 560 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    // sx={{
                                                    //     backgroundColor: isCodigoAllowed(row.PRODUCTO_ID, BODEGA) ? 'pink' : 'inherit'
                                                    // }}
                                                    sx={{
                                                        backgroundColor: isCodigoAllowedPromocion(row.PRODUCTO_ID),
                                                    }}
                                                >
                                                    {row.NOMBRE !== null ? row.NOMBRE : 'VALOR DEL ENVIO'}
                                                </Typography>

                                                <Typography variant="body2" sx={{
                                                    color: 'text.secondary',
                                                    backgroundColor: row.PRODUCTO_ID === '07.62.02'
                                                        || row.PRODUCTO_ID === '07.62.01' ? 'yellow' : 'inherit'
                                                }} noWrap>
                                                    {row.PRODUCTO_ID}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {/*{user.ROLE !== '0' ? (*/}
                                        {/*    user.ROLE !== '2' ? (*/}
                                        {/*        <TableCell align="left">{namePriceType(row.TIPOPRECIO)}</TableCell>*/}
                                        {/*    ) : null*/}
                                        {/*) : null*/}
                                        {/*}*/}


                                        {user.ROLE === '0' || user.ROLE === '2' && (
                                            // ROLES TOMEBAMBA
                                            <TableCell align="left">{namePriceType(row.TM_TIPO_PRECIO)}</TableCell>

                                        )
                                        }

                                        {(user.ROLE === "9" || user.ROLE === "10") && (
                                            <>
                                                <TableCell align="left">{namePriceType(row.TIPOPRECIO)}</TableCell>
                                            </>
                                        )}

                                        {(user.ROLE === "9" || user.ROLE === "10") && (
                                            <>
                                                <TableCell align="left">{row.DISCOUNTPERCENTSAP}</TableCell>
                                            </>
                                        )}

                                        <TableCell align="left">{row.CANTIDAD}</TableCell>


                                        {
                                            (user.ROLE === "9" || user.ROLE === "10") ? (

                                                <>
                                                    {/* <TableCell align="left" >{Number(row.STOCK_POR_BODEGA)}</TableCell> */}

                                                    {/* <TableCell align="left" >{Number(row.RESERVADO_CARGAR_SERIES)}</TableCell> */}

                                                    {/* <TableCell align="left" >{Number(row.RESERVADO_POR_BODEGA)}</TableCell> */}

                                                    <TableCell align="left"
                                                        style={{ backgroundColor: Number(row.DISPONIBLE_POR_BODEGA) <= 0 ? 'rgba(255, 0, 0, 0.08)' : 'rgba(0, 171, 85, 0.08)' }}>

                                                        {Number(row.DISPONIBLE_POR_BODEGA)}</TableCell>
                                                </>

                                            ) : null
                                        }

                                        {(user.ROLE === "9" || user.ROLE === "10") &&
                                            <TableCell align="left">{fCurrency(row.COSTO * 1.15)}</TableCell>}

                                        {user.ROLE === '0' || user.ROLE === '2' && (
                                            <>
                                                <TableCell
                                                    align="right">{fCurrency(row.TM_PRECIO_UNITARIO_VENTA)}</TableCell>
                                                <TableCell
                                                    align="right">{fCurrency(row.TM_PRECIO_UNITARIO_VENTA * row.CANTIDAD)}</TableCell>
                                            </>

                                        )}
                                        <TableCell align="left">{row.COMENTARIOPRECIO}</TableCell>

                                        {(user.ROLE === "9" || user.ROLE === "10") && (
                                            <>

                                                <TableCell
                                                    align="left">
                                                    <Box display="flex" flexDirection="column">


                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                            {fCurrency(
                                                                row.PRECIOUNITARIOVENTA)}
                                                        </Typography>

                                                        {(ESTADO === 6) && (
                                                            <TextField
                                                                onChange={(e) => handlePrecioChange(row.ID, e.target.value)}
                                                                size="small"
                                                                variant="standard"
                                                                inputProps={{ style: { textAlign: 'right' } }}
                                                                sx={{ width: 100 }} // o el valor que desees: 100, '80px', '10ch', etc.
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>


                                                <TableCell
                                                    align="right">{fCurrency(
                                                        (() => {
                                                            const descuento = (row.DISCOUNTPERCENTSAP || 0) / 100;
                                                            // Si el descuento es 100%, retornar 0 explícitamente
                                                            if (row.DISCOUNTPERCENTSAP >= 100) {
                                                                return 0;
                                                            }
                                                            const precioConDescuento = row.PRECIOUNITARIOVENTA * (1 - descuento);
                                                            return precioConDescuento * row.CANTIDAD;
                                                        })()
                                                    )}</TableCell>

                                            </>
                                        )
                                        }


                                        {(user.ROLE === "0" || user.ROLE === "2" || user.ROLE === "1") && (
                                            <>
                                                <TableCell
                                                    align="left">
                                                    <Box display="flex" flexDirection="row">

                                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                            {fCurrency(
                                                                row.PRECIOUNITARIOVENTA)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell
                                                    align="right">{fCurrency(row.PRECIOUNITARIOVENTA * row.CANTIDAD)}</TableCell>

                                            </>
                                        )
                                        }


                                        <TableCell align="right">
                                            <IconButton color={openPopover ? 'inherit' : 'default'}


                                                onClick={(event) => handleOpenPopover(event, row)}


                                            >
                                                <Iconify icon="eva:more-vertical-fill" />
                                            </IconButton>
                                        </TableCell>

                                        {/* <TableCell align="left">{row.ID}</TableCell> */}

                                        {(user.ROLE === "8") && (
                                            <>


                                                <TableCell
                                                    align="left"
                                                    sx={{
                                                        backgroundColor:
                                                            parseInt(row.SERIES_COUNT) === 0
                                                                ? 'inherit'
                                                                : parseInt(row.SERIES_COUNT) === parseInt(row.CANTIDAD)
                                                                    ? 'rgba(76, 175, 80, 0.2)' // Verde claro - completo
                                                                    : parseInt(row.SERIES_COUNT) > parseInt(row.CANTIDAD)
                                                                        ? 'rgba(244, 67, 54, 0.2)' // Rojo claro - excedido
                                                                        : 'rgba(255, 193, 7, 0.2)', // Amarillo/Naranja claro - incompleto
                                                        fontWeight: parseInt(row.SERIES_COUNT) !== 0 ? 'bold' : 'normal'
                                                    }}
                                                >
                                                    {parseInt(row.SERIES_COUNT) === 0
                                                        ? row.SERIES_COUNT
                                                        : parseInt(row.SERIES_COUNT) === parseInt(row.CANTIDAD)
                                                            ? `${row.SERIES_COUNT} ✅`
                                                            : parseInt(row.SERIES_COUNT) > parseInt(row.CANTIDAD)
                                                                ? `${row.SERIES_COUNT} ⚠️ (Excede: +${parseInt(row.SERIES_COUNT) - parseInt(row.CANTIDAD)})`
                                                                : `${row.SERIES_COUNT} (Faltan: ${parseInt(row.CANTIDAD) - parseInt(row.SERIES_COUNT)})`
                                                    }
                                                </TableCell>
                                            </>
                                        )}                                    </TableRow>

                                ))}

                                {(user.ROLE === "9" || user.ROLE === "10") && (
                                    <>
                                        <StyledRowResult>
                                            <TableCell colSpan={3} />

                                            <TableCell align="right" sx={{ typography: 'body1' }}>
                                                <Box sx={{ mt: 2 }} />
                                                Subtotal
                                            </TableCell>


                                            <TableCell align="right" width={120} sx={{ typography: 'body1' }}>
                                                <Box sx={{ mt: 2 }} />
                                                {fCurrency(subtotalTotal)}
                                            </TableCell>

                                        </StyledRowResult>

                                        <StyledRowResult>
                                            <TableCell colSpan={3} />

                                            <TableCell align="right" sx={{ typography: 'body1' }}>
                                                Discount
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                                width={120}
                                                sx={{ color: 'error.main', typography: 'body1' }}
                                            >
                                                {DISCOUNT && fCurrency(-DISCOUNT)}

                                                {user.ROLE === '9' && (
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        <TextField
                                                            value={valueNew}
                                                            onChange={handleChange}
                                                            sx={{ width: 75 }} // 🔥 Establece el ancho en 10px
                                                        />
                                                        {(ESTADO === 6) && (

                                                            <Button variant="contained" color="error" onClick={() => {
                                                                handleChangeLevelOrderDiscount();
                                                            }}>
                                                                ❤️
                                                            </Button>
                                                        )}
                                                    </Box>
                                                )
                                                }

                                            </TableCell>
                                        </StyledRowResult>

                                        <StyledRowResult>
                                            <TableCell colSpan={3} />

                                            <TableCell align="right" sx={{ typography: 'body1' }}>
                                                IVA
                                            </TableCell>

                                            <TableCell align="right" width={120} sx={{ typography: 'body1' }}>
                                                {fCurrency(ivaTotal)}
                                            </TableCell>
                                        </StyledRowResult>

                                        <StyledRowResult>
                                            <TableCell colSpan={3} />

                                            <TableCell align="right" sx={{ typography: 'h6' }}>
                                                Total
                                            </TableCell>

                                            <TableCell align="right" width={140} sx={{ typography: 'h6' }}>
                                                {fCurrency(totalConIva)}
                                            </TableCell>
                                        </StyledRowResult>
                                    </>
                                )}

                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>

                {/* Resumen de series cargadas para Bodega */}
                {(user.ROLE === "8") && (
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            📦 Total de series
                            cargadas: {items.reduce((total, item) => total + (parseInt(item.SERIES_COUNT) || 0), 0)}
                        </Typography>
                    </Box>
                )}

                {(user.ROLE === "8" || user.ROLE === "9" || user.ROLE === "10") && (
                    <>

                        {(ESTADO === 6) && (
                            <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%', px: 2, py: 1 }}>
                                <Button variant="contained" onClick={enviarPrecios}>
                                    Enviar precios actualizados
                                </Button>
                            </Box>
                        )}


                        <TextField
                            fullWidth
                            multiline
                            placeholder="Observaciones al aprobar."
                            label="Observaciones al aprobar."
                            value={observacionA}
                            onChange={(e) => setObservacionA(e.target.value)}
                        />
                    </>
                )}


                <Divider sx={{ mt: 5 }} />

                <Grid container>
                    <Grid item xs={12} md={9} sx={{ py: 3 }}>
                        <Typography variant="subtitle2">NOTAS</Typography>

                        <Typography variant="body2">
                            Una vez que su pedido haya sido aprobado, le solicitamos que en caso de requerir algún
                            cambio de
                            bodega o modificación en la orden, se comunique amablemente con el responsable del área
                            correspondiente. Agradecemos su colaboración. </Typography>
                    </Grid>

                    <Grid item xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
                        <Typography variant="subtitle2">¿Tengo una pregunta?</Typography>

                        <Link href="https://wa.me/593939991111">
                            WhatsApp
                        </Link>

                        {/* <Typography variant="body2">support@minimals.cc</Typography> */}
                    </Grid>
                </Grid>


                {user.COMPANY !== 'TOMEBAMBA' && (

                    <Grid container>
                        <Grid item xs={12} md={9} sx={{ py: 3 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 3,
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: 'primary.lighter',
                                        p: 1,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    📍
                                </Box>
                                INFORMACIÓN DE ENTREGA
                            </Typography>





                            {(() => {
                                try {
                                    const deliveryInfo = JSON.parse(OBSERVACIONESB);
                                    return (
                                        <Card
                                            sx={{
                                                p: 3,
                                                bgcolor: 'background.neutral',
                                                border: '2px solid',
                                                borderColor: 'primary.light',
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                                                }
                                            }}
                                        >
                                            <Grid container spacing={3}>
                                                {/* Dirección */}
                                                <Grid item xs={12}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1.5,
                                                            border: '1px solid',
                                                            borderColor: 'divider'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                            <Box
                                                                sx={{
                                                                    bgcolor: 'info.lighter',
                                                                    p: 0.75,
                                                                    borderRadius: 1,
                                                                    mr: 1.5,
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                🏠
                                                            </Box>
                                                            <Typography variant="subtitle2"
                                                                sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                                Dirección de Entrega
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                ml: 5,
                                                                color: 'text.primary',
                                                                fontWeight: 500,
                                                                lineHeight: 1.6
                                                            }}
                                                        >
                                                            {deliveryInfo.DIRECCION || 'No especificada'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                {/* Provincia */}
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'success.lighter',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minWidth: 40
                                                            }}
                                                        >
                                                            🌍
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Provincia
                                                            </Typography>
                                                            <Typography variant="body1"
                                                                sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                {deliveryInfo.PROVINCIA || 'No especificada'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* Cantón */}
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'warning.lighter',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minWidth: 40
                                                            }}
                                                        >
                                                            �️
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Cantón
                                                            </Typography>
                                                            <Typography variant="body1"
                                                                sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                {deliveryInfo.CANTON || 'No especificada'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* Parroquia */}
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'error.lighter',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minWidth: 40
                                                            }}
                                                        >
                                                            📍
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Parroquia
                                                            </Typography>
                                                            <Typography variant="body1"
                                                                sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                {deliveryInfo.PARROQUIA || 'No especificada'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* Código Postal */}
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'secondary.lighter',
                                                                p: 1,
                                                                borderRadius: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minWidth: 40
                                                            }}
                                                        >
                                                            📮
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" sx={{
                                                                color: 'text.secondary',
                                                                display: 'block'
                                                            }}>
                                                                Código Postal
                                                            </Typography>
                                                            <Typography variant="body1"
                                                                sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                                {deliveryInfo.ZIPCODE || 'No especificado'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* Tipo - Si existe */}
                                                {deliveryInfo.TIPO && (
                                                    <Grid item xs={12}>
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                bgcolor: 'info.lighter',
                                                                borderRadius: 1.5,
                                                                border: '1px dashed',
                                                                borderColor: 'info.main',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1.5
                                                            }}
                                                        >
                                                            <Typography variant="body2"
                                                                sx={{ fontWeight: 600, color: 'info.darker' }}>
                                                                🏷️ ID Dirección:
                                                            </Typography>
                                                            <Label
                                                                color="info"
                                                                sx={{
                                                                    fontSize: '0.875rem',
                                                                    py: 1,
                                                                    px: 2,
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {deliveryInfo.TIPO}
                                                            </Label>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Card>
                                    );
                                } catch (error) {
                                    return (
                                        <Card
                                            sx={{
                                                p: 3,
                                                bgcolor: 'warning.lighter',
                                                border: '2px solid',
                                                borderColor: 'warning.main',
                                                borderRadius: 2
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <Box
                                                    sx={{
                                                        bgcolor: 'warning.main',
                                                        color: 'white',
                                                        p: 1,
                                                        borderRadius: 1,
                                                        fontSize: '1.5rem'
                                                    }}
                                                >
                                                    ⚠️
                                                </Box>
                                                <Typography variant="subtitle1"
                                                    sx={{ color: 'warning.darker', fontWeight: 600 }}>
                                                    Información de entrega no disponible
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption"
                                                sx={{ color: 'text.secondary', mt: 1, display: 'block', ml: 6 }}>
                                                Formato inválido o datos no especificados
                                            </Typography>
                                        </Card>
                                    );
                                }
                            })()}
                        </Grid>

                    </Grid>

                )}

                <Divider sx={{ mt: 5 }} />

                {(user.ROLE === "9" || user.ROLE === "10") &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{ py: 3, textAlign: 'center' }}>
                            {/* <Button onClick={enviarOrdenSAP}>CREAR ORDEN DE VENTA SAP</Button> */}

                            {/* Enviar a pendiente cargar series */}
                            {(ESTADO === 6) &&
                                <Button onClick={() => !loading && enviarOrdenPendienteCargaSeries()}
                                    disabled={loading}>
                                    {loading ? 'CREANDO...' : 'ENVIAR A PENDIENTE CARGAR SERIES'}
                                </Button>
                            }

                            {/* Retenido */}
                            {(ESTADO === 6 && user.ROLE === "9") &&
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={pedidoRetenido}
                                            onChange={(e) => setPedidoRetenido(e.target.checked)}
                                            color="warning"
                                        />
                                    }
                                    label="Pedido Retenido"
                                />
                            }

                            {/* Pendiente factuaración / Solo le va a aparecer el ROL de crédito */}
                            {(ESTADO === 0 && user.ROLE === "9") &&
                                <Button onClick={() => !loading && crearFacturaSAP()} disabled={loading}>
                                    {loading ? 'CREANDO FACTURA...' : ' FACTURA CREAR EN SAP'}
                                </Button>
                            }



                            {(ESTADO === 5 && user.ROLE === "9") &&
                                <Button onClick={() => !loading && liberarOrden()} disabled={loading}>
                                    {loading ? 'LIBERANDO ORDEN...' : 'LIBERAR ORDEN'}
                                </Button>
                            }

                        </Grid>
                    </Grid>
                }

                {(user.ROLE === "8" && ESTADO === 7) &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{ py: 6 }}>

                            <TextField
                                required
                                label="Número de guia."
                                value={valueGuia}
                                // onChange={handleChangeGuia}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    if (/^[0-9]{0,9}$/.test(inputValue)) {
                                        handleChangeGuia(e);
                                    }
                                }}
                                inputProps={{ maxLength: 9 }}
                                error={valueGuia.length !== 9}
                                helperText={valueGuia.length !== 9 ? 'El número de guía debe tener 9 caracteres' : ''}
                            />
                            {/* <TextField */}
                            {/*     required */}
                            {/*     label="Número de factura." */}
                            {/*     value={valueFactura} */}
                            {/*     onChange={handleChangeFactura} */}
                            {/* /> */}
                            {/* <TextField */}
                            {/*     required */}
                            {/*     label="Valor total." */}
                            {/*     value={valueValorFactura} */}
                            {/*     onChange={handleChangeValorFactura} */}
                            {/* /> */}

                            {showAutocomplete && user.COMPANY === 'HT' && (
                                <Autocomplete
                                    name="vendedor"
                                    label="Vendedor"
                                    single
                                    freeSolo
                                    options={dataEmpladosVenta}
                                    getOptionLabel={(option) => option.NOMBRE || ''}
                                    renderInput={(params) => <TextField {...params} label="Entregar a: "
                                        margin="none" />}
                                    onChange={(event, newValue) => handleChangeEmpleadoEntregar(event, newValue)}

                                />

                            )}

                            {!loading ? (
                                <Button variant="contained" color="success"
                                    onClick={() => handleChangePedidoPendienteFacturar()}>
                                    Enviar al área de facturación.
                                </Button>
                            ) : (
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress color="success" />
                                </Box>
                            )}

                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    onClose={() => setErrorMessage('')}
                                    sx={{
                                        mt: 2,
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        '& .MuiAlert-message': {
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}

                        </Grid>

                    </Grid>
                }


                {/* Para uso de bodega con estado 3 - Por despachar */}
                {(user.ROLE === "8" && ESTADO === 3) &&
                    <Grid container>

                        <Button variant="contained" color="success"
                            onClick={() => handleDespacharOrden()}>
                            DESPACHAR ORDEN
                        </Button>

                    </Grid>

                }

            </Card>


            {/* {user.ROLE === "8" && */}
            {/*     <Card sx={{pt: 5, px: 5}}> */}
            {/*         <Grid item xs={12} sm={6} sx={{mb: 5}}> */}
            {/*             <Box sx={{textAlign: {sm: 'left'}}}> */}
            {/*                 <Typography variant="h4">SERVIENTREGA</Typography> */}
            {/*             </Box> */}
            {/*         </Grid> */}


            {/*         <Masonry columns={{xs: 1, sm: 2, md: 3}} spacing={3}> */}
            {/*             <Block title="Ciudad Origen"> */}
            {/*                 <Autocomplete */}
            {/*                     fullWidth */}
            {/*                     options={dataCities} */}
            {/*                     getOptionLabel={(option) => option.nombre} */}
            {/*                     renderInput={(params) => <TextField {...params} label="Origen"/>} */}
            {/*                     onChange={(event, value) => { */}
            {/*                         handleCityChangeOrigen(event, value); */}
            {/*                     }} */}
            {/*                     sx={{mb: 2}} */}
            {/*                 /> */}

            {/*                 /!* <Autocomplete *!/ */}
            {/*                 /!*     fullWidth *!/ */}
            {/*                 /!*     disableClearable *!/ */}
            {/*                 /!*     options={dataCities} *!/ */}
            {/*                 /!*     getOptionLabel={(option) => option.nombre} *!/ */}
            {/*                 /!*     renderInput={(params) => ( *!/ */}
            {/*                 /!*         <TextField *!/ */}
            {/*                 /!*             {...params} *!/ */}
            {/*                 /!*             label="Destino" *!/ */}
            {/*                 /!*             InputProps={{...params.InputProps, type: 'search'}} *!/ */}
            {/*                 /!*         /> *!/ */}
            {/*                 /!*     )} *!/ */}
            {/*                 /!*     onChange={(event, value) => { *!/ */}
            {/*                 /!*         handleCityChangeDestino(event, value); *!/ */}
            {/*                 /!*     }} *!/ */}

            {/*                 /!* /> *!/ */}
            {/*             </Block> */}

            {/*             <Block title="Bultos - Cajas"> */}
            {/*                 <Autocomplete */}
            {/*                     fullWidth */}
            {/*                     freeSolo */}
            {/*                     options={boxes} */}
            {/*                     getOptionLabel={(option) => option.title} */}
            {/*                     renderInput={(params) => <TextField {...params} label="Número"/>} */}
            {/*                     onChange={(event, value) => { */}
            {/*                         handleCityChangeBoxes(event, value); */}
            {/*                     }} */}
            {/*                     sx={{mb: 2}} */}
            {/*                 /> */}

            {/*             </Block> */}

            {/*             <Block title="Creación"> */}
            {/*                 <Button variant="contained" color="success" */}
            {/*                         onClick={() => handleServiEntrega()}> */}
            {/*                     SERVIENTREGA */}
            {/*                 </Button> */}

            {/*             </Block> */}

            {/*         </Masonry> */}


            {/*         /!* <Tooltip title="View"> *!/ */}
            {/*         /!*     <IconButton onClick={openPDFInNewTab}> <Iconify icon="solar:eye-bold"/></IconButton> *!/ */}
            {/*         /!* </Tooltip> *!/ */}

            {/*         {decodedString ? ( */}
            {/*             <Tooltip title="View"> */}
            {/*                 <IconButton onClick={openPDFInNewTab}> */}
            {/*                     <Iconify icon="solar:eye-bold"/> */}
            {/*                 </IconButton> */}
            {/*             </Tooltip> */}
            {/*         ) : ( */}
            {/*             <p>¡La guía aun no esta creada.!</p> */}
            {/*         )} */}

            {/*     </Card> */}
            {/* } */}


            {
                (user.ROLE === "9" || user.ROLE === "10") || (ESTADO === 15 && ['7', '10'].includes(user.ROLE)) ? (


                    <MenuPopover
                        open={openPopover}
                        onClose={handleClosePopover}
                        arrow="right-top"
                        sx={{ width: 160 }}
                    >

                        {(ESTADO === 6) && (

                            <>


                                <MenuItem
                                    onClick={() => {
                                        handleOpenPriceUnit();
                                        handleClosePopover();
                                    }}
                                >
                                    <Iconify icon="eva:edit-fill" />
                                    Precio Unitario.
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        handleOpenQty();
                                        handleClosePopover();
                                    }}
                                >
                                    <Iconify icon="eva:edit-fill" />
                                    Cantidad.
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleOpenDiscountPercentage();
                                        handleClosePopover();
                                    }}
                                >
                                    <Iconify icon="eva:edit-fill" />
                                    %Desc.
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleOpenChangeProduct();
                                        handleClosePopover();
                                    }}
                                >
                                    <Iconify icon="eva:edit-fill" />
                                    Producto.
                                </MenuItem>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                <MenuItem
                                    onClick={() => {
                                        handleOpenConfirm();
                                        handleClosePopover();
                                    }}
                                    sx={{ color: 'error.main' }}
                                >
                                    <Iconify icon="eva:trash-2-outline" />
                                    Borrar
                                </MenuItem>

                            </>
                        )
                        }

                        {/* Opciones para estado 8 (Anulado) - Gestión de series */}
                        {(user?.ROLE === '9') && (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        handleOpenVerListaSeries();
                                        handleClosePopover();
                                    }}
                                >
                                    <Iconify icon="eva:edit-fill" />
                                    Ver Series
                                </MenuItem>


                                {(ESTADO === 8) && (
                                    <MenuItem
                                        onClick={() => {
                                            vaciarListaSeriesProducto();
                                        }}
                                    >
                                        <Iconify icon="eva:edit-fill" />
                                        Vaciar Series
                                    </MenuItem>
                                )}
                            </>
                        )}
                    </MenuPopover>
                ) : null
            }


            {
                user.ROLE === "8" ? (

                    <MenuPopover
                        open={openPopover}
                        onClose={handleClosePopover}
                        arrow="right-top"
                        sx={{ width: 160 }}
                    >

                        <MenuItem
                            onClick={() => {
                                handleOpenCargarSeries();
                                handleClosePopover();
                            }}
                        >
                            <Iconify icon="eva:edit-fill" />
                            Cargar Series
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleOpenVerListaSeries();
                                handleClosePopover();
                            }}
                        >
                            <Iconify icon="eva:edit-fill" />
                            Ver Series
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                vaciarListaSeriesProducto();
                            }}
                        >
                            <Iconify icon="eva:edit-fill" />
                            Vaciar Series
                        </MenuItem>


                    </MenuPopover>
                ) : null
            }


            {
                user.ROLE === "2" || user.ROLE === "1" ? (

                    <MenuPopover
                        open={openPopover}
                        onClose={handleClosePopover}
                        arrow="right-top"
                        sx={{ width: 160 }}
                    >

                        {/* <MenuItem
                        onClick={() => {
                            handleOpenQty();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill" />
                        Cantidad.
                    </MenuItem> */}

                        <MenuItem
                            onClick={() => {
                                handleOpenConfirm();
                                handleClosePopover();
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <Iconify icon="eva:trash-2-outline" />
                            Borrar
                        </MenuItem>

                    </MenuPopover>
                ) : null
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
                        }}
                        >
                            Cambiar P.U.
                        </Button>
                    </>
                }
            />

            <ConfirmDialog
                open={openChangeProduct}
                onClose={handleCloseChangeProduct}
                title="Cambiar el color del modelo."
                content={`¿Estás seguro de que quieres cambiar el producto? ${selected.PRODUCTO_ID}`}
                action={
                    <>
                        <TextField
                            label="Nuevo producto."
                            value={valueNew}
                            onChange={handleChange}
                        />
                        <Button variant="contained" color="error" onClick={() => {
                            handleChangeProduct();
                        }}
                        >
                            Cambiar Producto.
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
                    }}>
                        Borrar
                    </Button>
                }
            />

            <ConfirmDialog
                open={openConfirmAnular}
                onClose={handleCloseConfirmAnular}
                title="Anular"
                content="¿Estás seguro de que quieres anular la orden?"
                action={
                    <>
                        <TextField
                            label="Observaciones al anular."
                            value={valueNew}
                            onChange={handleChange}
                        />

                        <Button variant="contained" color="error" onClick={() => {
                            onAnularRow();
                        }}
                        >
                            Anular
                        </Button>
                    </>

                }
            />


            <Dialog
                open={openCargarSeries}
                onClose={handleCloseCargarSeries}
                fullScreen
                sx={{ padding: '16px' }}
            >
                <AppBar position="relative">
                    <Toolbar>
                        {/* <IconButton color="inherit" edge="start" onClick={handleCloseCargarSeries}>
                            <Iconify icon="eva:close-fill" />
                        </IconButton> */}
                        <Button autoFocus color="inherit" onClick={handlePrintClick} disabled={buttonDisabled}>
                            Formatear Series
                        </Button>
                        <Button autoFocus color="inherit" onClick={() => {
                            handleCargarSeriesSAP();
                        }}>
                            Validar Series en SAP
                        </Button>
                        <Button color="inherit" onClick={handleClearClick} style={{ marginLeft: '10px' }}>
                            Cerrar
                        </Button>

                    </Toolbar>
                </AppBar>

                <DialogContent
                    dividers={scroll === 'paper'}
                    sx={{ padding: '16px' }}

                >

                    <Box
                        sx={{
                            display: 'flex', // Alinea los elementos horizontalmente
                            alignItems: 'center', // Centra verticalmente los elementos
                        }}
                    >

                        <Typography variant="body1" sx={{ marginRight: '10px' }}>
                            Líneas ingresadas: {textArrayCount}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                marginRight: '10px',
                                color: 'red',
                                fontSize: '40px',
                                fontWeight: 'bold',
                            }}
                        >
                            Válidos: {uniqueTextArrayCount}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                marginRight: '10px',
                                color: 'green',
                                fontSize: '40px',
                                fontWeight: 'bold',
                            }}
                        >
                            {`===> Se requieren: ${selected?.CANTIDAD} series`}
                        </Typography>
                    </Box>
                    {selected?.PRODUCTO_ID} {selected?.NOMBRE}

                    <Grid container spacing={2}>
                        {/* Columna Izquierda - TextField para ingresar IMEIs */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                rows={100}
                                fullWidth
                                multiline
                                label="Lista IMEIs SAP"
                                value={valueNew}
                                onChange={handleTextChange}
                                disabled={buttonDisabled}
                            />
                        </Grid>

                        {/* Columna Derecha - Tabla de Series Disponibles */}
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGuardarSeriesDisponiblesSAP}
                            >
                                Guardar Series en el Producto
                            </Button>

                            {seriesDisponibles && (
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Estas se van a guardar en el producto {selected?.PRODUCTO_ID} {selected?.NOMBRE}:
                                    </Typography>
                                    <TableContainer sx={{ maxHeight: 400, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                        #
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                        Serie (IMEI)
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                        Código
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                        Producto
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                                        Bodega
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(() => {
                                                    try {
                                                        const parsedData = JSON.parse(seriesDisponibles);
                                                        const dataArray = parsedData?.data || [];
                                                        return dataArray.map((item, index) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{
                                                                    '&:nth-of-type(odd)': {
                                                                        backgroundColor: '#fafafa'
                                                                    },
                                                                    '&:hover': {
                                                                        backgroundColor: '#e3f2fd'
                                                                    }
                                                                }}
                                                            >
                                                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell
                                                                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                                    {item.IntrSerial}
                                                                </TableCell>
                                                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                                                    {item.ItemCode}
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: '0.875rem' }}>
                                                                    {item.ItemName}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box>
                                                                        <Typography variant="caption" display="block">
                                                                            {item.WhsCode}
                                                                        </Typography>
                                                                        <Typography variant="caption"
                                                                            color="text.secondary">
                                                                            {item.WhsName}
                                                                        </Typography>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ));
                                                    } catch (error) {
                                                        return (
                                                            <TableRow>
                                                                <TableCell colSpan={5} align="center">
                                                                    <Typography color="error">
                                                                        Error al procesar los datos: {error.message}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                })()}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {(() => {
                                        try {
                                            const parsedData = JSON.parse(seriesDisponibles);
                                            const dataArray = parsedData?.data || [];
                                            return (
                                                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                                    <Typography variant="body2" color="primary">
                                                        📊 Total de series
                                                        disponibles: <strong>{dataArray.length}</strong>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Las series se muestran con su información completa de SAP
                                                    </Typography>
                                                </Box>
                                            );
                                        } catch (error) {
                                            return null;
                                        }
                                    })()}
                                </Box>
                            )}
                        </Grid>
                    </Grid>


                </DialogContent>
            </Dialog>


            <Dialog
                open={openVerListaSeries}
                onClose={handleCloseVerListaSeries}
                fullScreen
                sx={{ padding: '16px' }}
            >
                <AppBar position="relative">
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={handleCloseVerListaSeries}>
                            <Iconify icon="eva:close-fill" />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Series del Producto: {selected?.PRODUCTO_ID}
                        </Typography>
                        <Button color="inherit" onClick={() => obtenerSeriesGuardadas()}>
                            Refrescar
                        </Button>
                    </Toolbar>
                </AppBar>

                <DialogContent
                    dividers={scroll === 'paper'}
                    sx={{ padding: '16px' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2
                        }}
                    >
                        <Typography variant="body1" sx={{ marginRight: '10px' }}>
                            Total de series guardadas: {seriesGuardadas.length}
                        </Typography>
                        <Typography variant="body1" sx={{ marginRight: '10px', color: 'green' }}>
                            Producto: {selected?.NOMBRE}
                        </Typography>
                    </Box>

                    {seriesGuardadas.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 600, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                            #
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                            Serie (IMEI)
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {seriesGuardadas.map((serie, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                '&:nth-of-type(odd)': {
                                                    backgroundColor: '#fafafa'
                                                },
                                                '&:hover': {
                                                    backgroundColor: '#e3f2fd'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ fontFamily: 'monospace' }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {serie.INTERNAL_SERIAL || 'N/A'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>

                                                {(ESTADO === 22 || ESTADO === 23 || ESTADO === 1) && (
                                                    <Tooltip title="Marcar como nota de crédito">
                                                        <IconButton
                                                            color="warning"
                                                            size="small"
                                                            onClick={() => marcarSerieComoNotaCredito(serie.INTERNAL_SERIAL)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)'
                                                                }
                                                            }}
                                                            disabled={serie.INTERNAL_SERIAL?.includes('_NOTA_DE_CREDITO')}
                                                        >
                                                            <Iconify icon="eva:file-text-outline" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {(ESTADO === 8) && (
                                                    <Tooltip title="Eliminar serie">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => eliminarSerieIndividual(serie.INTERNAL_SERIAL)}
                                                            sx={{
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            <Iconify icon="eva:trash-2-outline" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                            </TableCell>


                                        </TableRow>
                                    ))}

                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                No hay series guardadas para este producto
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Las series aparecerán aquí una vez que sean cargadas desde SAP
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

        </>
    );
}


export const top100Films = [
    { title: 'Centro Distribución HT', id: "019" },
    { title: 'Cuenca Turi', id: "002" },
    { title: 'Quito', id: "006" },
    // {title: 'Guayaquil', id: "015"},
    { title: 'Manta', id: "024" },
    { title: 'Colón', id: "030" },
    { title: 'Consignación', id: "008" },
    { title: 'Bodega Claro', id: "039" },
    { title: 'Cuenca Centro', id: "010" }
]

export const top100FilmsAlphacell = [
    { title: 'BODEGA', id: "001" },
    { title: 'MOVISTAR RESERVA', id: "002" },
    { title: 'MOVISTAR ENTREGADO', id: "003" },
    { title: 'DEPRATI', id: "004" },
    { title: 'CRESA CONSIGNACIÓN', id: "005" },
    { title: 'COMPUTRONSA CONSIGNACIÓN', id: "006" },
    { title: 'BODEGA CDHT QUITO', id: "007" },
    { title: 'GUAYAQUIL SERVIENTREGA', id: "009" },
    { title: 'INVENTARIO TRANSITO IMPORTACIONES', id: "099" }
]

export const top100FilmsMovilCelistic = [
    { title: 'CARAPUNGO - CENTRO DISTRIBUCION MOVILCELISTIC', id: "DISTLF" },
    { title: 'MACHALA - MAYORISTAS MOVILCELISTIC MACHALA', id: "003" },
    { title: 'CUENCA - MAYORISTAS MOVILCELISTIC CUENCA TURI', id: "004" },
    { title: 'COLON - MAYORISTAS MOVILCELISTIC COLON', id: "030" },
    { title: 'MANTA - MAYORISTAS MOVILCELISTIC MANTA', id: "024" },
    { title: 'CARAPUNGO - ⚠️ PENDIENTE OPERADORAS CARRIERS', id: "005" },
    { title: 'CARAPUNGO - ⚠️OPERADORAS CARRIER', id: "CARRIERS" },
    { title: 'CONSIGNACION EA', id: "EA" },
    { title: 'CUENCA CENTRO', id: "010" }

    // {title: 'QUITO - XIAOMI TERMINALES', id: "T1CARACO"}
]

export const boxes = [
    { title: '1', id: 1 },
    { title: '2', id: 2 },
    { title: '3', id: 3 },
    { title: '4', id: 4 },
    { title: '5', id: 5 },
    { title: '6', id: 6 },
    { title: '7', id: 7 },
    { title: '8', id: 8 },
    { title: '9', id: 9 }
]

// Función para verificar si un código está presente en el JSON
// const isCodigoAllowed = (codigo, bodega) => {
//     return datos.some(item => item.CODIGO === codigo && item.BODEGA == bodega);
// };

//V2
const isCodigoAllowedPromocion = (codigo) => {
    const promo = datos_promo.find(item => item.CODIGO === codigo);
    return promo ? promo.COLOR : "inherit";
};

