import { apiSlice } from './apiSlice';
import { Task } from '../../types/task.types';

export const tasksApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tasks
    getTasks: builder.query<Task[], void | { projectId?: string }>({
      query: (arg) => {
        const { projectId } = arg || {};
        return projectId ? `/tasks?project_id=${projectId}` : '/tasks';
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),
    
    // Get a single task by ID
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tasks', id: id?.toString() || "LIST" }],
    }),
    
    getTaskByProjectId: builder.query<Task[], string>({
      query: (projectId) => `/tasks?project_id=${projectId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),
    
    getTaskByEmployeeId: builder.query<Task[], string>({
      query: (employeeId) => `/tasks?employee_id=${employeeId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Tasks', id: 'LIST' }],
    }),

    // Create a new task
    createTask: builder.mutation<Task, FormData>({
      query: (formData) => ({
        url: '/tasks',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    
    // Update an existing task
    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}/status`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id: id?.toString() }],
    }),
    
    // Delete a task
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tasks', id: id?.toString() }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetTaskByProjectIdQuery,
  useGetTaskByEmployeeIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi; 
