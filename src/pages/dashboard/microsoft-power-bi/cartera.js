// next
import Head from 'next/head';
// @mui
import { useTheme } from '@mui/material/styles';
import {Grid, Container, Typography, Box} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// _mock_
//import { _analyticPost, _analyticOrderTimeline, _analyticTraffic } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../../components/settings';
// sections
// import {
//   AnalyticsTasks,
//   AnalyticsNewsUpdate,
//   AnalyticsOrderTimeline,
//   AnalyticsCurrentVisits,
//   AnalyticsWebsiteVisits,
//   AnalyticsTrafficBySite,
//   AnalyticsWidgetSummary,
//   AnalyticsCurrentSubject,
//   AnalyticsConversionRates,
// } from '../../../sections/@dashboard/general/analytics';

// ----------------------------------------------------------------------

GeneralAnalyticsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GeneralAnalyticsPage() {
  const theme = useTheme();

  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Head>
        <title> Gerencia: Power BI</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>

        {/*<Typography variant="h4" sx={{ mb: 5 }}>*/}
        {/*  Gerencia*/}
        {/*</Typography>*/}

        <Box
            component="iframe"
            src="https://app.powerbi.com/view?r=eyJrIjoiZjlhZjIzMzUtZWVmNi00MmI0LWI4MTQtYjgxZmJlMjM0ZmNhIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9"
            sx={{
              width: '100%',
              height: '1000px',
              border: 'none',
            }}
        />











      </Container>
    </>
  );
}
