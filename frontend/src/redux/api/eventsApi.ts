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

export const { useGetEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation } = eventsApi;
