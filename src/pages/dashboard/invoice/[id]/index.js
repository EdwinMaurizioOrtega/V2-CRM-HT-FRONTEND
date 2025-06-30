// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {Container} from '@mui/material';
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

    // useEffect(() => {
    //     if (id) {
    //         dispatch(getDetailOrder(id));
    //     }
    // }, [dispatch, id]);

    useEffect(() => {
        // Define an async function inside useEffect
        async function fetchData() {
            if (id) {
                try {
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/orders/order/detail?id=${id}&empresa=${user.EMPRESA}`);
                    const data = await response.json();
                    setCurrentInvoice(data.data);
                    //console.log("currentInvoice: "+JSON.stringify(data.data));
                } catch (error) {
                    console.error('Error fetching data:', error);
                    setCurrentInvoice([]);
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
                        {name: `INV-${currentInvoice.ID}`},
                    ]}
                />

                <InvoiceDetails invoice={currentInvoice}/>
            </Container>
        </>
    );
}
