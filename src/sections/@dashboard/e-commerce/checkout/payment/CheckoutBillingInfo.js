import PropTypes from 'prop-types';
// @mui
import {
    Card,
    Button,
    Typography,
    CardHeader,
    CardContent,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider
} from '@mui/material';
// components
import Iconify from '../../../../../components/iconify';
import {fCurrency} from "../../../../../utils/formatNumber";
import {TIPO_CREDITO} from "../../../../../utils/constants";

// ----------------------------------------------------------------------

CheckoutBillingInfo.propTypes = {
    // billing: PropTypes.object,
    onBackStep: PropTypes.func,
};

export default function CheckoutBillingInfo({billing, onBackStep}) {
    //Analisamos la cadena de texto y la convertimos en un arreglo valido.
    let billingEnvioArray = [];

    try {
        billingEnvioArray = JSON.parse(billing?.ENVIO || '[]');
    } catch (error) {
        console.error('Error al analizar la cadena JSON:', error);
    }

    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    return (
        <Card sx={{mb: 3}}>
            <CardHeader
                title="Dirección de Envio"
                action={
                    <Button size="small" startIcon={<Iconify icon="eva:edit-fill"/>} onClick={onBackStep}>
                        Editar
                    </Button>
                }
            />
            <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                    {billing?.Cliente}&nbsp;
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                      ({billing?.Tipo})
                    </Typography>
                    <Typography variant="body2" sx={{color: 'text.secondary'}}>
                        {billing?.ID}
                    </Typography>
                </Typography>

                <Typography variant="body2" gutterBottom>
                    Saldo Deuda: {fCurrency(billing?.Balance)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Cupo Disponible: {fCurrency(billing?.CreditLine - billing?.Balance)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Tipo Crédito: {tipoCredito(billing?.U_SYP_CREDITO)}
                </Typography>
                {/* <Typography variant="body2" sx={{color: 'text.secondary'}}> */}
                {/*     {billing?.Celular} */}
                {/* </Typography> */}

                <Divider/>

                {/* <Typography variant="subtitle2" gutterBottom> */}

                {/*     <RadioGroup> */}
                {/*         {billingEnvioArray.map((item, index) => ( */}
                {/*             <FormControlLabel */}
                {/*                 key={index} */}
                {/*                 value={index} */}
                {/*                 control={<Radio />} */}
                {/*                 label={ item.TIPO +' | ' + item.DIRECCION} */}
                {/*             /> */}
                {/*         ))} */}
                {/*     </RadioGroup> */}


                {/*     /!* <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}> *!/ */}
                {/*     /!*   ({billing?.addressType}) *!/ */}
                {/*     /!* </Typography> *!/ */}
                {/* </Typography> */}
            </CardContent>
        </Card>
    );
}
