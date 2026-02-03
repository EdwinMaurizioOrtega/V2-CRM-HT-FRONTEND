import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciaBodegasView from '../../../sections/@dashboard/tevcol/GestionTransferenciaBodegas';

// ----------------------------------------------------------------------

GestionTransferenciaBodegasPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function GestionTransferenciaBodegasPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciaBodegasView />
    </>
  );
}
