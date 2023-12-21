// next
import Head from 'next/head';
// @mui
import { alpha } from '@mui/material/styles';
import {Container, Typography, Box, Rating, Stack, Avatar, LinearProgress} from '@mui/material';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import { useSettingsContext } from '../../../components/settings';
import EmptyContent from "../../../components/empty-content";
import {useImperativeHandle, useMemo, useRef, useState} from "react";
import {
    DataGrid, GridActionsCellItem,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import DataGridCustom from "../../../sections/_examples/mui/data-grid/DataGridCustom";
import PropTypes from "prop-types";
import _mock from "../../../_mock";
import Label from "../../../components/label";
import Iconify from "../../../components/iconify";
import {fPercent} from "../../../utils/formatNumber";

// ----------------------------------------------------------------------

MayoristaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

const HIDE_COLUMNS = {
    id: false,
};

const baseColumns = [
    {
        field: 'id',
        headerName: 'Id',
        filterable: false,
    },
    // {
    //     field: 'name',
    //     headerName: 'Name',
    //     flex: 1,
    //     minWidth: 160,
    //     hideable: false,
    //     renderCell: (params) => (
    //         <Stack spacing={2} direction="row" alignItems="center" sx={{ minWidth: 0 }}>
    //             <Avatar alt={params.row.name} sx={{ width: 36, height: 36 }}>
    //                 {params.row.name.charAt(0).toUpperCase()}
    //             </Avatar>
    //             <Typography component="span" variant="body2" noWrap>
    //                 {params.row.name}
    //             </Typography>
    //         </Stack>
    //     ),
    // },
    // {
    //     field: 'email',
    //     headerName: 'Email',
    //     flex: 1,
    //     minWidth: 160,
    //     editable: true,
    //     renderCell: (params) => (
    //         <Link color="inherit" noWrap>
    //             {params.row.email}
    //         </Link>
    //     ),
    // },
    // {
    //     type: 'dateTime',
    //     field: 'lastLogin',
    //     headerName: 'Last login',
    //     align: 'right',
    //     headerAlign: 'right',
    //     width: 120,
    //     renderCell: (params) => (
    //         <Stack sx={{ textAlign: 'right' }}>
    //             <Box component="span">{fDate(params.row.lastLogin)}</Box>
    //             <Box component="span" sx={{ color: 'text.secondary', typography: 'caption' }}>
    //                 {fTime(params.row.lastLogin)}
    //             </Box>
    //         </Stack>
    //     ),
    // },
    {
        type: 'number',
        field: 'rating',
        headerName: 'Rating',
        width: 140,
        renderCell: (params) => (
            <Rating size="small" value={params.row.rating} precision={0.5} readOnly />
        ),
    },
    {
        type: 'singleSelect',
        field: 'status',
        headerName: 'Status',
        align: 'center',
        headerAlign: 'center',
        width: 100,
        editable: true,
        valueOptions: ['online', 'alway', 'busy'],
        renderCell: (params) => (
            <Label
                variant="soft"
                color={
                    (params.row.status === 'busy' && 'error') ||
                    (params.row.status === 'alway' && 'warning') ||
                    'success'
                }
                sx={{ mx: 'auto' }}
            >
                {params.row.status}
            </Label>
        ),
    },
    {
        type: 'boolean',
        field: 'isAdmin',
        align: 'center',
        headerAlign: 'center',
        width: 80,
        renderCell: (params) =>
            params.row.isAdmin ? (
                <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'primary.main' }} />
            ) : (
                '-'
            ),
    },
    {
        type: 'number',
        field: 'performance',
        headerName: 'Performance',
        align: 'center',
        headerAlign: 'center',
        width: 160,
        renderCell: (params) => (
            <Stack spacing={1} direction="row" alignItems="center" sx={{ px: 1, width: 1, height: 1 }}>
                <LinearProgress
                    value={params.row.performance}
                    variant="determinate"
                    color={
                        (params.row.performance < 30 && 'error') ||
                        (params.row.performance > 30 && params.row.performance < 70 && 'warning') ||
                        'primary'
                    }
                    sx={{ width: 1, height: 6 }}
                />
                <Typography variant="caption" sx={{ width: 80 }}>
                    {fPercent(params.row.performance)}
                </Typography>
            </Stack>
        ),
    },
    {
        type: 'actions',
        field: 'actions',
        headerName: 'Actions',
        align: 'right',
        headerAlign: 'right',
        width: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        getActions: (params) => [
            <GridActionsCellItem
                showInMenu
                icon={<Iconify icon="solar:eye-bold" />}
                label="View"
                onClick={() => console.info('VIEW', params.row.id)}
            />,
            <GridActionsCellItem
                showInMenu
                icon={<Iconify icon="solar:pen-bold" />}
                label="Edit"
                onClick={() => console.info('EDIT', params.row.id)}
            />,
            <GridActionsCellItem
                showInMenu
                icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                label="Delete"
                onClick={() => console.info('DELETE', params.row.id)}
                sx={{ color: 'error.main' }}
            />,
        ],
    },
];


