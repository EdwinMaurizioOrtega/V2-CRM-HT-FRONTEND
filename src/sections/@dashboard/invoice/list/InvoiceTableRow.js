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
        totalPrice
    } = row;

    const [openConfirm, setOpenConfirm] = useState(false);

    const [openPopover, setOpenPopover] = useState(null);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
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
                <TableCell padding="checkbox">
                    <Checkbox checked={selected} onClick={onSelectRow}/>
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

                <TableCell align="left">{FECHACREACION}</TableCell>

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

                <TableCell align="left">
                    <Label
                        variant="soft"
                        color={
                            (ESTADO === 6 && 'success') ||
                            (ESTADO === 0 && 'warning') ||
                            (ESTADO === 1 && 'error') ||
                            'default'
                        }
                    >
                        {
                            (ESTADO === 6 ? 'Pendiende de aprobar' : '') ||
                            (ESTADO === 0 ? 'Por Facturar' : '') ||
                            (ESTADO === 1 ? 'Facturado' : '') ||
                            'default'
                        }
                    </Label>
                </TableCell>
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {VENDEDOR}
                </TableCell>
                <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                    {CITY}
                </TableCell>

                <TableCell align="right">
                    <IconButton color={openPopover ? 'inherit' : 'default'} onClick={handleOpenPopover}>
                        <Iconify icon="eva:more-vertical-fill"/>
                    </IconButton>
                </TableCell>

                {user.ROLE === "bodega" &&
                    <TableCell align="center" sx={{textTransform: 'capitalize'}}>
                        {DOCNUM}
                    </TableCell>
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
