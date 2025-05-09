import { apiSlice } from './apiSlice';
import { Project } from '../../services/api';

export const projectsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Projects' as const, id })),
              { type: 'Projects', id: 'LIST' },
              { type: 'Tasks', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),
    
    // Get active projects
    getActiveProjects: builder.query<Project[], void>({
      query: () => '/projects?status=completed',
      providesTags: (result) => 
        result
          ? [...result.map(({ id }) => ({ type: 'Projects' as const, id }))]
          : [{ type: 'Projects', id: 'LIST' }],
    }),
    // Get a single project by ID
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Projects', id: id?.toString() || "LIST" }],
    }),
    
    // Create a new project
    createProject: builder.mutation<Project, Omit<Project, 'id'>>({
      query: (newProject) => ({
        url: '/projects',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),
    
    // Update an existing project
    updateProject: builder.mutation<Project, Partial<Project> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Projects', id: id?.toString() }],
    }),
    
    // Delete a project
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Projects', id: id?.toString() }],
    }),
    
    // Get all tasks for a project
    getProjectTasks: builder.query<any[], string>({
      query: (projectId) => `/projects/${projectId}/tasks`,
      providesTags: (result, error, projectId) => [
        { type: 'Tasks', id: 'LIST' },
        { type: 'Projects', id: projectId }
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProjectsQuery,
  useGetActiveProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTasksQuery,
} = projectsApi; 
