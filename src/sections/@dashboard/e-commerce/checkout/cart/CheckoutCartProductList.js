import PropTypes from 'prop-types';
// @mui
import { Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from '../../../../../components/scrollbar';
import { TableHeadCustom } from '../../../../../components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { CODIGO: 'NOMBRE', label: 'Producto' },
  { CODIGO: 'tp', label: 'TP' },
  { CODIGO: 'price', label: 'Precio' },
  { CODIGO: 'quantity', label: 'Cantidad' },
  { CODIGO: 'totalPrice', label: 'Precio Total', align: 'right' },
  { CODIGO: '' },
];

// const TABLE_HEAD_TM = [
//   { CODIGO: 'NOMBRE', label: 'Producto' },
//   { CODIGO: 'quantity', label: 'Cantidad' },
//   { CODIGO: '' },
// ];

// Función que decide qué tabla mostrar basada en el tipo de usuario
// function getTableHead(user) {
//   // Aquí puedes poner lógica para decidir qué tabla mostrar basada en el usuario
//   if (user && user.COMPANY !== "TOMEBAMBA") {
//     return TABLE_HEAD;
//   } else {
//     return TABLE_HEAD_TM;
//   }
// }

// ----------------------------------------------------------------------

CheckoutCartProductList.propTypes = {
  onDelete: PropTypes.func,
  products: PropTypes.array,
  onDecreaseQuantity: PropTypes.func,
  onIncreaseQuantity: PropTypes.func,
};

export default function CheckoutCartProductList({
  products,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  user,
}) {

  //const tableHead = getTableHead(user);

  return (
    <TableContainer sx={{ overflow: 'unset' }}>
      <Scrollbar>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {products.map((row) => (
              <CheckoutCartProduct
                key={row.CODIGO}
                row={row}
                onDelete={() => onDelete(row.CODIGO)}
                onDecrease={() => onDecreaseQuantity(row.CODIGO)}
                onIncrease={() => onIncreaseQuantity(row.CODIGO)}
                user={user}
              />
            ))}
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );
}
