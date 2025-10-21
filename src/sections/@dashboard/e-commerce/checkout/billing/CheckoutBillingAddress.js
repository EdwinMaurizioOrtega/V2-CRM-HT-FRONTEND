import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import {
    Grid,
    Card,
    Button,
    Typography,
    Stack,
    Box,
    InputAdornment,
    Autocomplete,
    CardHeader,
    Radio,
    Paper,
    RadioGroup,
    CardContent,
    FormControlLabel,
    TextField,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
// _mock
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { useRouter } from "next/router";
import { _addressBooks } from '../../../../../_mock/arrays';
// components
import Label from '../../../../../components/label';
import Iconify from '../../../../../components/iconify';
//
import CheckoutSummary from '../CheckoutSummary';
import CheckoutBillingNewAddressForm from './CheckoutBillingNewAddressForm';
import ShopCustomerSearch from "../../shop/ShopCustomerSearch";
import SearchNotFound from "../../../../../components/search-not-found";
import { CustomTextField } from "../../../../../components/custom-input";
import axios from "../../../../../utils/axios";
import { TIPO_CREDITO } from "../../../../../utils/constants";
import { fCurrency } from "../../../../../utils/formatNumber";
import { useAuthContext } from "../../../../../auth/useAuthContext";
import { resetCart } from "../../../../../redux/slices/product";
import { dispatch } from "../../../../../redux/store";
import { useSnackbar } from "../../../../../components/snackbar";

// ----------------------------------------------------------------------


const DELIVERY_OPTIONS = [
    {
        id: 48212,
        codigo: '06.04.15',
        value: 0,
        title: 'GRATIS | ENVIO ($0,00)',
        description: 'Entrega estándar (Gratis)',
    },
    {
        id: 48213,
        codigo: '06.04.16',
        value: 3,
        title: 'ENVIO ($3,00)',
        description: 'ENVIO ($3,00)',
    },
    {
        id: 48214,
        codigo: '06.04.17',
        value: 5,
        title: 'ENVIO ($5,00)',
        description: 'ENVIO ($5,00)',
    },
    {
        id: 48215,
        codigo: '06.04.18',
        value: 7,
        title: 'ENVIO ($7,00)',
        description: 'ENVIO ($7,00)',
    },
    {
        id: 48216,
        codigo: '06.04.19',
        value: 13,
        title: 'ENVIO ($13,00)',
        description: 'ENVIO ($13,00)',
    },
];

CheckoutBillingAddress.propTypes = {
    checkout: PropTypes.object,
    onBackStep: PropTypes.func,
    onCreateBilling: PropTypes.func,
    onNextStep: PropTypes.func,
    deliveryOptions: PropTypes.array,
    onApplyShipping: PropTypes.func,
    onApplyComment: PropTypes.func,
    onApplyServientrega: PropTypes.func,
};

export default function CheckoutBillingAddress({
    checkout,
    onBackStep,
    onCreateBilling,
    onNextStep,
    deliveryOptions,
    onApplyShipping,
    onApplyServientrega,
    onApplyComment
}) {

    const { user } = useAuthContext();

    const { total, discount, subtotal, iva, billing } = checkout;

    const [open, setOpen] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const { push } = useRouter();

    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {
                const response = await axios.get('/hanadb/api/customers/search', {
                    params: { query: value, empresa: user.EMPRESA },
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

        //console.log(name);
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
                                <Typography component="span" sx={{ color: 'text.secondary' }}>

                                </Typography>
                            </Typography>
                        }
                        sx={{ mb: 3 }}
                    />

                    {/* Buscamos todos los clientes creados en al sistema SAP */}
                    <Autocomplete
                        size="small"
                        autoHighlight
                        popupIcon={null}
                        options={searchResults}
                        onInputChange={(event, value) => handleChangeSearch(value)}
                        getOptionLabel={(product) => product.Cliente}
                        noOptionsText={<SearchNotFound query={searchProducts} />}
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
                                            <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, product, { inputValue }) => {
                            const { ID, Cliente } = product;
                            const matches = match(Cliente, inputValue);
                            const parts = parse(Cliente, matches);

                            return (
                                <li {...props}>


                                    <AddressItem
                                        key={ID}
                                        address={product}
                                        onCreateBilling={() => {
                                            onCreateBilling(product);
                                            setSelectedCustomer(product);
                                        }}
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

                    {/* Mostrar opciones de entrega cuando se selecciona un cliente */}
                    {selectedCustomer && (
                        <Box sx={{ mt: 3 }}>

                            <CheckoutDelivery billing={billing} total={total} onApplyComment={onApplyComment}
                                onApplyShipping={onApplyShipping} onApplyServientrega={onApplyServientrega}
                                deliveryOptions={DELIVERY_OPTIONS} />

                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                                <Button
                                    size="large"
                                    variant="contained"
                                    onClick={onNextStep}
                                    endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                                >
                                    Continuar al siguiente paso
                                </Button>
                            </Stack>
                        </Box>
                    )}

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
                            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
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
                    <CheckoutSummary subtotal={subtotal} iva={iva} total={total} discount={discount} />
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

function AddressItem({ address, onCreateBilling }) {
    // const {Cliente, Direccion, Celular, receiver, fullAddress, addressType, phoneNumber, isDefault} = address;
    const { Cliente, Direccion, Celular, ID, Tipo, U_SYP_CREDITO, CreditLine, Balance } = address;
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
                            <Box component="span" sx={{ ml: 0.5, typography: 'body2', color: 'text.secondary' }}>
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
                    <Label color="success" sx={{ ml: 1 }}>
                        Cupo Otorgado: {fCurrency(credit_line)}
                    </Label>

                    <Label color="warning" sx={{ ml: 1 }}>
                        Cupo Disponible: {fCurrency(credit_line - balance_a)}
                    </Label>

                    <Label color="info" sx={{ ml: 1 }}>
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

// ----------------------------------------------------------------------

CheckoutDelivery.propTypes = {
    onApplyShipping: PropTypes.func,
    deliveryOptions: PropTypes.array,
    onApplyComment: PropTypes.func,
    onApplyServientrega: PropTypes.func,
    billing: PropTypes.object,
    total: PropTypes.number,
};

function CheckoutDelivery({
    billing,
    total,
    deliveryOptions,
    onApplyShipping,
    onApplyServientrega,
    onApplyComment,
    ...other
}) {

    const { user } = useAuthContext();

    const { enqueueSnackbar } = useSnackbar();

    const [selectedDelivery, setSelectedDelivery] = useState('');
    const [selectedServientrega, setSelectedServientrega] = useState('');
    const [comment, setComment] = useState('');

    // Estados para el formulario de nueva dirección
    const [newAddress, setNewAddress] = useState({
        tipo: '',
        direccion: '',
        ciudad: '',
        latitud: '',
        longitud: '',
        provincia: '',
        canton: ''
    });

    // Estado para las parroquias del API
    const [dataParroquias, setDataParroquias] = useState([]);
    const [selectedParroquia, setSelectedParroquia] = useState(null);
    const [loadingParroquias, setLoadingParroquias] = useState(false);

    // Estado para controlar la eliminación de direcciones
    const [deletingAddress, setDeletingAddress] = useState(null);

    //Analisamos la cadena de texto y la convertimos en un arreglo valido.
    let billingEnvioArray = [];

    try {
        billingEnvioArray = JSON.parse(billing?.ENVIO || '[]');
    } catch (error) {
        console.error('Error al analizar la cadena JSON:', error);
    }

    // Agregar opción de "Entrega en Oficina" al inicio del array
    const oficinaOption = {
        TIPO: 'ENTREGA-OFICINA',
        DIRECCION: 'Retiro en oficina',
        CANTON: 'Oficina',
        PROVINCIA: 'Oficina',
        ZIPCODE: 'Oficina',
        CARDCODE: billing?.ID || '',
        PARROQUIA: 'Oficina'
    };

    // Combinar la opción de oficina con las direcciones existentes
    const allDeliveryOptions = [oficinaOption, ...billingEnvioArray];

    // Efecto para seleccionar automáticamente la opción de oficina al cargar
    useEffect(() => {
        if (!selectedServientrega) {
            const oficinaValue = JSON.stringify(oficinaOption);
            setSelectedServientrega(oficinaValue);
            onApplyServientrega(oficinaOption);
        }
    }, [billing?.ID]); // Se ejecuta cuando cambia el ID del cliente

    // Cargar parroquias desde el API
    useEffect(() => {
        const fetchParroquias = async () => {
            setLoadingParroquias(true);
            try {
                const response = await axios.get('/hanadb/api/customers/get_parroquias');
                if (response.status === 200) {
                    setDataParroquias(response.data.data);
                }
            } catch (error) {
                console.error('Error al obtener las parroquias:', error);
                enqueueSnackbar('Error al cargar las parroquias', { variant: 'error' });
            } finally {
                setLoadingParroquias(false);
            }
        };

        fetchParroquias();
    }, []);

    const vaciarcarrito = () => {
        dispatch(resetCart());
    }

    const handleNewAddressChange = (field, value) => {
        setNewAddress(prev => ({
            ...prev,
            [field]: value.toUpperCase()
        }));
    };

    const handleSaveNewAddress = async () => {

        // Validar que los campos requeridos estén completos
        if (!newAddress.direccion || !selectedParroquia) {
            enqueueSnackbar('Por favor complete los campos requeridos: Dirección y Parroquia', { variant: 'warning' });
            return;
        }

        try {

            const response = await axios.post('/hanadb/api/customers/create_customer_address_sap', {
                DIRECCION: newAddress.direccion,
                PARROQUIA: selectedParroquia?.PARROQUIA || '',
                CANTON: selectedParroquia?.CANTON || '',
                PROVINCIA: selectedParroquia?.PROVINCIA || '',
                ZIPCODE: selectedParroquia?.CODE || '0',
                CARD_CODE: billing?.ID || '',
                EMPRESA: user?.EMPRESA || ''
            });

            // Si la respuesta es exitosa (status 200)
            if (response.status === 200) {
                enqueueSnackbar('Dirección guardada exitosamente. Recargando...', { variant: 'success' });
                
                // Limpiar el formulario
                setNewAddress({
                    direccion: '',
                    ciudad: '',
                    latitud: '',
                    longitud: '',
                    provincia: '',
                    canton: ''
                });
                setSelectedParroquia(null);
                
                // Recargar la página después de 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }

        } catch (error) {
            console.error('Error al guardar la dirección:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Error al guardar la dirección', 
                { variant: 'error' }
            );
        }
    };

    const handleCancelNewAddress = () => {
        setNewAddress({
            tipo: '',
            direccion: '',
            ciudad: '',
            latitud: '',
            longitud: '',
            provincia: '',
            canton: ''
        });
        setSelectedParroquia(null);
    };

    const handleDeleteAddress = async (addressId) => {
        // Mostrar confirmación
        if (!window.confirm(`¿Está seguro de eliminar la dirección ${addressId}?`)) {
            return;
        }

        setDeletingAddress(addressId);

        try {
            const response = await axios.delete('/hanadb/api/customers/delete_customer_address_sap', {
                params: {
                    CARD_CODE: billing?.ID || '',
                    ADDRESS_ID: addressId,
                    EMPRESA: user?.EMPRESA || ''
                }
            });

            if (response.status === 200) {
                enqueueSnackbar('Dirección eliminada exitosamente. Recargando...', { variant: 'success' });
                
                // Recargar la página después de 1.5 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Error al eliminar la dirección:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Error al eliminar la dirección',
                { variant: 'error' }
            );
        } finally {
            setDeletingAddress(null);
        }
    };

    return (
        <Card {...other}>

            <Button variant="contained" onClick={vaciarcarrito}>Eliminar Pedido</Button>

            <CardHeader title="Opciones de entrega" />

            <CardContent>
                <RadioGroup
                    value={selectedDelivery}
                    onChange={(event) => {
                        const { value } = event.target;
                        setSelectedDelivery(value);
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
                        {deliveryOptions.map((option) => (
                            <DeliveryOption
                                key={option.value}
                                option={option}
                                isSelected={selectedDelivery === String(option.value)}
                            />
                        ))}
                    </Box>
                </RadioGroup>

                <Stack sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
                    </Typography>

                    <Stack spacing={1}>
                        <TextField
                            label="Comentario"
                            name="commentEnvio"
                            value={comment}
                            onChange={(event) => {
                                const { value } = event.target;
                                setComment(value);
                                onApplyComment(value);
                            }}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{ textAlign: 'right', color: 'text.secondary' }}
                        >
                            Observación por el vendedor.
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>

            <CardHeader title="DIRECCION DE ENTREGA PARA TODOS LOS TRANSPORTISTAS" />

            <Typography variant="p" sx={{ mb: 5, px: 3 }}>
                *Nota: No seleccionar ninguna de las opciones si el retiro es en oficina.
            </Typography>

            <CardContent>

                {/* AGREGAR UNA NUEVA DIRECCION */}
                <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary
                        expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                        aria-controls="nueva-direccion-content"
                        id="nueva-direccion-header"
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon="eva:plus-circle-outline" width={24} height={24} />
                            <Typography variant="subtitle1">Agregar Nueva Dirección</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {/* <TextField
                                fullWidth
                                required
                                label="Tipo de Dirección"
                                placeholder="Ej: MATRIZ, SUCURSAL, CASA, OFICINA"
                                value={newAddress.tipo}
                                onChange={(e) => handleNewAddressChange('tipo', e.target.value)}
                            /> */}
                            <TextField
                                fullWidth
                                required
                                label="Dirección Completa"
                                placeholder="Ingrese la dirección completa"
                                multiline
                                rows={2}
                                value={newAddress.direccion}
                                onChange={(e) => handleNewAddressChange('direccion', e.target.value)}
                            />

                            <Autocomplete
                                fullWidth
                                options={dataParroquias}
                                value={selectedParroquia}
                                loading={loadingParroquias}
                                onChange={(event, newValue) => {
                                    setSelectedParroquia(newValue);
                                    if (newValue) {
                                        setNewAddress(prev => ({
                                            ...prev,
                                            ciudad: newValue.PARROQUIA || '',
                                            provincia: newValue.PROVINCIA || '',
                                            canton: newValue.CANTON || ''
                                        }));
                                    }
                                }}
                                getOptionLabel={(option) => option.PARROQUIA || ''}
                                filterOptions={(options, { inputValue }) => {
                                    const filterValue = inputValue.toLowerCase();
                                    return options.filter((option) => {
                                        const parroquia = (option.PARROQUIA || '').toLowerCase();
                                        const canton = (option.CANTON || '').toLowerCase();
                                        const provincia = (option.PROVINCIA || '').toLowerCase();

                                        return parroquia.includes(filterValue) ||
                                            canton.includes(filterValue) ||
                                            provincia.includes(filterValue);
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        required
                                        label="Parroquia"
                                        placeholder="Buscar por parroquia, cantón o provincia..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingParroquias ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                                                            <Typography variant="caption" sx={{ mr: 1 }}>
                                                                Cargando...
                                                            </Typography>
                                                        </Box>
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.CODE}>
                                        <Stack sx={{ width: '100%' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {option.PARROQUIA}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Cantón: {option.CANTON} • Provincia: {option.PROVINCIA}
                                            </Typography>
                                        </Stack>
                                    </li>
                                )}
                                noOptionsText={
                                    loadingParroquias
                                        ? "Cargando parroquias..."
                                        : "No se encontraron parroquias"
                                }
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        disabled
                                        label="Ciudad/Destino"
                                        value={newAddress.ciudad}
                                        helperText="Se llena automáticamente al seleccionar la parroquia"
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        disabled
                                        label="Provincia"
                                        value={newAddress.provincia}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        disabled
                                        label="Cantón"
                                        value={newAddress.canton}
                                    />
                                </Grid>
                            </Grid>

                            {/* <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Latitud (Opcional)"
                                        placeholder="-2.8853418"
                                        value={newAddress.latitud}
                                        onChange={(e) => handleNewAddressChange('latitud', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Longitud (Opcional)"
                                        placeholder="-78.9833596"
                                        value={newAddress.longitud}
                                        onChange={(e) => handleNewAddressChange('longitud', e.target.value)}
                                    />
                                </Grid>
                            </Grid> */}
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={handleCancelNewAddress}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveNewAddress}
                                >
                                    Guardar Dirección
                                </Button>
                            </Stack>
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <RadioGroup
                    value={selectedServientrega}
                    onChange={(event) => {
                        const { value } = event.target;
                        setSelectedServientrega(value);
                        const mergedObject = JSON.parse(value);
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
                        {allDeliveryOptions.map((option) => (
                            <DeliveryOptionAux
                                key={option.TIPO}
                                option={option}
                                isSelected={selectedServientrega === JSON.stringify(option)}
                                onDelete={option.TIPO === 'ENTREGA-OFICINA' ? null : handleDeleteAddress}
                                isDeleting={deletingAddress === option.TIPO}
                            />
                        ))}
                    </Box>
                </RadioGroup>
            </CardContent>




        </Card>
    );
}

// ----------------------------------------------------------------------

DeliveryOption.propTypes = {
    option: PropTypes.object,
    isSelected: PropTypes.bool,
};

function DeliveryOption({ option, isSelected }) {
    const { value, title, description } = option;

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
                control={<Radio required={true} checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />} />}
                label={
                    <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2">{title}</Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {description}
                        </Typography>
                    </Box>
                }
                sx={{ py: 3, px: 2.5, flexGrow: 1, mr: 0 }}
            />
        </Paper>
    );
}

DeliveryOptionAux.propTypes = {
    option: PropTypes.object,
    isSelected: PropTypes.bool,
    onDelete: PropTypes.func,
    isDeleting: PropTypes.bool,
};

function DeliveryOptionAux({ option, isSelected, onDelete, isDeleting }) {
    const { TIPO, DIRECCION, CANTON, PROVINCIA, PARROQUIA, ZIPCODE, CARDCODE, NAME_SERVIENTREGA } = option;

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevenir que se seleccione el radio al hacer clic en eliminar
        if (onDelete) {
            onDelete(TIPO);
        }
    };

    // Determinar si es la opción de oficina (no se puede eliminar)
    const isOficinaOption = TIPO === 'ENTREGA-OFICINA';

    return (
        <Paper
            variant="outlined"
            key={TIPO}
            sx={{
                display: 'flex',
                alignItems: 'center',
                transition: (theme) => theme.transitions.create('all'),
                position: 'relative',
                ...(isSelected && {
                    boxShadow: (theme) => theme.customShadows.z20,
                }),
                ...(isDeleting && {
                    opacity: 0.5,
                    pointerEvents: 'none',
                }),
                ...(isOficinaOption && {
                    border: '2px solid',
                    borderColor: 'success.main',
                    bgcolor: 'success.lighter',
                }),
            }}
        >
            {/* Botón de eliminar en la esquina superior derecha - Solo si NO es opción de oficina */}
            {!isOficinaOption && onDelete && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                    }}
                >
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        startIcon={<Iconify icon="eva:trash-2-outline" />}
                        sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                        }}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </Box>
            )}

            {/* Badge especial para opción de oficina */}
            {isOficinaOption && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                    }}
                >
                    <Label color="success" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        ✓ Opción Predeterminada
                    </Label>
                </Box>
            )}

            <FormControlLabel
                value={JSON.stringify(option)}
                control={<Radio checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />} />}
                label={
                    <Box sx={{ ml: 1, width: '100%', pr: isOficinaOption ? 18 : 12 }}>
                        <Stack spacing={0.5}>
                            {/* Dirección completa */}
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'text.primary',
                                    fontWeight: isOficinaOption ? 600 : 400,
                                    fontSize: isOficinaOption ? '0.95rem' : '0.875rem'
                                }}
                            >
                                {isOficinaOption && '🏢 '}
                                {DIRECCION}
                            </Typography>

                            {/* Información geográfica */}
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {PARROQUIA && (
                                    <Label color={isOficinaOption ? "success" : "secondary"} sx={{ fontSize: '0.75rem' }}>
                                        {isOficinaOption ? 'Retiro en: ' : 'Parroquia: '}{PARROQUIA}
                                    </Label>
                                )}
                                {CANTON && (
                                    <Label color="primary" sx={{ fontSize: '0.75rem' }}>
                                        Cantón: {CANTON}
                                    </Label>
                                )}
                                {PROVINCIA && (
                                    <Label color="info" sx={{ fontSize: '0.75rem' }}>
                                        Provincia: {PROVINCIA}
                                    </Label>
                                )}
                                {ZIPCODE && (
                                    <Label color="secondary" sx={{ fontSize: '0.75rem' }}>
                                        Código Postal: {ZIPCODE}
                                    </Label>
                                )}
                            </Stack>

                            {/* Código de cliente (opcional, solo si existe) */}
                            {CARDCODE && !isOficinaOption && (
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                    Cliente: {CARDCODE}
                                </Typography>
                            )}

                            {/* Destino Servientrega (si existe) */}
                            {NAME_SERVIENTREGA && (
                                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                                    DESTINO: {NAME_SERVIENTREGA}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                }
                sx={{ py: 3, px: 2.5, flexGrow: 1, mr: 0 }}
            />
        </Paper>
    );
}
