import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { Note } from '../../services/api';

// Define state structure
interface NotesState {
  items: Note[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotesState = {
  items: [],
  status: 'idle',
  error: null
};

// Fetch notes (optionally filtered by project)
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (projectId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await api.notes.getAll(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
    }
  }
);

// Create a new note
export const createNote = createAsyncThunk(
  'notes/createNote',
  async (note: Omit<Note, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.notes.create(note);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create note');
    }
  }
);

// Update an existing note
export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, note }: { id: string; note: Partial<Note> }, { rejectWithValue }) => {
    try {
      const response = await api.notes.update(id, note);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update note');
    }
  }
);

// Delete a note
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.notes.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Create note
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(note => note.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export default notesSlice.reducer;