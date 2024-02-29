import PropTypes from 'prop-types';
import {useState} from 'react';
// @mui
import {Grid, Card, Button, Typography, Stack, Box, InputAdornment, Autocomplete, CardHeader} from '@mui/material';
// _mock
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import {useRouter} from "next/router";
import {_addressBooks} from '../../../../../_mock/arrays';
// components
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
//
import CheckoutSummary from '../CheckoutSummary';
import CheckoutBillingNewAddressForm from './CheckoutBillingNewAddressForm';
import ShopCustomerSearch from "../../shop/ShopCustomerSearch";
import SearchNotFound from "../../../../../components/search-not-found";
import {CustomTextField} from "../../../../../components/custom-input";
import axios from "../../../../../utils/axios";
import {TIPO_CREDITO} from "../../../../../utils/constants";
import {fCurrency} from "../../../../../utils/formatNumber";

// ----------------------------------------------------------------------

CheckoutBillingAddress.propTypes = {
    checkout: PropTypes.object,
    onBackStep: PropTypes.func,
    onCreateBilling: PropTypes.func,
};

export default function CheckoutBillingAddress({checkout, onBackStep, onCreateBilling}) {
    const {total, discount, subtotal, iva} = checkout;

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const {push} = useRouter();

    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {
                const response = await axios.get('/hanadb/api/customers/search', {
                    params: {query: value},
                });

                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGotoProduct = (name) => {
        // push(PATH_DASHBOARD.eCommerce.view(paramCase(name)));
        // push(PATH_DASHBOARD.eCommerce.view(name));

        console.log(name);
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            handleGotoProduct(searchProducts);
        }
    };

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>

                    <CardHeader
                        title={
                            <Typography variant="h6">
                                Seleccionar un cliente:
                                <Typography component="span" sx={{color: 'text.secondary'}}>

                                </Typography>
                            </Typography>
                        }
                        sx={{mb: 3}}
                    />

                    {/* Buscamos todos los clientes creados en al sistema SAP */}
                    <Autocomplete
                        size="small"
                        autoHighlight
                        popupIcon={null}
                        options={searchResults}
                        onInputChange={(event, value) => handleChangeSearch(value)}
                        getOptionLabel={(product) => product.Cliente}
                        noOptionsText={<SearchNotFound query={searchProducts}/>}
                        isOptionEqualToValue={(option, value) => option.ID === value.ID}
                        componentsProps={{
                            paper: {
                                sx: {
                                    '& .MuiAutocomplete-option': {
                                        px: `8px !important`,
                                    },
                                },
                            },
                        }}
                        renderInput={(params) => (
                            <CustomTextField
                                {...params}

                                placeholder="Buscar..."
                                onKeyUp={handleKeyUp}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Iconify icon="eva:search-fill" sx={{ml: 1, color: 'text.disabled'}}/>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, product, {inputValue}) => {
                            const {ID, Cliente} = product;
                            const matches = match(Cliente, inputValue);
                            const parts = parse(Cliente, matches);

                            return (
                                <li {...props}>


                                    <AddressItem
                                        key={ID}
                                        address={product}
                                        onCreateBilling={() => onCreateBilling(product)}
                                    >
                                        {parts.map((part, index) => (
                                            <Typography
                                                key={index}
                                                component="span"
                                                variant="subtitle2"
                                                color={part.highlight ? 'primary' : 'textPrimary'}
                                            >
                                                {part.text}
                                            </Typography>
                                        ))}

                                    </AddressItem>

                                </li>
                            );
                        }}
                    />

                    {/* {_addressBooks.map((address, index) => ( */}
                    {/*   <AddressItem */}
                    {/*     key={index} */}
                    {/*     address={address} */}
                    {/*     onCreateBilling={() => onCreateBilling(address)} */}
                    {/*   /> */}
                    {/* ))} */}

                    <Stack direction="row" justifyContent="space-between">
                        <Button
                            size="small"
                            color="inherit"
                            onClick={onBackStep}
                            startIcon={<Iconify icon="eva:arrow-ios-back-fill"/>}
                        >
                            Atrás
                        </Button>

                        {/* <Button */}
                        {/*     size="small" */}
                        {/*     variant="soft" */}
                        {/*     onClick={handleOpen} */}
                        {/*     startIcon={<Iconify icon="eva:plus-fill"/>} */}
                        {/* > */}
                        {/*     Agregar nueva dirección */}
                        {/* </Button> */}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                    <CheckoutSummary subtotal={subtotal} iva={iva} total={total} discount={discount}/>
                </Grid>
            </Grid>

            <CheckoutBillingNewAddressForm
                open={open}
                onClose={handleClose}
                onCreateBilling={onCreateBilling}
            />
        </>
    );
}

// ----------------------------------------------------------------------

AddressItem.propTypes = {
    address: PropTypes.object,
    onCreateBilling: PropTypes.func,
};

function AddressItem({address, onCreateBilling}) {
    // const {Cliente, Direccion, Celular, receiver, fullAddress, addressType, phoneNumber, isDefault} = address;
    const {Cliente, Direccion, Celular, ID, Tipo, U_SYP_CREDITO, CreditLine, Balance} = address;
    const receiver = Cliente;
    const tipo = Tipo;
    const id = ID;
    const tipo_credito = U_SYP_CREDITO;
    const credit_line = CreditLine;
    const balance_a = Balance;


    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    return (
        <Card onClick={onCreateBilling}
              sx={{
                  p: 3,
                  mb: 3,
                  width: '100%', // Hacer que el card ocupe todo el ancho disponible

              }}
        >
            <Stack
                spacing={2}
                alignItems={{
                    md: 'flex-end',
                }}
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
            >
                <Stack flexGrow={1} spacing={1}>
                    <Stack direction="row" alignItems="center">
                        <Typography variant="subtitle1">
                            {receiver}
                            <Box component="span" sx={{ml: 0.5, typography: 'body2', color: 'text.secondary'}}>
                                ({id + " | " + tipo})
                            </Box>
                        </Typography>

                        {/* {isDefault && ( */}
                        {/*     <Label color="info" sx={{ml: 1}}> */}
                        {/*         Default */}
                        {/*     </Label> */}
                        {/* )} */}
                    </Stack>

                    {/*<Typography variant="body2">{tipo + " " +id}</Typography>*/}

                    {/*<Typography variant="body2" sx={{color: 'text.secondary'}}>*/}
                    {/*    {id}*/}
                    {/*</Typography>*/}
                    <Label color="success" sx={{ml: 1}}>
                        Cupo Otorgado: {fCurrency(credit_line)}
                    </Label>

                    <Label color="warning" sx={{ml: 1}}>
                        Cupo Disponible: {fCurrency(credit_line - balance_a)}
                    </Label>

                    <Label color="info" sx={{ml: 1}}>
                        Tipo de Crédito: {tipoCredito(tipo_credito)}
                    </Label>
                </Stack>

                {/* <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}> */}
                {/*     /!* {!isDefault && ( *!/ */}
                {/*     /!*     <Button variant="outlined" size="small" color="inherit" sx={{mr: 1}}> *!/ */}
                {/*     /!*         Borrar *!/ */}
                {/*     /!*     </Button> *!/ */}
                {/*     /!* )} *!/ */}

                {/*     <Button variant="outlined" size="small" onClick={onCreateBilling}> */}
                {/*         Entregar a esta dirección */}
                {/*     </Button> */}
                {/* </Stack> */}
            </Stack>
        </Card>
    );
}
