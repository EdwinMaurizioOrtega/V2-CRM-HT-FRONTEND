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
import React, { useEffect, useState } from "react";
import axios from '../../../utils/axios';
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import FormProvider, {
    RHFEditor,
    RHFSelect,
    RHFUpload,
    RHFSwitch,
    RHFSlider,
    RHFCheckbox,
    RHFTextField,
    RHFRadioGroup,
    RHFMultiSelect,
    RHFAutocomplete,
    RHFMultiCheckbox,
} from '../../../components/hook-form';
import { HOST_API_KEY } from "../../../config-global";
import {useAuthContext} from "../../../auth/useAuthContext";


// ----------------------------------------------------------------------

export default function CustomerReasignarCliente({ currentPartner, open, onClose }) {

    //console.log("partner.ID " + currentPartner?.Cliente || '');

    const [dataEmpladosVenta, setDataEmpleadosVenta] = useState([]);

    const { user } = useAuthContext();

    const methods = useForm({
        //resolver: yupResolver(FormSchemaAAAAAA),
        //defaultValues,
    });

    const {
        watch, reset, control, setValue, handleSubmit, formState: { isSubmitting },
    } = methods;

    useEffect(() => {

        const fetchData = async () => {

            //Empleado ventas
            try {
                const response = await axios.get(`${HOST_API_KEY}/hanadb/api/customers/get_empleados_venta`);

                if (response.status === 200) {
                    //console.log("DATA: " + JSON.stringify(response.data.data));
                    // La solicitud PUT se realizó correctamente
                    setDataEmpleadosVenta(response.data.data);
                } else {
                    // La solicitud POST no se realizó correctamente
                    console.error('Error en la solicitud POST:', response.status);
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data) => {

        // console.log('DATA', data);
        // console.log('currentPartner', currentPartner);

        try {
            const response = await axios.put('/hanadb/api/customers/update_slp_code_customer_sap', {
                //Cedula del cliente
                CardCode: currentPartner.ID,
                //Nuevo vendedor
                SlpCode: Number(data.vendedor.CODE),
                EMPRESA: user?.EMPRESA,
            });
            //console.log('RESPONSE', response);
            if (response.status === 200) {
                //alert(response.data.data);
                onClose();
            } else {
                alert('No se pudo reasignar el cliente. Intente nuevamente.');
                console.error('Respuesta inesperada:', response);
            }
        } catch (error) {
            console.error('ERROR', error);
        }




    }

    return (<Dialog
        fullWidth
        maxWidth={false}
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: { maxWidth: 1080 },
        }}
    >

        <DialogTitle>Reasignar Cliente</DialogTitle>

        <DialogContent>
            <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
                Cliente: {currentPartner.Cliente || ''}
            </Alert>

            {currentPartner ? (<>
                <Stack spacing={2}>
                    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={12}>

                                <RHFAutocomplete
                                    name="vendedor"
                                    label="Vendedor"
                                    freeSolo
                                    options={dataEmpladosVenta}
                                    getOptionLabel={(option) => option.NOMBRE}
                                    ChipProps={{ size: 'small' }}
                                />
                                <Box mt={2} />
                                <LoadingButton
                                    fullWidth
                                    color="success"
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                >
                                    Reasignar a este Vendedor
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </FormProvider>
                </Stack>
            </>
            ) : (<Label color="error">Cliente no encontrado</Label>)}

        </DialogContent>

        <DialogActions>
            <Button variant="outlined" onClick={onClose}>
                Cerrar
            </Button>

        </DialogActions>

    </Dialog >);
}

CustomerReasignarCliente.propTypes = {
    open: PropTypes.bool, onClose: PropTypes.func, currentUser: PropTypes.object,
};

