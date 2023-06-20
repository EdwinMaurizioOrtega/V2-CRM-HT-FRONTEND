// next
import NextLink from 'next/link';
// @mui
import { Stack, Typography, Link } from '@mui/material';
// layouts
import LoginLayout from '../../layouts/login';
// routes
import { PATH_AUTH } from '../../routes/paths';
//
import AuthWithSocial from './AuthWithSocial';
import AuthRegisterForm from './AuthRegisterForm';

// ----------------------------------------------------------------------

export default function Register() {
  return (
    <LoginLayout title="Administre el trabajo de manera más efectiva con Lidenar.">
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant="h4">Comience absolutamente fácil.</Typography>

        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2"> ¿Ya tienes una cuenta? </Typography>

          <Link component={NextLink} href={PATH_AUTH.login} variant="subtitle2">
              Iniciar sesión
          </Link>
        </Stack>
      </Stack>

      <AuthRegisterForm />

      <Typography
        component="div"
        sx={{ color: 'text.secondary', mt: 3, typography: 'caption', textAlign: 'center' }}
      >
        {'Al registrarme, acepto '}
        <Link underline="always" color="text.primary">
            Términos de servicio
        </Link>
        {' y '}
        <Link underline="always" color="text.primary">
            Política de privacidad
        </Link>
        .
      </Typography>

      <AuthWithSocial />
    </LoginLayout>
  );
}
