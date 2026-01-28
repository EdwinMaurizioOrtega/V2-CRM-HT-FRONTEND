import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciasView from '../../../sections/@dashboard/tevcol/GestionTransferencias';

// ----------------------------------------------------------------------

AceptarTransferenciaPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function AceptarTransferenciaPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciasView />
    </>
  );
}
