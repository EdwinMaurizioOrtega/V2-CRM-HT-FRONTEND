// next
import Head from 'next/head';
// @mui
import { alpha } from '@mui/material/styles';
import { Container, Typography, Box } from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';

// ----------------------------------------------------------------------

CFinalPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CFinalPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Head>
        <title> Consumidor Final Page | HT</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h4"> Consumidor Final </Typography>

        <Box
          sx={{
            mt: 5,
            width: 1,
            height: 320,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        />
      </Container>
    </>
  );
}
