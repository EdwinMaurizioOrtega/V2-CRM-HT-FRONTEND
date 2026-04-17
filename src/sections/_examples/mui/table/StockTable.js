// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// components
import Scrollbar from '../../../../components/scrollbar';
import { TableHeadCustom } from '../../../../components/table';
import { useEffect, useState } from "react";
import { useDispatch } from "../../../../redux/store";
import { HOST_API_KEY } from "../../../../config-global";
import { fNumber } from "../../../../utils/formatNumber";
import { useAuthContext } from "../../../../auth/useAuthContext";
import { useWarehouseContext } from "../../../../auth/useWarehouseContext";
import PropTypes from "prop-types";
import InvoiceTableRow from "../../../@dashboard/invoice/list/InvoiceTableRow";

// ----------------------------------------------------------------------

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const TABLE_DATA = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const TABLE_HEAD = [
    { id: 'dessert', label: 'BODEGA' },
    { id: 'fat', label: 'CANTIDAD', align: 'right' },
    { id: 'carbs', label: 'RESERVADO', align: 'right' },
    { id: 'protein', label: 'DISPONIBLE', align: 'right' },
    { id: 'calories', label: 'CODIGO', align: 'right' },
];

const TABLE_HEAD_IMEI = [
    { id: 'bodega', label: 'BODEGA' },
    // { id: 'total', label: 'TOTAL IMEIS', align: 'right' },
    // { id: 'no_disp', label: 'NO DISPONIBLES', align: 'right' },
    // { id: 'disp', label: 'DISPONIBLES', align: 'right' },
    // { id: 'transito', label: 'STOCK POR LLEGAR', align: 'right' },
    // { id: 'reservados', label: 'CRM RESERVADOS', align: 'right' },
    { id: 'real', label: 'STOCK REAL', align: 'right' },
];

// ----------------------------------------------------------------------

StockTable.propTypes = {
    validateStock: PropTypes.func,
};

export default function StockTable({ code, validateStock }) {

    const dispatch = useDispatch();

    const { user } = useAuthContext();

    const { getWarehouseName } = useWarehouseContext();

    const [loading, setLoading] = useState(true);

    const [stockProduct, setStockProduct] = useState([]);

    const [stockImei, setStockImei] = useState([]);

    const filteredTableHead = user.ROLE === 'tienda' ? TABLE_HEAD.filter(column => column.id === 'dessert' || column.id === 'protein' || column.id === 'calories') : TABLE_HEAD;

    //Lista de precios por producto
    useEffect(() => {
        //1. Eliminar la lista anterior.
        // dispatch(getClearPriceListProduct());

        // if (name) {
        //     //2. consultar nuevamente.
        //     dispatch(getPriceListProduct(name, user.ID));
        // }

        //V2
        async function fetchData() {
            if (code) {
                // Fetch IMEI-level stock
                try {
                    const responseImei = await fetch(`${HOST_API_KEY}/hanadb/api/products/stock/product_imei?code=${code}&empresa=${user.EMPRESA}`);
                    if (responseImei.status === 200) {
                        // Eliminar el estado de carga aquí, ya que la respuesta es exitosa (código 200).
                        setLoading(false);
                    } else {
                        // Mantener el estado de carga aquí, ya que la respuesta no fue exitosa (código diferente de 200).
                        setLoading(true);
                    }
                    const dataImei = await responseImei.json();
                    setStockImei(dataImei.product_stock_imei || []);


                    if (dataImei.product_stock_imei && dataImei.product_stock_imei.length > 0) {

                        //Cuatro B. Mayoristas: 019 CDH - 002 Cuenca - 024 Manta - 030 Colon

                        const bodegasM = dataImei.product_stock_imei.reduce((acumulador, producto) => {
                            if (producto.NRO_BODEGA === '019' || producto.NRO_BODEGA === '002' || producto.NRO_BODEGA === '024' || producto.NRO_BODEGA === '030') {
                                acumulador.push(producto);
                            }
                            return acumulador;
                        }, []);

                        validateStock(bodegasM);

                    } else {
                        //console.log('No hay datos de stock disponibles.');
                    }

                } catch (error) {
                    console.error('Error IMEI:', error);
                    setStockImei([]);
                    // Eliminar el estado de carga en caso de error también.
                    setLoading(false);
                }
            }
        }

        // Call the async function immediately
        fetchData();

    }, [dispatch, code]);


    return (
        <>
            {loading ? (
                <LoadingComponent />
            ) : (
                <>
                {/* Tabla Stock IMEI */}
                {stockImei && stockImei.length > 0 && (
                    <TableContainer sx={{ mt: 3, overflow: 'unset' }}>
                        <Scrollbar>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHeadCustom headLabel={TABLE_HEAD_IMEI} />
                                <TableBody>

                                    {
                                        // Hipertronics
                                        user.EMPRESA == '0992537442001' && (

                                            user.COMPANY === 'TOMEBAMBA' ? (
                                                stockImei
                                                    .filter((row) => row.NRO_BODEGA === '030')
                                                    .map((row) => (
                                                        <TableRow key={row.NRO_BODEGA}>
                                                            <TableCell>{getWarehouseName(row.NRO_BODEGA)}</TableCell>
                                                            {/* <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell> */}
                                                            <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                        </TableRow>
                                                    ))

                                            ) : (

                                                user.ROLE != 'infinix' ? (

                                                    stockImei.map((row) => (
                                                        <TableRow key={row.NRO_BODEGA}>
                                                            <TableCell>{getWarehouseName(row.NRO_BODEGA)}</TableCell>
                                                            {/* <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell> */}
                                                            <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                        </TableRow>
                                                    ))

                                                ) : (
                                                    // Mostrar solo las filas con BODEGA 019, 002 y 030
                                                    stockImei
                                                        .filter((row) => row.NRO_BODEGA === '019' || row.NRO_BODEGA === '002' || row.NRO_BODEGA === '030')
                                                        .map((row) => (
                                                            <TableRow key={row.NRO_BODEGA}>
                                                                <TableCell>{getWarehouseName(row.NRO_BODEGA)}</TableCell>
                                                                {/* <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                                <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                                <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                                <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                                <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell> */}
                                                                <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                )

                                            )

                                        )

                                    }

                                    {
                                        user.EMPRESA === '1792161037001' && (
                                            //MovilCelistic

                                            user.COMPANY === 'TOMEBAMBA' ? (
                                                stockImei
                                                    .filter((row) => row.NRO_BODEGA === '030')
                                                    .map((row) => (
                                                        <TableRow key={row.NRO_BODEGA}>
                                                            <TableCell>{getWarehouseName(row.NRO_BODEGA)}</TableCell>
                                                            {/* <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell> */}
                                                            <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                        </TableRow>
                                                    ))

                                            ) : (

                                                stockImei.map((row) => (
                                                    <TableRow key={row.NRO_BODEGA}>
                                                        <TableCell>{getWarehouseName(row.NRO_BODEGA)}</TableCell>
                                                        {/* <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell> */}
                                                        <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                    </TableRow>
                                                ))
                                            )

                                        )
                                    }

                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>
                )}
                </>
            )}
        </>
    );
}

const LoadingComponent = () => {
    return (
        <>
            {/* <p className="ml-2 mb-0">Cargando...</p> */}
            <img src="/assets/images/loading.gif" height="100px" alt="Loading" />

        </>

    );
};
