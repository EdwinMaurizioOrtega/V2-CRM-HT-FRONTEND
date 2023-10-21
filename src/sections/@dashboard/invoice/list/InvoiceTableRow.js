import PropTypes from 'prop-types';
import {useState} from 'react';
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
    Typography,
} from '@mui/material';
// utils
import {fDate} from '../../../../utils/formatTime';
import {fCurrency} from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Iconify from '../../../../components/iconify';
import {CustomAvatar} from '../../../../components/custom-avatar';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import {useAuthContext} from "../../../../auth/useAuthContext";

// ----------------------------------------------------------------------

InvoiceTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.bool,
    onEditRow: PropTypes.func,
    onViewRow: PropTypes.func,
    onAnularRow: PropTypes.func,
    onDeleteRow: PropTypes.func,
    onSelectRow: PropTypes.func,
};

export default function InvoiceTableRow({
                                            row,
                                            selected,
                                            onSelectRow,
                                            onViewRow,
                                            onAnularRow,
                                            onEditRow,
                                            onDeleteRow,
                                        }) {

    const {user} = useAuthContext();

    const {
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
        FORMADEPAGO
    } = row;

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

    return (
        <>
            <TableRow hover selected={selected}>
                {/* <TableCell padding="checkbox"> */}
                {/*     <Checkbox checked={selected} onClick={onSelectRow}/> */}
                {/* </TableCell> */}

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

                <TableCell align="left">{FECHACREACION}</TableCell>

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

                <TableCell align="right">
                    <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
                        <Iconify icon="eva:more-vertical-fill"/>
                    </IconButton>
                </TableCell>

                {
                    user.ROLE === "aprobador" || user.ROLE === "bodega" ? (
                    <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                        {DOCNUM}
                    </TableCell>
                    ) : null

                }

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

                {/* <MenuItem */}
                {/*   onClick={() => { */}
                {/*     onEditRow(); */}
                {/*     handleClosePopover(); */}
                {/*   }} */}
                {/* > */}
                {/*   <Iconify icon="eva:edit-fill" /> */}
                {/*   Editar */}
                {/* </MenuItem> */}

                <Divider sx={{borderStyle: 'dashed'}}/>

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
                    <Button variant="contained" color="error" onClick={onAnularRow}>
                        Anular
                    </Button>
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
    );
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
        26: "CRÉDITO 21 DÍAS",
        27: "CRÉDITO 25 DÍAS",
        28: "CRÉDITO 75 DÍAS",
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
    };

    const bodegaActual = strings[ware];
    return bodegaActual || "Bodega no definida.";

}
