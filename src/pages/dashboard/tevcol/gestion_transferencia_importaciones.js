import Head from 'next/head';
import AuthGuard from '../../../auth/AuthGuard';
import DashboardLayout from '../../../layouts/dashboard';
import GestionTransferenciaImportacionesView from '../../../sections/@dashboard/tevcol/GestionTransferenciaImportaciones';

// ----------------------------------------------------------------------

GestionTransferenciaImportacionesPage.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

// ----------------------------------------------------------------------

export default function GestionTransferenciaImportacionesPage() {
  return (
    <>
      <Head>
        <title>Gestión de Transferencias | HT</title>
      </Head>

      <GestionTransferenciaImportacionesView />
    </>
  );
}
