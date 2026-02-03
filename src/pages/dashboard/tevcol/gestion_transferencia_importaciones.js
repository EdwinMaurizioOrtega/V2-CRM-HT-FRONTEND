import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciasView from '../../../sections/@dashboard/tevcol/GestionTransferencias';

// ----------------------------------------------------------------------

CargarSeriesTransferenciaPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function CargarSeriesTransferenciaPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciasView />
    </>
  );
}