const rows = [...Array(20)].map((_, index) => {
    const status =
        (index % 2 && 'online') || (index % 3 && 'alway') || (index % 4 && 'busy') || 'offline';

    return {
        id: _mock.id(index),
        status,
        email: _mock.email(index),
        // name: _mock.fullName(index),
        age: _mock.number.age(index),
        lastLogin: _mock.time(index),
        isAdmin: _mock.boolean(index),
        // lastName: _mock.lastName(index),
        rating: _mock.number.rating(index),
        // firstName: _mock.firstName(index),
        performance: _mock.number.percent(index),
    };
});


export default function MayoristaPage() {
    const { themeStretch } = useSettingsContext();


    const [selectedRows, setSelectedRows] = useState([]);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

    const columns = useMemo(
        () =>
            baseColumns.map((col) =>
                col.field === 'rating'
                    ? {
                        ...col,
                        filterOperators: ratingOnlyOperators,
                    }
                    : col
            ),
        []
    );

    const getTogglableColumns = () =>
        columns
            .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
            .map((column) => column.field);

    const selected = rows.filter((row) => selectedRows.includes(row.id)).map((_row) => _row.id);

    console.info('SELECTED ROWS', selected);

    return (
        <>
            <Head>
                <title> Mayorista Page | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Typography variant="h4"> Mayorista </Typography>

                <Box
                    sx={{
                        mt: 5,
                        width: 1,
                        height: 320,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                        border: (theme) => `dashed 1px ${theme.palette.divider}`,
                    }}
                />
            </Container>
            <DataGrid
                checkboxSelection
                disableRowSelectionOnClick
                rows={rows}
                columns={columns}
                onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectedRows(newSelectionModel);
                }}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                slots={{
                    toolbar: CustomToolbar,
                    noRowsOverlay: () => <EmptyContent title="No Data" />,
                    noResultsOverlay: () => <EmptyContent title="No results found" />,
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                    columnsPanel: {
                        getTogglableColumns,
                    },
                }}
            />
        </>
    );
}

DataGridCustom.propTypes = {
    data: PropTypes.array,
};

// ----------------------------------------------------------------------

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarQuickFilter />
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

// ----------------------------------------------------------------------

function RatingInputValue({ item, applyValue, focusElementRef }) {
    const ratingRef = useRef(null);

    useImperativeHandle(focusElementRef, () => ({
        focus: () => {
            ratingRef.current.querySelector(`input[value="${Number(item.value) || ''}"]`).focus();
        },
    }));

    const handleFilterChange = (event, newValue) => {
        applyValue({ ...item, value: newValue });
    };

    return (
        <Rating
            ref={ratingRef}
            precision={0.5}
            value={Number(item.value)}
            onChange={handleFilterChange}
            name="custom-rating-filter-operator"
            sx={{ ml: 2 }}
        />
    );
}

RatingInputValue.propTypes = {
    item: PropTypes.object,
    applyValue: PropTypes.func,
    focusElementRef: PropTypes.any,
};

const ratingOnlyOperators = [
    {
        label: 'Above',
        value: 'above',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.field || !filterItem.value || !filterItem.operator) {
                return null;
            }

            return (params) => Number(params.value) >= Number(filterItem.value);
        },
        InputComponent: RatingInputValue,
        InputComponentProps: { type: 'number' },
        getValueAsString: (value) => `${value} Stars`,
    },
];

