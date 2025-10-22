import DashboardLayout from "../../../layouts/dashboard";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid, IconButton,
    LinearProgress, MenuItem, TableCell, TextField, Tooltip
} from "@mui/material";
import {useSettingsContext} from "../../../components/settings";
import {useRouter} from "next/router";
import EmptyContent from "../../../components/empty-content";
import {
    DataGrid,
    GridToolbarColumnsButton,
    GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import axios from "../../../utils/axios";
import {useAuthContext} from "../../../auth/useAuthContext";
import Iconify from "../../../components/iconify";
import MenuPopover from "../../../components/menu-popover";
import ConfirmDialog from "../../../components/confirm-dialog";
import NotificationsIcon from '@mui/icons-material/Notifications';


CargarArchivosCreditoPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CargarArchivosCreditoPage() {

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const router = useRouter();
    // const {id} = router.query; // Captura el parámetro "id"

    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openPopover, setOpenPopover] = useState(null);
    const [openOBS, setOpenOBS] = useState(false);
    const [valueNewOBS, setValueNewOBS] = useState('Ninguno..');
// Estado para guardar el ID seleccionado
    const [selectedIdEmpresa, setSelectedIdEmpresa] = useState(null);
    const handleChangeOBS = (event) => {
        setValueNewOBS(event.target.value);
        // //console.log(`Nuevo precio unitario ${valueNew}`);
    };

    const handleCloseOBS = () => {
        setOpenOBS(false);
    };
    const handleOpenPopover = (event, params) => {
        setOpenPopover(event.currentTarget);
        //console.log( JSON.stringify( params.row.ID_EMPRESA));
        // Guardamos el ID de la fila seleccionada
        setSelectedIdEmpresa(params.row.ID_EMPRESA);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const handleOpenOBS = () => {
        setOpenOBS(true);
    };

    // Define las columnas para el DataGrid
    const baseColumns = [

        {
            type: 'actions',
            field: 'actions',
            headerName: 'ACCIONES',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            getActions: (params) => [
                <TableCell align="right">
                    <IconButton color={openPopover ? 'inherit' : 'default'} onClick={(event) =>handleOpenPopover(event, params)}>
                        <Iconify icon="eva:more-vertical-fill"/>
                    </IconButton>
                    {params.row.OBSERVACIONES_CREDITO
                        && params.row.OBSERVACIONES_CREDITO !== "<NULL>"
                        && (
                            <Tooltip title={params.row.OBSERVACIONES_CREDITO}>
                                <IconButton color="primary" sx={{ width: 40, height: 40 }}>
                                    <Badge badgeContent={1} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        )}

                </TableCell>

            ],
        },

        // {field: 'id', headerName: 'ID', width: 90},
        {field: 'CREATED_AT', headerName: 'CREACIÓN', width: 250},
        {field: 'DISPLAYNAME', headerName: 'VENDEDOR', width: 350},
        {field: 'RUC', headerName: 'RUC', width: 200},
        {field: 'NOMBRE', headerName: 'NOMBRE_EMPRESARIAL', width: 300},
        {field: 'NOMBRE_REPRESENTANTE', headerName: 'NOMBRE_REPRESENTANTE', width: 400},
        {field: 'TIPO_PERSONA', headerName: 'T_P', width: 100},
        {
            field: 'VER INFORMACIÓN',
            headerName: 'VER INFORMACIÓN',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerInformacionCliente(params);
                        }}
                    >
                        VER INFORMACIÓN
                    </Button>
                );
            },
        },
        {
            field: 'VER EN UANATAC',
            headerName: 'VER EN UANATAC',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => {
                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerInformacionUanataca(params);
                        }}
                    >
                        VER EN UANATAC
                    </Button>
                );
            },
        },
        {
            field: 'verFirma',
            headerName: 'COPIAR ENLACE FIRMA SOLICITUD+AUTORIZACION',
            flex: 1,
            minWidth: 180,
            renderHeader: () => (
        <Box sx={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            lineHeight: 1.2,
            fontWeight: 'bold'
        }}>
            COPIAR ENLACE FIRMA SOLICITUD+AUTORIZACION
        </Box>
    ),
            renderCell: (params) => {

                const SOO = params.row.SOO;
                // Si viene null, undefined, vacío o como "<NULL>" => no mostramos el botón
                if (!SOO || SOO === "<NULL>") {
                    return null;
                }

                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerFirmaUanataca(SOO);
                        }}
                    >
                        COPIAR ENLACE
                    </Button>
                );
            },
        },

        {
            field: 'verFirmaPagare',
            headerName: 'COPIAR ENLACE FIRMA PAGARE',
            flex: 1,
            minWidth: 180,
            renderHeader: () => (
        <Box sx={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            lineHeight: 1.2,
            fontWeight: 'bold'
        }}>
            COPIAR ENLACE FIRMA PAGARE
        </Box>
    ),
            renderCell: (params) => {

                const SOO_PAGARE = params.row.SOO_PAGARE;
                // Si viene null, undefined, vacío o como "<NULL>" => no mostramos el botón
                if (!SOO_PAGARE || SOO_PAGARE === "<NULL>") {
                    return null;
                }

                return (
                    <Button
                        component="label"
                        variant="outlined"
                        onClick={() => {
                            VerFirmaUanataca(SOO_PAGARE);
                        }}
                    >
                        COPIAR ENLACE
                    </Button>
                );
            },
        },

        // {
        //     field: 'verFotoRegistroCivil',
        //     headerName: 'FOTO REGISTRO CIVIL',
        //     flex: 1,
        //     minWidth: 180,
        //     renderCell: (params) => {
        //         return (
        //             <Button
        //                 component="label"
        //                 variant="outlined"
        //                 onClick={() => {
        //                     VerFotoRegistroCivil(params);
        //                 }}
        //             >
        //                 Ver
        //             </Button>
        //         );
        //     },
        // },


    ];

    const VerInformacionCliente = (row) => {
        const { TIPO_PERSONA, RUC } = row.row;

        const url =
            TIPO_PERSONA === 'N'
                ? PATH_DASHBOARD.credito.natural_view(RUC)
                : PATH_DASHBOARD.credito.juridica_view(RUC);

        router.push(url);

    }

    const VerInformacionUanataca = (row) => {
        //console.log(row.row);
        const url = `https://console.nexxit.dev/#login`; // Asegúrate de que el ID esté disponible
        window.open(url, "_blank");

    }


    const VerFirmaUanataca = (dato) => {
        //console.log(dato);
        const url = `https://hypertronics.nexxit.dev/#sso/${dato}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                alert("Enlace copiado al portapapeles ✅");
            })
            .catch(() => {
                alert("No se pudo copiar el enlace ❌");
            });

    }

    const VerFotoRegistroCivil = (row) => {
        //console.log(row);
        // const SESSION_ID = row.row.SESSION_ID;
        // console.log(SESSION_ID);

    }

    // Cargar datos del endpoint cuando el componente se monta
    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = '';

                // Vendedor
                if (user?.ROLE === '7') {
                    url = `/hanadb/api/customers/lista_validar_info_prospecto_cartera_by_user?id_user=${user?.ID}`;
                } else {
                    url = '/hanadb/api/customers/lista_validar_info_prospecto_cartera';
                }

                const response = await axios.get(url);
                setBusinessPartners(response.data); // Suponiendo que el response.data contiene los registros
                //console.log(response.data);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false); // Deja de mostrar el loading cuando termine
            }
        };

        fetchData();
    }, [user]); // Dependencia: se ejecuta al montar y cuando cambie user

    const onRowOBS = async () => {
        //console.log("Número ID_EMPRESA: " + selectedIdEmpresa);
        //console.log("Observación de cartera: " + valueNewOBS);
        //console.log("USER_ID: " + user?.ID);

        try {
            const response = await axios.put('/hanadb/api/customers/obs_cartera_uanataca', {
                ID_REGISTRO: selectedIdEmpresa,
                OBS: valueNewOBS,
                USER_ID: Number(user?.ID),
            });

            // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
            //console.log('Cambiando estado');
            //console.log("Código de estado:", response.status);

            // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
            if (response.status === 200) {

                //setTimeout(() => {
                router.reload();
                //}, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
            }

        } catch (error) {
            // Manejar el error de la petición DELETE aquí
            console.error('Error al cambiar el status de la orden:', error);
        }


    };

    return (
        <>
            <Head>
                <title> Validar Información | HT</title>
            </Head>

            <Container maxWidth={false}>
                <CustomBreadcrumbs
                    heading="Validar Información"
                    links={[
                        {name: 'Dashboard', href: PATH_DASHBOARD.root},
                        {name: 'Crédito', href: PATH_DASHBOARD.blog.root},
                        {name: 'Validar Información'},
                    ]}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Card sx={{p: 3, textAlign: "center"}}>

                            <CardContent>

                                <DataGrid
                                    rows={businessPartners?.map((partner, index) => ({
                                        ...partner,
                                        id: partner.ID || index + 1, // Usa el ID real si existe, de lo contrario, el índice
                                    })) || []}
                                    columns={baseColumns}
                                    rowHeight={100} // Define la altura de las filas
                                    pagination
                                    pageSize={10} // Número de filas por página
                                    slots={{
                                        toolbar: CustomToolbar,
                                        noRowsOverlay: () => <EmptyContent title="No Data"/>,
                                        noResultsOverlay: () => <EmptyContent title="No results found"/>,
                                        loadingOverlay: LinearProgress, // Usa LinearProgress como indicador de carga

                                    }}
                                    loading={loading} // Activa el loading
                                />



                                <MenuPopover
                                    open={openPopover}
                                    onClose={handleClosePopover}
                                    arrow="right-top"
                                    sx={{width: 160}}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleOpenOBS();
                                            handleClosePopover();
                                        }}
                                    >
                                        <Iconify icon="eva:shopping-bag-outline"/>
                                        Observación
                                    </MenuItem>


                                </MenuPopover>


                                <ConfirmDialog
                                    open={openOBS}
                                    onClose={handleCloseOBS}
                                    title="Observación Cartera (UANATACA)"
                                    action={
                                        <>
                                            <TextField
                                                label="Nota"
                                                value={valueNewOBS}
                                                onChange={handleChangeOBS}
                                            />
                                            <Button variant="contained" color="error" onClick={() => {
                                                onRowOBS();
                                            }}>
                                                Guardar.
                                            </Button>
                                        </>
                                    }
                                />
                            </CardContent>

                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

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
