import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import api, { Event } from '../../services/api';

// Define state structure
interface EventsState {
  items: Event[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedEvent: Event | null;
}

// Initial state
const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedEvent: null,
};

// Async thunk for fetching all events
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (projectId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await api.events.getAll(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch events');
    }
  }
);

// Async thunk for fetching a single event by ID
export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.events.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch event');
    }
  }
);

// Async thunk for creating a new event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (event: Omit<Event, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.events.create(event);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create event');
    }
  }
);

// Async thunk for updating an event
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, event }: { id: string, event: Partial<Event> }, { rejectWithValue }) => {
    try {
      const response = await api.events.update(id, event);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update event');
    }
  }
);

// Async thunk for deleting an event
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.events.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete event');
    }
  }
);

// Create the events slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSelectedEvent(state, action: PayloadAction<Event | null>) {
      state.selectedEvent = action.payload;
    },
    clearEvents(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchEvents
    builder.addCase(fetchEvents.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
      state.error = null;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle fetchEventById
    builder.addCase(fetchEventById.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchEventById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.selectedEvent = action.payload;
      state.error = null;
    });
    builder.addCase(fetchEventById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Handle createEvent
    builder.addCase(createEvent.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // Handle updateEvent
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEvent?.id === action.payload.id) {
        state.selectedEvent = action.payload;
      }
    });

    // Handle deleteEvent
    builder.addCase(deleteEvent.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.selectedEvent?.id === action.payload) {
        state.selectedEvent = null;
      }
    });
  }
});

// Export actions
export const { setSelectedEvent, clearEvents } = eventsSlice.actions;

// Export selectors
export const selectAllEvents = (state: RootState) => state.events?.items || [];
export const selectEventById = (state: RootState, id: string) => 
  state.events?.items.find(event => event.id === id);
export const selectSelectedEvent = (state: RootState) => state.events?.selectedEvent;
export const selectEventsStatus = (state: RootState) => state.events?.status || 'idle';
export const selectEventsError = (state: RootState) => state.events?.error;

// Export reducer
export default eventsSlice.reducer; 