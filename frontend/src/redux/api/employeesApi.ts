import { apiSlice } from './apiSlice';
import { Employee } from '../../types/employee.types.ts';

export const employeesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '/employees',
      transformResponse: (response: Employee[]) => {
        // Take first 5 events
        return response;
      },
      providesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
    createEmployee: builder.mutation<Employee, Employee>({
      query: (employee) => ({
        url: '/employees',
        method: 'POST',
        body: employee,
      }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<Employee, Employee>({
      query: (employee) => ({
        url: `/employees/${employee.id}`,
        method: 'PUT',
        body: employee,
      }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
  }),
});

export const { useGetEmployeesQuery, useUpdateEmployeeMutation, useDeleteEmployeeMutation, useCreateEmployeeMutation } = employeesApi;
