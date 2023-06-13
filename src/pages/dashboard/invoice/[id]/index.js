// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {Container} from '@mui/material';
// routes
import {useEffect, useState} from "react";
import {PATH_DASHBOARD} from '../../../../routes/paths';
// _mock_
import {_invoices} from '../../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../../components/settings';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
// sections
import InvoiceDetails from '../../../../sections/@dashboard/invoice/details';
import {getProduct} from "../../../../redux/slices/product";
import {useDispatch, useSelector} from "../../../../redux/store";
import {getDetailOrder} from "../../../../redux/slices/order";

// ----------------------------------------------------------------------

InvoiceDetailsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
    const {themeStretch} = useSettingsContext();

    const {
        query: {id},
    } = useRouter();

    const dispatch = useDispatch();

    console.log(`Invoice: ${id}`);

    const {currentInvoice, isLoading} = useSelector((state) => state.orders_status);

    useEffect(() => {
        if (id) {
            dispatch(getDetailOrder(id));
        }
    }, [dispatch, id]);

    return (
        <>
            <Head>
                <title> Invoice: View | Minimal UI</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Invoice Details"
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
