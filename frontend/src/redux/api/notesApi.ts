import { apiSlice } from './apiSlice';
import { Note } from '../../types/note.types';

export const notesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notes
    getNotes: builder.query<Note[], void | { projectId?: string, employeeId?: string }>({
      query: (arg) => {
        const { projectId, employeeId } = arg || {};
        let url = '/notes';
        if (projectId) {
          url += `?project_id=${projectId}`;
        }
        if (employeeId) {
          url += `?employee_id=${employeeId}`;
        }
        return url;
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notes' as const, id })),
              { type: 'Notes', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),
    
    // Get a single note by ID
    getNoteById: builder.query<Note, string>({
      query: (id) => `/notes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Notes', id }],
    }),
    
    // Create a new note
    createNote: builder.mutation<Note, Omit<Note, 'id'>>({
      query: (newNote) => ({
        url: '/notes',
        method: 'POST',
        body: newNote,
      }),
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),
    
    // Update an existing note
    updateNote: builder.mutation<Note, Partial<Note> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/notes/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Notes', id }],
    }),
    
    // Delete a note
    deleteNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notes', id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi; 