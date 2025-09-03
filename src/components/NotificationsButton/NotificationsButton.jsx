import { useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import {IconButtonAnimate} from "../animate";
import Iconify from "../iconify";
import {_notifications} from "../../_mock/arrays";
import {PATH_DASHBOARD} from "../../routes/paths";

export default function NotificationsButton() {
    const router = useRouter();
    const [notifications] = useState(_notifications);

    const totalUnRead = notifications.filter((item) => item.isUnRead).length;

    const handleGoToNotifications = () => {
        router.push(PATH_DASHBOARD.notifications_page,); // redirige a la página completa
    };

    return (
        <IconButtonAnimate
            color={totalUnRead > 0 ? 'primary' : 'default'}
            onClick={handleGoToNotifications}
            sx={{ width: 40, height: 40 }}
        >
            <Badge badgeContent={totalUnRead} color="error">
                <Iconify icon="eva:bell-fill" />
            </Badge>
        </IconButtonAnimate>
    );
}
