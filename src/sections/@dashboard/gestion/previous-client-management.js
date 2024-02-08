import * as Yup from 'yup';
import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import axios from "../../../utils/axios";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import EmptyContent from "../../../components/empty-content";
import {AnalyticsCurrentVisits, AnalyticsWebsiteVisits} from "../general/analytics";
import {Grid} from "@mui/material";
import {useTheme} from "@mui/material/styles";


// ----------------------------------------------------------------------

export default function PreviousClientManagement({currentPartner, open, onClose}) {

    console.log("partner.ID " + currentPartner?.ID || '');

    const theme = useTheme();


    const baseColumns = [
        {
            field: 'id',
            hide: true,
        },
        {
            field: 'COMENTARIO',
            headerName: 'COMENTARIO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'FECHA_CREACION',
            headerName: 'FECHA_CREACION',
            flex: 1,
            minWidth: 160,
        },

        {
            field: 'FECHA_VISITA',
            headerName: 'FECHA_VISITA',
            flex: 1,
            minWidth: 160,
        },

        {
            field: 'MOTIVO',
            headerName: 'MOTIVO',
            flex: 1,
            minWidth: 160,
        },
        {
            field: 'CLIENTE_ID',
            headerName: 'CLIENTE_ID',
            flex: 1,
            minWidth: 160,
        },

    ]

    const [businessPartnersManagement, setBusinessPartnersManagement] = useState([]);

    //Ver el registro de gestiones
    useEffect(() => {
        const handleViewManagementRow = async () => {

            console.log("event: " + JSON.stringify(currentPartner.ID));

            if (currentPartner) {

                try {
                    const response = await axios.post('/hanadb/api/customers/management/VisitList', {
                        ID_CLIENTE: currentPartner.ID,
                    });

                    if (response.status === 200) {
                        console.log("DATA: " + JSON.stringify(response.data));

                        const businessPartnersWithId = response.data.data.map((partner, index) => ({
                            ...partner,
                            id: index + 1, // Puedes ajustar la lógica según tus necesidades
                        }));

                        setBusinessPartnersManagement(businessPartnersWithId);
                        console.log("response.data.data: " + JSON.stringify(response.data.data));
                        console.log("businessPartnersWithId: " + JSON.stringify(businessPartnersWithId));

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                }
                ;

            }

        };

        handleViewManagementRow();

    }, [currentPartner?.ID])

    return (
        <Dialog
            fullWidth
            maxWidth={false}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {maxWidth: 1080},
            }}
        >

            <DialogTitle>Gestiones anteriores.</DialogTitle>

            <DialogContent>
                <Alert variant="outlined" severity="info" sx={{mb: 3}}>
                    Cliente: {currentPartner?.Cliente || ''}
                </Alert>

                <Grid container spacing={3}>

                    <Grid item xs={12} md={6} lg={8}>
                        <AnalyticsWebsiteVisits
                            title="Visitas Semanales"
                            subheader="(+43%) que la semana pasada."
                            chart={{
                                labels: [
                                    '01/01/2004',
                                    '02/01/2004',
                                    '03/01/2004',
                                    '04/01/2004',
                                    '05/01/2004',
                                    '06/01/2004',
                                    '07/01/2004',
                                ],
                                series: [
                                    {
                                        name: 'Team A',
                                        type: 'column',
                                        fill: 'solid',
                                        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                                    }
                                ],
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <AnalyticsCurrentVisits
                            title="Gestión inteligente de cliente"
                            chart={{
                                series: [
                                    {label: 'Total Gestiones', value: 5435},
                                    {label: 'Total Agenda', value: 1443},
                                    {label: 'Agenda Cerrada', value: 1443},
                                ],
                                colors: [
                                    theme.palette.primary.main,
                                    theme.palette.info.main,
                                    theme.palette.error.main,
                                    theme.palette.warning.main,
                                ],
                            }}
                        />
                    </Grid>
                </Grid>
                <DataGrid
                    rows={businessPartnersManagement}
                    columns={baseColumns}
                    pagination
                    slots={{
                        toolbar: CustomToolbar,
                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                    }}
                />


            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cerrar
                </Button>
            </DialogActions>

        </Dialog>
    );
}

PreviousClientManagement.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentUser: PropTypes.object,
};


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

// ----------------------------------------------------------------------
