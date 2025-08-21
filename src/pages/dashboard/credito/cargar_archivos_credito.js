import DashboardLayout from "../../../layouts/dashboard";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import CustomBreadcrumbs from "../../../components/custom-breadcrumbs";
import {PATH_DASHBOARD} from "../../../routes/paths";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    LinearProgress
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

CargarArchivosCreditoPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function CargarArchivosCreditoPage() {

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const router = useRouter();
    // const {id} = router.query; // Captura el parámetro "id"

    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define las columnas para el DataGrid
    const baseColumns = [
        {field: 'id', headerName: 'ID', width: 90},
        {field: 'DISPLAYNAME', headerName: 'VENDEDOR', width: 350},
        {field: 'RUC', headerName: 'RUC', width: 200},
        {field: 'NOMBRE', headerName: 'NOMBRE', width: 250},
        {field: 'TIPO_PERSONA', headerName: 'T_P', width: 100},
        {field: 'CREATED_AT', headerName: 'CREACIÓN', width: 250},
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
            headerName: 'COPIAR ENLACE FIRMA',
            flex: 1,
            minWidth: 180,
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
                            VerFirmaUanataca(params);
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


    const VerFirmaUanataca = (row) => {

        const SOO = row.row.SOO;
        if (!SOO) {
            alert("Aún no se genera el enlace por el área de crédito.");
            return;
        }

        const url = `https://hypertronics.nexxit.dev/#sso/${row.row.SOO}`;

        navigator.clipboard.writeText(url)
            .then(() => {
                alert("Enlace copiado al portapapeles ✅");
            })
            .catch(() => {
                alert("No se pudo copiar el enlace ❌");
            });

    }

    const VerFotoRegistroCivil = (row) => {
        console.log(row);
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
                console.log(response.data);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false); // Deja de mostrar el loading cuando termine
            }
        };

        fetchData();
    }, [user]); // Dependencia: se ejecuta al montar y cuando cambie user

    return (
        <>
            <Head>
                <title> Validar Información | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
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