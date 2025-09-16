import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Label from "../../../components/label";
import React, {useEffect, useState} from "react";
import axios from '../../../utils/axios';
import {HOST_API_KEY} from "../../../config-global";
import {useAuthContext} from "../../../auth/useAuthContext";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";

import EmptyContent from "../../../components/empty-content";
import {EcommerceYearlySales} from '../../../sections/@dashboard/general/e-commerce';
import {differenceInDays} from "date-fns";
import {Card, CardContent, Typography} from "@mui/material";

// ----------------------------------------------------------------------

export default function CustomerPagosEfectuados({currentPartner, open, onClose}) {


    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'NO_PAGO',
            headerName: 'NO_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CONTAB_PAGO',
            headerName: 'FECHA_CONTAB_PAGO',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'TOTAL_PAGO',
            headerName: 'TOTAL_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'DOC_TYPE',
            headerName: 'DOC_TYPE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CANCELED',
            headerName: 'CANCELED',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CARD_CODE',
            headerName: 'CARD_CODE',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CARD_NAME',
            headerName: 'CARD_NAME',
            flex: 1,
            minWidth: 300,
        },
        {
            field: 'FACTURA',
            headerName: 'FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'EMISION',
            headerName: 'EMISION',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'NO_FACTURA',
            headerName: 'NO_FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CONTAB_FACT',
            headerName: 'FECHA_CONTAB_FACT',
            flex: 1,
            minWidth: 250,
        },
        {
            field: 'TOTAL_FACTURA',
            headerName: 'TOTAL_FACTURA',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CONDICIONES_PAGO',
            headerName: 'CONDICIONES_PAGO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'VENDEDOR_FACTURADOR',
            headerName: 'VENDEDOR_FACTURADOR',
            flex: 1,
            minWidth: 300,
        },

        {
            field: 'TIPO',
            headerName: 'TIPO_VENDEDOR',
            flex: 1,
            minWidth: 160,
        },


    ]

    const {user} = useAuthContext();

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/pagos_efectuados_by_cliente?EMPRESA=${user?.EMPRESA}&CARD_CODE=${currentPartner.ID}`);

                if (response.status === 200) {
                    console.log("DATA: " + JSON.stringify(response.data));

                    const businessPartnersWithId = response.data.data.map((partner, index) => ({
                        ...partner,
                        id: index + 1, // Puedes ajustar la lógica según tus necesidades
                    }));

                    setBusinessPartnersInvoiced(businessPartnersWithId);

                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [currentPartner.ID]);

    // Sacar las categorías (fechas) y los valores (pagos)
    const categories = businessPartnersInvoiced.map(item =>
        new Date(item.FECHA_CONTAB_PAGO).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    );

    // Sacar los valores numéricos
    const facturado = businessPartnersInvoiced.map(item => parseFloat(item.TOTAL_FACTURA));
    const pagos = businessPartnersInvoiced.map(item => parseFloat(item.TOTAL_PAGO));
    const pendiente = facturado.map((f, i) => f - pagos[i]);

    // Total facturado
    const totalFacturado = facturado.reduce((acc, val) => acc + val, 0);

    // Total pagado
    const totalPagado = pagos.reduce((acc, val) => acc + val, 0);

    // Saldo pendiente total
    const saldoPendiente = pendiente.reduce((acc, val) => acc + val, 0);

    // Número de facturas pendientes
    const facturasPendientes = pendiente.filter((p) => p > 0).length;

    // Promedio de días en pagar
    const diasPago = businessPartnersInvoiced.map(item =>
        differenceInDays(new Date(item.FECHA_CONTAB_PAGO), new Date(item.FECHA_CONTAB_FACT))
    );

    const promedioDiasPago = diasPago.length > 0 ? (diasPago.reduce((a, b) => a + b, 0) / diasPago.length).toFixed(1) : 0;


    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {maxWidth: '100%'},
        }}
    >

        <DialogTitle>Pagos Efectuados</DialogTitle>

        <DialogContent>
            <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                Cliente: {currentPartner.Cliente || ''}
            </Alert>

            {currentPartner ? (<>
                    <Stack spacing={2}>
                        <Grid item xs={12} md={6} lg={8}>

                            <Grid size={{xs: 12, md: 6, lg: 8}}>


                                <Stack spacing={3}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={2.4}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">Total Facturado</Typography>
                                                    <Typography variant="h6">${totalFacturado.toFixed(2)}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2.4}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">Total Pagado</Typography>
                                                    <Typography variant="h6">${totalPagado.toFixed(2)}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2.4}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">Saldo Pendiente</Typography>
                                                    <Typography variant="h6">${saldoPendiente.toFixed(2)}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2.4}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">Facturas Pendientes</Typography>
                                                    <Typography variant="h6">{facturasPendientes}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={2.4}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle2">Promedio Días en Pagar</Typography>
                                                    <Typography variant="h6">{promedioDiasPago}</Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>


                                    <EcommerceYearlySales
                                        title="Evolución de lo Facturado en el tiempo"
                                        // subheader="(+43%) than last year"
                                        chart={{
                                            categories,
                                            series: [
                                                {
                                                    name: '2025',
                                                    data: [
                                                        {
                                                            name: 'Pagos',
                                                            data: pagos
                                                        },
                                                        {
                                                            name: 'Facturado',
                                                            data: facturado,
                                                        },
                                                    ],
                                                },
                                            ],
                                        }}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>


                        <DataGrid
                            rows={businessPartnersInvoiced}
                            columns={baseColumns}
                            pagination
                            slots={{
                                toolbar: CustomToolbar,
                                noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                noResultsOverlay: () => <EmptyContent title="No results found"/>,
                            }}
                        />
                    </Stack>
                </>
            ) : (<Label color="error">Cliente no encontrado</Label>)}

        </DialogContent>

        <DialogActions>
            <Button variant="outlined" onClick={onClose}>
                Cerrar
            </Button>

        </DialogActions>

    </Dialog>);
}

CustomerPagosEfectuados.propTypes = {
    open: PropTypes.bool, onClose: PropTypes.func, currentUser: PropTypes.object,
};

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