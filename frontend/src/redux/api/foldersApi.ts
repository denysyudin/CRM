import { apiSlice } from './apiSlice';
import { Folder } from '../../types/folder.types';

export const foldersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notes
    getFolders: builder.query<Folder[], void>({
      query: () => '/folders',
      providesTags: [{ type: 'Folders', id: 'LIST' }],
    }),

    // Create a new note
    createFolder: builder.mutation<Folder, Folder>({
      query: (folder) => ({
        url: '/folders',
        method: 'POST',
        body: folder,
      }),
      invalidatesTags: [{ type: 'Folders', id: 'LIST' }],
    }),
    
    // Update an existing note
    
    // Delete a note
    // deleteNote: builder.mutation<string, string>({
    //   query: (id) => ({
    //     url: `/notes/${id}`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: (result, error, id) => [{ type: 'Notes', id: id?.toString() }],
    // }),
  }),
});

// Export hooks for usage in components
export const {
  useGetFoldersQuery,
  useCreateFolderMutation,
} = foldersApi;
