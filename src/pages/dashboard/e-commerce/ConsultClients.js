import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
// form
import FormProvider, {
    RHFTextField,
    RHFRadioGroup,
} from '../../../components/hook-form';

import axios from '../../../utils/axios';
// @mui
import {
    Grid,
    Stack,
    Typography,
    Container,
    Card,
    Box,
    Button,
} from '@mui/material';
import {useForm} from "react-hook-form";
import DashboardLayout from "../../../layouts/dashboard";
import {LoadingButton} from "@mui/lab";
import {PATH_DASHBOARD} from "../../../routes/paths";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import Head from "next/head";
import {
    GridToolbarContainer,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import {useAuthContext} from "../../../auth/useAuthContext";
import Label from "../../../components/label";
import {fCurrency} from "../../../utils/formatNumber";
import {useSnackbar} from "../../../components/snackbar";
import {DOCUMENTACION, PAYMENT_OPTIONS_V2, TIPO_CREDITO, TIPO_PRECIO} from "../../../utils/constants";
import {GoogleMap, InfoWindow, Marker, useJsApiLoader} from "@react-google-maps/api";
import {HOST_API_KEY} from "../../../config-global";

// ----------------------------------------------------------------------

ConsultClientForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function ConsultClientForm() {

    const {user} = useAuthContext();

    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const {
        watch, reset, control, setValue, handleSubmit, formState: {isSubmitting},
    } = methods;

    const methods_second_form = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const baseColumns = [{
        field: 'id', hide: true,
    },

        {
            field: 'COMPANY', headerName: 'EMPRESA', width: 150, renderCell: (params) => {
                return (<Button
                    variant="contained"
                    onClick={() => handleShowCoordinates(params.row)}
                >
                    {(params.row.COMPANY)}
                </Button>);
            }
        }, {
            field: 'Cliente', headerName: 'CLIENTE', width: 500, // Ancho específico en píxeles
        }, {
            field: 'ID', headerName: 'CI/RUC', width: 150, // Ancho específico en píxeles
        },


    ]


    const onSubmit = async (data) => {

        console.log('DATA', data);

        const searchTerm = data.searchTerm || ""; // Si data.ci_ruc es undefined, asigna una cadena vacía

        //Ruc/Cédula
        if (data.tipo === "0") {

            if (searchTerm.length === 10 || searchTerm.length === 13) {

                // Buscar en dataClienteAll
                const clientes = dataClienteAll.filter(cliente => cliente.ID === 'CL' + searchTerm);

                if (clientes) {
                    console.log('Cliente encontrado:', clientes);
                    // Aquí puedes hacer algo con el cliente encontrado

                    setSearchResults(clientes);

                } else {
                    console.log('Cliente no encontrado con ci_ruc:', searchTerm);
                    // Aquí puedes manejar el caso cuando no se encuentra el cliente
                }


            } else {
                onSnackbarAction('Número de caracteres invalido.', 'default', {
                    vertical: 'top', horizontal: 'center',
                });
            }

        }

        //Razón Social
        if (data.tipo === "1") {

                // Buscar en dataClienteAll
                const clientes = dataClienteAll.filter(cliente => cliente.Cliente.includes(searchTerm));

                if (clientes.length === 2 || clientes.length === 1) {
                    console.log('Cliente encontrado:', clientes);
                    // Aquí puedes hacer algo con el cliente encontrado

                    setSearchResults(clientes);

                } else if (clientes.length > 2) {
                    console.log('Se han encontrado mas de dos resultados.', searchTerm);
                    onSnackbarAction('Se han encontrado mas de dos resultados.', 'default', {
                        vertical: 'top', horizontal: 'center',
                    });
                    // Aquí puedes manejar el caso cuando no se encuentra el cliente
                } else if (clientes.length === 0) {
                    console.log('Ningun cliente encontrado.', searchTerm);
                        onSnackbarAction('Ningun cliente encontrado.', 'default', {
                            vertical: 'top', horizontal: 'center',
                        });
                }


        }
    }

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const onSnackbarAction = (data, color, anchor) => {
        enqueueSnackbar(`${data}`, {
            variant: color, anchorOrigin: anchor, action: (key) => (<>
                <Button size="small" color="inherit" onClick={() => closeSnackbar(key)}>
                    Cerrar
                </Button>
            </>),
        });
    };


    const [dataClienteAll, setDataClienteAll] = useState([]);
    const [dataCliente, setDataCliente] = useState(null);

    function nameFormaPago(pay) {
        const payActual = PAYMENT_OPTIONS_V2.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function documentacion(pay) {
        const payActual = DOCUMENTACION.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function tipoCredito(pay) {
        const payActual = TIPO_CREDITO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    function tipoPrecio(pay) {
        const payActual = TIPO_PRECIO.find(option => option.id == pay);
        return payActual ? payActual.title : "Pago no definido.";
    }

    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/all_customers_of_companys`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataClienteAll(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }


            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, []);

    const handleShowCoordinates = (position) => {
        if (position) {
            console.log("Coordenadas seleccionadas:", position);
            // Puedes hacer algo con las coordenadas seleccionadas aquí, si es necesario
            setDataCliente(position);

        } else {
            console.log("No se ha seleccionado ningún marcador.");
        }
    };


    const [searchProducts, setSearchProducts] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const handleChangeSearch = async (value) => {
        try {
            setSearchProducts(value);
            if (value) {


                setSearchResults(response.data.results);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === 'Enter') {
            // handleGotoProduct(searchProducts);
        }
    };


    return (<>
        <Head>
            <title> Catálogo: Productos | HT</title>
        </Head>
        <Container>

            <CustomBreadcrumbs
                heading="Buscar Cliente v1.1"
                links={[{
                    name: 'Dashboard', href: PATH_DASHBOARD.root,
                }, {
                    name: 'SAP', href: PATH_DASHBOARD.eCommerce.catalogo,
                }, {name: 'Cliente'},]}
            />


            {/*<Box sx={{height: 280}}>*/}
            {/*<DataGrid*/}
            {/*    rows={dataClienteAll}*/}
            {/*    columns={baseColumns}*/}
            {/*    slots={{*/}
            {/*        toolbar: CustomToolbar,*/}
            {/*        noRowsOverlay: () => <EmptyContent title="No Data"/>,*/}
            {/*        noResultsOverlay: () => <EmptyContent title="No results found"/>,*/}
            {/*    }}*/}
            {/*/>*/}
            {/*</Box>*/}


            {/*<Grid container spacing={5}>*/}
            {/*    <Grid item xs={12} md={6}>*/}
            {/*        <Stack spacing={2}>*/}
            {/*            <Block label="Cliente Razon Social">*/}
            {/*                <Autocomplete*/}
            {/*                    size="small"*/}
            {/*                    autoHighlight*/}
            {/*                    popupIcon={null}*/}
            {/*                    options={dataClienteAll}*/}
            {/*                    onInputChange={(event, value) => handleChangeSearch(value)}*/}
            {/*                    getOptionLabel={(product) => product.Cliente}*/}
            {/*                    noOptionsText={<SearchNotFound query={searchProducts}/>}*/}
            {/*                    isOptionEqualToValue={(option, value) => option.ID === value.ID}*/}
            {/*                    componentsProps={{*/}
            {/*                        paper: {*/}
            {/*                            sx: {*/}
            {/*                                '& .MuiAutocomplete-option': {*/}
            {/*                                    px: `8px !important`,*/}
            {/*                                },*/}
            {/*                            },*/}
            {/*                        },*/}
            {/*                    }}*/}
            {/*                    renderInput={(params) => (*/}
            {/*                        <CustomTextField*/}
            {/*                            {...params}*/}

            {/*                            placeholder="Buscar..."*/}
            {/*                            onKeyUp={handleKeyUp}*/}
            {/*                            InputProps={{*/}
            {/*                                ...params.InputProps,*/}
            {/*                                startAdornment: (*/}
            {/*                                    <InputAdornment position="start">*/}
            {/*                                        <Iconify icon="eva:search-fill"*/}
            {/*                                                 sx={{ml: 1, color: 'text.disabled'}}/>*/}
            {/*                                    </InputAdornment>*/}
            {/*                                ),*/}
            {/*                            }}*/}
            {/*                        />*/}
            {/*                    )}*/}
            {/*                    renderOption={(props, product, {inputValue}) => {*/}
            {/*                        const {ID, Cliente} = product;*/}
            {/*                        const matches = match(Cliente, inputValue);*/}
            {/*                        const parts = parse(Cliente, matches);*/}

            {/*                        return (*/}
            {/*                            <li {...props}>*/}


            {/*                                <AddressItem*/}
            {/*                                    key={ID}*/}
            {/*                                    address={product}*/}
            {/*                                    onCreateBilling={() => onCreateBilling(product)}*/}
            {/*                                >*/}
            {/*                                    {parts.map((part, index) => (*/}
            {/*                                        <Typography*/}
            {/*                                            key={index}*/}
            {/*                                            component="span"*/}
            {/*                                            variant="subtitle2"*/}
            {/*                                            color={part.highlight ? 'primary' : 'textPrimary'}*/}
            {/*                                        >*/}
            {/*                                            {part.text}*/}
            {/*                                        </Typography>*/}
            {/*                                    ))}*/}

            {/*                                </AddressItem>*/}

            {/*                            </li>*/}
            {/*                        );*/}
            {/*                    }}*/}
            {/*                />*/}

            {/*            </Block>*/}

            {/*        </Stack>*/}
            {/*    </Grid>*/}

            {/*</Grid>*/}

            <Stack spacing={2}>
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={12}>
                            <Block label="Cliente RUC/Cédula">
                                <RHFRadioGroup row spacing={4} name="tipo" options={GENDER_OPTION} />
                                <RHFTextField name="searchTerm"
                                              label="RUC/Cédula"
                                              onChange={(event) => {
                                                  const inputValue = event.target.value.toUpperCase(); // Convertir a mayúsculas
                                                  setValue('searchTerm', inputValue, { shouldValidate: true });
                                              }}
                                />
                            </Block>

                            <Block label="Acción">
                                <LoadingButton
                                    fullWidth
                                    color="success"
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                >
                                    Buscar
                                </LoadingButton>

                            </Block>
                        </Grid>
                    </Grid>
                </FormProvider>
            </Stack>

            <Grid container spacing={2} style={{marginTop: '20px'}}>
                <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                        {searchResults.length > 0 ? (<Block label={searchResults[0].COMPANY}>
                            <>
                                <Label color="success">Tipo: {searchResults[0].Tipo} </Label>
                                <Label color="success">Vendedor: {searchResults[0].SlpName} </Label>
                                <Label color="success">Cliente: {searchResults[0].Cliente} </Label>
                                <Label color="success">Lista
                                    Precio: {tipoPrecio(searchResults[0].Lista)} </Label>
                                <Label color="success">Saldo de
                                    Cuenta: {fCurrency(searchResults[0].Balance)} </Label>
                                <Label
                                    color="success">DOCUMENTACIÓN: {documentacion(searchResults[0].U_SYP_DOCUMENTACION)} </Label>
                                <Label color="success">Tipo de
                                    Crédito: {tipoCredito(searchResults[0].U_SYP_CREDITO)} </Label>
                                <Label color="success">Condicion de
                                    Pago: {nameFormaPago(searchResults[0].GroupNum)} </Label>
                                <Label color="success">Límte de
                                    Crédito: {fCurrency(searchResults[0].CreditLine)} </Label>
                                <Label color="success">Límite de
                                    comprometido: {fCurrency(searchResults[0].DebtLine)} </Label>
                                <Label color="success">Pedidos
                                    Clientes: {fCurrency(searchResults[0].OrdersBal)} </Label>

                                <Label color="success">Saldo en Crédito: {

                                   fCurrency(searchResults[0].CreditLine - searchResults[0].Balance) >0  ? "POR COLOCAR" : "SOBRECUPO"

                                } </Label>
                                <p style={{color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)'}}>
                                    Comentario: {searchResults[0].Free_Text}
                                </p>
                                <Box
                                    rowGap={1}
                                    columnGap={1}
                                >
                                    {dataCliente ? (<>
                                        <MapComponent markers={JSON.parse(dataCliente?.ENVIO)}/>
                                    </>) : (<Label color="error">Cliente no encontrado</Label>)}

                                </Box>
                            </>
                        </Block>) : (<Label color="error">Cliente no encontrado</Label>)}
                    </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                        {searchResults.length > 1 ? (<Block label={searchResults[1].COMPANY}>
                                <>
                                    <Label color="success">Tipo: {searchResults[1].Tipo} </Label>
                                    <Label color="success">Vendedor: {searchResults[1].SlpName} </Label>
                                    <Label color="success">Cliente: {searchResults[1].Cliente} </Label>
                                    <Label color="success">Lista
                                        Precio: {tipoPrecio(searchResults[1].Lista)} </Label>
                                    <Label color="success">Saldo de
                                        Cuenta: {fCurrency(searchResults[1].Balance)} </Label>
                                    <Label
                                        color="success">DOCUMENTACIÓN: {documentacion(searchResults[1].U_SYP_DOCUMENTACION)} </Label>
                                    <Label color="success">Tipo de
                                        Crédito: {tipoCredito(searchResults[1].U_SYP_CREDITO)} </Label>
                                    <Label color="success">Condicion de
                                        Pago: {nameFormaPago(searchResults[1].GroupNum)} </Label>
                                    <Label color="success">Límte de
                                        Crédito: {fCurrency(searchResults[1].CreditLine)} </Label>
                                    <Label color="success">Límite de
                                        comprometido: {fCurrency(searchResults[1].DebtLine)} </Label>
                                    <Label color="success">Pedidos
                                        Clientes: {fCurrency(searchResults[1].OrdersBal)} </Label>
                                    <Label color="success">Saldo en Crédito: {

                                        fCurrency(searchResults[0].CreditLine - searchResults[0].Balance) > 0  ? "POR COLOCAR" : "SOBRECUPO"

                                    } </Label>
                                    <p style={{color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)'}}>
                                        Comentario: {searchResults[1].Free_Text}
                                    </p>
                                    <Box
                                        rowGap={1}
                                        columnGap={1}
                                    >
                                        {dataCliente ? (<>
                                            <MapComponent markers={JSON.parse(dataCliente?.ENVIO)}/>
                                        </>) : (<Label color="error">Cliente no encontrado</Label>)}
                                    </Box>
                                </>
                            </Block>
                        ) : (<Label color="error">Cliente no encontrado</Label>)}
                    </Stack>
                </Grid>

                {/* <Grid item xs={12} md={6}> */}
                {/*     <Stack spacing={2}> */}
                {/*         {searchResults.length > 1 ? (<Block label={searchResults[2].COMPANY}> */}
                {/*                 <> */}
                {/*                     <Label color="success">Tipo: {searchResults[2].Tipo} </Label> */}
                {/*                     <Label color="success">Vendedor: {searchResults[2].SlpName} </Label> */}
                {/*                     <Label color="success">Cliente: {searchResults[2].Cliente} </Label> */}
                {/*                     <Label color="success">Lista */}
                {/*                         Precio: {tipoPrecio(searchResults[2].Lista)} </Label> */}
                {/*                     <Label color="success">Saldo de */}
                {/*                         Cuenta: {fCurrency(searchResults[2].Balance)} </Label> */}
                {/*                     <Label */}
                {/*                         color="success">DOCUMENTACIÓN: {documentacion(searchResults[2].U_SYP_DOCUMENTACION)} </Label> */}
                {/*                     <Label color="success">Tipo de */}
                {/*                         Crédito: {tipoCredito(searchResults[2].U_SYP_CREDITO)} </Label> */}
                {/*                     <Label color="success">Condicion de */}
                {/*                         Pago: {nameFormaPago(searchResults[2].GroupNum)} </Label> */}
                {/*                     <Label color="success">Límte de */}
                {/*                         Crédito: {fCurrency(searchResults[2].CreditLine)} </Label> */}
                {/*                     <Label color="success">Límite de */}
                {/*                         comprometido: {fCurrency(searchResults[2].DebtLine)} </Label> */}
                {/*                     <Label color="success">Pedidos */}
                {/*                         Clientes: {fCurrency(searchResults[2].OrdersBal)} </Label> */}
                {/*                     <p style={{color: '#1B806A', backgroundColor: 'rgba(54, 179, 126, 0.16)'}}> */}
                {/*                         Comentario: {searchResults[2].Free_Text} */}
                {/*                     </p> */}
                {/*                     <Box */}
                {/*                         rowGap={1} */}
                {/*                         columnGap={1} */}
                {/*                     > */}
                {/*                         {dataCliente ? (<> */}
                {/*                             <MapComponent markers={JSON.parse(dataCliente?.ENVIO)}/> */}
                {/*                         </>) : (<Label color="error">Cliente no encontrado</Label>)} */}
                {/*                     </Box> */}
                {/*                 </> */}
                {/*             </Block> */}
                {/*         ) : (<Label color="error">Cliente no encontrado</Label>)} */}
                {/*     </Stack> */}
                {/* </Grid> */}
            </Grid>

        </Container>
    </>);
}

// ----------------------------------------------------------------------

Block.propTypes = {
    label: PropTypes.string, children: PropTypes.node, sx: PropTypes.object,
};

function Block({label = 'RHFTextField', sx, children}) {
    return (<Stack spacing={1} sx={{width: 1, ...sx}}>
        <Typography
            variant="caption"
            sx={{
                textAlign: 'right', fontStyle: 'italic', color: 'text.disabled',
            }}
        >
            {label}
        </Typography>
        {children}
    </Stack>);
}


function AddressItem({address, onCreateBilling}) {
    // const {Cliente, Direccion, Celular, receiver, fullAddress, addressType, phoneNumber, isDefault} = address;
    const {Cliente, Direccion, Celular, ID, Tipo} = address;
    const receiver = Cliente;
    const tipo = Tipo;
    const id = ID;

    return (<Card onClick={onCreateBilling}
                  sx={{
                      p: 3, mb: 3,
                  }}
    >
        <Stack
            spacing={2}
            alignItems={{
                md: 'flex-end',
            }}
            direction={{
                xs: 'column', md: 'row',
            }}
        >
            <Stack flexGrow={1} spacing={1}>
                <Stack direction="row" alignItems="center">
                    <Typography variant="subtitle1">
                        {receiver}
                        {/* <Box component="span" sx={{ml: 0.5, typography: 'body2', color: 'text.secondary'}}> */}
                        {/*     ({addressType}) */}
                        {/* </Box> */}
                    </Typography>

                    {/* {isDefault && ( */}
                    {/*     <Label color="info" sx={{ml: 1}}> */}
                    {/*         Default */}
                    {/*     </Label> */}
                    {/* )} */}
                </Stack>

                <Typography variant="body2">{tipo}</Typography>

                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                    {id}
                </Typography>
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
    </Card>);
}


const mapContainerStyle = {
    width: '100%', height: '800px',
};

function MapComponent({markers}) {

    console.log("Markers: " + JSON.stringify(markers));

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState({lat: -1.8312, lng: -78.1834});
    const [zoom, setZoom] = useState(8);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script', googleMapsApiKey: 'AIzaSyARV9G0tkya9zgXXlVNmx8U5ep7mg8XdHI',
    });

    useEffect(() => {
        if (isLoaded && map) {
            let bounds = new window.google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend({lat: parseFloat(marker.U_LS_LATITUD), lng: parseFloat(marker.U_LS_LONGITUD)});
            });
            map.fitBounds(bounds);
        }
    }, [isLoaded, map, markers]);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleInfoWindowClose = () => {
        setSelectedMarker(null);
    };

    const onLoad = (map) => {
        setMap(map);
    };

    return isLoaded ? (<GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onZoomChanged={() => map && setZoom(map.getZoom())}
        onCenterChanged={() => map && setCenter(map.getCenter())}
    >
        {/* Renderizar marcadores */}
        {markers.map((marker, index) => (<Marker
            key={index}
            position={{lat: parseFloat(marker.U_LS_LATITUD), lng: parseFloat(marker.U_LS_LONGITUD)}}
            // icon={customMarkerIcon} // Usar icono personalizado
            onClick={() => handleMarkerClick(marker)}
        />))}

        {/* Mostrar información del marcador seleccionado */}
        {selectedMarker && (<InfoWindow
            position={{
                lat: parseFloat(selectedMarker.U_LS_LATITUD), lng: parseFloat(selectedMarker.U_LS_LONGITUD)
            }}
            onCloseClick={handleInfoWindowClose}
        >
            <div>
                <p>TIPO: {selectedMarker.TIPO}</p>
                <p>PROVINCIA: {selectedMarker.PROVINCIA}</p>
                <p>CANTON: {selectedMarker.CANTON}</p>
                <p>DIRECCION: {selectedMarker.DIRECCION}</p>
            </div>
        </InfoWindow>)}

    </GoogleMap>) : (<></>);
}


function CustomToolbar() {
    return (<GridToolbarContainer>
        <GridToolbarQuickFilter/>
        <Box sx={{flexGrow: 1}}/>

    </GridToolbarContainer>);
}

const GENDER_OPTION = [
    { label: 'Ruc/Cédula', value: '0' },
    { label: 'Razón Social', value: '1' },

];


