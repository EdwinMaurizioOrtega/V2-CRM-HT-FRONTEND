import React, {useState} from 'react';
import * as Yup from 'yup';
// next
import NextLink from 'next/link';
// form
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
// @mui
import {
    Link,
    Stack,
    Alert,
    IconButton,
    InputAdornment,
    TextField,
    Autocomplete,
    MenuItem,
    Divider
} from '@mui/material';
import {LoadingButton} from '@mui/lab';
// routes
import {PATH_AUTH} from '../../routes/paths';
// auth
import {useAuthContext} from '../../auth/useAuthContext';
// components
import Iconify from '../../components/iconify';
import FormProvider, {RHFSelect, RHFTextField} from '../../components/hook-form';
import {empresas} from "./Login";
import {Block} from "../_examples/Block";

// ----------------------------------------------------------------------

const EMPRESAS = [
    {id: '0992537442001', title: 'Hipertronics'},
    {id: '0992264373001', title: 'Alphacell'}
]

export default function AuthLoginForm() {
    const {login} = useAuthContext();

    const [showPassword, setShowPassword] = useState(false);

    const LoginSchema = Yup.object().shape({
        empresa: Yup.string().required('Se requiere una empresa'),
        email: Yup.string().required('Email is required').email('Email must be a valid email address'),
        password: Yup.string().required('Password is required'),
    });

    const defaultValues = {
        empresa: '',
        email: '',
        password: '',
    };

    const methods = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues,
    });

    const {
        reset,
        setError,
        handleSubmit,
        formState: {errors, isSubmitting, isSubmitSuccessful},
    } = methods;

    const onSubmit = async (data) => {
        try {

            var listaAccessOnlyInfinix = [
                "infinix@infinix.com",
                "ricardojose.86@hotmail.com",
                "bernardopanda@hotmail.com",
                "darwin79uquillas@gmail.com",
                "alexa_pi02@hotmail.es"
            ];


            // Verificar si data.email está en listaAccessOnlyInfinix
            if (listaAccessOnlyInfinix.includes(data.email)) {
                // Si está en la lista, usar el email el input
                await login('0992537442001', data.email, data.password);
            } else {
                // Si no está en la lista, proceder con el login normal
                await login(data.empresa, data.email, data.password);
            }

        } catch (error) {
            console.error(error);
            reset();
            setError('afterSubmit', {
                ...error,
                message: error.message || error,
            });
        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

                <RHFSelect name="empresa" label="Empresa">
                    <MenuItem value="">None</MenuItem>
                    <Divider sx={{borderStyle: 'dashed'}}/>
                    {EMPRESAS.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.title}
                        </MenuItem>
                    ))}
                </RHFSelect>

                <RHFTextField name="email" label="Email" autoComplete="off"/>

                <RHFTextField
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}/>
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>

            <Stack alignItems="flex-end" sx={{my: 2}}>
                <Link
                    component={NextLink}
                    href={PATH_AUTH.resetPassword}
                    variant="body2"
                    color="inherit"
                    underline="always"
                >
                    ¿Has olvidado tu contraseña?
                </Link>
            </Stack>

            <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitSuccessful || isSubmitting}
                sx={{
                    bgcolor: 'text.primary',
                    color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                    '&:hover': {
                        bgcolor: 'text.primary',
                        color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                    },
                }}
            >
                Acceder
            </LoadingButton>
        </FormProvider>
    );
}
