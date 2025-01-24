// next
import Head from 'next/head';
// @mui
import {Button, Card, Container, Grid, IconButton, Stack, SvgIcon, TextField} from '@mui/material';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import InvoiceNewEditForm from '../../../sections/@dashboard/invoice/form';
import React, {useState} from "react";

// ----------------------------------------------------------------------

SeriesPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function SeriesPage() {

    const {themeStretch} = useSettingsContext();

    const [nroOrdenVenta, setNroOrdenVenta] = useState(''); //INIT TO EMPTY

    const F_OrdenVenta = async (nroOrdenVenta) => {

        console.log('nroOrdenVenta: '+ nroOrdenVenta);

    }

    return (
        <>
            <Head>
                <title>Series SAP</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Módulo Series SAP"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'SAP',
                            href: PATH_DASHBOARD.invoice.series,
                        },
                        {
                            name: 'Series',
                        },
                    ]}
                />

                <h2>Series</h2>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3}}>
                            <Stack spacing={3}>

                                <TextField type="text" className="form-control email"
                                           name="email" id="email2"
                                           placeholder="IMEI/SERIE" required
                                           onChange={e => {
                                               setNroOrdenVenta(e.currentTarget.value.toUpperCase());
                                           }}
                                />
                                <Button variant="contained" onClick={() => {
                                    F_OrdenVenta(nroOrdenVenta)
                                }}>
                                    BUSCAR
                                </Button>



                            </Stack>
                        </Card>
                    </Grid>
                </Grid>



            </Container>
        </>
    );
}

