import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
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
import {AnalyticsConversionRates} from "../general/analytics";
import {Grid} from "@mui/material";

// ----------------------------------------------------------------------

export default function CustomerUltimaVentaPorMarca({currentPartner, open, onClose}) {

    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'U_SYP_GRUPO',
            headerName: 'U_SYP_GRUPO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'Nombre_Grupo',
            headerName: 'Nombre_Grupo',
            flex: 1,
            minWidth: 150,
        },

        {
            field: 'Fecha',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 150,
        },

        {
            field: 'No_Documento_Ref',
            headerName: 'No_Documento_Ref',
            flex: 1,
            minWidth: 250,
        },

        {
            field: 'ItemCode',
            headerName: 'ItemCode',
            flex: 1,
            minWidth: 250,
        },

        {
            field: 'Tiempo_sin_vender',
            headerName: 'Tiempo_sin_vender',
            flex: 1,
            minWidth: 250,
        },

    ]

    const {user} = useAuthContext();

    const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);

    useEffect(() => {

        const fetchData = async () => {

            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/ultima-venta-por-marca?EMPRESA=${user?.EMPRESA}&CARD_CODE=${currentPartner.ID}&USER_NAME=${user.DISPLAYNAME}`);

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

    const ventasBySemanaUserWithId = businessPartnersInvoiced.map(item => {
        let dias = 0;

        if (item.Tiempo_sin_vender.includes("Hace")) {
            // Extraer número (ejemplo: "Hace -28 días")
            const match = item.Tiempo_sin_vender.match(/-?\d+/);
            dias = match ? Math.abs(parseInt(match[0], 10)) : 0;
        }

        return {
            label: item.Nombre_Grupo,
            value: dias,
        };
    });

    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {maxWidth: '100%'},
        }}
    >

        <DialogTitle>Última Venta Por Marca</DialogTitle>

        <DialogContent>
            <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                Cliente: {currentPartner.Cliente || ''}
            </Alert>

            {currentPartner ? (<>
                    <Stack spacing={2}>

                        <Grid item xs={12} md={6} lg={8}>
                            <AnalyticsConversionRates
                                title="Última venta por marca"
                                subheader="Tiempo en días desde la última venta"
                                chart={{
                                    series: ventasBySemanaUserWithId
                                }}
                            />
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

CustomerUltimaVentaPorMarca.propTypes = {
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