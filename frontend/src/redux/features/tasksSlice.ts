import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import taskApi from '../../services/taskApi';

// Define interfaces for the Task state
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project_id?: string; // Added to match API
  assignee?: string; // Added to match API
}

// Backend to frontend mapping
const mapBackendTaskToFrontend = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    status: backendTask.status as 'todo' | 'in-progress' | 'completed',
    priority: backendTask.priority as 'low' | 'medium' | 'high',
    dueDate: backendTask.due_date,
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
    project_id: backendTask.project_id,
    assignee: backendTask.assignee
  };
};

// Frontend to backend mapping
const mapFrontendTaskToBackend = (frontendTask: Partial<Task>): any => {
  const backendTask: any = {
    title: frontendTask.title,
    description: frontendTask.description,
    status: frontendTask.status,
    priority: frontendTask.priority,
    due_date: frontendTask.dueDate,
    project_id: frontendTask.project_id,
    assignee: frontendTask.assignee
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
          updatedAt: new Date().toISOString(),
        };
        
        // If the selected task is being updated, update it as well
        if (state.selectedTask && state.selectedTask.id === action.payload.id) {
          state.selectedTask = {
            ...state.selectedTask,
            ...action.payload,
            updatedAt: new Date().toISOString(),
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