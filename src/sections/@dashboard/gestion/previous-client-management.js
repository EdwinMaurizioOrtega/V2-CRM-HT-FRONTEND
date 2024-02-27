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

export default function PreviousClientManagement({userID, currentPartner, open, onClose}) {

    console.log("partner.ID " + currentPartner?.ID || '');

    const theme = useTheme();

    const [businessPartnersManagement, setBusinessPartnersManagement] = useState([]);
    const [visitByDayManagement, setVisitByDayManagement] = useState([]);
    const [trueCount, setTrueCount] = useState(0);
    const [falseCount, setFalseCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

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
            }
        };

        handleViewManagementRow();

    }, [currentPartner?.ID])

    //Visitas por dia del cliente
    useEffect(() => {
        const handleViewVisitasByDia = async () => {

            console.log("event: " + JSON.stringify(currentPartner.ID));

            if (currentPartner) {

                //Visitas por día de las últimas 4 semanas.
                try {
                    const response = await axios.post('/hanadb/api/customers/management/VisitByDay', {
                        ID_CLIENTE: currentPartner.ID,
                        USER_ID: Number(userID)
                    });

                    if (response.status === 200) {
                        console.log("Visitas Por Día: " + JSON.stringify(response.data));

                        const getVisitByDayTemplate = response.data.data.map((partner) => ({
                            fechaFormat: partner.FECHA_FORMAT,
                            nroGestiones: partner.NRO_GESTIONES
                        }));

                        const labels = getVisitByDayTemplate.map((item) => item.fechaFormat);
                        const data = getVisitByDayTemplate.map((item) => item.nroGestiones);

                        setVisitByDayManagement({
                            labels: labels,
                            data: data
                        });
                        console.log("Visitas Por Día: " + JSON.stringify(response.data.data));
                        //console.log("Template Visitas Por Día: " + JSON.stringify(visitByDayManagement));

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }


                } catch (error) {
                    console.error('Error fetching data:', error);
                }

            }
        };

        handleViewVisitasByDia();

    }, [currentPartner?.ID])

    //Agenda
    useEffect(() => {
        const handleViewAgenda = async () => {

            console.log("event: " + JSON.stringify(currentPartner.ID));

            if (currentPartner) {
                //Agenda (cerrada y abierta) por cliente
                try {
                    const response = await axios.get(`/hanadb/api/customers/agenda_by_cliente?ID_CLIENTE=${currentPartner.ID}`);

                    if (response.status === 200) {

                        console.log("Agenda JSON " + JSON.stringify(response.data));

                        let trueCounter = 0;
                        let falseCounter = 0;

                        response.data.events.forEach((partner) => {
                            if (partner.VISITO === true) {
                                trueCounter++;
                            } else {
                                falseCounter++;
                            }
                        });


                        setTrueCount(trueCounter);
                        setFalseCount(falseCounter);
                        setTotalCount(trueCounter + falseCounter);

                    } else {
                        // La solicitud POST no se realizó correctamente
                        console.error('Error en la solicitud POST:', response.status);
                    }

                } catch (error) {
                    console.error('Error fetching data:', error);
                }

            }
        };

        handleViewAgenda();

    }, [currentPartner?.ID])

    const totalGestiones = () => {
        if (businessPartnersManagement && businessPartnersManagement.length) {
            let count = 0;
            for (let i = 0; i < businessPartnersManagement.length; i++) {
                count++;
            }
            return count;
        } else {
            return 0;
        }
    };

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
                            title="Últimas 4 semanas."
                            subheader="Gestiones por día."
                            chart={{
                                labels: visitByDayManagement.labels,
                                series: [
                                    {
                                        name: 'Por día',
                                        type: 'column',
                                        fill: 'solid',
                                        data: visitByDayManagement.data,
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
                                    {
                                        label: 'Total Gestiones',
                                        value: totalGestiones()
                                    },
                                    {label: 'Total Agenda', value: totalCount},
                                    {label: 'Agenda Abierta', value: trueCount},
                                    {label: 'Agenda Cerrada', value: falseCount},
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
