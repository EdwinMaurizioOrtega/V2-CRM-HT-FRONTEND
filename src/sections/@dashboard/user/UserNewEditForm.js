import PropTypes from 'prop-types';
import * as Yup from 'yup';
import {useCallback, useEffect, useMemo} from 'react';
// next
import {useRouter} from 'next/router';
// form
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
// @mui
import {LoadingButton} from '@mui/lab';
import {Box, Card, Grid, Stack, Switch, Typography, FormControlLabel} from '@mui/material';
// utils
import axios from "../../../utils/axios";
import {fData} from '../../../utils/formatNumber';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// assets
import {countries} from '../../../assets/data';
// components
import Label from '../../../components/label';
import {useSnackbar} from '../../../components/snackbar';
import FormProvider, {
    RHFSelect,
    RHFSwitch,
    RHFTextField,
    RHFUploadAvatar,
} from '../../../components/hook-form';

// ----------------------------------------------------------------------

UserNewEditForm.propTypes = {
    isEdit: PropTypes.bool,
    currentUser: PropTypes.object,
};

export default function UserNewEditForm({isEdit = false, currentUser}) {
    const {push} = useRouter();

    const {enqueueSnackbar} = useSnackbar();

    const NewUserSchema = Yup.object().shape({
        name: Yup.string().required('Se requiere el nombre'),
        email: Yup.string().required('Correo electronico es requerido').email('El correo electrónico debe ser una dirección de correo electrónico válida'),
        phoneNumber: Yup.string().required('Se requiere el número de teléfono'),
        address: Yup.string().required('La dirección es necesaria'),
        // country: Yup.string().required('Country is required'),
        // company: Yup.string().required('Company is required'),
        state: Yup.string().required('Se requiere el estado'),
        city: Yup.string().required('Ciudad es requerida'),
        role: Yup.string().required('Se requiere rol'),
        // avatarUrl: Yup.mixed().required('Avatar is required'),
    });

    const defaultValues = useMemo(
        () => ({
            id: currentUser?.ID,
            name: currentUser?.DISPLAYNAME || '',
            email: currentUser?.EMAIL || '',
            phoneNumber: currentUser?.PHONENUMBER || '',
            address: currentUser?.ADDRESS || '',
            country: currentUser?.COUNTRY || '',
            state: currentUser?.STATE || '',
            city: currentUser?.CITY || '',
            zipCode: currentUser?.ZIPCODE || '',
            avatarUrl: currentUser?.PHOTOURL || null,
            isVerified: currentUser?.ISVERIFIED || true,
            status: currentUser?.status,
            // company: currentUser?.COMPANY || '',
            role: currentUser?.ROLE || '',
            password: currentUser?.PASSWORD || '',
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentUser]
    );

    const methods = useForm({
        resolver: yupResolver(NewUserSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: {isSubmitting},
    } = methods;

    const values = watch();

    useEffect(() => {
        if (isEdit && currentUser) {
            reset(defaultValues);
        }
        if (!isEdit) {
            reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, currentUser]);

    const onSubmit = async (data) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            reset();
            enqueueSnackbar(!isEdit ? '¡Creado con éxito!' : 'Actualización exitosa!');
            push(PATH_DASHBOARD.user.list);
            console.log('DATA', data);

            if (!isEdit) {
                // Crear un cliente.
                const response = await axios.post('/hanadb/api/account/register', {
                    DISPLAYNAME: data.name,
                    EMAIL: data.email,
                    PASSWORD: data.password,
                    PHOTOURL: data.photourl || 'https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_default.jpg',
                    PHONENUMBER: data.phoneNumber,
                    COUNTRY: 'Ecuador',
                    ADDRESS: data.address,
                    STATE: null,
                    CITY: data.city,
                    ZIPCODE: data.zipCode,
                    ABOUT: data.about,
                    ROLE: data.role,
                    ISPUBLIC: data.ispublic || true

                });

                if (response.status === 200) {
                    // La solicitud PUT se realizó correctamente
                } else {
                    // La solicitud PUT no se realizó correctamente
                }

            } else {
                // Actualizar un cliente.
                const response = await axios.put('/hanadb/api/users/user', {
                    ID: data.id,
                    DISPLAYNAME: data.name,
                    EMAIL: data.email,
                    PASSWORD: data.password,
                    PHOTOURL: data.photourl || 'https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_default.jpg',
                    PHONENUMBER: data.phoneNumber,
                    COUNTRY: 'Ecuador',
                    ADDRESS: data.address,
                    STATE: null,
                    CITY: data.city,
                    ZIPCODE: data.zipCode,
                    ABOUT: data.about,
                    ROLE: data.role,
                    ISPUBLIC: data.ispublic || true

                });

                if (response.status === 200) {
                    // La solicitud PUT se realizó correctamente
                } else {
                    // La solicitud PUT no se realizó correctamente
                }

            }


        } catch (error) {
            console.error(error);
        }
    };

    const handleDrop = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];

            const newFile = Object.assign(file, {
                preview: URL.createObjectURL(file),
            });

            if (file) {
                setValue('avatarUrl', newFile, {shouldValidate: true});
            }
        },
        [setValue]
    );

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{pt: 10, pb: 5, px: 3}}>
                        {isEdit && (
                            <Label
                                color={values.status === 'active' ? 'success' : 'error'}
                                sx={{textTransform: 'uppercase', position: 'absolute', top: 24, right: 24}}
                            >
                                {values.status}
                            </Label>
                        )}

                        <Box sx={{mb: 5}}>
                            <RHFUploadAvatar
                                name="avatarUrl"
                                maxSize={3145728}
                                onDrop={handleDrop}
                                helperText={
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 2,
                                            mx: 'auto',
                                            display: 'block',
                                            textAlign: 'center',
                                            color: 'text.secondary',
                                        }}
                                    >
                                        Allowed *.jpeg, *.jpg, *.png, *.gif
                                        <br/> max size of {fData(3145728)}
                                    </Typography>
                                }
                            />
                        </Box>

                        {/* {isEdit && ( */}
                        {/*   <FormControlLabel */}
                        {/*     labelPlacement="start" */}
                        {/*     control={ */}
                        {/*       <Controller */}
                        {/*         name="status" */}
                        {/*         control={control} */}
                        {/*         render={({ field }) => ( */}
                        {/*           <Switch */}
                        {/*             {...field} */}
                        {/*             checked={field.value !== 'active'} */}
                        {/*             onChange={(event) => */}
                        {/*               field.onChange(event.target.checked ? 'banned' : 'active') */}
                        {/*             } */}
                        {/*           /> */}
                        {/*         )} */}
                        {/*       /> */}
                        {/*     } */}
                        {/*     label={ */}
                        {/*       <> */}
                        {/*         <Typography variant="subtitle2" sx={{ mb: 0.5 }}> */}
                        {/*           Banned */}
                        {/*         </Typography> */}
                        {/*         <Typography variant="body2" sx={{ color: 'text.secondary' }}> */}
                        {/*           Apply disable account */}
                        {/*         </Typography> */}
                        {/*       </> */}
                        {/*     } */}
                        {/*     sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }} */}
                        {/*   /> */}
                        {/* )} */}

                        {/* <RHFSwitch */}
                        {/*   name="isVerified" */}
                        {/*   labelPlacement="start" */}
                        {/*   label={ */}
                        {/*     <> */}
                        {/*       <Typography variant="subtitle2" sx={{ mb: 0.5 }}> */}
                        {/*         Email Verified */}
                        {/*       </Typography> */}
                        {/*       <Typography variant="body2" sx={{ color: 'text.secondary' }}> */}
                        {/*         Disabling this will automatically send the user a verification email */}
                        {/*       </Typography> */}
                        {/*     </> */}
                        {/*   } */}
                        {/*   sx={{ mx: 0, width: 1, justifyContent: 'space-between' }} */}
                        {/* /> */}
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{p: 3}}>
                        <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                sm: 'repeat(2, 1fr)',
                            }}
                        >
                            <RHFTextField name="name" label="Nombre completo"/>
                            <RHFTextField name="email" label="Dirección de correo electrónico"/>
                            <RHFTextField name="phoneNumber" label="Número de teléfono"/>

                            {/* <RHFSelect native name="country" label="Country" placeholder="Country"> */}
                            {/*   <option value="" /> */}
                            {/*   {countries.map((country) => ( */}
                            {/*     <option key={country.code} value={country.label}> */}
                            {/*       {country.label} */}
                            {/*     </option> */}
                            {/*   ))} */}
                            {/* </RHFSelect> */}

                            {/* <RHFTextField name="state" label="Estado/Región"/> */}
                            <RHFTextField name="city" label="Ciudad"/>
                            <RHFTextField name="address" label="Dirección"/>
                            {/* <RHFTextField name="zipCode" label="Zip/Code" /> */}
                            {/* <RHFTextField name="company" label="Company" /> */}
                            <RHFTextField name="role" label="Rol"/>
                            <RHFTextField name="password" label="Contraseña"/>
                        </Box>

                        <Stack alignItems="flex-end" sx={{mt: 3}}>
                            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                {!isEdit ? 'Crear usuario' : 'Guardar cambios'}
                            </LoadingButton>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </FormProvider>
    );
}
