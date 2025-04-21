import { createSelector } from 'reselect';
import { RootState } from '../store';

// Import interfaces from task and note slices
import { Task } from './tasksSlice';
import { Note } from './notesSlice';

// OrderBook selectors
const selectOrderBook = (state: RootState) => state.orderBook;

export const selectTopBids = createSelector(
    [selectOrderBook],
    (orderBook) => orderBook.topBids
);

export const selectTopAsks = createSelector(
    [selectOrderBook],
    (orderBook) => orderBook.topAsks
);

// Tasks selectors
const selectTasksState = (state: RootState) => state.tasks;

export const selectAllTasks = createSelector(
    [selectTasksState],
    (tasksState): Task[] => tasksState.tasks
);

export const selectSelectedTask = createSelector(
    [selectTasksState],
    (tasksState) => tasksState.selectedTask
);

export const selectTasksLoading = createSelector(
    [selectTasksState],
    (tasksState) => tasksState.loading
);

export const selectTasksError = createSelector(
    [selectTasksState],
    (tasksState) => tasksState.error
);

export const selectTasksByStatus = createSelector(
    [selectAllTasks, (_, status: 'todo' | 'in-progress' | 'completed') => status],
    (tasks, status) => tasks.filter(task => task.status === status)
);

export const selectTasksByPriority = createSelector(
    [selectAllTasks, (_, priority: 'low' | 'medium' | 'high') => priority],
    (tasks, priority) => tasks.filter(task => task.priority === priority)
);

// Notes selectors
const selectNotesState = (state: RootState) => state.notes;

export const selectAllNotes = createSelector(
    [selectNotesState],
    (notesState): Note[] => notesState.notes
);

export const selectSelectedNote = createSelector(
    [selectNotesState],
    (notesState) => notesState.selectedNote
);

export const selectNotesLoading = createSelector(
    [selectNotesState],
    (notesState) => notesState.loading
);

export const selectNotesError = createSelector(
    [selectNotesState],
    (notesState) => notesState.error
);

export const selectNotesByProject = createSelector(
    [selectAllNotes, (_, projectId: string) => projectId],
    (notes, projectId) => notes.filter(note => note.projectId === projectId)
);

export const selectNotesByEmployee = createSelector(
    [selectAllNotes, (_, employeeId: string) => employeeId],
    (notes, employeeId) => notes.filter(note => note.employeeId === employeeId)
); 