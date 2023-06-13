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

export function getOrders() {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('/hanadb/api/orders');
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