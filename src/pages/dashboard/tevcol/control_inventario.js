import { useEffect } from 'react';
// next
import Head from 'next/head';
// @mui
// auth
import AuthGuard from '../../../auth/AuthGuard';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
// sections
import ControlInventarioView from '../../../sections/@dashboard/tevcol/control_inventario';

// ----------------------------------------------------------------------

ControlInventarioPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function ControlInventarioPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Head>
        <title>Control de Inventario por Series | HT</title>
      </Head>

      <ControlInventarioView />
    </>
  );
}
