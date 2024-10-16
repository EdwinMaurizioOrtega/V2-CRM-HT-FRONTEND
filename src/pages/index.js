import Head from 'next/head';
import MainLayout from '../layouts/main';
import DemoCarouselsPage from "./components/extra/carousel";
import ScrollProgress from "../components/scroll-progress";

// ----------------------------------------------------------------------

HomePage.getLayout = (page) => <MainLayout> {page} </MainLayout>;

// ----------------------------------------------------------------------

export default function HomePage() {

    return (
        <>
            <Head>
                <title> CRM HT BUSINESS</title>
            </Head>
             <ScrollProgress />
            <DemoCarouselsPage/>
        </>
    );
}
