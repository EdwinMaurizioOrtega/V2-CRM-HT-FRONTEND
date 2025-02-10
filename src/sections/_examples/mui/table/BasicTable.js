// @mui
import {Table, TableRow, TableBody, TableCell, TableContainer} from '@mui/material';
// components
import Scrollbar from '../../../../components/scrollbar';
import {TableHeadCustom} from '../../../../components/table';
import {useEffect, useState} from "react";
import {useDispatch} from "../../../../redux/store";
import {HOST_API_KEY} from "../../../../config-global";
import {fNumber} from "../../../../utils/formatNumber";
import {useAuthContext} from "../../../../auth/useAuthContext";
import PropTypes from "prop-types";
import InvoiceTableRow from "../../../@dashboard/invoice/list/InvoiceTableRow";

// ----------------------------------------------------------------------

function createData(name, calories, fat, carbs, protein) {
    return {name, calories, fat, carbs, protein};
}

const TABLE_DATA = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const TABLE_HEAD = [
    {id: 'dessert', label: 'BODEGA'},
    {id: 'fat', label: 'CANTIDAD', align: 'right'},
    {id: 'carbs', label: 'RESERVADO', align: 'right'},
    {id: 'protein', label: 'DISPONIBLE', align: 'right'},
    {id: 'calories', label: 'CODIGO', align: 'right'},
];

// ----------------------------------------------------------------------

BasicTable.propTypes = {
    validateStock: PropTypes.func,
};

