// next
import Head from 'next/head';
// @mui
import {alpha, styled} from '@mui/material/styles';
import {
    Container,
    Typography,
    Box,
    Rating,
    Stack,
    Avatar,
    LinearProgress,
    Card,
    TextField,
    Autocomplete, InputAdornment, IconButton, CardContent
} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import EmptyContent from "../../../components/empty-content";
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {
    DataGrid, GridActionsCellItem, GridToolbar,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import PropTypes from "prop-types";
import _mock from "../../../_mock";
import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import {fPercent} from "../../../utils/formatNumber";
import axios from "../../../utils/axios";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {useBoolean} from "../../../hooks/use-boolean";
import CustomerQuickManagementForm from "../../../sections/@dashboard/gestion/customer-quick-management-form";
import PreviousClientManagement from "../../../sections/@dashboard/gestion/previous-client-management";
import InvoicedClientOrders from "../../../sections/@dashboard/gestion/invoiced-client-orders";
import MapChangeTheme from "../../../sections/_examples/extra/map/change-theme";
import {MAP_API} from "../../../config-global";
import MapMarkersPopups from "../../../sections/_examples/extra/map/MapMarkersPopups";
import { countries as COUNTRIES } from 'src/_mock/map/countries';


// ----------------------------------------------------------------------

TrackingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const THEMES = {
    streets: 'mapbox://styles/mapbox/streets-v11',
    outdoors: 'mapbox://styles/mapbox/outdoors-v11',
    light: 'mapbox://styles/mapbox/light-v10',
    dark: 'mapbox://styles/mapbox/dark-v10',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v11',
};

const baseSettings = {
    mapboxAccessToken: MAP_API,
    minZoom: 1,
};


const StyledMapContainer = styled('div')(({theme}) => ({
    zIndex: 0,
    height: 560,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '& .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right': {
        display: 'none',
    },
}));

export default function TrackingPage(callback, deps) {
    const {themeStretch} = useSettingsContext();


    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Tracking Usuario"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'User',
                            href: PATH_DASHBOARD.user.tracking,
                        },
                        {
                            name: 'Tracking',
                        },
                    ]}
                />


                <Card>
                    <CardContent>
                        <StyledMapContainer>
                            <MapMarkersPopups {...baseSettings} data={COUNTRIES} />
                        </StyledMapContainer>
                    </CardContent>
                </Card>


            </Container>

        </>
    );
}

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter/>
            <Box sx={{flexGrow: 1}}/>
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarExport/>
        </GridToolbarContainer>
    );
}

// ----------------------------------------------------------------------



