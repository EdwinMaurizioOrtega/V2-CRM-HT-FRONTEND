// next
import Head from 'next/head';
import NextLink from 'next/link';
// @mui
import { Button, Typography, Stack } from '@mui/material';
// layouts
import CompactLayout from '../layouts/compact';
// assets
import { MaintenanceIllustration } from '../assets/illustrations';

// ----------------------------------------------------------------------

MaintenancePage.getLayout = (page) => <CompactLayout>{page}</CompactLayout>;

// ----------------------------------------------------------------------

export default function MaintenancePage() {
  return (
    <>
      <Head>
        <title> Maintenance | HT</title>
      </Head>

        <Stack sx={{alignItems: 'center'}}>
            <Typography variant="h3" paragraph>
                Web App actualmente en mantenimiento
            </Typography>

            <Typography sx={{color: 'text.secondary'}}>
                ¡Estamos trabajando duro en esta página!
            </Typography>

            <MaintenanceIllustration sx={{my: 10, height: 240}}/>

            {/*<Button component={NextLink} href="/" size="large" variant="contained">*/}
            {/*    👨‍💻*/}
            {/*</Button>*/}
            <a style={{fontSize: '75px', textDecoration: 'none'}}>
                👨‍💻
            </a>
        </Stack>
    </>
  );
}
