'use client';

import {useState, useCallback, useEffect} from 'react';
import {usePopover} from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import {CustomPopover} from "../dashboard/header/custom-popover/custom-popover";
import {useAuthContext} from "../../auth/useAuthContext";

// ----------------------------------------------------------------------

export function WorkspacesPopover({data = [], sx, ...other}) {

    const {user, updateUser} = useAuthContext();

    const mediaQuery = 'sm';

    const {open, anchorEl, onClose, onOpen} = usePopover();

    const [workspace, setWorkspace] = useState(data[0]);

    // Sincroniza el estado con el valor de EMPRESA del contexto
    useEffect(() => {
        if (user?.EMPRESA) {
            const workspace = data.find(item => item.id === user?.EMPRESA);
            if (workspace) {
                //console.log(workspace);
                setWorkspace(workspace);
            } else {
                //console.log('No se encontró el workspace con ese id.');
            }

        }
    }, [user]);

    const handleChangeWorkspace = useCallback(
        (newValue) => {
            setWorkspace(newValue);
            onClose();

            // ----------------------------------------------------------------------

            //console.log(newValue);

            // Lógica para cambiar EMPRESA basado en la selección
            updateUser({EMPRESA: newValue.id});

        },
        [onClose]
    );

    const buttonBg = {
        height: 1,
        zIndex: -1,
        opacity: 0,
        content: "''",
        borderRadius: 1,
        position: 'absolute',
        visibility: 'hidden',
        bgcolor: 'action.hover',
        width: 'calc(100% + 8px)',
        transition: (theme) =>
            theme.transitions.create(['opacity', 'visibility'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
            }),
        ...(open && {
            opacity: 1,
            visibility: 'visible',
        }),
    };

    const renderButton = () => (
        <ButtonBase
            disableRipple
            onClick={onOpen}
            sx={[
                {
                    py: 0.5,
                    gap: {xs: 0.5, [mediaQuery]: 1},
                    '&::before': buttonBg,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Box
                component="img"
                alt={workspace?.name}
                src={workspace?.logo}
                sx={{width: 24, height: 24, borderRadius: '50%'}}
            />

            <Box
                component="span"
                sx={{
                    typography: 'subtitle2',
                    display: {xs: 'none', [mediaQuery]: 'inline-flex'},
                    color: 'black',
                }}
            >
                {workspace?.name}
            </Box>

            <Label
                color={workspace?.plan === 'Free' ? 'default' : 'info'}
                sx={{
                    height: 22,
                    cursor: 'inherit',
                    display: {xs: 'none', [mediaQuery]: 'inline-flex'},
                }}
            >
                {workspace?.plan}
            </Label>

            <Iconify width={16} icon="carbon:chevron-sort" sx={{color: 'text.disabled'}}/>
        </ButtonBase>
    );

    const renderMenuList = () => (
        <CustomPopover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            slotProps={{
                arrow: {placement: 'top-left'},
                paper: {sx: {mt: 0.5, ml: -1.55}},
            }}
        >
            <MenuList sx={{width: 240}}>
                {data.map((option) => (
                    <MenuItem
                        key={option.id}
                        selected={option.id === workspace?.id}
                        onClick={() => handleChangeWorkspace(option)}
                        sx={{height: 48}}
                    >
                        <Avatar alt={option.name} src={option.logo} sx={{width: 24, height: 24}}/>

                        <Box component="span" sx={{
                            flexGrow: 1, fontWeight: 'fontWeightMedium',
                            color: 'gray',
                        }}>
                            {option.name}
                        </Box>

                        <Label color={option.plan === 'Free' ? 'default' : 'info'}>{option.plan}</Label>
                    </MenuItem>
                ))}
            </MenuList>
        </CustomPopover>
    );

    return (
        <>
            {renderButton()}
            {renderMenuList()}
        </>
    );
}
