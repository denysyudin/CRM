import { configureStore, createSlice } from '@reduxjs/toolkit';
import chartSlice from './features/chartSlice';
import remindersReducer from './features/remindersSlice';
import eventsReducer from './features/eventsSlice';

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
        chart: chartSlice,
        tasks: tasksSlice.reducer,
        notes: notesSlice.reducer,
        reminders: remindersReducer,
        events: eventsReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
