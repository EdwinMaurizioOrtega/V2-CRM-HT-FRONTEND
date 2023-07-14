import {useEffect, useState} from 'react';
import sumBy from 'lodash/sumBy';
// next
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// utils
import { fTimestamp } from '../../../utils/formatTime';
// _mock_
import { _invoices } from '../../../_mock/arrays';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// components
import Label from '../../../components/label';
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../../components/table';
// sections
import InvoiceAnalytic from '../../../sections/@dashboard/invoice/InvoiceAnalytic';
import { InvoiceTableRow, InvoiceTableToolbar } from '../../../sections/@dashboard/invoice/list';
import {getUsers} from "../../../redux/slices/user";
import {useDispatch, useSelector} from "../../../redux/store";
import {
  getOrders,
  getOrdersAllStatus,
  getOrdersAllStatusByVendedor,
  getOrdersByBodega
} from "../../../redux/slices/order";
import {useAuthContext} from "../../../auth/useAuthContext";
import axios from "../../../utils/axios";

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'all',
  'full stack development',
  'backend development',
  'ui design',
  'ui/ux design',
  'front end development',
];

const TABLE_HEAD = [
  { id: 'invoiceNumber', label: 'Orden', align: 'left' },
  { id: 'createDate', label: 'Fecha', align: 'left' },
  { id: 'dueDate', label: 'CI/RUC', align: 'left' },
  { id: 'price', label: 'R.Social', align: 'center', width: 140 },
  { id: 'sent', label: 'Celular', align: 'center', width: 140 },
  { id: 'status', label: 'Tipo Cliente', align: 'left' },
  { id: 'status', label: 'Ciudad Cliente', align: 'left' },
  { id: 'status', label: 'Estado', align: 'left' },
  { id: 'status', label: 'Vendedor', align: 'left' },
  { id: 'status', label: 'Ciudad Vendedor', align: 'left' },
  { id: 'status', label: 'Detalle', align: 'left' },

  { id: '' },
];

// ----------------------------------------------------------------------

InvoiceListPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

// ----------------------------------------------------------------------

