import {createSlice} from "@reduxjs/toolkit";
import axios from "../../utils/axios";


const initialState = {
    isLoading: false,
    error: null,
    orders: [],
    currentInvoice: [],
};

const slice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        // START LOADING
        startLoading(state) {
            state.isLoading = true;
        },
        // HAS ERROR
        hasError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        // GET ORDERS
        getOrdersSuccess(state, action) {
            state.isLoading = false;
            state.orders = action.payload;
        },

        getDetailOrderSuccess(state, action) {
            state.isLoading = false;
            state.currentInvoice = action.payload;
        },


    },
});

// Reducer
export default slice.reducer;

// Ordenes por estado
export function getOrders(estado) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get(`/hanadb/api/orders?estado=${estado}`);
            dispatch(slice.actions.getOrdersSuccess(response.data.orders));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// Ordenes con todos los estados.
export function getOrdersAllStatusByVendedor(idVendedor) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get(`/hanadb/api/orders/vendedor?ven=${idVendedor}`);
            dispatch(slice.actions.getOrdersSuccess(response.data.orders));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// Ordenes pendientes de factura por bodega con estado 0
export function getOrdersByBodega(bodega) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get(`/hanadb/api/orders/bodega?bod=${bodega}`);
            dispatch(slice.actions.getOrdersSuccess(response.data.orders));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function getDetailOrder(id) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('/hanadb/api/orders/order/detail', {
                params: {id},
            });
            dispatch(slice.actions.getDetailOrderSuccess(response.data.data));
        } catch (error) {
            console.error(error);
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------