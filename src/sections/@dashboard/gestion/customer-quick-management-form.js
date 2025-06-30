import PropTypes from 'prop-types';
import {Controller, useForm} from 'react-hook-form';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import {DateTimePicker} from "@mui/x-date-pickers";
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

  //console.log("Cliente a gestionar: "+ currentPartner?.ID || '');

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

    try {
      // Actualizar una orden.
      const response = await axios.post('/hanadb/api/customers/management/', {
        DATA: data,
        CLIENTE_ID: currentPartner.ID,
        USER_ID: user.ID,
      });

      //console.log("Código de estado:", response.status);

      // Se completó con éxito (código de estado 200)
      if (response.status === 200) {
        //console.log("Gestión creada.");
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
        <DialogTitle>Opciones gestión</DialogTitle>

        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Cliente: {currentPartner?.Cliente || currentPartner?.ID || ''}
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
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFAutocomplete
              name="dato"
              type="dato"
              label="Opciones gestión."
              placeholder="Opciones gestión."
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
