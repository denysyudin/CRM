import axios from 'axios';
import { Note } from '../redux/features/notesSlice';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout
});

// Backend note interface
export interface BackendNote {
  id: string;
  title: string;
  content: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
  category?: string;
}

// Frontend to backend mapping
export const mapNoteToBackend = (note: Partial<Note>): Partial<BackendNote> => {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    project_id: note.projectId,
    category: note.category
  };
};

// Backend to frontend mapping
export const mapNoteFromBackend = (backendNote: BackendNote): Note => {
  return {
    id: backendNote.id,
    title: backendNote.title,
    content: backendNote.content,
    projectId: backendNote.project_id,
    createdAt: backendNote.created_at,
    updatedAt: backendNote.updated_at,
    category: backendNote.category
  };
};

// Notes API
export const noteApi = {
  // Get all notes
  getAllNotes: async (projectId?: string): Promise<Note[]> => {
    try {
      const url = projectId ? `/notes?project_id=${projectId}` : '/notes';
      const response = await api.get<BackendNote[]>(url);
      return response.data.map(mapNoteFromBackend);
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Get note by ID
  getNoteById: async (noteId: string): Promise<Note> => {
    try {
      const response = await api.get<BackendNote>(`/notes/${noteId}`);
      return mapNoteFromBackend(response.data);
    } catch (error) {
      console.error(`Error fetching note ${noteId}:`, error);
      throw error;
    }
  },

  // Create new note
  createNote: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    try {
      const backendNote = mapNoteToBackend(note);
      const response = await api.post<BackendNote>('/notes', backendNote);
      return mapNoteFromBackend(response.data);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Update note
  updateNote: async (noteId: string, updates: Partial<Note>): Promise<Note> => {
    try {
      const backendUpdates = mapNoteToBackend(updates);
      const response = await api.put<BackendNote>(`/notes/${noteId}`, backendUpdates);
      return mapNoteFromBackend(response.data);
    } catch (error) {
      console.error(`Error updating note ${noteId}:`, error);
      throw error;
    }
  },

  // Delete note
  deleteNote: async (noteId: string): Promise<void> => {
    try {
      await api.delete(`/notes/${noteId}`);
    } catch (error) {
      console.error(`Error deleting note ${noteId}:`, error);
      throw error;
    }
  }
};

export default noteApi; 