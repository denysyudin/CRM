import { Events } from '../../types';
import { apiSlice } from './apiSlice';

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<Events[], void>({
      query: () => '/events',
      transformResponse: (response: Events[]) => {
        return response;
      },
      providesTags: [{ type: 'Events', id: 'LIST' }],
    }),

    getEventByProjectId: builder.query<Events[], string>({
      query: (projectId) => `/events?project_id=${projectId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Events' as const, id })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),

    getEventByEmployeeId: builder.query<Events[], string>({
      query: (employeeId) => `/events?employee_id=${employeeId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Events' as const, id })), 
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),

    getEventById: builder.query<Events, string>({
      query: (id) => `/events/${id}`,
      providesTags: (id) => [{ type: 'Events', id: id?.id || "LIST" }],
    }),
    
    createEvent: builder.mutation<Events, Events>({
      query: (event) => ({
        url: '/events',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }),
    updateEvent: builder.mutation<Events, Events>({
      query: (event) => ({
        url: `/events/${event.id}`,
        method: 'PUT',
        body: event,
      }),
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }),
    deleteEvent: builder.mutation<Events, Events>({
      query: (event) => ({
        url: `/events/${event.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }), 
  }),
});

export const { 
  useGetEventsQuery, 
  useGetEventByProjectIdQuery,
  useGetEventByEmployeeIdQuery,
  useGetEventByIdQuery,
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useDeleteEventMutation } = eventsApi;

