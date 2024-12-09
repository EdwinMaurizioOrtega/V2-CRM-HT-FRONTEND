import PropTypes from 'prop-types';
import {createContext, useEffect, useReducer, useCallback, useMemo} from 'react';
// utils
import axios from '../utils/axios';
import localStorageAvailable from '../utils/localStorageAvailable';
//
import {isValidToken, setSession} from './utils';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
    isInitialized: false,
    isAuthenticated: false,
    user: null,
};

const reducer = (state, action) => {
    if (action.type === 'INITIAL') {
        return {
            isInitialized: true,
            isAuthenticated: action.payload.isAuthenticated,
            user: action.payload.user,
        };
    }
    if (action.type === 'LOGIN') {
        return {
            ...state,
            isAuthenticated: true,
            user: action.payload.user,
        };
    }
    if (action.type === 'REGISTER') {
        return {
            ...state,
            isAuthenticated: true,
            user: action.payload.user,
        };
    }
    if (action.type === 'LOGOUT') {
        return {
            ...state,
            isAuthenticated: false,
            user: null,
        };
    }
    if (action.type === 'ADD_NEW_VALUE_TO_USER') {
        return {
            ...state,
            user: {
                ...state.user,
                ...action.payload,
            },
        };
    }

    return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
    children: PropTypes.node,
};

export function AuthProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const storageAvailable = localStorageAvailable();

    const initialize = useCallback(async () => {
        try {
            const accessToken = storageAvailable ? localStorage.getItem('accessToken') : '';

            if (accessToken && isValidToken(accessToken)) {
                setSession(accessToken);

                const response = await axios.get('/hanadb/api/account/my-account');

                const {user} = response.data;

                // Recupera el usuario del localStorage si existe
                const storedUser = localStorage.getItem('user');
                const initialUser = storedUser ? JSON.parse(storedUser) : user;

                dispatch({
                    type: 'INITIAL',
                    payload: {
                        isAuthenticated: true,
                        user: initialUser,
                    },
                });
            } else {
                dispatch({
                    type: 'INITIAL',
                    payload: {
                        isAuthenticated: false,
                        user: null,
                    },
                });
            }
        } catch (error) {
            console.error(error);
            dispatch({
                type: 'INITIAL',
                payload: {
                    isAuthenticated: false,
                    user: null,
                },
            });
        }
    }, [storageAvailable]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    // LOGIN
    const login = useCallback(async (email, password) => {
        const response = await axios.post('/hanadb/api/account/login', {
            // empresa,
            email,
            password,
        });
        const {accessToken, user} = response.data;

        setSession(accessToken);

        dispatch({
            type: 'LOGIN',
            payload: {
                user,
            },
        });
    }, []);

    // REGISTER
    const register = useCallback(async (email, password, firstName, lastName) => {
        const response = await axios.post('/hanadb/api/account/register', {
            EMAIL: email,
            PASSWORD: password,
            DISPLAYNAME: `${firstName} ${lastName}`,
            ROLE: 'user',
            ISPUBLIC: true,
            PHOTOURL: 'https://api-dev-minimal-v4.vercel.app/assets/images/avatars/avatar_default.jpg',

        });
        const {accessToken, user} = response.data;

        localStorage.setItem('accessToken', accessToken);

        dispatch({
            type: 'REGISTER',
            payload: {
                user,
            },
        });
    }, []);

    // LOGOUT
    const logout = useCallback(() => {
        setSession(null);
        // Eliminar el token y el usuario del localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        dispatch({
            type: 'LOGOUT',
        });
    }, []);

    // AuthProvider.js
    const updateUser = useCallback((updatedFields) => {

        const updatedUser = {
            ...state.user,
            ...updatedFields,
        };

        // Guarda el usuario actualizado en localStorage
        if (storageAvailable) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        dispatch({
            type: 'ADD_NEW_VALUE_TO_USER',
            payload: updatedFields,
        });
    }, [state.user]);


    const memoizedValue = useMemo(
        () => ({
            isInitialized: state.isInitialized,
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            method: 'jwt',
            login,
            register,
            logout,
            updateUser, // Add the new updateUser method

        }),
        [state.isAuthenticated, state.isInitialized, state.user, login, logout, register, updateUser]
    );

    return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
