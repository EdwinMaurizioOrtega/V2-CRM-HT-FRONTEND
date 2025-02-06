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
    Typography, Dialog, DialogContent, Toolbar, AppBar
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

    const [selected, setSelected] = useState(false);

    const [openChangeProduct, setOpenChangeProduct] = useState(false);

    const [valueNew, setValueNew] = useState('');

    const FileCopySvgIcon = (props) => (
        <SvgIcon {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 4C10.8954 4 10 4.89543 10 6H14C14 4.89543 13.1046 4 12 4ZM8.53513 4C9.22675 2.8044 10.5194 2 12 2C13.4806 2 14.7733 2.8044 15.4649 4H17C18.6569 4 20 5.34315 20 7V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V7C4 5.34315 5.34315 4 7 4H8.53513ZM8 6H7C6.44772 6 6 6.44772 6 7V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7C18 6.44772 17.5523 6 17 6H16C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6Z"
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

    const handleChange = (event) => {
        setValueNew(event.target.value);
        // console.log(`Nuevo precio unitario ${valueNew}`);
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
                        variant="contained"
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
                doc_entry: Number(nroOrdenVenta),
                line_num: Number(selected.row.line_num),
                // Convertir cada número a string P@ssw0rd
                lista_series: listaDeStrings,
                whs_code: selected.row.warehouse_code,
                item_code: selected.row.item_code,
            });

            if (response.status === 200) {
                console.log(response);
                console.log("hola.......");
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

    };

    const handlePrintClick = () => {

        const textArray = valueNew.split('\n').map((item) => item.trim()).filter(Boolean); // Eliminar líneas vacías

        const uniqueTextArray = [...new Set(textArray)]; // Eliminar duplicados usando un Set

        var validIMEIs = uniqueTextArray.filter(function (imei) {
            return luhn_validate(imei);
        });

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
                                    }}
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
                            <IconButton color="inherit" onClick={handlePrintClick}>
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

                        <TextField
                            rows={100}
                            fullWidth
                            multiline
                            label="Lista IMEIs SAP"
                            value={valueNew}
                            onChange={handleChange}
                            sx={{width: '100%'}} // Esto asegura que el TextField ocupe todo el ancho
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