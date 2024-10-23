import React from 'react';
// next
import Head from 'next/head';
// @mui
import {Grid, Container, Stack, Card} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {useSettingsContext} from "../../../components/settings";


// ----------------------------------------------------------------------

CustomerPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CustomerPage() {

    const {themeStretch} = useSettingsContext();

    return (
        <>
            <Head>
                <title> Recompensas | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>

                <CustomBreadcrumbs
                    heading="Programa HT Recompensas"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Recompensas',
                            href: PATH_DASHBOARD.customer.root,
                        },
                        {
                            name: 'Puntos',
                        },
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>
                                <h3>Próximamente</h3>
                            </Stack>


                        </Card>
                    </Grid>

                </Grid>

            </Container>
        </>
    );
}

// ----------------------------------------------------------------------