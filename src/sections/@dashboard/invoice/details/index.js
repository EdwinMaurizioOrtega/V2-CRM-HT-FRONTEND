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
    TableContainer,
    IconButton,
    MenuItem,
    Button,
    TextField,
    Autocomplete,
    Tooltip,
    CircularProgress,
} from '@mui/material';

import Link from 'next/link';
// utils
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {fCurrency, fNumberSin} from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Scrollbar from '../../../../components/scrollbar';
import Iconify from "../../../../components/iconify";
import MenuPopover from "../../../../components/menu-popover";
import ConfirmDialog from "../../../../components/confirm-dialog";
import axios from "../../../../utils/axios";
import {useAuthContext} from "../../../../auth/useAuthContext";
import React from 'react';
import {useSnackbar} from "../../../../components/snackbar";
import {HOST_API_KEY} from "../../../../config-global";
import {useBoolean} from "../../../../hooks/use-boolean";
import {PDFDownloadLink} from "@react-pdf/renderer";
import PedidoInvoicePDF from "./PedidoInvoicePDF";
import {DOCUMENTACION, PAYMENT_OPTIONS_V2, TIPO_CREDITO, TIPO_PRECIO} from "../../../../utils/constants";

import datos from '/data/datos.json'; // Ajusta la ruta según la ubicación de tu archivo JSON
import datos_promo from '/data/promo.json'; // JSON Promoción

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

function insertLineBreaks(text, maxLength) {
    if (!text) return ''; // Si el texto no está definido, retorna una cadena vacía
    let result = '';
    let currentLine = '';
    let words = text.split(' '); // Dividir el texto en palabras

    console.log(`Palabras: ${words}`)

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
    console.log(`Última línea: ${result}`)
    return result;
}


