import {paramCase} from 'change-case';
import {useState, useEffect} from 'react';
// next
import Head from 'next/head';
import {useRouter} from 'next/router';
// @mui
import {
    Card,
    Table,
    Button,
    Tooltip,
    TableBody,
    Container,
    IconButton,
    TableContainer,
} from '@mui/material';
// redux
import {useDispatch, useSelector} from '../../../redux/store';
// routes
import {PATH_DASHBOARD} from '../../../routes/paths';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import {useSettingsContext} from '../../../components/settings';
import {
    useTable,
    getComparator,
    emptyRows,
    TableNoData,
    TableSkeleton,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from '../../../components/table';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import ConfirmDialog from '../../../components/confirm-dialog';
// sections
import {ProductTableRow, ProductTableToolbar} from '../../../sections/@dashboard/e-commerce/list';
import {useAuthContext} from "../../../auth/useAuthContext";
import {HOST_API_KEY} from "../../../config-global";
import {AppCompanyWork} from "../../../sections/@dashboard/general/app";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    {id: 'NOMBRE', label: 'Producto', align: 'left'},
    {id: 'CODIGO', label: 'Código', align: 'left'},
    {id: 'SKU', label: 'SKU', align: 'left'},
    {id: 'COD_ITSA', label: 'ITSA', align: 'left'},
];

const TABLE_HEAD_TM = [
    {id: 'NOMBRE', label: 'Producto', align: 'left'},
    {id: 'COD_ITSA', label: 'ITSA', align: 'left'},
];

// Función que decide qué tabla mostrar basada en el tipo de usuario
function getTableHead(user) {
    // Aquí puedes poner lógica para decidir qué tabla mostrar basada en el usuario
    if (user && user.COMPANY !== "TOMEBAMBA") {
        return TABLE_HEAD;
    } else {
        return TABLE_HEAD_TM;
    }
}


// ----------------------------------------------------------------------

EcommerceProductListPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function EcommerceProductListPage() {
    const {
        dense,
        page,
        order,
        orderBy,
        rowsPerPage,
        setPage,
        //
        selected,
        setSelected,
        onSelectRow,
        onSelectAllRows,
        //
        onSort,
        onChangeDense,
        onChangePage,
        onChangeRowsPerPage,
    } = useTable({
        defaultOrderBy: 'createdAt',
    });

    const {user} = useAuthContext();

    const {themeStretch} = useSettingsContext();

    const {push} = useRouter();

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    //const { products, isLoading } = useSelector((state) => state.product);
    const [products, setProducts] = useState([]);

    const [tableData, setTableData] = useState([]);

    const [filterName, setFilterName] = useState('');

    const [filterStatus, setFilterStatus] = useState([]);

    const [openConfirm, setOpenConfirm] = useState(false);


    let STATUS_OPTIONS;

    if (user.COMPANY !== 'TOMEBAMBA') {
        STATUS_OPTIONS = [
            {label: 'CELULARES', value: 'CELULARES'},
            {label: 'ELECTRODOMÉSTICOS', value: 'ELECTRODOMÉSTICOS'},
            {label: 'ACCESORIOS', value: 'ACCESORIOS'},
            {label: 'BELLEZA', value: 'BELLEZA'},
            {label: 'REPUESTOS', value: 'REPUESTOS'},
            {label: 'ELECTROMENORES', value: 'ELECTROMENORES'},
            {label: 'TECNOLOGIA', value: 'TECNOLOGIA'},
            {label: 'VARIOS', value: 'VARIOS'},
        ];
    } else {
        STATUS_OPTIONS = [{label: 'CELULARES', value: 'CELULARES'}];
    }

    useEffect(() => {
        const fetchData = async () => {

            console.log("User: " + JSON.stringify(user));

            try {

                //MovilCelistic
                if (user.EMPRESA === '1792161037001') {

                    const networkResponse = await fetch(`${HOST_API_KEY}/hanadb/api/products/mc`);
                    const data = await networkResponse.json();
                    setProducts(data.products);
                    //console.log("data: " + JSON.stringify(data));

                }

                //Lidenar
                if (user.EMPRESA === '0992537442001') {
                    // Otras empresas
                    const cache = await caches.open('cache-crm');
                    const response = await cache.match(`${HOST_API_KEY}/hanadb/api/products/?empresa=${user.EMPRESA}`);

                    if (response) {
                        // Si hay una respuesta en la caché, se obtiene su contenido
                        const cachedData = await response.json();

                        if (user.ROLE === 'infinix') {
                            const targetBrands = ['INFINIX', 'GENERICO'];
                            const infinixProducts = cachedData.products.filter(product => targetBrands.includes(product.MARCA));
                            setProducts(infinixProducts);
                        } else if (user.ROLE === '0') {
                            //Prpductos de la bodega CENTRO_DE_DISTRIBUCION_HT y categoria celulares
                            const tomebambaProducts = cachedData.products.filter(product => product.CATEGORIA === 'CELULARES' && product.CENTRO_DE_DISTRIBUCION_HT > 0);
                            setProducts(tomebambaProducts);
                        } else {
                            setProducts(cachedData.products);
                        }

                        console.log("cachedData: " + JSON.stringify(cachedData));
                    }

                    // Independientemente de si hay una respuesta en la caché o no, se realiza la solicitud de red
                    const networkResponse = await fetch(`${HOST_API_KEY}/hanadb/api/products/?empresa=${user.EMPRESA}`);
                    const data = await networkResponse.json();
                    //console.log("data: " + JSON.stringify(data));

                    // Se almacena la respuesta de red en la caché
                    await cache.put(`${HOST_API_KEY}/hanadb/api/products/?empresa=${user.EMPRESA}`, new Response(JSON.stringify(data)));

                    // Si había una respuesta en la caché, los productos ya se establecieron en el estado
                    // Si no había respuesta en la caché, ahora se establecen los productos con los datos de la respuesta de red
                    if (user.ROLE === 'infinix') {
                        const targetBrands = ['INFINIX', 'GENERICO'];
                        const infinixProducts = data.products.filter(product => targetBrands.includes(product.MARCA));
                        setProducts(infinixProducts);
                    } else if (user.ROLE === '0') {
                        //Prpductos de la bodega CENTRO_DE_DISTRIBUCION_HT y categoria celulares
                        const tomebambaProducts = data.products.filter(product => product.CATEGORIA === 'CELULARES' && product.CENTRO_DE_DISTRIBUCION_HT > 0);
                        setProducts(tomebambaProducts);
                    } else {
                        setProducts(data.products);
                    }
                }

            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (products.length) {
            setTableData(products);
        }
    }, [products]);

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(order, orderBy),
        filterName,
        filterStatus,
    });

    const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const denseHeight = dense ? 60 : 80;

    const isFiltered = filterName !== '' || !!filterStatus.length;

    const isNotFound = (!dataFiltered.length && !!filterName) || (!isLoading && !dataFiltered.length);

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleFilterName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    const handleFilterStatus = (event) => {
        const {
            target: {value},
        } = event;
        setPage(0);
        setFilterStatus(typeof value === 'string' ? value.split(',') : value);
    };

    const handleDeleteRow = (id) => {
        const deleteRow = tableData.filter((row) => row.id !== id);
        setSelected([]);
        setTableData(deleteRow);

        if (page > 0) {
            if (dataInPage.length < 2) {
                setPage(page - 1);
            }
        }
    };

    const handleDeleteRows = (selectedRows) => {
        const deleteRows = tableData.filter((row) => !selectedRows.includes(row.id));
        setSelected([]);
        setTableData(deleteRows);

        if (page > 0) {
            if (selectedRows.length === dataInPage.length) {
                setPage(page - 1);
            } else if (selectedRows.length === dataFiltered.length) {
                setPage(0);
            } else if (selectedRows.length > dataInPage.length) {
                const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
                setPage(newPage);
            }
        }
    };

    const handleEditRow = (id) => {
        push(PATH_DASHBOARD.eCommerce.edit(paramCase(id)));
    };

    const handleViewRow = (CODIGO) => {
        push(PATH_DASHBOARD.eCommerce.view(CODIGO));
    };

    const handleResetFilter = () => {
        setFilterName('');
        setFilterStatus([]);
    };

    const tableHead = getTableHead(user);

    return (
        <>
            <Head>
                <title> Ecommerce: Product List | HT</title>
            </Head>

            <Container maxWidth={themeStretch ? false : 'lg'}>
                <CustomBreadcrumbs
                    heading="Tienda"
                    links={[
                        {
                            name: 'Dashboard',
                            href: PATH_DASHBOARD.root
                        },
                        {
                            name: 'E-Commerce',
                            href: PATH_DASHBOARD.eCommerce.list,
                        },
                        {name: 'List'},
                    ]}
                />

                <AppCompanyWork/>

                <Card>
                    <ProductTableToolbar
                        filterName={filterName}
                        filterStatus={filterStatus}
                        onFilterName={handleFilterName}
                        onFilterStatus={handleFilterStatus}
                        statusOptions={STATUS_OPTIONS}
                        isFiltered={isFiltered}
                        onResetFilter={handleResetFilter}
                    />

                    <TableContainer sx={{position: 'relative', overflow: 'unset'}}>
                        <TableSelectedAction
                            dense={dense}
                            numSelected={selected.length}
                            rowCount={tableData.length}
                            onSelectAllRows={(checked) =>
                                onSelectAllRows(
                                    checked,
                                    tableData.map((row) => row.id)
                                )
                            }
                            action={
                                <Tooltip title="Delete">
                                    <IconButton color="primary" onClick={handleOpenConfirm}>
                                        <Iconify icon="eva:trash-2-outline"/>
                                    </IconButton>
                                </Tooltip>
                            }
                        />

                        <Scrollbar>
                            <Table size={dense ? 'small' : 'medium'} sx={{minWidth: 960}}>
                                <TableHeadCustom
                                    order={order}
                                    orderBy={orderBy}
                                    headLabel={tableHead}
                                    rowCount={tableData.length}
                                    numSelected={selected.length}
                                    onSort={onSort}
                                    onSelectAllRows={(checked) =>
                                        onSelectAllRows(
                                            checked,
                                            tableData.map((row) => row.CODIGO)
                                        )
                                    }
                                />

                                <TableBody>
                                    {(isLoading ? [...Array(rowsPerPage)] : dataFiltered)
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) =>
                                            row ? (
                                                <ProductTableRow
                                                    key={row.CODIGO}
                                                    row={row}
                                                    selected={selected.includes(row.CODIGO)}
                                                    onSelectRow={() => onSelectRow(row.CODIGO)}
                                                    onDeleteRow={() => handleDeleteRow(row.CODIGO)}
                                                    onEditRow={() => handleEditRow(row.CODIGO)}
                                                    onViewRow={() => handleViewRow(row.CODIGO)}
                                                    userA={user}
                                                />
                                            ) : (
                                                !isNotFound && <TableSkeleton key={index} sx={{height: denseHeight}}/>
                                            )
                                        )}

                                    <TableEmptyRows
                                        height={denseHeight}
                                        emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                                    />

                                    <TableNoData isNotFound={isNotFound}/>
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>

                    <TablePaginationCustom
                        count={dataFiltered.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={onChangePage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                        //
                        dense={dense}
                        onChangeDense={onChangeDense}
                    />
                </Card>
            </Container>

            <ConfirmDialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                title="Delete"
                content={
                    <>
                        Are you sure want to delete <strong> {selected.length} </strong> items?
                    </>
                }
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            handleDeleteRows(selected);
                            handleCloseConfirm();
                        }}
                    >
                        Delete
                    </Button>
                }
            />
        </>
    );
}

// ----------------------------------------------------------------------

function applyFilter({inputData, comparator, filterName, filterStatus}) {
    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (filterName) {
        inputData = inputData.filter(
            (product) => product.NOMBRE.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
                product.CODIGO.indexOf(filterName) !== -1 ||
                product.SKU && product.SKU.indexOf(filterName) !== -1
        );
    }

    if (filterStatus.length) {
        inputData = inputData.filter((product) => filterStatus.includes(product.CATEGORIA));
    }

    return inputData;
}
