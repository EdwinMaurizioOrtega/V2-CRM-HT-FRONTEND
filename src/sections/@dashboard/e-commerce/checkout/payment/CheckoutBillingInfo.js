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
                    {/* <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}> */}
                    {/*   ({billing?.addressType}) */}
                    {/* </Typography> */}
                </Typography>

                <Typography variant="body2" gutterBottom>
                    Crédito aprobado: {billing?.ValidComm}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Tipo crédito: {billing?.GLN}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Cupo utilizado: {fCurrency(billing?.Balance)}
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
