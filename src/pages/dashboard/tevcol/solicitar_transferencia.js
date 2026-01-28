import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciasView from '../../../sections/@dashboard/tevcol/GestionTransferencias';

// ----------------------------------------------------------------------

SolicitarTransferenciaPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function SolicitarTransferenciaPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciasView />
    </>
  );
}
