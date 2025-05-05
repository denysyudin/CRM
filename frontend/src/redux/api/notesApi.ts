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

    getNoteByProjectId: builder.query<Note[], string>({
      query: (projectId) => `/notes?project_id=${projectId}`,
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
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notes' as const, id })), 
              { type: 'Notes', id: 'LIST' },
            ]
          : [{ type: 'Notes', id: 'LIST' }],
    }),
    

    // Create a new note
    createNote: builder.mutation<Note, FormData | (Omit<Note, 'id'> & { fileData?: File })>({
      query: (data) => {
        const { fileData, ...noteData } = data as (Omit<Note, 'id'> & { fileData?: File });
        const formData = new FormData();
        
        Object.entries(noteData).forEach(([key, value]) => {
          if (value !== undefined && key !== 'files') {
            formData.append(key, value.toString());
          }
        });
        
        if (fileData) {
          formData.append('file', fileData);
        }
        
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
          if (value !== undefined && key !== 'files' && key !== 'id') {
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
  useGetNoteByProjectIdQuery,
  useGetNoteByEmployeeIdQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi; 