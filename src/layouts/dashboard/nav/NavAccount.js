// next
import NextLink from 'next/link';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import Label from "../../../components/label";
import {ROLE, TIPO_PRECIO} from "../../../utils/constants";

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user } = useAuthContext();

  function tipoRol(id_rol) {
    const rolActual = ROLE.find(option => option.id == id_rol);
    return rolActual ? rolActual.title : "Sin Rol.";
  }

  return (
    <Link component={NextLink} href={PATH_DASHBOARD.user.account} underline="none" color="inherit">
      <StyledRoot>
        <CustomAvatar src={user?.PHOTOURL} alt={user?.DISPLAYNAME} name={user?.DISPLAYNAME} />

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.DISPLAYNAME}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {tipoRol(user?.ROLE)}
          </Typography>

          <Label color="info">
            {user?.COMPANY}
          </Label>

        </Box>
      </StyledRoot>
    </Link>
  );
}
