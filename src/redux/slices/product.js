import sum from 'lodash/sum';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import {createSlice} from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';
import {dispatch} from "../store";

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    products: [],
    product: null,
    pricelistproduct: [],
    checkout: {
        activeStep: 0,
        cart: [],
        subtotal: 0,
        total: 0,
        discount: 0,
        //Valor del envío por defecto
        shipping: 0,
        //Bodega por defecto
        warehouse: "002",
        //Forma de pago por defecto
        method: 2,
        comment: 'Ninguno.',
        servientrega: null,
        billing: null,
        totalItems: 0,
    },
};

const slice = createSlice({
    name: 'product',
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

        // GET PRODUCTS
        getProductsSuccess(state, action) {
            state.isLoading = false;
            state.products = action.payload;
        },

        // GET PRODUCT
        getProductSuccess(state, action) {
            state.isLoading = false;
            state.product = action.payload;
        },

        // GET PRODUCT
        getPriceListProductSuccess(state, action) {
            state.isLoading = true;
            state.pricelistproduct = action.payload;
        },

        // CHECKOUT
        getCart(state, action) {
            const cart = action.payload;

            const totalItems = sum(cart.map((product) => +product.quantity));
            const subtotal = sum(cart.map((product) => product.price.Price * product.quantity));
            const iva = subtotal * 0.15;
            state.checkout.cart = cart;
            state.checkout.discount = state.checkout.discount || 0;
            state.checkout.shipping = state.checkout.shipping || 0;
            state.checkout.billing = state.checkout.billing || null;
            state.checkout.warehouse = state.checkout.warehouse || 0;
            state.checkout.subtotal = subtotal;
            state.checkout.iva = iva;
            state.checkout.total = subtotal - state.checkout.discount + iva;
            state.checkout.totalItems = totalItems;
        },

        addToCart(state, action) {

            //INICIO V1
            const newProduct = action.payload;
            const isEmptyCart = !state.checkout.cart.length;

            if (isEmptyCart) {
                state.checkout.cart = [...state.checkout.cart, newProduct];
            } else {
                state.checkout.cart = state.checkout.cart.map((product) => {
                    const isExisted = product.CODIGO === newProduct.CODIGO;

                    if (isExisted) {
                        return {
                            ...product,
                            // colors: uniq([...product.colors, ...newProduct.colors]),
                            quantity: product.quantity + 1,
                        };
                    }

                    return product;
                });
            }
            state.checkout.cart = uniqBy([...state.checkout.cart, action.payload], 'CODIGO');
            //FIN V1

            //INICIO V2
            //state.checkout.cart = [...state.checkout.cart, action.payload];
            //FIN V2

            //El operador + antes de item.quantity convierte el valor de item.quantity a un número.
            state.checkout.totalItems = sum(state.checkout.cart.map((product) => +product.quantity));
        },

        deleteCart(state, action) {
            const updateCart = state.checkout.cart.filter((product) => product.CODIGO !== action.payload);

            state.checkout.cart = updateCart;
        },

        resetCart(state) {
            state.checkout.cart = [];
            state.checkout.billing = null;
            state.checkout.activeStep = 0;
            state.checkout.total = 0;
            state.checkout.subtotal = 0;
            state.checkout.discount = 0;
            state.checkout.shipping = 0;
            state.checkout.totalItems = 0;
            state.checkout.warehouse = 0;
            state.checkout.comment = 'Ninguno.';
            state.checkout.servientrega = null;
            state.checkout.method = 0;
            state.checkout.iva = 0;
        },

        backStep(state) {
            state.checkout.activeStep -= 1;
        },

        nextStep(state) {
            state.checkout.activeStep += 1;
        },

        gotoStep(state, action) {
            const step = action.payload;
            state.checkout.activeStep = step;
        },

        increaseQuantity(state, action) {
            const productId = action.payload;

            const updateCart = state.checkout.cart.map((product) => {
                if (product.CODIGO === productId) {
                    return {
                        ...product,
                        quantity: product.quantity + 1,
                    };
                }
                return product;
            });

            state.checkout.cart = updateCart;
        },

        decreaseQuantity(state, action) {
            const productId = action.payload;
            const updateCart = state.checkout.cart.map((product) => {
                if (product.CODIGO === productId) {
                    return {
                        ...product,
                        quantity: product.quantity - 1,
                    };
                }
                return product;
            });

            state.checkout.cart = updateCart;
        },

        createBilling(state, action) {
            state.checkout.billing = action.payload;
        },

        applyDiscount(state, action) {
            const discount = action.payload;
            state.checkout.discount = discount;
            state.checkout.total = state.checkout.subtotal - discount;
        },

        applyShipping(state, action) {
            const shipping = action.payload;
            state.checkout.shipping = shipping;
            state.checkout.total = state.checkout.subtotal - state.checkout.discount + shipping + state.checkout.iva;
        },
        applyWarehouse(state, action) {
            state.checkout.warehouse = action.payload;
        },
        applyMethod(state, action) {
            state.checkout.method = action.payload;
        },
        applyComment(state, action) {
            state.checkout.comment = action.payload;
        },

        applyServientrega(state, action) {
            state.checkout.servientrega = action.payload;
        },

        clearPriceListProduct(state) {
            state.pricelistproduct = null;
        },
    },
});

// Reducer
export default slice.reducer;

// Actions
export const {
    getCart,
    addToCart,
    resetCart,
    gotoStep,
    backStep,
    nextStep,
    deleteCart,
    createBilling,
    applyShipping,
    applyWarehouse,
    applyMethod,
    applyComment,
    applyServientrega,
    applyDiscount,
    increaseQuantity,
    decreaseQuantity,
} = slice.actions;

// ----------------------------------------------------------------------

export function getProducts() {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('/hanadb/api/products/');
            dispatch(slice.actions.getProductsSuccess(response.data.products));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

// export function getProduct(name) {
//     return async (dispatch) => {
//         dispatch(slice.actions.startLoading());
//         try {
//             const response = await axios.get('/hanadb/api/products/product', {
//                 params: {name},
//             });
//             dispatch(slice.actions.getProductSuccess(response.data.product));
//         } catch (error) {
//             console.error(error);
//             dispatch(slice.actions.hasError(error));
//         }
//     };
// }

// ----------------------------------------------------------------------

// export function getPriceListProduct(name, idUser) {
//     return async (dispatch) => {
//         dispatch(slice.actions.startLoading());
//         try {
//             const response = await axios.get('/hanadb/api/products/price_list_product', {
//                 params: {name, idUser},
//             });
//
//             dispatch(slice.actions.clearPriceListProduct);
//
//             dispatch(slice.actions.getPriceListProductSuccess(response.data.data));
//         } catch (error) {
//             console.error(error);
//             dispatch(slice.actions.hasError(error));
//         }
//     };
// }

// export function  getClearPriceListProduct (){
//     return async (dispatch) => {
//         dispatch(slice.actions.clearPriceListProduct);
//     }
// }
