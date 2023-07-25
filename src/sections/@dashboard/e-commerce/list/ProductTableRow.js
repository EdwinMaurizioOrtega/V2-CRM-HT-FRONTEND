import PropTypes from 'prop-types';
import {useState} from 'react';
import {sentenceCase} from 'change-case';
// @mui
import {
    Stack,
    Button,
    TableRow,
    Checkbox,
    MenuItem,
    TableCell,
    IconButton,
    Link,
} from '@mui/material';
// utils
import {fDate} from '../../../../utils/formatTime';
import {fCurrency, fNumber} from '../../../../utils/formatNumber';
// components
import Label from '../../../../components/label';
import Image from '../../../../components/image';
import Iconify from '../../../../components/iconify';
import MenuPopover from '../../../../components/menu-popover';
import ConfirmDialog from '../../../../components/confirm-dialog';
import {PATH_DASHBOARD} from "../../../../routes/paths";

// ----------------------------------------------------------------------

ProductTableRow.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.bool,
    onEditRow: PropTypes.func,
    onViewRow: PropTypes.func,
    onSelectRow: PropTypes.func,
    onDeleteRow: PropTypes.func,
};

export default function ProductTableRow({
                                            row,
                                            selected,
                                            onSelectRow,
                                            onDeleteRow,
                                            onEditRow,
                                            onViewRow,
                                        }) {
    const {NOMBRE, CODIGO, TOTAL, cover, createdAt, inventoryType, price, IMAGES} = row;

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

    // const linkTo = PATH_DASHBOARD.eCommerce.view(CODIGO);


    const handleClosePopover = () => {
        setOpenPopover(null);
    };


    let jsonArrayImages = [];
    if (IMAGES !== null) {
        jsonArrayImages = JSON.parse(IMAGES);
    }


    return (
        <>
            <TableRow hover selected={selected}>
                <TableCell padding="checkbox">
                    <Checkbox checked={selected} onClick={onSelectRow}/>
                </TableCell>

                <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>

                        {jsonArrayImages && jsonArrayImages.length > 0 ? (
                            <Image
                                disabledEffect
                                visibleByDefault
                                alt={IMAGES}
                                src={jsonArrayImages[0].URL}
                                sx={{borderRadius: 1.5, width: 48, height: 48}}
                            />

                        ) : (
                            <Image
                                disabledEffect
                                visibleByDefault
                                alt={IMAGES}
                                src="/assets/images/sin_imagen.jpg"
                                sx={{borderRadius: 1.5, width: 48, height: 48}}
                            />
                        )}

                        <Link
                            noWrap
                            color="inherit"
                            variant="subtitle2"
                            onClick={onViewRow}
                            sx={{cursor: 'pointer'}}
                        >
                            {NOMBRE}
                        </Link>
                    </Stack>
                </TableCell>

                {/* <TableCell>{fDate(createdAt)}</TableCell> */}
                <TableCell>{CODIGO}</TableCell>

                {/* <TableCell align="center"> */}
                {/*     <Label */}
                {/*         variant="soft" */}
                {/*         color={ */}
                {/*             (inventoryType === 'out_of_stock' && 'error') || */}
                {/*             (inventoryType === 'low_stock' && 'warning') || */}
                {/*             'success' */}
                {/*         } */}
                {/*         sx={{textTransform: 'capitalize'}} */}
                {/*     > */}
                {/*         {inventoryType ? sentenceCase(inventoryType) : ''} */}
                {/*     </Label> */}
                {/* </TableCell> */}

                {/* <TableCell align="right">{fCurrency(price)}</TableCell> */}

                <TableCell align="right">{fNumber(TOTAL)}</TableCell>

                {/* <TableCell align="right"> */}
                {/*     <IconButton color={openPopover ? 'primary' : 'default'} onClick={handleOpenPopover}> */}
                {/*         <Iconify icon="eva:more-vertical-fill"/> */}
                {/*     </IconButton> */}
                {/* </TableCell> */}
            </TableRow>

            <MenuPopover
                open={openPopover}
                onClose={handleClosePopover}
                arrow="right-top"
                sx={{width: 140}}
            >
                <MenuItem
                    onClick={() => {
                        handleOpenConfirm();
                        handleClosePopover();
                    }}
                    sx={{color: 'error.main'}}
                >
                    <Iconify icon="eva:trash-2-outline"/>
                    Delete
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        onEditRow();
                        handleClosePopover();
                    }}
                >
                    <Iconify icon="eva:edit-fill"/>
                    Edit
                </MenuItem>
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
