import { apiSlice } from './apiSlice';
import { Reminder } from '../../services/api';

export const remindersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reminders
    getReminders: builder.query<Reminder[], void | { projectId?: string }>({
      query: (arg) => {
        const { projectId } = arg || {};
        return projectId ? `/reminders?project_id=${projectId}` : '/reminders';
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reminders' as const, id })),
              { type: 'Reminders', id: 'LIST' },
            ]
          : [{ type: 'Reminders', id: 'LIST' }],
    }),
    
    // Get a single reminder by ID
    getReminderById: builder.query<Reminder, string>({
      query: (id) => `/reminders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reminders', id }],
    }),
    
    getReminderByProjectId: builder.query<Reminder[], string>({
      query: (projectId) => `/reminders?project_id=${projectId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reminders' as const, id })),
              { type: 'Reminders', id: 'LIST' },
            ]
          : [{ type: 'Reminders', id: 'LIST' }],
    }),
    
    getReminderByEmployeeId: builder.query<Reminder[], string>({
      query: (employeeId) => `/reminders?employee_id=${employeeId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reminders' as const, id })),
              { type: 'Reminders', id: 'LIST' },
            ]
          : [{ type: 'Reminders', id: 'LIST' }],
    }),

    // Get pending reminders
    getPendingReminders: builder.query<Reminder[], void>({
      query: () => '/reminders?status=false',
      providesTags: [{ type: 'Reminders', id: 'PENDING' }],
    }),
    
    // Create a new reminder
    createReminder: builder.mutation<Reminder, Omit<Reminder, 'id'>>({
      query: (newReminder) => ({
        url: '/reminders',
        method: 'POST',
        body: newReminder,
      }),
      invalidatesTags: [
        { type: 'Reminders', id: 'LIST' },
        { type: 'Reminders', id: 'PENDING' }
      ],
    }),
    
    // Update an existing reminder
    updateReminder: builder.mutation<Reminder, Partial<Reminder> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/reminders/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reminders', id },
        { type: 'Reminders', id: 'PENDING' }
      ],
    }),
    
    // Mark reminder as complete
    completeReminder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reminders/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Reminders', id },
        { type: 'Reminders', id: 'PENDING' },
        { type: 'Reminders', id: 'LIST' }
      ],
    }),
    
    // Delete a reminder
    deleteReminder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Reminders', id },
        { type: 'Reminders', id: 'LIST' },
        { type: 'Reminders', id: 'PENDING' }
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRemindersQuery,
  useGetReminderByIdQuery,
  useGetPendingRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useCompleteReminderMutation,
  useDeleteReminderMutation,
  useGetReminderByProjectIdQuery,
  useGetReminderByEmployeeIdQuery,
} = remindersApi; 