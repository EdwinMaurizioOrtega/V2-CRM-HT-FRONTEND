import { useEffect } from 'react';
// next
import Head from 'next/head';
// auth
import AuthGuard from '../../../auth/AuthGuard';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
// sections
import ReporteGeneralOrdenesView from '../../../sections/@dashboard/reports/ReporteGeneralOrdenesView';

// ----------------------------------------------------------------------

ReporteGeneralOrdenesPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function ReporteGeneralOrdenesPage() {
  const { themeStretch } = useSettingsContext();

  return (
    <>
      <Head>
        <title>Reporte General de Órdenes | HT</title>
      </Head>

      <ReporteGeneralOrdenesView />
    </>
  );
}
