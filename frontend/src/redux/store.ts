import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './features/employeesSlice';
import tasksReducer from './features/tasksSlice';
import eventsReducer from './features/eventsSlice';
import remindersReducer from './features/remindersSlice';
import projectsReducer from './features/projectsSlice';
import notesReducer from './features/notesSlice';
// import filesReducer from './features/fileSlice';
import { apiSlice, apiReducer, apiReducerPath, apiMiddleware } from './api/apiSlice';
// Import the query hooks but not the API itself since we're using injectEndpoints
import './api/tasksApi';
import './api/eventsApi';

// Configure the store with both traditional reducers and RTK Query
export const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        employees: employeesReducer,
        events: eventsReducer,
        reminders: remindersReducer,
        projects: projectsReducer,
        notes: notesReducer,
        // files: filesReducer,
        [apiReducerPath]: apiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
        .concat(apiMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
