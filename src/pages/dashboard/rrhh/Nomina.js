import React, { useCallback, useEffect, useMemo, useState } from 'react';
// next
import Head from 'next/head';
// @mui
import {
    Box,
    Button,
    Card,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';

// ----------------------------------------------------------------------
import { useSettingsContext } from "../../../components/settings";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarFilterButton
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import { useAuthContext } from "../../../auth/useAuthContext";

// ----------------------------------------------------------------------

const ubicacionConfig = {
    ninguno: { id: 0, nombre: 'NINGUNO' },
    kleberGranda: { id: 1, nombre: 'KLEBER GRANDA' },
    ambatoCentro: { id: 2, nombre: 'AMBATO CENTRO' },
    cci: { id: 3, nombre: 'CCI' },
    mallDeLosAndes: { id: 4, nombre: 'MALL DE LOS ANDES' },
    malteria: { id: 5, nombre: 'MALTERIA' },
    paseoShopping: { id: 6, nombre: 'PASEO SHOPPING' },
    quicentroSur: { id: 7, nombre: 'QUICENTRO SUR' },
    recreo: { id: 8, nombre: 'RECREO' },
    sanLuis: { id: 9, nombre: 'SAN LUIS' },
    administrador: { id: 10, nombre: 'ADMINISTRADOR' },
    matriz: { id: 11, nombre: 'MATRIZ' },
};

const companyOptions = ['MC', 'HT', 'NU'];

const ubicacionesById = Object.values(ubicacionConfig).reduce((acc, item) => {
    acc[item.id] = item.nombre;
    return acc;
}, {});

const sucursalLabelFromValue = (sucursalValue) => {
    if (sucursalValue === null || sucursalValue === undefined || sucursalValue === '') {
        return '';
    }

    const asNumber = Number(sucursalValue);
    if (!Number.isNaN(asNumber) && ubicacionesById[asNumber]) {
        return `[${asNumber}] ${ubicacionesById[asNumber]}`;
    }

    const asString = String(sucursalValue).toLowerCase().trim();
    const byKey = ubicacionConfig[asString];
    if (byKey) {
        return `[${byKey.id}] ${byKey.nombre}`;
    }

    return String(sucursalValue);
};

NominaPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function NominaPage() {
    const { themeStretch } = useSettingsContext();

    const { user } = useAuthContext();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [filterText, setFilterText] = useState('');
    const [filterCompany, setFilterCompany] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [filterSucursal, setFilterSucursal] = useState('all');

    const [formValues, setFormValues] = useState({
        DISPLAYNAME: '',
        EMAIL: '',
        PASSWORD: '',
        PHOTOURL: '',
        PHONENUMBER: '',
        COUNTRY: '',
        ADDRESS: '',
        STATE: '',
        CITY: '',
        ZIPCODE: '',
        ABOUT: '',
        ROLE: '0',
        ISPUBLIC: true,
        WAREHOUSE: '0',
        COMPANY: '',
        CARD_CODE: '',
        OSLP_CODE: 0,
        SUCURSAL: 0,
    });

    const resetForm = () => {
        setFormValues({
            DISPLAYNAME: '',
            EMAIL: '',
            PASSWORD: '',
            PHOTOURL: '',
            PHONENUMBER: '',
            COUNTRY: '',
            ADDRESS: '',
            STATE: '',
            CITY: '',
            ZIPCODE: '',
            ABOUT: '',
            ROLE: '0',
            ISPUBLIC: true,
            WAREHOUSE: '0',
            COMPANY: '',
            CARD_CODE: '',
            OSLP_CODE: 0,
            SUCURSAL: 0,
        });
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/hanadb/api/account/users');
            setUsers(response?.data?.users || []);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            alert('No se pudo cargar la lista de empleados');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setSelectedId(null);
        resetForm();
        setOpenDialog(true);
    };

    const handleOpenEdit = (row) => {
        setIsEditing(true);
        setSelectedId(row.ID);
        setFormValues({
            DISPLAYNAME: row.DISPLAYNAME || '',
            EMAIL: row.EMAIL || '',
            PASSWORD: row.PASSWORD || '',
            PHOTOURL: row.PHOTOURL || '',
            PHONENUMBER: row.PHONENUMBER || '',
            COUNTRY: row.COUNTRY || '',
            ADDRESS: row.ADDRESS || '',
            STATE: row.STATE || '',
            CITY: row.CITY || '',
            ZIPCODE: row.ZIPCODE || '',
            ABOUT: row.ABOUT || '',
            ROLE: row.ROLE || '0',
            ISPUBLIC: Boolean(row.ISPUBLIC),
            WAREHOUSE: row.WAREHOUSE || '0',
            COMPANY: row.COMPANY || '',
            CARD_CODE: row.CARD_CODE || '',
            OSLP_CODE: Number(row.OSLP_CODE) || 0,
            SUCURSAL: Number(row.SUCURSAL) || 0,
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleChangeField = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleTogglePublic = (event) => {
        setFormValues((prev) => ({ ...prev, ISPUBLIC: event.target.checked }));
    };

    const handleSave = async () => {
        if (!formValues.DISPLAYNAME || !formValues.EMAIL || !formValues.PASSWORD) {
            alert('DISPLAYNAME, EMAIL y PASSWORD son obligatorios');
            return;
        }

        const payload = {
            ...formValues,
            WAREHOUSE: formValues.WAREHOUSE || null,
            COMPANY: formValues.COMPANY || null,
            CARD_CODE: formValues.CARD_CODE || null,
            OSLP_CODE: Number(formValues.OSLP_CODE) || 0,
            SUCURSAL: Number(formValues.SUCURSAL) || 0,
        };

        setLoading(true);
        try {
            if (isEditing && selectedId) {
                await axios.put(`/hanadb/api/account/users/${selectedId}`, payload);
            } else {
                await axios.post('/hanadb/api/account/users', payload);
            }
            setOpenDialog(false);
            await fetchUsers();
        } catch (error) {
            console.error('Error al guardar empleado:', error);
            alert('No se pudo guardar el empleado');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('¿Seguro que deseas eliminar este empleado?');
        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`/hanadb/api/account/users/${id}`);
            await fetchUsers();
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            alert('No se pudo eliminar el empleado');
            setLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            { field: 'ID', headerName: 'ID', width: 90 },
            { field: 'DISPLAYNAME', headerName: 'Nombre', width: 220 },
            { field: 'EMAIL', headerName: 'Email', width: 260 },
            { field: 'ROLE', headerName: 'Rol', width: 140 },
            { field: 'COMPANY', headerName: 'Empresa', width: 130 },
            {
                field: 'SUCURSAL',
                headerName: 'Sucursal',
                width: 230,
                renderCell: (params) => sucursalLabelFromValue(params.row.SUCURSAL),
            },
            { field: 'WAREHOUSE', headerName: 'Bodega', width: 140 },
            {
                field: 'ISPUBLIC',
                headerName: 'Activo',
                width: 110,
                renderCell: (params) => (params.row.ISPUBLIC ? 'SI' : 'NO'),
            },
            {
                field: 'actions',
                headerName: 'Acciones',
                width: 230,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleOpenEdit(params.row)}>
                            Editar
                        </Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row.ID)}>
                            Eliminar
                        </Button>
                    </Stack>
                ),
            },
        ],
        []
    );

    const roleOptions = useMemo(() => {
        const values = users
            .map((item) => item.ROLE)
            .filter((value) => value !== null && value !== undefined && String(value).trim() !== '');
        return Array.from(new Set(values.map((value) => String(value))));
    }, [users]);

    const sucursalOptions = useMemo(() => {
        const values = users
            .map((item) => item.SUCURSAL)
            .filter((value) => value !== null && value !== undefined && String(value).trim() !== '');
        return Array.from(new Set(values.map((value) => String(value))));
    }, [users]);

    const filteredUsers = useMemo(() => {
        const search = filterText.trim().toLowerCase();

        return users.filter((item) => {
            const companyMatch =
                filterCompany === 'all' || String(item.COMPANY || '') === filterCompany;
            const roleMatch =
                filterRole === 'all' || String(item.ROLE || '') === filterRole;
            const sucursalMatch =
                filterSucursal === 'all' || String(item.SUCURSAL ?? '') === filterSucursal;

            if (!companyMatch || !roleMatch || !sucursalMatch) {
                return false;
            }

            if (!search) {
                return true;
            }

            const haystack = [
                item.DISPLAYNAME,
                item.EMAIL,
                item.COMPANY,
                item.ROLE,
                item.WAREHOUSE,
                item.SUCURSAL,
                sucursalLabelFromValue(item.SUCURSAL),
            ]
                .map((value) => String(value || '').toLowerCase())
                .join(' ');

            return haystack.includes(search);
        });
    }, [users, filterText, filterCompany, filterRole, filterSucursal]);

    const handleResetFilters = () => {
        setFilterText('');
        setFilterCompany('all');
        setFilterRole('all');
        setFilterSucursal('all');
    };

    return (
        <>
            <Head>
                <title> Nomina | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Nómina"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root,
                        },
                        {
                            name: 'RRHH',
                            href: PATH_DASHBOARD.blog.root,
                        },
                        {
                            name: 'Nómina',
                        },
                    ]}
                    action={
                        <Button variant="contained" onClick={handleOpenCreate}>
                            Nuevo Empleado
                        </Button>
                    }
                />

                <Card sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Administración de empleados
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Usuario autenticado: {user?.DISPLAYNAME || 'Sin usuario'}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Buscar"
                                placeholder="Nombre, email, empresa, rol..."
                                value={filterText}
                                onChange={(event) => setFilterText(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Empresa"
                                value={filterCompany}
                                onChange={(event) => setFilterCompany(event.target.value)}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {companyOptions.map((item) => (
                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Rol"
                                value={filterRole}
                                onChange={(event) => setFilterRole(event.target.value)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                {roleOptions.map((item) => (
                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Sucursal"
                                value={filterSucursal}
                                onChange={(event) => setFilterSucursal(event.target.value)}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {sucursalOptions.map((item) => (
                                    <MenuItem key={item} value={item}>{sucursalLabelFromValue(item)}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={1}>
                            <Button variant="outlined" fullWidth onClick={handleResetFilters}>
                                Limpiar
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card sx={{ height: 640, p: 2 }}>
                            <DataGrid
                                rows={filteredUsers.map((item, idx) => ({ ...item, id: item.ID || idx + 1 }))}
                                columns={columns}
                                loading={loading}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                                }}
                                slots={{
                                    toolbar: CustomToolbar,
                                    loadingOverlay: LinearProgress,
                                    noRowsOverlay: () => <EmptyContent title="No hay empleados" />,
                                    noResultsOverlay: () => <EmptyContent title="Sin resultados" />,
                                }}
                            />
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? 'Editar empleado' : 'Crear empleado'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Nombre" name="DISPLAYNAME" value={formValues.DISPLAYNAME} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Email" name="EMAIL" value={formValues.EMAIL} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Password" name="PASSWORD" value={formValues.PASSWORD} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Rol" name="ROLE" value={formValues.ROLE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Empresa" name="COMPANY" value={formValues.COMPANY} onChange={handleChangeField}>
                                {companyOptions.map((item) => (
                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Bodega" name="WAREHOUSE" value={formValues.WAREHOUSE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Sucursal" name="SUCURSAL" value={String(formValues.SUCURSAL)} onChange={handleChangeField}>
                                {Object.values(ubicacionConfig).map((item) => (
                                    <MenuItem key={item.id} value={String(item.id)}>
                                        [{item.id}] {item.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="number" label="OSLP_CODE" name="OSLP_CODE" value={formValues.OSLP_CODE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Teléfono" name="PHONENUMBER" value={formValues.PHONENUMBER} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Card Code" name="CARD_CODE" value={formValues.CARD_CODE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="País" name="COUNTRY" value={formValues.COUNTRY} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Ciudad" name="CITY" value={formValues.CITY} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Estado" name="STATE" value={formValues.STATE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="ZipCode" name="ZIPCODE" value={formValues.ZIPCODE} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Dirección" name="ADDRESS" value={formValues.ADDRESS} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Photo URL" name="PHOTOURL" value={formValues.PHOTOURL} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline minRows={2} label="About" name="ABOUT" value={formValues.ABOUT} onChange={handleChangeField} />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Switch checked={formValues.ISPUBLIC} onChange={handleTogglePublic} />
                                <Typography variant="body2">Usuario activo (ISPUBLIC)</Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
        </GridToolbarContainer>
    );
}

