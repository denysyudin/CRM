import { configureStore, createSlice } from '@reduxjs/toolkit';
import remindersReducer from './features/remindersSlice';
import eventsReducer from './features/eventsSlice';
import projectsReducer from './features/projectsSlice';
import employeesReducer from './features/employeesSlice';
import notesReducer from './features/notesSlice';

// Temporary stubs for the task slice until it's properly implemented
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

const store = configureStore({
    reducer: {
        tasks: tasksSlice.reducer,
        notes: notesReducer,
        reminders: remindersReducer,
        events: eventsReducer,
        projects: projectsReducer,
        employees: employeesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