export default function InvoiceListPage() {

  const router = useRouter();

  const { user } = useAuthContext();

  const theme = useTheme();

  const dispatch = useDispatch();

  const { orders, isLoading } = useSelector((state) => state.orders_status);


  const { themeStretch } = useSettingsContext();

  const { push } = useRouter();

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
  } = useTable({ defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState([]);

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');

  const [filterService, setFilterService] = useState('all');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterStartDate, setFilterStartDate] = useState(null);


  useEffect(() => {

    console.log(user.DISPLAYNAME);
    console.log(user.ROLE);

    // Perfil vendedor
    if ( user.ROLE === "vendedor") {
      const idVendedor = user.ID;
      // Mostramos todos los estados para el rol del vendedor
      dispatch(getOrdersAllStatusByVendedor(idVendedor));
    };

    // Perfil aprobacion

    if ( user.ROLE === "aprobador") {
      // Enviar el estado 6 para consultar las ordenes pendientes de factuaración.
      dispatch(getOrders(6));
    };

    // Perfil bodega

    if ( user.ROLE === "bodega") {
      console.log(user.WAREHOUSE);
      const bodegaSAP = user.WAREHOUSE;

      dispatch(getOrdersByBodega(bodegaSAP));
    };



  }, [dispatch]);

  useEffect(() => {
    if (orders.length) {
      setTableData(orders);
    }
  }, [orders])

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterStatus !== 'all' ||
    filterName !== '' ||
    filterService !== 'all' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const getLengthByStatus = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalPriceByStatus = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status) => (getLengthByStatus(status) / tableData.length) * 100;

  const TABS = [
    { value: 'total', label: 'Total', color: 'info', count: tableData.length },
    { value: 'pendiente-aprobar', label: 'Pendiente de aprobar', color: 'success', count: getLengthByStatus('6') },
    { value: 'pendiente-facturar', label: 'Pendiente de Facturar', color: 'warning', count: getLengthByStatus('0') },
    { value: 'facturado', label: 'Facturado', color: 'error', count: getLengthByStatus('1') },
    // { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ];

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
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
    push(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = (id) => {
    push(PATH_DASHBOARD.invoice.view(id));
  };

  //Anúla una orden
  const handleAnularRow = async (id) => {
    console.log("Número de orden: " + id);

    try {
      const response = await axios.put('/hanadb/api/orders/order/anular', {
        params: {
          ID: id
        }
      });

      // Comprobar si la petición DELETE se realizó correctamente pero no se recibe una respuesta del servidor
      console.log('Estado de orden anulado.');
      console.log("Código de estado:", response.status);

      // Recargar la misma ruta solo si la petición PUT se completó con éxito (código de estado 200)
      if (response.status === 200) {

        setTimeout(() => {
          router.reload();
        }, 5000); // Tiempo de espera de 5 segundos (5000 milisegundos)
      }

    } catch (error) {
      // Manejar el error de la petición DELETE aquí
      console.error('Error al eliminar la orden:', error);
    }

  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('all');
    setFilterService('all');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Head>
        <title> Invoice: List | HT</title>
      </Head>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Lista Ordenes"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Invoices',
              href: PATH_DASHBOARD.invoice.root,
            },
            {
              name: 'Lista',
            },
          ]}
          // action={
          //   <Button
          //     component={NextLink}
          //     href={PATH_DASHBOARD.invoice.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="eva:plus-fill" />}
          //   >
          //     New Invoice
          //   </Button>
          // }
        />

        <Card sx={{ mb: 5 }}>
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, 'totalPrice')}
                icon="ic:round-receipt"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Pendiente de aprobar"
                total={getLengthByStatus('paid')}
                percent={getPercentByStatus('paid')}
                price={getTotalPriceByStatus('paid')}
                icon="eva:checkmark-circle-2-fill"
                color={theme.palette.success.main}
              />

              {/* <InvoiceAnalytic */}
              {/*   title="Unpaid" */}
              {/*   total={getLengthByStatus('unpaid')} */}
              {/*   percent={getPercentByStatus('unpaid')} */}
              {/*   price={getTotalPriceByStatus('unpaid')} */}
              {/*   icon="eva:clock-fill" */}
              {/*   color={theme.palette.warning.main} */}
              {/* /> */}

              {/* <InvoiceAnalytic */}
              {/*   title="Overdue" */}
              {/*   total={getLengthByStatus('overdue')} */}
              {/*   percent={getPercentByStatus('overdue')} */}
              {/*   price={getTotalPriceByStatus('overdue')} */}
              {/*   icon="eva:bell-fill" */}
              {/*   color={theme.palette.error.main} */}
              {/* /> */}

              {/* <InvoiceAnalytic */}
              {/*   title="Draft" */}
              {/*   total={getLengthByStatus('draft')} */}
              {/*   percent={getPercentByStatus('draft')} */}
              {/*   price={getTotalPriceByStatus('draft')} */}
              {/*   icon="eva:file-fill" */}
              {/*   color={theme.palette.text.secondary} */}
              {/* /> */}
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label color={tab.color} sx={{ mr: 1 }}>
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Divider />

          <InvoiceTableToolbar
            isFiltered={isFiltered}
            filterName={filterName}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            optionsService={SERVICE_OPTIONS}
            onResetFilter={handleResetFilter}
            filterStartDate={filterStartDate}
            onFilterService={handleFilterService}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="ic:round-send" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="eva:printer-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.ID}
                        row={row}
                        selected={selected.includes(row.ID)}
                        onSelectRow={() => onSelectRow(row.ID)}
                        onViewRow={() => handleViewRow(row.ID)}
                        onAnularRow={()=> handleAnularRow(row.ID)}
                        // onEditRow={() => handleEditRow(row.ID)}
                        // onDeleteRow={() => handleDeleteRow(row.ID)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
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

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  }

  if (filterService !== 'all') {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((c) => c.service === filterService)
    );
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (invoice) =>
        fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
        fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
