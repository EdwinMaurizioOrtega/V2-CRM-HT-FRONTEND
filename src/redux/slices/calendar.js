import {createSlice} from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
    isLoading: false,
    error: null,
    events: [],
};

const slice = createSlice({
    name: 'calendar',
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

        // GET EVENTS
        getEventsSuccess(state, action) {
            state.isLoading = false;
            state.events = action.payload;
        },

        // CREATE EVENT
        createEventSuccess(state, action) {
            const newEvent = action.payload;
            state.isLoading = false;
            state.events = [...state.events, newEvent];
        },

        // UPDATE EVENT
        updateEventSuccess(state, action) {
            state.isLoading = false;
            state.events = state.events.map((event) => {
                if (event.id === action.payload.id) {
                    return action.payload;
                }
                return event;
            });
        },

        // DELETE EVENT
        deleteEventSuccess(state, action) {
            const eventId = action.payload;
            state.events = state.events.filter((event) => event.id !== eventId);
        },
    },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export function getEvents(us) {
    //console.log("user: "+ JSON.stringify(us))
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            //const response = await axios.get('https://api-dev-minimal-v4.vercel.app/api/calendar/events');
            const response = await axios.get('/hanadb/api/customers/calendar?USER_ID=' + us.ID);
            dispatch(slice.actions.getEventsSuccess(response.data.events));
            //console.log("getEventsResponse: "+ JSON.stringify( response))
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function createEvent(newEvent) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            const response = await axios.post('https://api-dev-minimal-v4.vercel.app/api/calendar/events/new', newEvent);
            dispatch(slice.actions.createEventSuccess(response.data.event));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function updateEvent(eventId) {

    console.log("eventId: " + eventId);

    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {

            const response = await axios.put('/hanadb/api/customers/calendar/events/update', {
                ID_AGENDA: Number(eventId)
            });

            console.log("responseStatus: " + response.status)
            if (response.status === 200) {
                dispatch(slice.actions.updateEventSuccess(response.data.event));
                // Recargar la página
                window.location.reload();
            }
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}

// ----------------------------------------------------------------------

export function deleteEvent(eventId) {
    return async (dispatch) => {
        dispatch(slice.actions.startLoading());
        try {
            await axios.post('https://api-dev-minimal-v4.vercel.app/api/calendar/events/delete', {eventId});
            dispatch(slice.actions.deleteEventSuccess(eventId));
        } catch (error) {
            dispatch(slice.actions.hasError(error));
        }
    };
}
