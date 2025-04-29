import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectsApi, Project as ApiProject } from '../../services/api';

// Define the Project interface for the Redux state
export interface ProjectCategory {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  categories: ProjectCategory[];
}

interface ProjectsState {
  items: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
  error: null
};

// Helper function to transform API projects to our Redux model
const mapApiProjectToReduxProject = (apiProject: ApiProject): Project => {
  return {
    id: apiProject.id,
    name: apiProject.title,
    categories: [] // Map categories if they exist in your API response
  };
};

// Async thunk for fetching projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const apiProjects = await projectsApi.getAll();
      // Transform API projects to the format expected by the Redux state
      return apiProjects.map(mapApiProjectToReduxProject);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch projects';
      });
  }
});

export default projectsSlice.reducer; 