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


// ----------------------------------------------------------------------

export default function PreviousClientManagement({currentPartner, open, onClose}) {

    console.log("partner.ID " + currentPartner?.ID || '');

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
                };

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
