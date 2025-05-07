import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Task } from '../../types/task.types';
import { Project } from '../../types/project.types';
import { Reminder } from '../../types/reminder.types';
import { Note } from '../../types/note.types';
import { Employee } from '../../types/employee.types';

// Remove or comment out the orderBook selector if not needed
// const selectOrderBook = (state: RootState) => state.orderBook;

// Tasks selectors
const selectTasksState = (state: RootState) => state.tasks;

export const selectAllTasks = createSelector(
  [selectTasksState],
  (tasksState) => tasksState.tasks || []
);

export const selectSelectedTask = createSelector(
  [selectTasksState],
  (tasksState) => tasksState.selectedTask || null
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
  [selectAllTasks, (_, status) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

export const selectTasksByPriority = createSelector(
  [selectAllTasks, (_, priority) => priority],
  (tasks, priority) => tasks.filter(task => task.priority === priority)
);

export const selectTaskById = createSelector(
  [selectAllTasks, (_, taskId) => taskId],
  (tasks, taskId) => tasks.find((task) => task.id === taskId)
);

export const selectTasksByProject = createSelector(
  [selectAllTasks, (_, projectId) => projectId],
  (tasks, projectId) => tasks.filter((task) => task.project_id === projectId)
);

export const selectTasksByEmployee = createSelector(
  [selectAllTasks, (_, employeeId) => employeeId],
  (tasks, employeeId) => tasks.filter((task) => task.employee_id === employeeId)
);

// Projects selectors
const selectProjectsState = (state: RootState) => state.projects;

export const selectAllProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.items || []
);

export const selectProjectById = createSelector(
  [selectAllProjects, (_, projectId) => projectId],
  (projects, projectId) => projects.find((project) => project.id === projectId)
);

// Reminders selectors
const selectRemindersState = (state: RootState) => state.reminders;

export const selectAllReminders = createSelector(
  [selectRemindersState],
  (remindersState) => remindersState.items || []
);

export const selectReminderById = createSelector(
  [selectAllReminders, (_, reminderId) => reminderId],
  (reminders, reminderId) => reminders.find((reminder) => reminder.id === reminderId)
);

// Notes selectors
const selectNotesState = (state: RootState) => state.notes;

export const selectAllNotes = createSelector(
  [selectNotesState],
  (notesState) => notesState.items || []
);

export const selectNoteById = createSelector(
  [selectAllNotes, (_, noteId) => noteId],
  (notes, noteId) => notes.find((note) => note.id === noteId)
);

export const selectNotesLoading = createSelector(
  [selectNotesState],
  (notesState) => notesState.status === 'loading'
);

export const selectNotesByProject = createSelector(
  [selectAllNotes, (_, projectId) => projectId],
  (notes, projectId) => notes.filter(note => note.project_id === projectId)
);

export const selectNotesByEmployee = createSelector(
  [selectAllNotes, (_, employeeId) => employeeId],
  (notes, employeeId) => notes.filter(note => note.employee_id === employeeId)
);

// Employees selectors
const selectEmployeesState = (state: RootState) => state.employees;

export const selectAllEmployees = createSelector(
  [selectEmployeesState],
  (employeesState) => employeesState.items || []
);

export const selectEmployeeById = createSelector(
  [selectAllEmployees, (_, employeeId) => employeeId],
  (employees, employeeId) => employees.find((employee) => employee.id === employeeId)
); 
