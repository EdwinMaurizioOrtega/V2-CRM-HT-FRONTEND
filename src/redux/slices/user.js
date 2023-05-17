import {createSlice} from "@reduxjs/toolkit";
import axios from "../../utils/axios";


const initialState = {
    isLoading: false,
    error: null,
    users: [],
};

const slice = createSlice({
    name: 'user_hana',
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
        // GET USERS
        getUsersSuccess(state, action) {
            state.isLoading = false;
            state.users = action.payload;
        },


    },
});

// Reducer
export default slice.reducer;

export function getUsers() {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.get('/hanadb/api/users');
            dispatch(slice.actions.getUsersSuccess(response.data.users));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}