// next
import Head from 'next/head';
// @mui
import {useTheme} from '@mui/material/styles';
import {Container, Box} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import {useAuthContext} from "../../../auth/useAuthContext";
import {useEffect, useState} from "react";

// ----------------------------------------------------------------------

GeneralAnalyticsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function GeneralAnalyticsPage() {

    const {user} = useAuthContext();

    const [urlEmpresa, setUrlEmpresa] = useState('');

    useEffect(() => {

        //Lidenar
        if (user.EMPRESA === '0992537442001') {
            setUrlEmpresa('https://app.powerbi.com/view?r=eyJrIjoiYzdjZTliNTMtYjViMi00YzczLWFkMDgtYjQ0ZTE2ZTNiMTJjIiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9')
        } else {
            // MovilCelistic
            setUrlEmpresa('https://app.powerbi.com/view?r=eyJrIjoiMTgwODFlMjUtMzdkOC00YTU4LTlhZTMtYTdkYTMwODk2NWM5IiwidCI6Ijk2ZTEzNWRiLWZmZDItNDdiZS1iZDJlLWYxMjQ2MTY2YWZmZCIsImMiOjR9')
        }

    }, [user]);

    const {themeStretch} = useSettingsContext();

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
                    src={urlEmpresa}
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
