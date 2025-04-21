import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { 
  fetchTasks, 
  fetchTaskById, 
  createTask, 
  updateTaskAsync, 
  deleteTaskAsync,
  selectTask,
  clearSelectedTask
} from '../redux/features/tasksSlice';
import { 
  fetchNotes, 
  fetchNoteById, 
  createNote, 
  updateNoteAsync,
  deleteNoteAsync,
  selectNote,
  clearSelectedNote
} from '../redux/features/notesSlice';
import { 
  selectAllTasks, 
  selectSelectedTask, 
  selectTasksLoading,
  selectTasksError,
  selectTasksByStatus,
  selectTasksByPriority
} from '../redux/features/selectors';
import {
  selectAllNotes,
  selectSelectedNote,
  selectNotesLoading,
  selectNotesError,
  selectNotesByProject,
  selectNotesByEmployee
} from '../redux/features/selectors';

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for Tasks
export const useTasks = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectAllTasks);
  const selectedTask = useAppSelector(selectSelectedTask);
  const loading = useAppSelector(selectTasksLoading);
  const error = useAppSelector(selectTasksError);

  const loadTasks = (projectId?: string) => {
    dispatch(fetchTasks(projectId));
  };

  const loadTask = (taskId: string) => {
    dispatch(fetchTaskById(taskId));
  };

  const addTask = (task: any) => {
    dispatch(createTask(task));
  };

  const updateTask = (task: any) => {
    dispatch(updateTaskAsync(task));
  };

  const deleteTask = (taskId: string) => {
    dispatch(deleteTaskAsync(taskId));
  };

  const setSelectedTask = (taskId: string) => {
    dispatch(selectTask(taskId));
  };

  const clearTask = () => {
    dispatch(clearSelectedTask());
  };

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'completed') => {
    return useAppSelector(state => selectTasksByStatus(state, status));
  };

  const getTasksByPriority = (priority: 'low' | 'medium' | 'high') => {
    return useAppSelector(state => selectTasksByPriority(state, priority));
  };

  return {
    tasks,
    selectedTask,
    loading,
    error,
    loadTasks,
    loadTask,
    addTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    clearTask,
    getTasksByStatus,
    getTasksByPriority
  };
};

// Custom hooks for Notes
export const useNotes = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectAllNotes);
  const selectedNote = useAppSelector(selectSelectedNote);
  const loading = useAppSelector(selectNotesLoading);
  const error = useAppSelector(selectNotesError);

  const loadNotes = (projectId?: string) => {
    dispatch(fetchNotes(projectId));
  };

  const loadNote = (noteId: string) => {
    dispatch(fetchNoteById(noteId));
  };

  const addNote = (note: any) => {
    dispatch(createNote(note));
  };

  const updateNote = (note: any) => {
    dispatch(updateNoteAsync(note));
  };

  const deleteNote = (noteId: string) => {
    dispatch(deleteNoteAsync(noteId));
  };

  const setSelectedNote = (noteId: string) => {
    dispatch(selectNote(noteId));
  };

  const clearNote = () => {
    dispatch(clearSelectedNote());
  };

  const getNotesByProject = (projectId: string) => {
    return useAppSelector(state => selectNotesByProject(state, projectId));
  };

  const getNotesByEmployee = (employeeId: string) => {
    return useAppSelector(state => selectNotesByEmployee(state, employeeId));
  };

  return {
    notes,
    selectedNote,
    loading,
    error,
    loadNotes,
    loadNote,
    addNote,
    updateNote,
    deleteNote,
    setSelectedNote,
    clearNote,
    getNotesByProject,
    getNotesByEmployee
  };
}; 