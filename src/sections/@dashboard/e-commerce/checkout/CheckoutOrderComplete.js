import PropTypes from 'prop-types';
// @mui
import {Link, Button, Divider, Typography, Stack} from '@mui/material';
// components
import Iconify from '../../../../components/iconify';
import {DialogAnimate} from '../../../../components/animate';
// assets
import {OrderCompleteIllustration} from '../../../../assets/illustrations';
import LoadingScreen from "../../../../components/loading-screen";

// ----------------------------------------------------------------------

CheckoutOrderComplete.propTypes = {
    open: PropTypes.bool,
    onReset: PropTypes.func,
    onDownloadPDF: PropTypes.func,
};

export default function CheckoutOrderComplete({loading, open, onReset, onDownloadPDF}) {
    return (
        <DialogAnimate
            fullScreen
            open={open}
            PaperProps={{
                sx: {
                    maxWidth: {md: 'calc(100% - 48px)'},
                    maxHeight: {md: 'calc(100% - 48px)'},
                },
            }}
        >
            <Stack
                spacing={5}
                sx={{
                    m: 'auto',
                    maxWidth: 480,
                    textAlign: 'center',
                    px: {xs: 2, sm: 0},
                }}
            >
                <Typography variant="h4">Gracias por su compra!</Typography>

                <Stack
                    spacing={2}
                    justifyContent="space-between"
                    direction={{xs: 'column-reverse', sm: 'row'}}
                >

                    {loading ? (
                        <LoadingScreen />
                    ) : (

                        <Button
                            fullWidth
                            size="large"
                            color="inherit"
                            variant="outlined"
                            onClick={onReset}
                            startIcon={<Iconify icon="eva:arrow-ios-back-fill"/>}
                        >
                            Enviar al área de aprobación.
                        </Button>


                    )
                    }

                    {/* <Button */}
                    {/*   fullWidth */}
                    {/*   size="large" */}
                    {/*   variant="contained" */}
                    {/*   startIcon={<Iconify icon="ant-design:file-pdf-filled" />} */}
                    {/*   onClick={onDownloadPDF} */}
                    {/* > */}
                    {/*   Mis pedidos */}
                    {/* </Button> */}
                </Stack>

                <OrderCompleteIllustration sx={{height: 260}}/>

                <Divider sx={{borderStyle: 'dashed'}}/>

                <Typography>
                    Gracias por hacer el pedido
                    <br/>
                    <br/>
                    {/* <Link>01dc1370-3df6-11eb-b378-0242ac130002</Link> */}
                    <br/>
                    <br/>
                    Le enviaremos una notificación dentro de los 5 días posteriores al envío.
                    <br/> Si tiene alguna pregunta o consulta, no dude en ponerse en contacto con nosotros. <br/> <br/>
                    Mis mejores deseos,
                </Typography>
            </Stack>
        </DialogAnimate>
    );
}
