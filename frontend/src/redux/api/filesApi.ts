import { File } from '../../types';
import { apiSlice } from './apiSlice';

export const filesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<File[], void>({
      query: () => '/files',
      providesTags: [{ type: 'Files', id: 'LIST' }],
    }),
    createFile: builder.mutation<File, File>({
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

export const { useGetFilesQuery, useCreateFileMutation, useDeleteFileMutation } = filesApi;
