import CalendarView from "../../sections/calendar/view/calendar";
import DashboardLayout from "../../layouts/dashboard";
import CustomBreadcrumbs from "../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../routes/paths";
import Head from "next/head";
import {Container} from "@mui/material";
import {useSettingsContext} from "../../components/settings";


CalendarPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default function CalendarPage() {

    const {themeStretch} = useSettingsContext();

    return (
        <>

            <Head>
                <title> Calendar | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'xl'}>

                <CustomBreadcrumbs
                    heading="Calendar"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'Calendar',
                        },
                    ]}
                    // moreLink={['https://fullcalendar.io/docs/react']}
                    // action={
                    //   <Button
                    //     variant="contained"
                    //     startIcon={<Iconify icon="eva:plus-fill" />}
                    //     onClick={handleOpenModal}
                    //   >
                    //     New Event
                    //   </Button>
                    // }
                />


                <CalendarView/>
            </Container>
        </>

    );
}



