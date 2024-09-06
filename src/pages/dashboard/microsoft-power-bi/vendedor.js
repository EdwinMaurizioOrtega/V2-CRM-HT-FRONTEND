// next
import Head from 'next/head';
// @mui
import {Grid, Container, Typography, Box} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import {useAuthContext} from "../../../auth/useAuthContext";
import {useEffect, useState} from "react";

// ----------------------------------------------------------------------
GeneralAnalyticsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GeneralAnalyticsPage() {

    const {user} = useAuthContext();

    const [urlPowerBi, setUrlPowerBi] = useState("");

    useEffect(() => {
        let url = "";

        switch (user.ID) {
            case 32:
                url = "https://app.powerbi.com/view?r=eyJrIjoiYWVlYzk0N2ItNTYyOS00ZGZhLWExYzMtNDM5MGRjYzlhNTQxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 10:
                url = "https://app.powerbi.com/view?r=eyJrIjoiYTY5NmM5YjAtMzYwMS00MDRiLWFlOTctYjE3MTFkNTI3OTZlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 37:
                url = "https://app.powerbi.com/view?r=eyJrIjoiZWQ0YzYyY2ItMWY0Zi00MGUwLWJhY2YtZDU2ZTVkNGM1NmE5IiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 43:
                url = "https://app.powerbi.com/view?r=eyJrIjoiZmI0YzEwNzUtNThiNy00ZWMxLWIzYTItZmYzZjBiNDUyNjcwIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 191:
                url = "https://app.powerbi.com/view?r=eyJrIjoiYzBjM2Y3YzMtYWJjOS00OTNhLWE4NzItOTVhMzdiMDE5MTZkIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 18:
                url = "https://app.powerbi.com/view?r=eyJrIjoiNzAyMmRjZTAtNWQxYy00MTZjLWE4ZTMtMzRkMDAxNjYwMzVkIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 51:
                url = "https://app.powerbi.com/view?r=eyJrIjoiYWYwZGI1MmQtZmUxMy00NzgzLWJjZDQtYzBkM2IzNDEzMTIxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 21:
                url = "https://app.powerbi.com/view?r=eyJrIjoiNWM3YmI0MjAtOWE0MC00NDZiLWI1ZmUtNjkwNjBiZWVjMDNmIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 138:
                url = "https://app.powerbi.com/view?r=eyJrIjoiMDVkOWMwM2EtZjY4OS00NTZiLTgxZjgtNzRjMTAzMTE5NjFlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 42:
                url = "https://app.powerbi.com/view?r=eyJrIjoiMTE2NGQ0YmItMzA1MC00NmM1LWFmYWItODAzZDU0NTBkNWJiIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 19:
                url = "https://app.powerbi.com/view?r=eyJrIjoiNTM1OGQzZDItODM2My00ZGNhLThiNjUtZmQ3MjA4NzZmM2M0IiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 52:
                url = "https://app.powerbi.com/view?r=eyJrIjoiOWFjYzk4OWUtMzdkNC00MzE4LWIzNDgtMDUzNDc4NWMxOTUxIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 132:
                url = "https://app.powerbi.com/view?r=eyJrIjoiMmM5NDFlNWUtN2EyNS00YmFiLTgzMDktMmQyZjI3Y2VkZmJlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 44:
                url = "https://app.powerbi.com/view?r=eyJrIjoiZDlkMGQyZGEtM2VlYi00MGZhLTk0YTYtMzZlYjJkNDQ1NGVmIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 45:
                url = "https://app.powerbi.com/view?r=eyJrIjoiMzkwOTBhMDgtMzYxOS00ZjM1LWIxZmUtOTJlZmZlOTc0MGJlIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 187:
                url = "https://app.powerbi.com/view?r=eyJrIjoiMWU0Y2FhYzUtNDMyZC00ZDc5LWFhNzgtMmY1YzZlZDM0NDFiIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            case 48:
                url = "https://app.powerbi.com/view?r=eyJrIjoiN2M2ZmRiNzEtYzYyOC00YThmLWI0MWYtYTg4NTEwMjQwNmEwIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9";
                break;
            default:
                url = ""; // Default or fallback URL if needed
        }

        setUrlPowerBi(url);
    }, [user.ID]); // Dependency array ensures effect runs when user.ID changes

    const { themeStretch } = useSettingsContext();

  return (
    <>
      <Head>
        <title> Vendedor: Power BI</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'xl'}>

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
