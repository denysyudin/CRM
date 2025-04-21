import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import noteApi from '../../services/noteApi';

// Define interfaces for the Note state
export interface Note {
  id: string;
  title: string;
  content: string;
  projectId?: string;
  employeeId?: string;
  createdAt: string;
  updatedAt: string;
  category?: string; // Added to match API
}

// Backend to frontend mapping
const mapBackendNoteToFrontend = (backendNote: any): Note => {
  return {
    id: backendNote.id,
    title: backendNote.title,
    content: backendNote.content || '',
    projectId: backendNote.project_id,
    createdAt: backendNote.created_at,
    updatedAt: backendNote.updated_at,
    category: backendNote.category
  };
};

// Frontend to backend mapping
const mapFrontendNoteToBackend = (frontendNote: Partial<Note>): any => {
  const backendNote: any = {
    title: frontendNote.title,
    content: frontendNote.content,
    project_id: frontendNote.projectId,
    category: frontendNote.category
  };
  
  // Remove undefined properties
  Object.keys(backendNote).forEach(key => 
    backendNote[key] === undefined && delete backendNote[key]
  );
  
  return backendNote;
};

interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (projectId: string | undefined = undefined, { rejectWithValue }) => {
    try {
      return await noteApi.getAllNotes(projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notes');
    }
  }
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async (noteId: string, { rejectWithValue }) => {
    try {
      return await noteApi.getNoteById(noteId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch note');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await noteApi.createNote(note);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create note');
    }
  }
);

export const updateNoteAsync = createAsyncThunk(
  'notes/updateNote',
  async ({ id, ...updates }: Partial<Note> & { id: string }, { rejectWithValue }) => {
    try {
      return await noteApi.updateNote(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update note');
    }
  }
);

export const deleteNoteAsync = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: string, { rejectWithValue }) => {
    try {
      await noteApi.deleteNote(noteId);
      return noteId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete note');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    // Get all notes
    fetchNotesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotesSuccess(state, action: PayloadAction<Note[]>) {
      state.notes = action.payload;
      state.loading = false;
    },
    fetchNotesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Add a new note
    addNote(state, action: PayloadAction<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) {
      const newNote: Note = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.notes.push(newNote);
    },

    // Update a note
    updateNote(state, action: PayloadAction<Partial<Note> & { id: string }>) {
      const index = state.notes.findIndex(note => note.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
        
        // If the selected note is being updated, update it as well
        if (state.selectedNote && state.selectedNote.id === action.payload.id) {
          state.selectedNote = {
            ...state.selectedNote,
            ...action.payload,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    },

    // Delete a note
    deleteNote(state, action: PayloadAction<string>) {
      state.notes = state.notes.filter(note => note.id !== action.payload);
      if (state.selectedNote && state.selectedNote.id === action.payload) {
        state.selectedNote = null;
      }
    },

    // Select a note
    selectNote(state, action: PayloadAction<string>) {
      state.selectedNote = state.notes.find(note => note.id === action.payload) || null;
    },

    // Clear selected note
    clearSelectedNote(state) {
      state.selectedNote = null;
    },
    
    // Filter notes by project
    filterNotesByProject(state, action: PayloadAction<string>) {
      if (action.payload) {
        // Filter logic would typically be in a selector, but we can store the filtered results here
        // or just handle this in the component using a selector
      }
    },
    
    // Filter notes by employee
    filterNotesByEmployee(state, action: PayloadAction<string>) {
      if (action.payload) {
        // Filter logic would typically be in a selector, but we can store the filtered results here
        // or just handle this in the component using a selector
      }
    }
  },
  extraReducers: (builder) => {
    // Handle fetchNotes
    builder.addCase(fetchNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.notes = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchNoteById
    builder.addCase(fetchNoteById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNoteById.fulfilled, (state, action) => {
      state.selectedNote = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchNoteById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle createNote
    builder.addCase(createNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNote.fulfilled, (state, action) => {
      state.notes.push(action.payload);
      state.loading = false;
    });
    builder.addCase(createNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle updateNoteAsync
    builder.addCase(updateNoteAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateNoteAsync.fulfilled, (state, action) => {
      const index = state.notes.findIndex(note => note.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
      if (state.selectedNote && state.selectedNote.id === action.payload.id) {
        state.selectedNote = action.payload;
      }
      state.loading = false;
    });
    builder.addCase(updateNoteAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle deleteNoteAsync
    builder.addCase(deleteNoteAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteNoteAsync.fulfilled, (state, action) => {
      state.notes = state.notes.filter(note => note.id !== action.payload);
      if (state.selectedNote && state.selectedNote.id === action.payload) {
        state.selectedNote = null;
      }
      state.loading = false;
    });
    builder.addCase(deleteNoteAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const {
  fetchNotesStart,
  fetchNotesSuccess,
  fetchNotesFailure,
  addNote,
  updateNote,
  deleteNote,
  selectNote,
  clearSelectedNote,
  filterNotesByProject,
  filterNotesByEmployee,
} = notesSlice.actions;

export default notesSlice.reducer; 