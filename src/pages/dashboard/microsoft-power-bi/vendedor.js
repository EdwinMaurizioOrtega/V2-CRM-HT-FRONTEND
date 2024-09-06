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
import {useAuthContext} from "../../../auth/useAuthContext";
import {useState} from "react";
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

    const {user} = useAuthContext();

    const [urlPowerBi, setUrlPowerBi] = useState("");

    //Victor Quintero
    if (user.ID === 32) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiYWVlYzk0N2ItNTYyOS00ZGZhLWExYzMtNDM5MGRjYzlhNTQxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //David Granda
    if (user.ID === 10) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiYTY5NmM5YjAtMzYwMS00MDRiLWFlOTctYjE3MTFkNTI3OTZlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Alexandra Nuñez
    if (user.ID === 37) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiZWQ0YzYyY2ItMWY0Zi00MGUwLWJhY2YtZDU2ZTVkNGM1NmE5IiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Michelle Calderon
    if (user.ID === 43) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiZmI0YzEwNzUtNThiNy00ZWMxLWIzYTItZmYzZjBiNDUyNjcwIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Michelle Calderon
    if (user.ID === 43) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiZmI0YzEwNzUtNThiNy00ZWMxLWIzYTItZmYzZjBiNDUyNjcwIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Alexandra Pinargote
    if (user.ID === 191) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiYzBjM2Y3YzMtYWJjOS00OTNhLWE4NzItOTVhMzdiMDE5MTZkIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Byron Asitimbay
    if (user.ID === 18) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiNzAyMmRjZTAtNWQxYy00MTZjLWE4ZTMtMzRkMDAxNjYwMzVkIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Estefania Aguilar
    if (user.ID === 51) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiYWYwZGI1MmQtZmUxMy00NzgzLWJjZDQtYzBkM2IzNDEzMTIxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Fatima Campos
    if (user.ID === 21) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiNWM3YmI0MjAtOWE0MC00NDZiLWI1ZmUtNjkwNjBiZWVjMDNmIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Jhoana Avila
    if (user.ID === 138) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiMDVkOWMwM2EtZjY4OS00NTZiLTgxZjgtNzRjMTAzMTE5NjFlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //José Mendoza
    if (user.ID === 42) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiMTE2NGQ0YmItMzA1MC00NmM1LWFmYWItODAzZDU0NTBkNWJiIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Juan Cabrera
    if (user.ID === 19) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiNTM1OGQzZDItODM2My00ZGNhLThiNjUtZmQ3MjA4NzZmM2M0IiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //Miguel Lozano
    if (user.ID === 52) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiOWFjYzk4OWUtMzdkNC00MzE4LWIzNDgtMDUzNDc4NWMxOTUxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //NATALI GARCIA
    if (user.ID === 132) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiMmM5NDFlNWUtN2EyNS00YmFiLTgzMDktMmQyZjI3Y2VkZmJlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //PATRICIO VELESACA
    if (user.ID === 44) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiZDlkMGQyZGEtM2VlYi00MGZhLTk0YTYtMzZlYjJkNDQ1NGVmIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    //ROBERT TINOCO
    if (user.ID === 45) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiMzkwOTBhMDgtMzYxOS00ZjM1LWIxZmUtOTJlZmZlOTc0MGJlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    // RONAL ARMAS
    if (user.ID === 187) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiMWU0Y2FhYzUtNDMyZC00ZDc5LWFhNzgtMmY1YzZlZDM0NDFiIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }

    // STEVEN VARGAS
    if (user.ID === 48) {
        setUrlPowerBi("https://app.powerbi.com/view?r=eyJrIjoiN2M2ZmRiNzEtYzYyOC00YThmLWI0MWYtYTg4NTEwMjQwNmEwIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9")
    }



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
            src={urlPowerBi}
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
