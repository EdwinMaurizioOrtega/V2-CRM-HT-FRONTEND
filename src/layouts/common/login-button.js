import PropTypes from 'prop-types';

import Button from '@mui/material/Button';


import {PATH_MINIMAL_ON_STORE} from "../../routes/paths";

// ----------------------------------------------------------------------

export default function LoginButton({ sx }) {
  return (
    <Button color="inherit" href={PATH_MINIMAL_ON_STORE} variant="outlined" sx={{ mr: 1, ...sx }}>
      Login
    </Button>
  );
}

LoginButton.propTypes = {
  sx: PropTypes.object,
};
