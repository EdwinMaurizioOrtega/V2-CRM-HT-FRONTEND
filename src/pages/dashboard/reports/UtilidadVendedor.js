// layouts
import DashboardLayout from '../../../layouts/dashboard/DashboardLayout';
// sections
import UtilidadVendedorView from '../../../sections/@dashboard/reports/UtilidadVendedorView';




UtilidadVendedorPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UtilidadVendedorPage() {
    return <UtilidadVendedorView />;
}