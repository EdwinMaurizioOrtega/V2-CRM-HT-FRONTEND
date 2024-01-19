import PropTypes from 'prop-types';
import React, {useState} from 'react';
// @mui
import {
    Link,
    Stack,
    Button,
    Divider,
    Checkbox,
    TableRow,
    MenuItem,
    TableCell,
    IconButton,
    Typography, TextField,
} from '@mui/material';
// utils
import {fDate} from '../../../../utils/formatTime';
import {fCurrency, fNumberSin} from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import {CustomAvatar} from '../../../../components/custom-avatar';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import {useAuthContext} from "../../../../auth/useAuthContext";
import {HOST_API_KEY} from "../../../../config-global";
import {PATH_DASHBOARD} from "../../../../routes/paths";
import axios from "../../../../utils/axios";
import {useRouter} from "next/router";


// ----------------------------------------------------------------------

InvoiceTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.bool,
    onEditRow: PropTypes.func,
    onViewRow: PropTypes.func,
    onDeleteRow: PropTypes.func,
    onSelectRow: PropTypes.func,
};

export default function InvoiceTableRow({
                                            row,
                                            selected,
                                            onSelectRow,
                                            onViewRow,
                                            onEditRow,
                                            onDeleteRow,
                                        }) {

    console.log("row: " + JSON.stringify(row));

    const {user} = useAuthContext();

    const {
        ID,
        ESTADO,
        FECHACREACION,
        FECHAAPROBO,
        FECHAFACTURACION,
        CLIENTEID,
        Nombres,
        Cliente,
        Ciudad,
        Celular,
        Tipo,
        VENDEDOR,
        CITY,
        DOCNUM,
        sent,
        invoiceNumber,
        createDate,
        dueDate,
        status,
        invoiceTo,
        totalPrice,
        BODEGA,
        FORMADEPAGO,
        NUMEROGUIA,
        FECHA_IMPRESION
    } = row;

    const router = useRouter();

    const [valueNew, setValueNew] = useState('Ninguno..');

    const [openConfirm, setOpenConfirm] = useState(false);
    //Anular la orden.
    const [openConfirmAnular, setOpenConfirmAnular] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleOpenConfirmAnular = () => {
        setOpenConfirmAnular(true);
    };

    const handleCloseConfirmAnular = () => {
        setOpenConfirmAnular(false);
    };

    const handleOpenPopover = (event) => {
        setOpenPopover(event.currentTarget);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const [isLoading, setIsLoading] = useState(false);

    const VerGuia = (guia) => {
        setIsLoading(true); // Set loading to true when starting the fetch

        console.log("Guia: " + guia);
        var dataToSend = {
            num_guia: guia
        };

        //console.log("dataToSend: "+JSON.stringify(dataToSend));

        // URL del servidor al que deseas enviar los datos
        const url = `${HOST_API_KEY}/hanadb/api/orders/order/ServiEntrega/GuiasWeb`;

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

                const byteCharacters = atob(pdfDecode);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const pdfBlob = new Blob([byteArray], {type: 'application/pdf'});
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');


            })
            .catch((error) => {
                // Aquí puedes manejar errores en la solicitud
                console.error("Error en la solicitud:", error);
            })
            .finally(() => {
                setIsLoading(false); // Set loading to false regardless of success or error
            });
    };

    const handleImprimir = () => {
        console.log('Botón clickeado');
        // Puedes agregar más lógica aquí según tus necesidades
    };

    const handleChange = (event) => {
        setValueNew(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
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


    //Recuperar pedido cuando se encuentre en estado anulado.
    //Retornar pedido desde bodega a cartera
    const sendOrderToBagRow = async () => {
        console.log("Número de orden: " + ID);

        try {
            const response = await axios.put('/hanadb/api/orders/order/to_bag', {
                params: {
                    ID_ORDER: ID
                }
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

    };


    return (
        <>

            <TableRow hover selected={selected}
                      style={{backgroundColor: user.ROLE === "bodega" && FECHA_IMPRESION != null ? '#ffdab9' : 'transparent',}}
            >
                {/* <TableCell padding="checkbox"> */}
                {/*     <Checkbox checked={selected} onClick={onSelectRow}/> */}
                {/* </TableCell> */}

                <TableCell align="right">
                    <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
                        <Iconify icon="eva:more-vertical-fill"/>
                    </IconButton>
                </TableCell>

                <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {/* <CustomAvatar name={ID} /> */}

                        <div>
                            <Typography variant="subtitle2" noWrap>
                                {VENDEDOR}
                            </Typography>

                            <Link
                                noWrap
                                variant="body2"
                                onClick={onViewRow}
                                sx={{color: 'text.disabled', cursor: 'pointer'}}
                            >
                                {`INV-${ID}`}
                            </Link>
                        </div>
                    </Stack>
                </TableCell>

                <TableCell align="left">
                    <Label
                        variant="soft"
                        color={
                            (ESTADO === 8 && 'error') ||
                            (ESTADO === 6 && 'success') ||
                            (ESTADO === 0 && 'warning') ||
                            (ESTADO === 1 && 'error') ||
                            'default'
                        }
                    >
                        {
                            (ESTADO === 8 ? 'Anulado' : '') ||
                            (ESTADO === 6 ? 'Pendiende de aprobar' : '') ||
                            (ESTADO === 0 ? 'Por Facturar' : '') ||
                            (ESTADO === 1 ? 'Facturado' : '') ||
                            'default'
                        }
                    </Label>
                </TableCell>

                <TableCell align="left">{nameWarehouse(BODEGA)}</TableCell>
                <TableCell align="left">{nameFormaPago(FORMADEPAGO)}</TableCell>

                <TableCell align="left">{CLIENTEID}</TableCell>

                <TableCell align="center">{Cliente}</TableCell>

                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {Celular}
                </TableCell>
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {Tipo}
                </TableCell>
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {Ciudad}
                </TableCell>


                {/* <TableCell align="center" sx={{textTransform: 'capitalize'}}> */}
                {/*     {VENDEDOR} */}
                {/* </TableCell> */}
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {CITY}
                </TableCell>

                <TableCell align="center" sx={{textTransform: 'capitalize'}}>

                    <Button
                        variant="text"
                        onClick={() => VerGuia(NUMEROGUIA)}
                        sx={{color: 'text.disabled', cursor: 'pointer'}}
                        disabled={isLoading} // Disable the button while loading
                    >
                        {isLoading ? 'Cargando...' : NUMEROGUIA}
                    </Button>

                </TableCell>



                {/* { */}
                {/*     user.ROLE === "aprobador" || user.ROLE === "bodega" ? ( */}
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {DOCNUM}
                </TableCell>
                {/* //     ) : null */}
                {/* // */}
                {/* // } */}
                <TableCell align="left">{FECHACREACION}</TableCell>
                <TableCell align="left">{FECHAAPROBO}</TableCell>
                <TableCell align="left">{FECHAFACTURACION}</TableCell>
                {/* <TableCell align="left"> */}
                {/*     <Button variant="contained" onClick={handleImprimir}>Imprimir</Button> */}
                {/* </TableCell> */}

            </TableRow>

            <MenuPopover
                open={openPopover}
                onClose={handleClosePopover}
                arrow="right-top"
                sx={{width: 160}}
            >
                <MenuItem
                    onClick={() => {
                        onViewRow();
                        handleClosePopover();
                    }}
                >
                    <Iconify icon="eva:eye-fill"/>
                    Ver
                </MenuItem>

                <Divider sx={{borderStyle: 'dashed'}}/>


                {ESTADO === 0 && user.ROLE === "aprobador" ? (
                    <MenuItem
                        onClick={() => {
                            sendOrderToBagRow();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:shopping-bag-outline"/>
                        Cartera
                    </MenuItem>

                ) : null
                }

                {ESTADO === 8 && user.ROLE === "aprobador" ? (
                    <MenuItem
                        onClick={() => {
                            sendOrderToBagRow();
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:shopping-bag-outline"/>
                        Regre. Cartera
                    </MenuItem>

                ) : null
                }


                <Divider sx={{borderStyle: 'dashed'}}/>

                {user.ROLE === "aprobador" || user.ROLE === "bodega" ? (
                    <MenuItem
                        onClick={() => {
                            handleOpenConfirmAnular();
                            handleClosePopover();
                        }}
                        sx={{color: 'error.main'}}
                    >
                        <Iconify icon="eva:trash-2-outline"/>
                        Anular
                    </MenuItem>
                ) : null
                }

                {/* <MenuItem */}
                {/*   onClick={() => { */}
                {/*     onEditRow(); */}
                {/*     handleClosePopover(); */}
                {/*   }} */}
                {/* > */}
                {/*   <Iconify icon="eva:edit-fill" /> */}
                {/*   Editar */}
                {/* </MenuItem> */}


                {/* <MenuItem */}
                {/*   onClick={() => { */}
                {/*     handleOpenConfirm(); */}
                {/*     handleClosePopover(); */}
                {/*   }} */}
                {/*   sx={{ color: 'error.main' }} */}
                {/* > */}
                {/*   <Iconify icon="eva:trash-2-outline" /> */}
                {/*   Borrar */}
                {/* </MenuItem> */}
            </MenuPopover>

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

            <ConfirmDialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                title="Delete"
                content="Are you sure want to delete?"
                action={
                    <Button variant="contained" color="error" onClick={onDeleteRow}>
                        Delete
                    </Button>
                }
            />
        </>
    )
        ;
}


function nameFormaPago(pay) {
    const strings = {
        "-1": "CONTADO",
        1: "CRÉDITO 5 DÍAS",
        2: "CRÉDITO 7 DÍAS",
        3: "CRÉDITO 15 DÍAS",
        4: "CRÉDITO 30 DÍAS",
        5: "CRÉDITO 45 DÍAS",
        6: "CRÉDITO 60 DÍAS",
        7: "90 DÍAS",
        8: "120 DÍAS",
        9: "CRÉDITO 30-60 DÍAS",
        10: "CRÉDITO 30-60-90 DÍAS",
        11: "CRÉDITO 30-60-90-120 DÍAS",
        12: "CRÉDITO 60-90-120 DÍAS",
        13: "6 MESES",
        14: "9 MESES",
        15: "12 MESES",
        16: "18 MESES",
        17: "24 MESES",
        18: "36 MESES",
        19: "CONTADO / RET",
        20: "CRÉDITO 8 DÍAS",
        21: "180 DÍAS",
        22: "*",
        23: "CRÉDITO 1 DÍA",
        25: "CRÉDITO 90 DÍAS",
        26: "CRÉDITO 21 DÍAS",
        27: "CRÉDITO 25 DÍAS",
        28: "CRÉDITO 75 DÍAS",
        30: "CRÉDITO 2 DÍAS"
    };

    const payActual = strings[pay];
    return payActual || "Pago no definido.";

}

function nameWarehouse(ware) {
    console.log(`Bodega: ${ware}`);
    const strings = {
        "019": "Centro Distribución HT",
        "002": "Cuenca",
        "006": "Quito",
        "015": "Guayaquil",
        "024": "Manta",
        "030": "Colón"
    };

    const bodegaActual = strings[ware];
    return bodegaActual || "Bodega no definida.";

}