export default function BasicTable({code, validateStock}) {

    const dispatch = useDispatch();

    const {user} = useAuthContext();

    const [loading, setLoading] = useState(true);

    const [stockProduct, setStockProduct] = useState([]);

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
                try {
                    const response = await fetch(`${HOST_API_KEY}/hanadb/api/products/stock/product?code=${code}&empresa=${user.EMPRESA}`);
                    if (response.status === 200) {
                        // Eliminar el estado de carga aquí, ya que la respuesta es exitosa (código 200).
                        setLoading(false);
                    } else {
                        // Mantener el estado de carga aquí, ya que la respuesta no fue exitosa (código diferente de 200).
                        setLoading(true);
                    }
                    const data = await response.json();
                    setStockProduct(data.product_stock);
                    console.log("Stock: " + JSON.stringify(data.product_stock));
                    //console.log("Stock: " + JSON.stringify(stockProduct));


                    if (data.product_stock && data.product_stock.length > 0) {

                        // Usamos reduce para sumar todos los valores del campo DISPONIBLE
                        //const sumaDisponible = data.product_stock.reduce((total, producto) => total + Number(producto.DISPONIBLE), 0);

                        // console.log(`La suma total del campo DISPONIBLE es: ${sumaDisponible}`);
                        // validateStock(sumaDisponible);

                        //Cuatro B. Mayoristas: 019 CDH - 002 Cuenca - 024 Manta - 030 Colon

                        const bodegasM = data.product_stock.reduce((acumulador, producto) => {
                            if (producto.BODEGA === '019' || producto.BODEGA === '002' || producto.BODEGA === '024' || producto.BODEGA === '030') {
                                acumulador.push(producto);
                            }
                            return acumulador;
                        }, []);

                        validateStock(bodegasM);

                    } else {
                        console.log('No hay datos de stock disponibles.');
                    }

                } catch (error) {
                    console.error('Error:', error);
                    setStockProduct([]);
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
                <LoadingComponent/>
            ) : (
                <TableContainer sx={{mt: 3, overflow: 'unset'}}>
                    <Scrollbar>
                        <Table sx={{minWidth: 800}}>
                            <TableHeadCustom headLabel={filteredTableHead}/>

                            <TableBody>

                                {
                                    // Hipertronics
                                    user.EMPRESA == '0992537442001' && (

                                        user.COMPANY === 'TOMEBAMBA' ? (
                                            stockProduct
                                                .filter((row) => row.BODEGA === '019')
                                                .map((filteredRow) => (
                                                        <TableRow key={filteredRow.BODEGA}>
                                                            <TableCell>{getTextFromCodigo(filteredRow.BODEGA)}</TableCell>
                                                            <TableCell
                                                                align="right">{fNumber(filteredRow.CANTIDAD)}</TableCell>
                                                            <TableCell
                                                                align="right">{fNumber(filteredRow.RESERVADO)}</TableCell>
                                                            <TableCell
                                                                align="right">{fNumber(filteredRow.DISPONIBLE)}</TableCell>
                                                            <TableCell align="right">{filteredRow.CODIGO}</TableCell>
                                                        </TableRow>
                                                    )
                                                )

                                        ) : (

                                            user.ROLE != 'infinix' ? (

                                                user.ROLE != 'tienda' ? (

                                                    stockProduct.map((row) => (
                                                        <TableRow key={row.BODEGA}>
                                                            <TableCell>{getTextFromCodigo(row.BODEGA)}</TableCell>
                                                            <TableCell align="right">{fNumber(row.CANTIDAD)}</TableCell>
                                                            <TableCell
                                                                align="right">{fNumber(row.RESERVADO)}</TableCell>
                                                            <TableCell
                                                                align="right">{fNumber(row.DISPONIBLE)}</TableCell>
                                                            <TableCell align="right">{row.CODIGO}</TableCell>
                                                        </TableRow>
                                                    ))

                                                ) : (

                                                    stockProduct.map((row) => (
                                                        <TableRow key={row.BODEGA}>
                                                            <TableCell>{getTextFromCodigo(row.BODEGA)}</TableCell>
                                                            <TableCell align="right">{

                                                                fNumber(row.DISPONIBLE) >= 1 && fNumber(row.DISPONIBLE) < 5 ? (
                                                                    "+1"
                                                                ) : fNumber(row.DISPONIBLE) >= 5 && fNumber(row.DISPONIBLE) < 10 ? (
                                                                    "+5"
                                                                ) : fNumber(row.DISPONIBLE) >= 10 && fNumber(row.DISPONIBLE) < 20 ? (
                                                                    "+10"
                                                                ) : fNumber(row.DISPONIBLE) >= 20 ? (
                                                                    "+20"
                                                                ) : (
                                                                    "0"
                                                                )

                                                            }</TableCell>

                                                            <TableCell align="right">{row.CODIGO}</TableCell>
                                                        </TableRow>
                                                    ))

                                                )

                                            ) : (
                                                // Mostrar solo las filas con BODEGA 019, 002 y 030
                                                stockProduct
                                                    .filter((row) => row.BODEGA === '019' || row.BODEGA === '002' || row.BODEGA === '030')
                                                    .map((filteredRow) => (
                                                            <TableRow key={filteredRow.BODEGA}>
                                                                <TableCell>{getTextFromCodigo(filteredRow.BODEGA)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.CANTIDAD)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.RESERVADO)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.DISPONIBLE)}</TableCell>
                                                                <TableCell align="right">{filteredRow.CODIGO}</TableCell>
                                                            </TableRow>
                                                        )
                                                    )
                                            )

                                        )

                                    )

                                }

                                {/* {user.EMPRESA === '0992264373001' && ( */}
                                {/*     //Alphacell */}
                                {/*     stockProduct.map((row) => ( */}
                                {/*         <TableRow key={row.BODEGA}> */}
                                {/*             <TableCell>{getTextFromCodigoAlphacell(row.BODEGA)}</TableCell> */}
                                {/*             <TableCell align="right">{fNumber(row.CANTIDAD)}</TableCell> */}
                                {/*             <TableCell align="right">{fNumber(row.RESERVADO)}</TableCell> */}
                                {/*             <TableCell align="right">{fNumber(row.DISPONIBLE)}</TableCell> */}
                                {/*             <TableCell align="right">{row.CODIGO}</TableCell> */}
                                {/*         </TableRow> */}
                                {/*     )) */}
                                {/*     ) */}
                                {/* } */}

                                {
                                    user.EMPRESA === '1792161037001' && (
                                        //MovilCelistic

                                        user.COMPANY === 'TOMEBAMBA' ? (
                                                stockProduct
                                                    .filter((row) => row.BODEGA === 'DISTLF')
                                                    .map((filteredRow) => (
                                                            <TableRow key={filteredRow.BODEGA}>
                                                                <TableCell>{getTextFromCodigoMovilCelistic(filteredRow.BODEGA)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.CANTIDAD)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.RESERVADO)}</TableCell>
                                                                <TableCell
                                                                    align="right">{fNumber(filteredRow.DISPONIBLE)}</TableCell>
                                                                <TableCell align="right">{filteredRow.CODIGO}</TableCell>
                                                            </TableRow>
                                                        )
                                                    )

                                            ) : (

                                            stockProduct.map((row) => (
                                                <TableRow key={row.BODEGA}>
                                                    <TableCell>{getTextFromCodigoMovilCelistic(row.BODEGA)}</TableCell>
                                                    <TableCell align="right">{fNumber(row.CANTIDAD)}</TableCell>
                                                    <TableCell align="right">{fNumber(row.RESERVADO)}</TableCell>
                                                    <TableCell align="right">{fNumber(row.DISPONIBLE)}</TableCell>
                                                    <TableCell align="right">{row.CODIGO}</TableCell>
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
    );
}

const LoadingComponent = () => {
    return (
        <>
            {/* <p className="ml-2 mb-0">Cargando...</p> */}
            <img src="/assets/images/loading.gif" height="100px" alt="Loading"/>

        </>

    );
};


function getTextFromCodigo(rowCodigo) {
    switch (rowCodigo) {
        case '019':
            return "CENTRO_DE_DISTRIBUCION_HT";
        case '002':
            return "MAYORISTAS_CUENCA";
        case '006':
            return "MAYORISTAS_QUITO";
        case '015':
            return "MAYORISTAS_GUAYAQUIL";
        case '024':
            return "MAYORISTAS_MANTA";
        case '030':
            return "COLON";
        case '009':
            return "SAMSUNG_BAHIA";
        case '014':
            return "ME_COMPRAS_SAMSUNG_ORELLANA";
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
//     console.log(data);
// }

function getTextFromCodigoMovilCelistic(rowCodigo) {
    switch (rowCodigo) {
        case 'DISTLF':
            return "CENTRO DISTRIBUCION MOVILCELISTIC";
        case '003':
            return "MAYORISTAS MOVILCELISTIC MACHALA";
        case '004':
            return "MAYORISTAS MOVILCELISTIC CUENCA";
        case 'T1CARACO':
            return "CARACOL XIAOMI TERMINALES";
        case 'T1CUENCA':
            return "CUENCA XIAOMI TERMINALES";
        case 'T1MACHAL':
            return "MACHALA XIAOMI TERMINALES";
        case 'T3CARACO':
            return "CARACOL XIAOMI ACCESORIOS";
        case 'T3CUENCA':
            return "CUENCA XIAOMI ACCESORIOS";
        case 'T3MACHAL':
            return "MACHALA XIAOMI ACCESORIOS";
        case 'T2CARACO':
            return "CARACOL XIAOMI ELECTRODOMESTICOS";
        case 'T2CUENCA':
            return "CARACOL XIAOMI ELECTRODOMESTICOS";
        case 'T2MACHAL':
            return "MACHALA XIAOMI ELECTRODOMESTICOS";
        default:
            return "...";
    }
}