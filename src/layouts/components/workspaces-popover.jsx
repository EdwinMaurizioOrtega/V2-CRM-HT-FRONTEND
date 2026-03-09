'use client';

import {useState, useCallback, useEffect} from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import {alpha} from '@mui/material/styles';

import Label from 'src/components/label';
import {useAuthContext} from "../../auth/useAuthContext";

// ----------------------------------------------------------------------

const WORKSPACE_COLORS = {
    '0992537442001': '#1565C0', // Azul - Samsung/Infinix (HT)
    '1792161037001': '#FF6F00', // Naranja - Xiaomi (MC)
    '0000000000000': '#D32F2F', // Rojo - Alerta
};

export function WorkspacesPopover({data = [], sx, ...other}) {

    const {user, updateUser} = useAuthContext();

    const [workspace, setWorkspace] = useState(data[0]);

    // Sincroniza el estado con el valor de EMPRESA del contexto
    useEffect(() => {
        if (user?.EMPRESA) {
            const ws = data.find(item => item.id === user?.EMPRESA);
            if (ws) {
                setWorkspace(ws);
            }
        }
    }, [user, data]);

    const handleChangeWorkspace = useCallback(
        (newValue) => {
            setWorkspace(newValue);
            updateUser({EMPRESA: newValue.id});
        },
        [updateUser]
    );

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
                ml: 1,
                ...sx,
            }}
            {...other}
        >
            {data.map((option) => {
                const isSelected = option.id === workspace?.id;
                const color = WORKSPACE_COLORS[option.id] || '#616161';

                return (
                    <Box
                        key={option.id}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                        }}
                    >
                    <ButtonBase
                        disableRipple
                        onClick={() => handleChangeWorkspace(option)}
                        sx={{
                            py: 0.5,
                            px: 1.5,
                            gap: 1,
                            borderRadius: 1.5,
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            ...(isSelected
                                ? {
                                    bgcolor: alpha(color, 0.12),
                                    border: `2px solid ${color}`,
                                    transform: 'scale(1.05)',
                                    boxShadow: `0 2px 8px ${alpha(color, 0.25)}`,
                                }
                                : {
                                    bgcolor: 'transparent',
                                    border: '2px solid transparent',
                                    opacity: 0.4,
                                    filter: 'grayscale(80%)',
                                    '&:hover': {
                                        opacity: 0.75,
                                        filter: 'grayscale(30%)',
                                        bgcolor: alpha(color, 0.06),
                                    },
                                }),
                        }}
                    >
                        <Avatar
                            alt={option.name}
                            src={option.logo}
                            sx={{
                                width: isSelected ? 28 : 22,
                                height: isSelected ? 28 : 22,
                                transition: 'all 0.3s ease',
                            }}
                        />

                        <Box
                            component="span"
                            sx={{
                                typography: 'subtitle2',
                                display: {xs: 'none', sm: 'inline-flex'},
                                color: isSelected ? color : 'text.disabled',
                                fontWeight: isSelected ? 700 : 500,
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {option.name}
                        </Box>

                        <Label
                            sx={{
                                height: 22,
                                cursor: 'inherit',
                                display: {xs: 'none', sm: 'inline-flex'},
                                bgcolor: isSelected ? color : alpha(color, 0.3),
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {option.plan}
                        </Label>
                    </ButtonBase>

                    {/* Manito animada debajo de la empresa seleccionada */}
                    {isSelected && (
                        <Box
                            sx={{
                                fontSize: '22px',
                                lineHeight: 1,
                                mt: -0.3,
                                animation: 'bounceHand 0.8s ease-in-out infinite',
                                '@keyframes bounceHand': {
                                    '0%, 100%': { transform: 'translateY(0)' },
                                    '50%': { transform: 'translateY(-8px)' },
                                },
                            }}
                        >
                            👆
                        </Box>
                    )}
                    </Box>
                );
            })}
        </Stack>
    );
}
