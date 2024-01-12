import PropTypes from 'prop-types';
// form
import {Controller, useFormContext} from 'react-hook-form';
// @mui
import {
    Box,
    Card,
    Radio,
    Paper,
    Typography,
    RadioGroup,
    CardHeader,
    CardContent,
    FormControlLabel, Stack, Button, Divider, Alert, AlertTitle, TextField, Autocomplete,
} from '@mui/material';
// components
import Iconify from '../../../../../components/iconify';
import {RHFTextField} from "../../../../../components/hook-form";
import {resetCart} from "../../../../../redux/slices/product";
import {dispatch} from "../../../../../redux/store";
import React, {useEffect, useState} from "react";
import {value} from "lodash/seq";
import {Block} from "../../../../_examples/Block";
import ContadorRegresivo from "../../../../../components/ContadorRegresivo/ContadorRegresivo";
import {HOST_API_KEY} from "../../../../../config-global";
import Masonry from "@mui/lab/Masonry";

// ----------------------------------------------------------------------

CheckoutDelivery.propTypes = {
    onApplyShipping: PropTypes.func,
    deliveryOptions: PropTypes.array,
    onApplyComment: PropTypes.func,
    onApplyServientrega: PropTypes.func,
};


export default function CheckoutDelivery({
                                             billing,
                                             total,
                                             deliveryOptions,
                                             onApplyShipping,
                                             onApplyServientrega,
                                             onApplyComment,
                                             ...other
                                         }) {
    const {control} = useFormContext();


    //Analisamos la cadena de texto y la convertimos en un arreglo valido.
    let billingEnvioArray = [];

    try {
        billingEnvioArray = JSON.parse(billing?.ENVIO || '[]');
    } catch (error) {
        console.error('Error al analizar la cadena JSON:', error);
    }


    const vaciarcarrito = () => {
        dispatch(resetCart());
    }

    const [selectedValue, setSelectedValue] = useState(null);

    const handleRadioChange = (event) => {
        console.log(event.target.value);
    };

    // const [dataCities, setDataCities] = useState([]);
    //
    // useEffect(() => {
    //
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/order/ServiEntrega/ciudades`);
    //             const result = await response.json();
    //             setDataCities(result.data);
    //             console.log(dataCities);
    //         } catch (error) {
    //             console.log('error', error);
    //         }
    //     };
    //
    //     fetchData();
    //
    //     // Si necesitas hacer algo al desmontar el componente, puedes retornar una función desde useEffect
    //     return () => {
    //         // Por ejemplo, limpiar intervalos, cancelar solicitudes, etc.
    //     };
    // }, []); // El segundo argumento es un array de dependencias, en este caso, está vacío para que se ejecute solo una vez
    //

    //const [selectedCityDestino, setSelectedCityDestino] = useState('');
    // const handleCityChangeDestino = (event, value) => {
    //     if (value) {
    //         setSelectedCityDestino(value)
    //     }
    // };


    return (
        <Card {...other}>

            <Button variant="contained" onClick={vaciarcarrito}>Eliminar Pedido</Button>

            <CardHeader title="Opciones de entrega"/>

            {/* <Typography variant="h3" sx={{ mb: 5 }}> */}
            {/*     Valor total: ${total} */}
            {/* </Typography> */}
            <CardContent>
                <Controller
                    name="delivery"
                    control={control}
                    render={({field}) => (
                        <RadioGroup
                            {...field}
                            onChange={(event) => {
                                const {value} = event.target;
                                console.log("Envío: "+value);
                                field.onChange(Number(value));
                                onApplyShipping(Number(value));
                            }}
                        >
                            <Box
                                gap={2}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                }}
                            >
                                {/* V1 */}
                                {deliveryOptions.map((option) => (
                                    <DeliveryOption
                                        key={option.value}
                                        option={option}
                                        isSelected={field.value === option.value}
                                    />
                                ))}


                                {/* V2 */}
                                {/* { */}
                                {/*     deliveryOptions.map((option, index) => { */}
                                {/*         if (total < 1000 && (index === 1 || index === 2 || index === 3 || index === 4) ) { */}
                                {/*             return ( */}
                                {/*                 <DeliveryOption */}
                                {/*                     key={option.value} */}
                                {/*                     option={option} */}
                                {/*                     isSelected={field.value === option.value} */}
                                {/*                 /> */}
                                {/*             ); */}
                                {/*         } else if (total > 1000 && index === 0) { */}
                                {/*             return ( */}
                                {/*                 <DeliveryOption */}
                                {/*                     key={option.value} */}
                                {/*                     option={option} */}
                                {/*                     isSelected={field.value === option.value} */}
                                {/*                 /> */}
                                {/*             ); */}
                                {/*         } */}
                                {/*         return null; */}
                                {/*     }) */}
                                {/* } */}


                            </Box>
                        </RadioGroup>
                    )}
                />


                <Stack>

                    <Typography variant="subtitle2" sx={{height: 36, lineHeight: '36px'}}>

                    </Typography>

                    <Stack spacing={1}>
                        <RHFTextField
                            label="Comentario"
                            name="commentEnvio"
                            onKeyUp={(event) => {
                                const {value} = event.target;
                                onApplyComment(value);
                            }}
                        />
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{textAlign: 'right', color: 'text.secondary'}}
                        >
                            Observación por el vendedor.
                        </Typography>
                    </Stack>
                </Stack>

            </CardContent>

            <CardHeader title="SERVIENTREGA"/>

            {/* <ContadorRegresivo /> */}

            <Typography variant="p" sx={{mb: 5}}>
                *Nota: No seleccionar ninguna de las opciones si el retiro es en oficina.
            </Typography>

            {/* <Block title="Ciudad Destino"> */}
            {/*     <Autocomplete */}
            {/*         fullWidth */}
            {/*         disableClearable */}
            {/*         options={dataCities} */}
            {/*         getOptionLabel={(option) => option.nombre} */}
            {/*         renderInput={(params) => ( */}
            {/*             <TextField */}
            {/*                 {...params} */}
            {/*                 label="Destino" */}
            {/*                 InputProps={{...params.InputProps, type: 'search'}} */}
            {/*             /> */}
            {/*         )} */}
            {/*         onChange={(event, value) => { */}
            {/*             handleCityChangeDestino(event, value); */}
            {/*         }} */}
            {/*     /> */}
            {/* </Block> */}

            <CardContent>
                <Controller
                    name="servientrega"
                    control={control}
                    render={({field}) => (
                        <RadioGroup
                            {...field}
                            onChange={(event) => {
                                const {value} = event.target;
                                field.onChange(value);
                                //const mergedObject = {...JSON.parse(value), ...JSON.parse(JSON.stringify(selectedCityDestino))};
                                const mergedObject = JSON.parse(value);
                                //console.log("Value Muy Importante: " + JSON.stringify(mergedObject));
                                onApplyServientrega(mergedObject);
                            }}
                        >
                            <Box
                                gap={2}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                }}
                            >

                                {billingEnvioArray.map((option) => (
                                    <DeliveryOptionAux
                                        key={option.TIPO}
                                        option={option}
                                        isSelected={field.TIPO === option.TIPO}
                                    />
                                ))}

                            </Box>
                        </RadioGroup>
                    )}
                />


            </CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------------

DeliveryOption.propTypes = {
    option: PropTypes.object,
    isSelected: PropTypes.bool,
};

function DeliveryOption({option, isSelected}) {
    const {value, title, description} = option;

    return (
        <Paper
            variant="outlined"
            key={value}
            sx={{
                display: 'flex',
                alignItems: 'center',
                transition: (theme) => theme.transitions.create('all'),
                ...(isSelected && {
                    boxShadow: (theme) => theme.customShadows.z20,
                }),
            }}
        >
            <FormControlLabel
                value={value}
                control={<Radio required={true} checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill"/>}/>}
                label={
                    <Box sx={{ml: 1}}>
                        <Typography variant="subtitle2">{title}</Typography>

                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                            {description}
                        </Typography>
                    </Box>
                }
                sx={{py: 3, px: 2.5, flexGrow: 1, mr: 0}}
            />
        </Paper>
    );
}


DeliveryOptionAux.propTypes = {
    option: PropTypes.object,
    isSelected: PropTypes.bool,
};

function DeliveryOptionAux({option, isSelected}) {
    const {TIPO, DIRECCION, NAME_SERVIENTREGA} = option;

    return (
        <Paper
            variant="outlined"
            key={TIPO}
            sx={{
                display: 'flex',
                alignItems: 'center',
                transition: (theme) => theme.transitions.create('all'),
                ...(isSelected && {
                    boxShadow: (theme) => theme.customShadows.z20,
                }),
            }}
        >
            <FormControlLabel
                value={JSON.stringify(option)}
                control={<Radio checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill"/>}/>}
                label={
                    <Box sx={{ml: 1}}>
                        <Typography variant="subtitle2">{TIPO}</Typography>

                        <Typography variant="body2" sx={{color: 'text.secondary'}}>
                            {DIRECCION}
                        </Typography>

                        <Typography variant="subtitle2" sx={{color: 'red'}}>
                            DESTINO: {NAME_SERVIENTREGA}
                        </Typography>
                    </Box>
                }
                sx={{py: 3, px: 2.5, flexGrow: 1, mr: 0}}
            />
        </Paper>
    );
}
