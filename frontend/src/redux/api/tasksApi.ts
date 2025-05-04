import { apiSlice } from './apiSlice';
import { Task } from '../features/tasksSlice';

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
      providesTags: (result, error, id) => [{ type: 'Tasks', id }],
    }),
    
    // Create a new task
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (newTask) => ({
        url: '/tasks',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    
    // Update an existing task
    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tasks', id }],
    }),
    
    // Delete a task
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tasks', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi; 