import { useState } from 'react';
// @mui
import {
    Box,
    Stack,
    List,
    Button,
    Avatar,
    Divider,
    Typography,
    ListItemText,
    ListSubheader,
    ListItemAvatar,
    ListItemButton,
    Container,
    Grid,
} from '@mui/material';
// utils
import { fToNow } from '../../utils/formatTime';
// _mock_
import { _notifications } from '../../_mock/arrays';
// components
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
// change-case
import { noCase } from 'change-case';
import DashboardLayout from "../../layouts/dashboard";
import { useSettingsContext } from "../../components/settings";

NotificationsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default function NotificationsPage() {
    const { themeStretch } = useSettingsContext();

    const [notifications, setNotifications] = useState(_notifications);

    const totalNoLeidas = notifications.filter((item) => item.isUnRead).length;

    const marcarTodasComoLeidas = () => {
        setNotifications(
            notifications.map((notification) => ({
                ...notification,
                isUnRead: false,
            }))
        );
    };

    return (
        <Container maxWidth={themeStretch ? false : 'xl'}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ mt: 5, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h4" sx={{ flexGrow: 1 }}>
                                Notificaciones
                            </Typography>

                            {totalNoLeidas > 0 && (
                                <Button variant="contained" color="primary" onClick={marcarTodasComoLeidas}>
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </Box>

                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Tienes {totalNoLeidas} mensajes sin leer
                        </Typography>

                        <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                        <Scrollbar sx={{ height: 500 }}>
                            <List
                                disablePadding
                                subheader={
                                    <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                                        Nuevas
                                    </ListSubheader>
                                }
                            >
                                {notifications.slice(0, 2).map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </List>

                            <List
                                disablePadding
                                subheader={
                                    <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                                        Anteriores
                                    </ListSubheader>
                                }
                            >
                                {notifications.slice(2, 5).map((notification) => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))}
                            </List>
                        </Scrollbar>

                        <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />

                        <Box sx={{ p: 1 }}>
                            <Button fullWidth disableRipple>
                                Ver todas
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

// ----------------------------------------------------------------------

function NotificationItem({ notification }) {
    const { avatar, title } = renderContent(notification);

    return (
        <ListItemButton
            sx={{
                py: 1.5,
                px: 2.5,
                mt: '1px',
                ...(notification.isUnRead && { bgcolor: 'action.selected' }),
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
            </ListItemAvatar>

            <ListItemText
                disableTypography
                primary={title}
                secondary={
                    <Stack direction="row" sx={{ mt: 0.5, typography: 'caption', color: 'text.disabled' }}>
                        <Iconify icon="eva:clock-fill" width={16} sx={{ mr: 0.5 }} />
                        <Typography variant="caption">{fToNow(notification.createdAt)}</Typography>
                    </Stack>
                }
            />
        </ListItemButton>
    );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
    const title = (
        <Typography variant="subtitle2">
            {notification.title}
            <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                &nbsp; {noCase(notification.description)}
            </Typography>
        </Typography>
    );

    if (notification.type === 'order_placed') {
        return {
            avatar: <img alt={notification.title} src="/assets/icons/notification/ic_package.svg" />,
            title,
        };
    }
    if (notification.type === 'order_shipped') {
        return {
            avatar: <img alt={notification.title} src="/assets/icons/notification/ic_shipping.svg" />,
            title,
        };
    }
    if (notification.type === 'mail') {
        return {
            avatar: <img alt={notification.title} src="/assets/icons/notification/ic_mail.svg" />,
            title,
        };
    }
    if (notification.type === 'chat_message') {
        return {
            avatar: <img alt={notification.title} src="/assets/icons/notification/ic_chat.svg" />,
            title,
        };
    }
    return {
        avatar: notification.avatar ? <img alt={notification.title} src={notification.avatar} /> : null,
        title,
    };
}
