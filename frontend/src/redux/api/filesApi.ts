import { File } from '../../types';
import { apiSlice } from './apiSlice';

export const filesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<File[], void>({
      query: () => '/files',
      providesTags: [{ type: 'Files', id: 'LIST' }],
    }),

    getFileByProjectId: builder.query<File[], string>({
      query: (projectId) => `/files?project_id=${projectId}`,
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Files' as const, id })),
              { type: 'Files', id: 'LIST' },
            ]
          : [{ type: 'Files', id: 'LIST' }],
    }),
    
    createFile: builder.mutation<File, FormData>({
      query: (file) => ({
        url: '/files',
        method: 'POST',
        body: file,
      }),
      invalidatesTags: [{ type: 'Files', id: 'LIST' }],
    }),

    deleteFile: builder.mutation<File, File>({
      query: (file) => ({
        url: `/files/${file.id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Files', id: 'LIST' }],
    }), 
  }),
});

export const { 
  useGetFilesQuery, 
  useGetFileByProjectIdQuery,
  useCreateFileMutation, 
  useDeleteFileMutation 
} = filesApi;
