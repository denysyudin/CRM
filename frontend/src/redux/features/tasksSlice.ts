import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import taskApi from '../../services/taskApi';

// Define interfaces for the Task state
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  project_id?: string; // Added to match API
  employee_id?: string; // Added to match API
}

// Backend to frontend mapping
const mapBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    status: backendTask.status as string,
    priority: backendTask.priority as string,
    due_date: backendTask.due_date,
    created_at: backendTask.created_at,
    project_id: backendTask.project_id,
    employee_id: backendTask.employee_id
  };
};

// Frontend to backend mapping
const mapFrontendTaskToBackend = (frontendTask: Partial<Task>): any => {
  const backendTask: any = {
    title: frontendTask.title,
    description: frontendTask.description,
    status: frontendTask.status,
    priority: frontendTask.priority,
    due_date: frontendTask.due_date,
    project_id: frontendTask.project_id,
    employee_id: frontendTask.employee_id
  };
  
  // Remove undefined properties
  Object.keys(backendTask).forEach(key => 
    backendTask[key] === undefined && delete backendTask[key]
  );
  
  return backendTask;
};

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      return await taskApi.getAllTasks(projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await taskApi.getTaskById(taskId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await taskApi.createTask(task);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create task');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...updates }: Partial<Task> & { id: string }, { rejectWithValue }) => {
    try {
      return await taskApi.updateTask(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update task');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Get all tasks
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
      state.loading = false;
    },
    fetchTasksFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add a new task
    addTask(state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) {
      const newTask: Task = {
        id: Date.now().toString(),
        ...action.payload,
        created_at: new Date().toISOString(),
      };
      state.tasks.push(newTask);
    },

    // Update a task
    updateTask(state, action: PayloadAction<Partial<Task> & { id: string }>) {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload,
        };
        
        // If the selected task is being updated, update it as well
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          state.selectedTask = {
            ...state.selectedTask,
            ...action.payload,
          };
        }
      }
    },

    // Delete a task
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.selectedTask && state.selectedTask.id === action.payload) {
        state.selectedTask = null;
      }
    },

    // Select a task
    selectTask(state, action: PayloadAction<string>) {
      state.selectedTask = state.tasks.find(task => task.id === action.payload) || null;
    },

    // Clear selected task
    clearSelectedTask(state) {
      state.selectedTask = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchTasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchTaskById
    builder.addCase(fetchTaskById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTaskById.fulfilled, (state, action) => {
      state.selectedTask = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchTaskById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle createTask
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
      state.loading = false;
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle updateTaskAsync
    builder.addCase(updateTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTaskAsync.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask && state.selectedTask.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
      state.loading = false;
    });
    builder.addCase(updateTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle deleteTaskAsync
    builder.addCase(deleteTaskAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTaskAsync.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.selectedTask && state.selectedTask.id === action.payload) {
        state.selectedTask = null;
      }
      state.loading = false;
    });
    builder.addCase(deleteTaskAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  selectTask,
  clearSelectedTask,
} = tasksSlice.actions;

export default tasksSlice.reducer; 