export default function InvoiceDetails({invoice}) {

    console.log("InvoiceDetail: " + JSON.stringify(invoice));

    const [loading, setLoading] = useState(false); // Variable de estado para rastrear el estado de carga

    const router = useRouter();

    const {user} = useAuthContext();

    const [selected, setSelected] = useState(false);

    const [valueNew, setValueNew] = useState('');

    const [valueGuia, setValueGuia] = useState('');
    const [valueFactura, setValueFactura] = useState('');
    const [valueValorFactura, setValueValorFactura] = useState('');
    const [empleadoEntregar, setEmpleadoEntregar] = useState('');

    const [openConfirm, setOpenConfirm] = useState(false);

    const [openPriceUnit, setOpenPriceUnit] = useState(false);
    const [openChangeProduct, setOpenChangeProduct] = useState(false);

    const [openQty, setOpenQty] = useState(false);

    const [openDiscountPercentage, setOpenDiscountPercentage] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

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
        OBSERVACIONES
    } = invoice;

    console.log("OBSERVACIONES: " + OBSERVACIONES)
    console.log("Row Detail Order: " + JSON.stringify(items))

    const [observacionA, setObservacionA] = useState('Ninguno...');

    const [showAutocomplete, setShowAutocomplete] = useState(false);

    useEffect(() => {
        // Aquí se ejecuta después del montaje del componente
        setObservacionA(OBSERVACIONES !== '' ? OBSERVACIONES : 'Ninguno...');

        // También puedes poner otros efectos secundarios aquí si es necesario

    }, [OBSERVACIONES]); // Este efecto se ejecutará cada vez que invoice.OBSERVACIONES cambie


    const handleChange = (event) => {
        setValueNew(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeGuia = (event) => {
        setValueGuia(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);

        //Comprobar si el valor del campo tiene exactamente 9 ceros. Si es así, se actualiza el estado showAutocomplete para mostrar el Autocomplete.
        // Determinar si se debe mostrar el Autocomplete
        if (/^0{9}$/.test(event.target.value)) {
            setShowAutocomplete(true);
            if (CLIENTEID === 'CL1791251237001'){
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }

    };

    const handleChangeFactura = (event) => {
        setValueFactura(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeValorFactura = (event) => {
        setValueValorFactura(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleChangeEmpleadoEntregar = (event, newValue) => {
        setEmpleadoEntregar(newValue);
        // console.log(`Nuevo precio unitario ${valueNew}`);
    };


    const handleChangePriceUnit = async () => {

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/priceunit', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_PRICE_UNIT: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/change_product', {
                ID_DETALLE_ORDEN: selected.ID,
                PRODUCTO_ID: valueNew,
                empresa: user.EMPRESA
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/quantity', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_QUANTITY: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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

        // console.log(selected.ID);
        // console.log(valueNew);

        try {
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/detail/discount', {
                ID_DETALLE_ORDEN: selected.ID,
                NEW_DISCOUNT: valueNew,
                empresa: user.EMPRESA,
                id_order: ID
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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
            console.log('La orden se eliminó correctamente');

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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

            console.log("Cambio de bodega.")
            console.log(value.id); // Log the selected element
            console.log(ID); // Log ID de la orden

            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/change_warehouse', {
                ID_ORDER: ID,
                NEW_WAREHOUSE: value.id,
                ID_USER: user.ID,
                empresa: user.EMPRESA
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

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
            console.log(value.id); // Log the selected element
            console.log(ID); // Log ID de la orden
            // Actualizar una orden.
            const response = await axios.put('/hanadb/api/orders/order/change_payment', {
                ID_ORDER: ID,
                NEW_PAYMENT: value.id,
                empresa: user.EMPRESA
            });

            console.log("Orden actualizada correctamente.");
            console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                router.reload();
            }

        } catch (error) {
            // Manejar el error de la petición PUT aquí
            console.error('Error al actualizar la orden:', error);
        }

    }

    // La  mejor forma de crear un CASE
    function nameWarehouse(ware) {
        console.log(`Bodega: ${ware}`);
        const strings = {
            "019": "Centro Distribución HT",
            "002": "Cuenca",
            "006": "Quito",
            "015": "Guayaquil",
            "024": "Manta",
            "030": "Colón",
        };

        const bodegaActual = strings[ware];
        return bodegaActual || "Bodega no definida.";

    }

    function nameWarehouseAlphacell(ware) {
        console.log(`Bodega: ${ware}`);
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
        return payActual || "Tipo no definido.";

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
            const subtotal = row.PRECIOUNITARIOVENTA * row.CANTIDAD;
            subtotalTotal += subtotal;
        });

    }

    const ivaTotal = subtotalTotal * ivaPorcentaje;
    const totalConIva = subtotalTotal + ivaTotal;

    console.log('Subtotal: ', subtotalTotal);
    console.log('IVA: ', ivaTotal);
    console.log('Total incluido IVA: ', totalConIva);

    const enviarOrdenSAP = async () => {
        try {
            console.log(ID); // Log ID de la orden
            console.log(user.ID); // Log ID del usuario

            setLoading(true); // Establecer loading a true antes de hacer la llamada a la API

            // Actualizar una orden.
            const response = await axios.post('/hanadb/api/orders/orden_venta_sap', {
                ID_ORDER: ID,
                ID_USER: user.ID,
                OBSERVACION_APROBACION: observacionA,
                empresa: user.EMPRESA,
            });

            console.log("Orden Creada en el SAP.");
            console.log("Código de estado:", response.status);

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


    const handleChangePedidoFactura = async () => {

        // console.log(ID);
         console.log(JSON.stringify(user));

        //=========For All Companys=========
        let idEmpleadoEntregar = 0;
        let nombreUsuarioEntregara = '';
        let estadoInvoice = 1

        if (user.COMPANY === 'HT') {

            console.log("Empleado Entregar: " + JSON.stringify( empleadoEntregar))

            if (valueGuia === '000000000' && empleadoEntregar === '') {
                if (valueGuia === '000000000' && CLIENTEID === 'CL1791251237001') {
                    idEmpleadoEntregar = 0;
                    nombreUsuarioEntregara = '';
                    estadoInvoice = 1
                } else {
                    alert("Seleccionar un empleado es obligatorio cuando la guía es => 000000000")
                    return; // Stop the execution of the function if the condition is met
                }
            }

            if (empleadoEntregar !== '') {
                idEmpleadoEntregar = empleadoEntregar.CODE
                nombreUsuarioEntregara = empleadoEntregar.NOMBRE
                //Facturado - Pendiente de cargar evidencia vendedor
                estadoInvoice = 22;
            }

            if (valueGuia !== '000000000') {
                idEmpleadoEntregar = 0;
                nombreUsuarioEntregara = '';
                estadoInvoice = 1
            }

            console.log("ID empleado seleccionado: "+idEmpleadoEntregar)
        }



        //Enviamos los datos al servidor,
        if (valueGuia.length === 9) {

            if (valueFactura.length === 17) {

                if (valueFactura || valueValorFactura) {
                    try {

                        setLoading(true); // Establecer loading a true antes de hacer la llamada a la API

                        // Actualizar una orden.
                        const response = await axios.put('/hanadb/api/orders/order/facturar', {
                            ID_ORDER: ID,
                            NUMERO_FACTURA: `${valueFactura}`,
                            VALOR_FACTURA: `${valueValorFactura}`,
                            NUMERO_GUIA: `${valueGuia}`,
                            empresa: user.EMPRESA,
                            IDUSUARIOENTREGARA: Number(idEmpleadoEntregar),
                            NOMBREUSUARIOENTREGARA: nombreUsuarioEntregara,
                            ESTADO: Number(estadoInvoice),
                        });


                        console.log("Orden Facturada.");
                        console.log("Código de estado:", response.status);

                        // Se completó con éxito (código de estado 200)
                        if (response.status === 200) {
                            router.push('/dashboard/invoice/list/');
                        }

                        setLoading(false); // Restablecer loading a false después de que se completa la llamada a la API, independientemente de si fue exitosa o falló

                    } catch (error) {
                        // Manejar el error de la petición PUT aquí
                        console.error('Error al actualizar la orden:', error);
                        setLoading(false); // Restablecer loading a false después de que se completa la llamada a la API, independientemente de si fue exitosa o falló

                    }
                } else {
                    enqueueSnackbar('Los campos con * son obligatorios.', {variant: 'error'})
                }

            } else {
                enqueueSnackbar('El número de factura debe tener 17 caracteres, incluido los guiones.', {variant: 'error'})
            }
        } else {
            enqueueSnackbar('El número de guía debe tener 9 caracteres.', {variant: 'error'})
        }

    }


    const [decodedString, setDecodedString] = useState('');

    const handleServiEntrega = async () => {

        console.log("OBSERVACIONESB: " + OBSERVACIONESB);

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

        console.log(JSON.stringify(dataToSend));

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
                console.log("Respuesta del servidor:", data);

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
            //     console.log(dataCities);
            // } catch (error) {
            //     console.log('error', error);
            // }


            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_crm_empleados_venta`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data.data));
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
        console.log("Origen ID:", selectedCityOrigen.id);
        console.log("Destino ID:", selectedCityDestino.id);
        console.log("Boxes ID:", selectedCityBoxes.id);
    }, [selectedCityOrigen, selectedCityDestino, selectedCityBoxes]);


    const openPDFInNewTab = () => {
        const byteCharacters = decodedString;
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], {type: 'application/pdf'});
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };


    const handleButtonClick = () => {
        console.log('Contenido del texto:', observacion);
        // Puedes realizar otras acciones con el contenido del texto aquí
    };

    const handleDownloadClick = async (id) => {
        // Your method or logic to execute after the download icon is clicked
        console.log('Download icon clicked!');
        console.log("Número de orden: " + id);

        try {
            const response = await axios.put('/hanadb/api/orders/order/imprimir', {
                params: {
                    ID: id
                }
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {
                console.log('Impresión de la orden en PDF.');
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al colocar la fecha de impresión en la orden:', error);
        }

    };

    //console.log("USUARIO: "+ JSON.stringify( user));

    const orderAprobarEjecutivoSoporte = async () => {
        console.log("Número de orden Tomebamba: " + ID);

        try {
            const response = await axios.put('/hanadb/api/orders/order/importadora_tomebamba_approve', {
                ID_ORDER: ID,
                STATUS: 13
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            console.log('Cambiando estado');
            console.log("Código de estado:", response.status);

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
        console.log("Número de orden Tomebamba: " + ID);

        try {
            const response = await axios.put('/hanadb/api/orders/order/importadora_tomebamba_approve', {
                ID_ORDER: ID,
                STATUS: 6
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            console.log('Cambiando estado');
            console.log("Código de estado:", response.status);

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
        console.log("Número de orden: " + ID);
        console.log("Observación anulación orden: " + valueNew);

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
            console.log('Estado de orden anulado.');
            console.log("Código de estado:", response.status);

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


    return (
        <>
            {/* <InvoiceToolbar invoice={invoice} /> */}
            <Card sx={{pt: 5, px: 5}}>
                <Grid container>
                    <Grid item xs={12} sm={6} sx={{mb: 5}}>
                        <Image disabledEffect alt="logo" src="/logo/logo_full.svg" sx={{maxWidth: 120}}/>

                        {/*{user.COMPANY === 'HT' || user.COMPANY === 'ALPHACELL' ? (*/}
                        <PDFDownloadLink
                            document={<PedidoInvoicePDF invoice={invoice} user={user} empresa="LD"/>}
                            fileName={`PEDIDO_CLIENTE_${invoice.ID}`}
                            style={{textDecoration: 'none'}}
                        >
                            {({loading}) => (
                                <Tooltip title="Descargar LD">
                                    <IconButton
                                        onClick={user.ROLE === "8" ? () => handleDownloadClick(ID) : undefined}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit"/>
                                        ) : (
                                            <Iconify icon="eva:download-fill"/>
                                        )}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </PDFDownloadLink>


                        {
                            user.ROLE === '1' ? (

                                <PDFDownloadLink
                                    document={<PedidoInvoicePDF invoice={invoice} user={user} empresa="TM"/>}
                                    fileName={`PEDIDO_CLIENTE_${invoice.ID}`}
                                    style={{textDecoration: 'none'}}
                                >
                                    {({loading}) => (
                                        <Tooltip title="Descargar TM">
                                            <IconButton
                                                onClick={user.ROLE === "8" ? () => handleDownloadClick(ID) : undefined}
                                            >
                                                {loading ? (
                                                    <CircularProgress size={24} color="inherit"/>
                                                ) : (
                                                    <Iconify icon="eva:download-fill"/>
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </PDFDownloadLink>
                            ) : null

                        }

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

                                <Grid item xs={12} sm={6} sx={{mb: 5}}>
                                    <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                                        FACTURA A:
                                    </Typography>
                                    <Label color="success">{Cliente}</Label>
                                    <Typography variant="body2">CI/RUC: {CLIENTEID}</Typography>
                                    <Label color="success">{Ciudad}</Label>
                                    <Typography variant="body2">TIPO: {Tipo}</Typography>
                                    <Label color="success">Lista Precio: {tipoPrecio(Lista)}</Label>
                                    <Typography variant="body2">Saldo de Cuenta: {fCurrency(Balance)}</Typography>
                                    <Label color="success">DOCUMENTACIÓN: {documentacion(U_SYP_DOCUMENTACION)}</Label>
                                    <Typography variant="body2">Tipo de
                                        Crédito: {tipoCredito(U_SYP_CREDITO)}</Typography>
                                    <Label color="success">Condicion de Pago: {nameFormaPago(GroupNum)}</Label>
                                    <Typography variant="body2">Límte de Crédito: {fCurrency(CreditLine)}</Typography>
                                    <Label color="success">Límite de comprometido: {fCurrency(DebtLine)}</Label>
                                    <Typography variant="body2">Pedidos Clientes: {fCurrency(OrdersBal)}</Typography>
                                    <div style={{whiteSpace: 'pre-line', fontSize: '15px'}}>
                            <span>
                            Comentario: {insertLineBreaks(Free_Text, 40)}
                            </span>
                                    </div>

                                </Grid>


                                <Grid item xs={12} sm={6} sx={{mb: 5}}>
                                    <Typography paragraph variant="overline" sx={{color: 'text.disabled'}}>
                                        Orden de
                                    </Typography>

                                    <Typography variant="body2">{VENDEDOR}</Typography>

                                    <Typography variant="body2">{CITY}</Typography>

                                    {/* <Typography variant="body2">Phone: {invoiceFrom.phone}</Typography> */}
                                    <Typography variant="overline" sx={{color: 'text.disabled'}}>
                                        fecha de creación
                                    </Typography>

                                    <Typography variant="body2">{FECHACREACION}</Typography>

                                    <Typography variant="overline" sx={{color: 'text.disabled'}}>
                                        opciones
                                    </Typography>

                                    <Grid item xs={12} sm={5} sx={{mb: 1}}>

                                        {/* <Typography variant="body2">{fDate(dueDate)}</Typography> */}
                                        <Typography variant="body2">Bodega actual: {

                                            // Hipertronics
                                            user.EMPRESA == '0992537442001' ? (
                                                nameWarehouse(BODEGA)
                                            ) : (
                                                //Alphacell
                                                nameWarehouseAlphacell(BODEGA)
                                            )

                                        }</Typography>

                                        {user.ROLE === "9" &&

                                            <Autocomplete
                                                fullWidth
                                                options={
                                                    // Hipertronics
                                                    user.EMPRESA == '0992537442001' ? (
                                                        top100Films
                                                    ) : (
                                                        //Alphacell
                                                        top100FilmsAlphacell
                                                    )
                                                }
                                                getOptionLabel={(option) => option.title}
                                                onChange={(event, value) => {
                                                    handleChangeWarehouse(event, value);
                                                }} // Add onChange event handler
                                                renderInput={(params) => <TextField {...params} label="-_-"
                                                                                    margin="none"/>}
                                            />
                                        }

                                    </Grid>

                                    <Grid item xs={12} sm={7} sx={{mb: 1}}>

                                        <Typography variant="body2">Forma de pago
                                            actual: {nameFormaPago(FORMADEPAGO)}</Typography>

                                        {user.ROLE === "9" &&
                                            <Autocomplete
                                                fullWidth
                                                options={PAYMENT_OPTIONS_V2}
                                                getOptionLabel={(option) => option.title}
                                                onChange={(event, value) => {
                                                    handleChangePayment(event, value);
                                                }}
                                                renderInput={(params) => <TextField {...params} label="-_-"
                                                                                    margin="none"/>}
                                            />
                                        }

                                    </Grid>


                                </Grid>
                            </>
                        ) : null
                    ) : null}

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>

                    </Grid>

                    <Grid item xs={12} sm={6} sx={{mb: 5}}>

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
                                    {/*{user.ROLE !== '0' ? (*/}
                                    {/*    user.ROLE !== '2' ? (*/}
                                    <TableCell align="left">Tipo Precio</TableCell>
                                    {/*    ) : null*/}
                                    {/*) : null*/}
                                    {/*}*/}
                                    <TableCell align="left">Comentario Precio</TableCell>
                                    <TableCell align="left">%Desc.</TableCell>
                                    <TableCell align="left">Cantidad</TableCell>

                                    {
                                        user.ROLE === "9" ? (
                                            <TableCell align="left">Disponible</TableCell>
                                        ) : null
                                    }
                                    <TableCell align="right">Precio unitario</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    {user.ROLE !== '0' ? (
                                        user.ROLE !== '2' ? (
                                            <>
                                                <TableCell align="left">Acciones</TableCell>
                                            </>
                                        ) : null
                                    ) : null
                                    }
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


                                        {user.ROLE === '0' || user.ROLE === '2' ? (

                                            <TableCell align="left">{namePriceType(row.TM_TIPO_PRECIO)}</TableCell>

                                        ) : (
                                            <TableCell align="left">{namePriceType(row.TIPOPRECIO)}</TableCell>
                                        )
                                        }


                                        <TableCell align="left">{row.COMENTARIOPRECIO}</TableCell>
                                        <TableCell align="left">{row.DISCOUNTPERCENTSAP}</TableCell>
                                        <TableCell align="left">{row.CANTIDAD}</TableCell>
                                        {
                                            user.ROLE === "9" ? (
                                                <TableCell align="left"
                                                           style={{backgroundColor: Number(row.DISPONIBLE_POR_BODEGA) <= 0 ? 'rgba(255, 0, 0, 0.08)' : 'rgba(0, 171, 85, 0.08)'}}>

                                                    {Number(row.DISPONIBLE_POR_BODEGA)}</TableCell>

                                            ) : null
                                        }

                                        {user.ROLE === '0' || user.ROLE === '2' ? (
                                            <>
                                                <TableCell
                                                    align="right">{fCurrency(row.TM_PRECIO_UNITARIO_VENTA)}</TableCell>
                                                <TableCell
                                                    align="right">{fCurrency(row.TM_PRECIO_UNITARIO_VENTA * row.CANTIDAD)}</TableCell>
                                            </>

                                        ) : (
                                            <>
                                                <TableCell
                                                    align="right">{fCurrency(row.PRECIOUNITARIOVENTA)}</TableCell>
                                                <TableCell
                                                    align="right">{fCurrency(row.PRECIOUNITARIOVENTA * row.CANTIDAD)}</TableCell>
                                            </>

                                        )
                                        }

                                        <TableCell align="right">
                                            <IconButton color={openPopover ? 'inherit' : 'default'}
                                                        onClick={(event) => handleOpenPopover(event, row)}>
                                                <Iconify icon="eva:more-vertical-fill"/>
                                            </IconButton>
                                        </TableCell>

                                    </TableRow>

                                ))}

                                {/*{*/}
                                {/*    user.COMPANY !== 'TOMEBAMBA' ? (*/}
                                {/*        <>*/}
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
                                {/*        </>*/}
                                {/*    ) : null*/}
                                {/*}*/}

                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>

                <TextField
                    fullWidth
                    multiline
                    placeholder="Observaciones al aprobar."
                    label="Observaciones al aprobar."
                    value={observacionA}
                    onChange={(e) => setObservacionA(e.target.value)}
                />

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

                        <Link href="https://wa.me/593939991111">
                            WhatsApp
                        </Link>

                        {/* <Typography variant="body2">support@minimals.cc</Typography> */}
                    </Grid>
                </Grid>

                <Divider sx={{mt: 5}}/>

                {user.ROLE === "9" &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{py: 3, textAlign: 'center'}}>
                            {/* <Button onClick={enviarOrdenSAP}>CREAR ORDEN DE VENTA SAP</Button> */}

                            <Button onClick={() => !loading && enviarOrdenSAP()} disabled={loading}>
                                {loading ? 'CREANDO...' : 'CREAR ORDEN DE VENTA SAP'}
                            </Button>
                        </Grid>
                    </Grid>
                }

                {user.ROLE === "8" &&
                    <Grid container>
                        <Grid item xs={12} md={12} sx={{py: 6}}>

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
                                inputProps={{maxLength: 9}}
                                error={valueGuia.length !== 9}
                                helperText={valueGuia.length !== 9 ? 'El número de guía debe tener 9 caracteres' : ''}
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

                            {showAutocomplete && user.COMPANY === 'HT' && (
                                <Autocomplete
                                    name="vendedor"
                                    label="Vendedor"
                                    single
                                    freeSolo
                                    options={dataEmpladosVenta}
                                    getOptionLabel={(option) => option.NOMBRE || ''}
                                    renderInput={(params) => <TextField {...params} label="Entregar a: "
                                                                        margin="none"/>}
                                    onChange={(event, newValue) => handleChangeEmpleadoEntregar(event, newValue)}

                                />

                            )}

                            <Button variant="contained" color="success"
                                    onClick={() => !loading && handleChangePedidoFactura()} disabled={loading}>
                                {loading ? 'GUARDANDO...' : ' Guardar Factura'}
                            </Button>

                        </Grid>

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


            {user.ROLE === "9" ? (

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

                    <MenuItem
                        onClick={() => {
                            handleOpenChangeProduct();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill"/>
                        Producto.
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
            ) : null
            }


            {user.ROLE === "2" || user.ROLE === "1" ? (

                <MenuPopover
                    open={openPopover}
                    onClose={handleClosePopover}
                    arrow="right-top"
                    sx={{width: 160}}
                >

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
                            handleOpenConfirm();
                            handleClosePopover();
                        }}
                        sx={{color: 'error.main'}}
                    >
                        <Iconify icon="eva:trash-2-outline"/>
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


        </>
    );
}


export const top100Films = [
    {title: 'Centro Distribución HT', id: "019"},
    {title: 'Cuenca', id: "002"},
    {title: 'Quito', id: "006"},
    {title: 'Guayaquil', id: "015"},
    {title: 'Manta', id: "024"},
    {title: 'Colón', id: "030"}
]

export const top100FilmsAlphacell = [
    {title: 'BODEGA', id: "001"},
    {title: 'MOVISTAR RESERVA', id: "002"},
    {title: 'MOVISTAR ENTREGADO', id: "003"},
    {title: 'DEPRATI', id: "004"},
    {title: 'CRESA CONSIGNACIÓN', id: "005"},
    {title: 'COMPUTRONSA CONSIGNACIÓN', id: "006"},
    {title: 'BODEGA CDHT QUITO', id: "007"},
    {title: 'GUAYAQUIL SERVIENTREGA', id: "009"},
    {title: 'INVENTARIO TRANSITO IMPORTACIONES', id: "099"}
]

export const boxes = [
    {title: '1', id: 1},
    {title: '2', id: 2},
    {title: '3', id: 3},
    {title: '4', id: 4},
    {title: '5', id: 5},
    {title: '6', id: 6},
    {title: '7', id: 7},
    {title: '8', id: 8},
    {title: '9', id: 9}
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

