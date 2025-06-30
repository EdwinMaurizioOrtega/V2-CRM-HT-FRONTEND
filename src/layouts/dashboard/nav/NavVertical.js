import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { Box, Stack, Drawer } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// config
import { NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
//
import navConfig from './config-navigation';
import NavDocs from './NavDocs';
import NavAccount from './NavAccount';
import NavToggleButton from './NavToggleButton';
//
import axios from "../../../utils/axios";


// ----------------------------------------------------------------------

NavVertical.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function NavVertical({ openNav, onCloseNav }) {
  const { pathname } = useRouter();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

    const [allItems, setAllItems] = useState([]);

    useEffect(() => {
        fetchDataInit();
    }, []); // El segundo argumento [] asegura que el efecto solo se ejecute una vez al montar el componente


    const fetchDataInit = async () => {

        try {

            const accessToken = localStorage.getItem('accessToken');

            const response = await axios.get('/hanadb/api/account/my-access', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const myAccessData = response.data.data;
            ////console.log("myAccessData: " + JSON.stringify(myAccessData));

            const navConfigFiltrado = myAccessData.map(
                permisosSubheader => {
                    const subheaderIndex = permisosSubheader.SUBHEADER;
                    const permisos = JSON.parse(permisosSubheader.PAGE); // Parsear el string JSON a un array
                    const section = navConfig[subheaderIndex];

                    if (section) {
                        return {
                            subheader: section.subheader,
                            items: section.items.filter((item, index) => permisos.includes(index)),
                        };
                    }

                    return null;

                }).filter(Boolean);

            ////console.log(navConfigFiltrado);

            setAllItems(navConfigFiltrado);

        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
        }}
      >
        <Logo />

        <NavAccount />
      </Stack>

      <NavSectionVertical data={allItems} />

      <Box sx={{ flexGrow: 1 }} />

      <NavDocs />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD },
      }}
    >
      <NavToggleButton />

      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              zIndex: 0,
              width: NAV.W_DASHBOARD,
              bgcolor: 'transparent',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV.W_DASHBOARD,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
