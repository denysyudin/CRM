import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api from '../../services/api';

// Define the Reminder interface
export interface Reminder {
  id: string;
  name: string;
  dueDate: string;
  priority: string;
  completed?: boolean;
  projectId?: string;
}

// Define state structure
interface RemindersState {
  items: Reminder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedReminder: Reminder | null;
}

// Initial state
const initialState: RemindersState = {
  items: [],
  status: 'idle',
  error: null,
  selectedReminder: null,
};

// Async thunk for fetching all reminders
export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async (projectId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await api.reminders.getAll(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch reminders');
    }
  }
);

// Async thunk for fetching a single reminder by ID
export const fetchReminderById = createAsyncThunk(
  'reminders/fetchReminderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.reminders.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch reminder');
    }
  }
);

// Async thunk for creating a new reminder
export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (reminder: Omit<Reminder, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.reminders.create(reminder);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create reminder');
    }
  }
);

// Async thunk for updating a reminder
export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async ({ id, reminder }: { id: string, reminder: Partial<Reminder> }, { rejectWithValue }) => {
    try {
      const response = await api.reminders.update(id, reminder);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update reminder');
    }
  }
);

// Async thunk for deleting a reminder
export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.reminders.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete reminder');
    }
  }
);

// Create the reminders slice
const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setSelectedReminder(state, action: PayloadAction<Reminder | null>) {
      state.selectedReminder = action.payload;
    },
    clearReminders(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchReminders
    builder.addCase(fetchReminders.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchReminders.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
      state.error = null;
    });
    builder.addCase(fetchReminders.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle fetchReminderById
    builder.addCase(fetchReminderById.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchReminderById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.selectedReminder = action.payload;
      state.error = null;
    });
    builder.addCase(fetchReminderById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle createReminder
    builder.addCase(createReminder.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // Handle updateReminder
    builder.addCase(updateReminder.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedReminder?.id === action.payload.id) {
        state.selectedReminder = action.payload;
      }
    });

    // Handle deleteReminder
    builder.addCase(deleteReminder.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.selectedReminder?.id === action.payload) {
        state.selectedReminder = null;
      }
    });
  }
});

// Export actions
export const { setSelectedReminder, clearReminders } = remindersSlice.actions;

// Export selectors
export const selectAllReminders = (state: RootState) => state.reminders.items;
export const selectReminderById = (state: RootState, id: string) => 
  state.reminders.items.find(reminder => reminder.id === id);
export const selectSelectedReminder = (state: RootState) => state.reminders.selectedReminder;
export const selectRemindersStatus = (state: RootState) => state.reminders.status;
export const selectRemindersError = (state: RootState) => state.reminders.error;

// Export reducer
export default remindersSlice.reducer; 