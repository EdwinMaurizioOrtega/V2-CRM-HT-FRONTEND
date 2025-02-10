// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card,
    Container,
    Grid,
    Modal,
    IconButton,
    InputAdornment,
    Stack,
    SvgIcon, TextareaAutosize,
    TextField,
    Typography, Dialog, DialogContent, Toolbar, AppBar, LinearProgress
} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import InvoiceNewEditForm from '../../../sections/@dashboard/invoice/form';
import React, {useState} from "react";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import {useAuthContext} from "../../../auth/useAuthContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ConfirmDialog from "../../../components/confirm-dialog";
import Iconify from "../../../components/iconify";


// ----------------------------------------------------------------------

SeriesPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function SeriesPage() {

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const [nroOrdenVenta, setNroOrdenVenta] = useState(''); //INIT TO EMPTY

    const [businessPartners, setBusinessPartners] = useState([]);

    const [selected, setSelected] = useState(null);

    const [openChangeProduct, setOpenChangeProduct] = useState(false);

    const [valueNew, setValueNew] = useState('');

    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [textArrayCount, setTextArrayCount] = useState(0);
    const [uniqueTextArrayCount, setUniqueTextArrayCount] = useState(0);
    const [loading, setLoading] = useState(true); // Estado para controlar el loading

    const FileCopySvgIcon = (props) => (
        <SvgIcon {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"></path>
        </SvgIcon>
    );

    const handleOpenChangeProduct = (row) => {
        setOpenChangeProduct(true);
        console.log(row);
        setSelected(row)
    };

    const handleCloseChangeProduct = () => {
        setOpenChangeProduct(false);
    };

    const handleTextChange = (event) => {
        const inputText = event.target.value;
        const textArray = inputText.split('\n').map((item) => item.trim());
        setTextArrayCount(textArray.length);
        setValueNew(event.target.value);
        //setText(textArray.join('\n'));
    };

    const baseColumns = [

        {
            field: 'id',
            hide: true,
        },
        {
            field: 'line_num',
            headerName: 'line_num',
            flex: 1,
            minWidth: 100,
        },
        {
            field: 'item_code',
            headerName: 'item_code',
            flex: 1,
            minWidth: 100,
        },
        {
            field: 'item_description',
            headerName: 'item_description',
            flex: 1,
            minWidth: 660,
        },
        {
            field: 'quantity',
            headerName: 'quantity',
            flex: 1,
            minWidth: 60,
        },
        {
            field: 'warehouse_code',
            headerName: 'warehouse_code',
            flex: 1,
            minWidth: 60,
        },
        {
            field: 'CARGAR SERIES',
            headerName: 'CARGAR SERIES',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => {

                return (

                    <Button
                        component="label"
                        startIcon={<CloudUploadIcon/>}
                        onClick={() => {
                            handleOpenChangeProduct(params);
                        }}

                    >
                        CARGAR SERIES

                    </Button>

                );
            },
        },
    ]

    const F_OrdenVenta = async (nroOrdenVenta) => {

        console.log('nroOrdenVenta: ' + nroOrdenVenta);
        setLoading(true); // Activa el loading

        try {
            const response = await axios.post(`/hanadb/api/orders/sap/get_orden_venta`, {
                empresa: user.EMPRESA,
                orden_venta: Number(nroOrdenVenta),
            });

            if (response.status === 200) {
                console.log(response);
                setBusinessPartners(response.data);

            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); // Desactiva el loading (tanto en éxito como en error)
        }


    }

    const handleChangeProduct = async () => {

        console.log("LineNum: ");
        console.log(selected.row.line_num);

        console.log("DocEntry: ")
        console.log(businessPartners.doc_entry)

        console.log("Lista IMEIS: ")
        console.log(valueNew)

        console.log("Empresa: ")
        console.log(user.EMPRESA)

        // Reemplazar los saltos de línea (\n) por una cadena vacía
        const sinSaltosDeLinea = valueNew.replace(/\n/g, '');
        // Convertir la cadena a un array de strings
        const listaDeStrings = sinSaltosDeLinea.split(',').map(String);
        console.log("ListaDeStrings: " + listaDeStrings);

        try {
            const response = await axios.post(`/hanadb/api/orders/sap/parchar_series_sap_orden_venta`, {
                empresa: user.EMPRESA,
                doc_entry: Number(businessPartners?.doc_entry),
                line_num: Number(selected.row.line_num),
                // Convertir cada número a string P@ssw0rd
                lista_series: listaDeStrings,
                whs_code: selected.row.warehouse_code,
                item_code: selected.row.item_code,
            });

            if (response.status === 200) {
                console.log(response);
                console.log("hola.......");
                alert(  JSON.stringify( response.data));
            } else {
                // La solicitud POST no se realizó correctamente
                console.error('Error en la solicitud POST:', response.status);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }


    }

    const handleClearClick = () => {
        setValueNew('');
        setTextArrayCount(0);
        setUniqueTextArrayCount(0);
        setButtonDisabled(false); // Asegúrate de habilitar el botón después de limpiar.
    };

    const handlePrintClick = () => {

        setButtonDisabled(true);

        const textArray = valueNew.split('\n').map((item) => item.trim()).filter(Boolean); // Eliminar líneas vacías

        setTextArrayCount(textArray.length);

        const uniqueTextArray = [...new Set(textArray)]; // Eliminar duplicados usando un Set

        var validIMEIs = uniqueTextArray.filter(function (imei) {
            return luhn_validate(imei);
        });

        setUniqueTextArrayCount(validIMEIs.length); // Contar solo los IMEIs válidos

        const validatedIMEIs = validIMEIs.join(',\n');

        setValueNew(validatedIMEIs);
        console.log(validatedIMEIs);
        // Puedes agregar aquí una lógica adicional después de imprimir en la consola, si es necesario

    };

    function luhn_validate(fullcode) {
        return luhn_checksum(fullcode) == 0
    }

    function luhn_checksum(code) {
        var len = code.length
        var parity = len % 2
        var sum = 0
        for (var i = len - 1; i >= 0; i--) {
            var d = parseInt(code.charAt(i))
            if (i % 2 == parity) {
                d *= 2
            }
            if (d > 9) {
                d -= 9
            }
            sum += d
        }
        return sum % 10
    }

    return (
        <>
            <Head>
                <title>Series SAP</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Módulo Series SAP"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'SAP',
                            href: PATH_DASHBOARD.invoice.series,
                        },
                        {
                            name: 'Series',
                        },
                    ]}
                />

                <h2>Series</h2>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>
                                <TextField type="text" className="form-control email"
                                           name="email" id="email2"
                                           placeholder="Orden de Venta" required
                                           onChange={e => {
                                               setNroOrdenVenta(e.currentTarget.value.toUpperCase());
                                           }}
                                />
                                <Button variant="contained" onClick={() => {
                                    F_OrdenVenta(nroOrdenVenta)
                                }}>
                                    BUSCAR
                                </Button>

                                <h4>ID SAP: {businessPartners?.doc_entry}</h4>
                                <h4>Nro. Orden de Venta: {businessPartners?.doc_num}</h4>
                                <DataGrid
                                    rows={
                                        businessPartners?.document_lines?.map((partner, index) => ({
                                            ...partner,
                                            id: partner.id || index + 1, // Usa el ID real si existe, de lo contrario, el índice
                                        })) || []
                                    }
                                    columns={baseColumns}
                                    rowHeight={100} // Define la altura de las filas
                                    pagination
                                    pageSize={10} // Número de filas por página
                                    slots={{
                                        toolbar: CustomToolbar,
                                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        loadingOverlay: LinearProgress, // Usa LinearProgress como indicador de carga

                                    }}
                                    loading={loading} // Activa el loading
                                />
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

                <Dialog
                    open={openChangeProduct}
                    onClose={handleCloseChangeProduct}
                    fullScreen
                    sx={{padding: '16px'}}
                >
                    <AppBar position="relative">
                        <Toolbar>
                            <IconButton color="inherit" edge="start" onClick={handleCloseChangeProduct}>
                                <Iconify icon="eva:close-fill"/>
                            </IconButton>
                            <IconButton color="inherit" onClick={handlePrintClick} disabled={buttonDisabled}>
                                <FileCopySvgIcon/>
                            </IconButton>
                            <Button autoFocus color="inherit" onClick={() => {
                                handleChangeProduct();
                            }}>
                                Subir
                            </Button>
                            <Button color="inherit" onClick={handleClearClick} style={{marginLeft: '10px'}}>
                                Limpiar
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <DialogContent
                        dividers={scroll === 'paper'}
                        sx={{padding: '16px'}}

                    >

                        <Box
                            sx={{
                                display: 'flex', // Alinea los elementos horizontalmente
                                alignItems: 'center', // Centra verticalmente los elementos
                            }}
                        >
                            <Typography variant="body1" sx={{ marginRight: '10px' }}>
                                Líneas ingresadas: {textArrayCount}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginRight: '10px',
                                    color: 'red',
                                    fontSize: '40px',
                                    fontWeight: 'bold',
                                }}
                            >
                                Válidos: {uniqueTextArrayCount}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginRight: '10px',
                                    color: 'green',
                                    fontSize: '40px',
                                    fontWeight: 'bold',
                                }}
                            >
                                === {selected?.row.quantity} se requieren.
                            </Typography>
                        </Box>

                        <TextField
                            rows={100}
                            fullWidth
                            multiline
                            label="Lista IMEIs SAP"
                            value={valueNew}
                            onChange={handleTextChange}
                            sx={{width: '100%'}} // Esto asegura que el TextField ocupe todo el ancho
                            disabled={buttonDisabled}

                        />

                    </DialogContent>
                </Dialog>
            </Container>
        </>
    );

}

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter/>
            <Box sx={{flexGrow: 1}}/>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}