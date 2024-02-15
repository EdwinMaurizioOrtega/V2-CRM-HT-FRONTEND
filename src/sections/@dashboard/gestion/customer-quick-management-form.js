import * as Yup from 'yup';
import { useMemo } from 'react';
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

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import {DatePicker, DateTimePicker} from "@mui/x-date-pickers";
import {TextField} from "@mui/material";
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";


// ----------------------------------------------------------------------

const options_1 = [
  { id: '01', label: 'Agendar' },
  { id: '02', label: 'No le interesa'},
  { id: '03', label: 'Cierre definitivo'},
  { id: '04', label: 'No Contactado'},
  { id: '05', label: 'Cobranza'},
]

const options_2 = [
  { id: '01', label: 'Llamada telefónica' },
  { id: '02', label: 'Visita en Local'},
  { id: '03', label: 'Whatsapp'},
  { id: '04', label: 'Correo'},
  { id: '05', label: 'Otros'},
]

export default function CustomerQuickManagementForm({ currentPartner, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const {user} = useAuthContext();

  console.log("partner.ID "+ currentPartner?.ID || '');

  // const NewUserSchema = Yup.object().shape({
  //   name: Yup.string().required('Name is required'),
  //   email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  //   phoneNumber: Yup.string().required('Phone number is required'),
  //   address: Yup.string().required('Address is required'),
  //   country: Yup.string().required('Country is required'),
  //   company: Yup.string().required('Company is required'),
  //   state: Yup.string().required('State is required'),
  //   city: Yup.string().required('City is required'),
  //   role: Yup.string().required('Role is required'),
  // });

  const defaultValues = useMemo(
    () => ({
      ci: currentPartner?.ID || '',

    }),
    [currentPartner]
  );

  const methods = useForm({
    // resolver: yupResolver(NewUserSchema),
    //defaultValues,
  });

  const {
    reset,
      control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    //console.info('DATA: ', JSON.stringify(data));
    //console.info("CLIENTE_ID: "+ currentPartner.ID);
    //console.info("USER_ID: "+ user.ID);

    try {
      // Actualizar una orden.
      const response = await axios.post('/hanadb/api/customers/management/', {
        DATA: data,
        CLIENTE_ID: currentPartner.ID,
        USER_ID: user.ID,
      });

      console.log("Código de estado:", response.status);

      // Se completó con éxito (código de estado 200)
      if (response.status === 200) {
        console.log("Gestión creada.");
        reset();
        onClose();
        enqueueSnackbar('Guardado exitoso!');
      }

    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Registrar gestión</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Cliente: {currentPartner?.Cliente || ''}
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
            }}
          >
          {/*   <RHFSelect name="status" label="Status"> */}
          {/*     {USER_STATUS_OPTIONS.map((status) => ( */}
          {/*       <MenuItem key={status.value} value={status.value}> */}
          {/*         {status.label} */}
          {/*       </MenuItem> */}
          {/*     ))} */}
          {/*   </RHFSelect> */}

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

          {/*   <RHFTextField name="name" label="Full Name" /> */}
          {/*   <RHFTextField name="email" label="Email Address" /> */}
          {/*   <RHFTextField name="phoneNumber" label="Phone Number" /> */}

            <RHFAutocomplete
              name="dato"
              type="dato"
              label="Datos de la gestión."
              placeholder="Datos de la gestión."
              fullWidth
              options={options_1}
              getOptionLabel={(option) => option.label}
            />

          <RHFAutocomplete
              name="medio"
              type="medio"
              label="Medio de contacto."
              placeholder="Medio de contacto"
              fullWidth
              options={options_2}
              getOptionLabel={(option) => option.label}
          />

            <RHFTextField name="nota" label="Nota" />

            <Controller
                name="dateManagement"
                control={control}
                render={({ field, fieldState: { error } }) => (
                    <DateTimePicker
                        {...field}
                        label="Próxima gestión (Obligatorio)"
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => (
                            <TextField
                                fullWidth
                                {...params}
                                error={!!error}
                                helperText={error?.message}
                            />
                        )}
                    />
                )}
            />
          {/*   <RHFTextField name="city" label="City" /> */}
          {/*   <RHFTextField name="address" label="Address" /> */}
          {/*   <RHFTextField name="zipCode" label="Zip/Code" /> */}
          {/*   <RHFTextField name="company" label="Company" /> */}
          {/*   <RHFTextField name="role" label="Role" /> */}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Guardar
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

CustomerQuickManagementForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentUser: PropTypes.object,
};
