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

BasicTable.propTypes = {
    validateStock: PropTypes.func,
};

export default function BasicTable({ code, validateStock }) {

    const dispatch = useDispatch();

    const { user } = useAuthContext();

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
                                                            <TableCell>{getTextFromCodigo(row.NRO_BODEGA)}</TableCell>
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
                                                            <TableCell>{getTextFromCodigo(row.NRO_BODEGA)}</TableCell>
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
                                                                <TableCell>{getTextFromCodigo(row.NRO_BODEGA)}</TableCell>
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
                                                            <TableCell>{getTextFromCodigoMovilCelistic(row.NRO_BODEGA)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.STOCK_REAL)}</TableCell>
                                                        </TableRow>
                                                    ))

                                            ) : (

                                                stockImei.map((row) => (
                                                    <TableRow key={row.NRO_BODEGA}>
                                                        <TableCell>{getTextFromCodigoMovilCelistic(row.NRO_BODEGA)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_TOTAL_IMEIS)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_NO_DISPONIBLES)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_DISPONIBLES)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.SAP_STOCK_POR_LLEGAR)}</TableCell>
                                                        <TableCell align="right">{fNumber(row.CRM_RESERVADOS)}</TableCell>
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


function getTextFromCodigo(rowCodigo) {
    switch (rowCodigo) {
        case '043':
            return "PARQUE_COLON";
        case '019':
            return "CENTRO_DE_DISTRIBUCION_QUITO";
        case '002':
            return "MAYORISTAS_CUENCA_TURI";
        case '006':
            return "MAYORISTAS_QUITO";
        case '015':
            return "INACTIVA";
        case '024':
            return "MAYORISTAS_MANTA";
        case '030':
            return "MAYORISTAS_GUAYAQUIL";
        case '009':
            return "SAMSUNG_BAHIA";
        case '014':
            return "BODEGA_COMBO";
        case '001':
            return "SAMSUNG_CARACOL_QUITO";
        case '011':
            return "SAMSUNG_CUENCA";
        case '016':
            return "SAMSUNG_MALL_GUAYAQUIL";
        case '017':
            return "SAMSUNG_MALL_CUENCA";
        case '020':
            return "SAMSUNG_MANTA";
        case '022':
            return "SAMSUNG_PORTOVIEJO";
        case '003':
            return "PADRE_AGUIRRE";
        case '010':
            return "MAYORISTAS_CUENCA_CENTRO";
            case '008':
            return "CONSIGNACIÓN";
        default:
            return "...";
    }
}


function getTextFromCodigoAlphacell(rowCodigo) {
    switch (rowCodigo) {
        case '001':
            return "BODEGA";
        case '002':
            return "MOVISTAR RESERVA";
        case '003':
            return "MOVISTAR ENTREGADO";
        case '004':
            return "DEPRATI";
        case '005':
            return "CRESA CONSIGNACIÓN";
        case '006':
            return "COMPUTRONSA CONSIGNACIÓN";
        case '007':
            return "BODEGA CDHT QUITO";
        case '009':
            return "GUAYAQUIL SERVIENTREGA";
        case '099':
            return "INVENTARIO TRANSITO IMPORTACIONES";
        default:
            return "...";
    }
}

// function functionAuxStock (data) {
//     functionStock(data)
//     //console.log(data);
// }

function getTextFromCodigoMovilCelistic(rowCodigo) {
    switch (rowCodigo) {
        case 'DISTLF':
            return "CENTRO DISTRIBUCION MOVILCELISTIC";
        case '003':
            return "MAYORISTAS MOVILCELISTIC MACHALA";
        case '004':
            return "MAYORISTAS MOVILCELISTIC CUENCA TURI";
        case 'T1CARACO':
            return "CARACO XIAOMI TERMINALES";
        case 'T1CUENCA':
            return "CUENCA XIAOMI TERMINALES";
        case 'T1MACHAL':
            return "MACHALA XIAOMI TERMINALES";
        case 'T3CARACO':
            return "CARACO XIAOMI ACCESORIOS";
        case 'T3CUENCA':
            return "CUENCA XIAOMI ACCESORIOS";
        case 'T3MACHAL':
            return "MACHALA XIAOMI ACCESORIOS";
        case 'T2CARACO':
            return "CARACO XIAOMI ELECTRODOMESTICOS";
        case 'T2CUENCA':
            return "CARACOL XIAOMI ELECTRODOMESTICOS";
        case 'T2MACHAL':
            return "MACHALA XIAOMI ELECTRODOMESTICOS";

        case '030':
            return "MAYORISTAS MOVILCELISTIC COLON";
        case '024':
            return "MAYORISTAS MOVILCELISTIC MANTA";

        case '020':
            return "MALL GUAYAQUIL";
        case '021':
            return "MALL CUENCA";

        case '005':
            return "⚠️OPERADORAS CARRIER";
        case '010':
            return "MAYORISTAS MOVILCELISTIC CUENCA CENTRO";
        case '043':
            return "PARQUE_COLON";
        default:
            return "...";
    }
}
