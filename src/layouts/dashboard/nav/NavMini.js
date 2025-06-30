// @mui
import { Stack, Box } from '@mui/material';
// config
import { NAV } from '../../../config-global';
// utils
import { hideScrollbarX } from '../../../utils/cssStyles';
// components
import Logo from '../../../components/logo';
import { NavSectionMini } from '../../../components/nav-section';
//
import navConfig from './config-navigation';
import NavToggleButton from './NavToggleButton';
import {useEffect, useState} from "react";
import axios from "../../../utils/axios";

// ----------------------------------------------------------------------

export default function NavMini() {

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
  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_DASHBOARD_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_DASHBOARD_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScrollbarX,
        }}
      >
        <Logo sx={{ mx: 'auto', my: 2 }} />

        <NavSectionMini data={allItems} />
      </Stack>
    </Box>
  );
}
