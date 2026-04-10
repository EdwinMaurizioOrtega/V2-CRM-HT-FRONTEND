// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {Container, Box, CircularProgress, Typography, Stack, Skeleton, Paper, Grid} from '@mui/material';
// routes
import {useEffect, useState} from "react";
import {PATH_DASHBOARD} from '../../../../routes/paths';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../../components/settings';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
// sections
import InvoiceDetails from '../../../../sections/@dashboard/invoice/details';
import {useDispatch, useSelector} from "../../../../redux/store";
import { getDetailOrder } from "../../../../redux/slices/order";
import {HOST_API_KEY} from "../../../../config-global";
import {useAuthContext} from "../../../../auth/useAuthContext";

// ----------------------------------------------------------------------

InvoiceDetailsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
    const {themeStretch} = useSettingsContext();

    const { user } = useAuthContext();

    const {
        query: {id},
    } = useRouter();

    const dispatch = useDispatch();

    //console.log(`Invoice: ${id}`);

    //const {currentInvoice, isLoading} = useSelector((state) => state.orders_status);
    const [currentInvoice, setCurrentInvoice] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    // useEffect(() => {
    //     if (id) {
    //         dispatch(getDetailOrder(id));
    //     }
    // }, [dispatch, id]);

    useEffect(() => {
        // Define an async function inside useEffect
        async function fetchData() {
            if (id) {
                setPageLoading(true);
                try {
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/order/detail?id=${id}&empresa=${user.EMPRESA}`);
                    const data = await response.json();
                    setCurrentInvoice(data.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setCurrentInvoice([]);
                } finally {
                    setPageLoading(false);
                }
            }
        }

        // Call the async function immediately
        fetchData();
    }, [id]);

    //console.log(currentInvoice);

    return (
        <>
            <Head>
                <title> Invoice: View | HT</title>
            </Head>

            <Container maxWidth={false}>
                <CustomBreadcrumbs
                    heading="Detalle Orden"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {
                            name: 'Invoices',
                            href: PATH_DASHBOARD.invoice.root,
                        },
                        {name: `INV-${currentInvoice.ID || ''}`},
                    ]}
                />

                {pageLoading ? (
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        {/* Header skeleton */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1, mb: 2 }} />
                                <Skeleton variant="text" width="60%" height={24} />
                                <Skeleton variant="text" width="40%" height={20} />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Skeleton variant="text" width="50%" height={28} sx={{ ml: 'auto' }} />
                                <Skeleton variant="text" width="35%" height={20} sx={{ ml: 'auto' }} />
                            </Grid>
                        </Grid>

                        {/* Info cards skeleton */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
                                <Skeleton variant="rectangular" width="80%" height={20} sx={{ borderRadius: 1, mb: 1 }} />
                                <Skeleton variant="text" width="50%" height={18} />
                                <Skeleton variant="text" width="65%" height={18} />
                                <Skeleton variant="text" width="55%" height={18} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Skeleton variant="text" width="30%" height={16} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="60%" height={18} />
                                <Skeleton variant="text" width="45%" height={18} />
                                <Skeleton variant="text" width="40%" height={18} />
                            </Grid>
                        </Grid>

                        {/* Table skeleton */}
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '8px 8px 0 0', mb: 0.5 }} />
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" width="100%" height={52} sx={{ mb: 0.5, opacity: 1 - i * 0.15 }} />
                        ))}

                        {/* Bottom loading indicator */}
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mt: 4, mb: 2 }}>
                            <CircularProgress size={20} thickness={4} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Cargando detalle del pedido...
                            </Typography>
                        </Stack>
                    </Paper>
                ) : (
                    <InvoiceDetails invoice={currentInvoice}/>
                )}
            </Container>
        </>
    );
}
