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
      transformResponse: (response: Note[]) => {
        console.log('response', response);
        return response || [];
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notes' as const, id })),
              { type: 'Notes', id: 'LIST' },
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' },
            { type: 'Tasks', id: 'LIST' },
          ],

    }),
    
    // Get a single note by ID
    getNoteById: builder.query<Note, string>({
      query: (id) => `/notes/${id}`,
      transformResponse: (response: Note) => {
        return response;
      },
      providesTags: (id) => [{ type: 'Notes', id: id?.id || "LIST" }],
    }),

    getNoteByProjectId: builder.query<Note[], string>({
      query: (projectId) => `/notes?project_id=${projectId}`,
      transformResponse: (response: Note[]) => {
        return response || [];
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notes' as const, id })), 
              { type: 'Notes', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),
    
    getNoteByEmployeeId: builder.query<Note[], string>({
      query: (employeeId) => `/notes?employee_id=${employeeId}`,
      transformResponse: (response: Note[]) => {
        return response || [];
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notes' as const, id })), 
              { type: 'Notes', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),
    

    // Create a new note
    createNote: builder.mutation<Note, FormData>({
      query: (formData) => {
        return {
          url: '/notes',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: [{ type: 'Notes', id: 'LIST' }],
    }),
    
    // Update an existing note
    updateNote: builder.mutation<Note, { id: string; formData?: FormData } | (Partial<Note> & { id: string; fileData?: File })>({
      query: (data) => {
        // Extract the ID
        const id = data.id;
        
        // Check if formData is provided directly
        if ('formData' in data && data.formData instanceof FormData) {
          return {
            url: `/notes/${id}`,
            method: 'PUT',
            body: data.formData,
            formData: true
          };
        }
        
        // Otherwise, convert to FormData
        const { fileData, ...patch } = data as (Partial<Note> & { id: string; fileData?: File });
        
        // Always use FormData - backend expects Form data
        const formData = new FormData();
        
        // Append all note data to form
        Object.entries(patch).forEach(([key, value]) => {
          // Skip undefined values, id (already extracted), and files array
          if (value !== undefined && key !== 'files' && key !== 'id' && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Append file if exists
        if (fileData) {
          formData.append('file', fileData);
        }
        
        return {
          url: `/notes/${id}`,
          method: 'PUT',
          body: formData,
          // Don't set Content-Type header, browser will set it with boundary
          formData: true,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Notes', id: id?.toString() }],
    }),
    
    // Delete a note
    deleteNote: builder.mutation<string, string>({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notes', id: id?.toString() }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetNotesQuery,
  useGetNoteByIdQuery,
  useGetNoteByProjectIdQuery,
  useGetNoteByEmployeeIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;
