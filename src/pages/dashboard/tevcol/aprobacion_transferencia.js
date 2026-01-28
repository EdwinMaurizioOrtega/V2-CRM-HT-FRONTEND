import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciasView from '../../../sections/@dashboard/tevcol/GestionTransferencias';

// ----------------------------------------------------------------------

AprobacionTransferenciaPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function AprobacionTransferenciaPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciasView />
    </>
  );
}
