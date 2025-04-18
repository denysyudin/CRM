import { configureStore, createSlice } from '@reduxjs/toolkit';
import orderBookSlice from './features/orderBookSlice';
import currencyPairSlice from './features/currencyPairSlice ';
import chartSlice from './features/chartSlice';

// Temporary stubs for the task and notes slices until they're properly implemented
const tasksSlice = createSlice({
    name: 'tasks',
    initialState: {
        tasks: [],
        selectedTask: null,
        loading: false,
        error: null
    },
    reducers: {}
});

const notesSlice = createSlice({
    name: 'notes',
    initialState: {
        notes: [],
        projects: [],
        employees: [],
        selectedNote: null,
        selectedProject: null,
        selectedCategory: null,
        selectedEmployee: null,
        loading: false,
        error: null
    },
    reducers: {}
});

const store = configureStore({
    reducer: {
        orderBook: orderBookSlice,
        currencyPairs: currencyPairSlice,
        chart: chartSlice,
        tasks: tasksSlice.reducer,
        notes: notesSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
