import {paramCase} from 'change-case';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {Container} from '@mui/material';
// routes
import {useEffect} from "react";
import {PATH_DASHBOARD} from '../../../../routes/paths';
// _mock_
import {_userList} from '../../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../../components/settings';
import CustomBreadcrumbs from '../../../../components/custom-breadcrumbs';
// sections
import UserNewEditForm from '../../../../sections/@dashboard/user/UserNewEditForm';
import {useDispatch, useSelector} from "../../../../redux/store";
import {getUsers} from "../../../../redux/slices/user";

// ----------------------------------------------------------------------

UserEditPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function UserEditPage() {
    const {themeStretch} = useSettingsContext();

    const dispatch = useDispatch();

    const {
        query: {name},
    } = useRouter();

    const currentUser = useSelector((state) =>
        state.user_hana.users.find((user) => user.ID == name)
    );

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    return (
        <>
            <Head>
                <title> Usuario: Editar usuario | Lidenar S.A.</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Editar usuario"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'User',
                            href: PATH_DASHBOARD.user.list,
                        },
                        {name: currentUser?.DISPLAYNAME},
                    ]}
                />

                <UserNewEditForm isEdit currentUser={currentUser} />
            </Container>
        </>
    );
}
