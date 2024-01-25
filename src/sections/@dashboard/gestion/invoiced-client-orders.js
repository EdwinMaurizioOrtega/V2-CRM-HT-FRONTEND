import * as Yup from 'yup';
import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {Controller, useForm} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { USER_STATUS_OPTIONS } from 'src/_mock';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import {DatePicker} from "@mui/x-date-pickers";
import {Link, TextField} from "@mui/material";
import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter
} from "@mui/x-data-grid";
import EmptyContent from "../../../components/empty-content";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {useRouter} from "next/router";


// ----------------------------------------------------------------------

const options_1 = [
  { id: '01', label: 'Agendar' },
  { id: '02', label: 'No le interesa'},
  { id: '03', label: 'Cierre definitivo'},
  { id: '04', label: 'No Contactado'},
]

const options_2 = [
  { id: '01', label: 'Llamada telefonic' },
  { id: '02', label: 'Llamada telefonica'},
  { id: '03', label: 'Whatsapp'},
  { id: '04', label: 'Correo'},
  { id: '05', label: 'Otros'},
]

export default function InvoicedClientOrders({ currentPartner, open, onClose }) {

  console.log("partner.ID " + currentPartner?.ID || '');

  const {push} = useRouter();

  const handleViewRow = (id) => {
    // console.log("id_id"+ id);
    //push(PATH_DASHBOARD.invoice.view(id));
    window.open(PATH_DASHBOARD.invoice.view(id), '_blank');

  };

  const baseColumns = [
    {
      field: 'id',
      hide: true,
    },
    {
      field: 'ID',
      headerName: 'ORDEN',
      flex: 1,
      minWidth: 160,
      renderCell: (param) =>  <Link
          noWrap
          variant="body2"
          onClick={() => handleViewRow(param.row.ID)}
          sx={{color: 'text.disabled', cursor: 'pointer'}}
      >
        {`INV-${param.row.ID}`}
      </Link>
    },
    {
      field: 'FECHACREACION',
      headerName: 'FECHACREACION',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'ESTADO',
      headerName: 'ESTADO',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => params.row.ESTADO == "8" && "Anulado"
          || params.row.ESTADO == "6" && "Área de crédito"
          || params.row.ESTADO == "0" && "Área de facturación"
          || params.row.ESTADO == "1" && "Facturado"

    },
    {
      field: 'Cliente',
      headerName: 'CLIENTE',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'CLIENTEID',
      headerName: 'CLIENTEID',
      flex: 1,
      minWidth: 160,
    },

    {
      field: 'BODEGA',
      headerName: 'BODEGA',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => params.row.BODEGA == "002" && "MAYORISTA CUENCA"
          || params.row.BODEGA == "019" && "C. DISTRIBUCIÓN HT"
          || params.row.BODEGA == "006" && "MAYORISTA QUITO"
          || params.row.BODEGA == "015" && "MAYORISTA GUAYAQUIL"
          || params.row.BODEGA == "024" && "MAYORISTA MANTA"
    },
    {
      field: 'VENDEDOR',
      headerName: 'VENDEDOR',
      flex: 1,
      minWidth: 160,
    },

  ]

  const [businessPartnersInvoiced, setBusinessPartnersInvoiced] = useState([]);

  //Ver el registro de pedidos
  useEffect(() => {
    const handleViewManagementRow = async () => {
      if (currentPartner) {
        console.log("event: " + JSON.stringify(currentPartner.ID));

        try {
          const response = await axios.post('/hanadb/api/customers/management/OrdersList', {
            ID_CLIENTE: currentPartner.ID,
          });

          if (response.status === 200) {
            console.log("DATA: " + JSON.stringify(response.data));

            const businessPartnersWithId = response.data.data.map((partner, index) => ({
              ...partner,
              id: index + 1, // Puedes ajustar la lógica según tus necesidades
            }));

            setBusinessPartnersInvoiced(businessPartnersWithId);
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
            sx: {maxWidth: 1500},
          }}
      >

        <DialogTitle>Historico ordenes.</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{mb: 3}}>
            Cliente: {currentPartner?.Cliente || ''}
          </Alert>


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


        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>

      </Dialog>
  );
}

InvoicedClientOrders.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentUser: PropTypes.object,
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

// ----------------------------------------------------------------------