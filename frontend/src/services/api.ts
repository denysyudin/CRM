import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type definitions matching backend models
export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  employee_id: string | null;
  description?: string;
  project_id?: string;
  category?: string;
}

export interface Note {
  id: string;
  title: string;
  category?: string;
  project_id?: string;
  employee_id?: string;
  description?: string;
  files?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  due_date: string;
  type: string;
  participants?: string;
  notes?: string;
  project_id?: string;
  employee_id?: string;
  description?: string;
}

export interface Reminder {
  id: string;
  title: string;
  due_date: string;
  priority: string;
  status: boolean;
  project_id?: string;
  employee_id?: string;
  description?: string;
}

export interface File {
  id: string;
  title: string;
  type: string;
  project_id?: string;
  employee_id?: string;
}

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  
  update: async (id: string, project: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (projectId?: string): Promise<Task[]> => {
    const url = projectId ? `/projects/${projectId}/tasks` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  getByProjectId: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks?project_id=${projectId}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks?employee_id=${employeeId}`);
    return response.data;
  },
  
  create: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  
  update: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Notes API
export const notesApi = {
  getAll: async (projectId?: string): Promise<Note[]> => {
    const url = projectId ? `notes/?project_id=${projectId}` : '/notes';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  getByProjectId: async (projectId: string): Promise<Note[]> => {
    const response = await api.get(`/notes?project_id=${projectId}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<Note[]> => {
    const response = await api.get(`/notes?employee_id=${employeeId}`);
    return response.data;
  },

  create: async (note: Omit<Note, 'id'>): Promise<Note> => {
    console.log('API: Creating note with data:', note);
    const response = await api.post('/notes', note);
    console.log('API: Create note response:', response.data);
    return response.data;
  },
  
  update: async (id: string, note: Partial<Note>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

// Events API
export const eventsApi = {
  getAll: async (projectId?: string): Promise<Event[]> => {
    try {
      console.log('API: Fetching all events', projectId ? `for project ${projectId}` : '');
      const queryParams = projectId ? `?project_id=${projectId}` : '';
      const response = await api.get(`/events${queryParams}`);
      console.log('API: Events response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching events:', error);
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getByProjectId: async (projectId: string): Promise<Event[]> => {
    const response = await api.get(`/events?project_id=${projectId}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<Event[]> => {
    const response = await api.get(`/events?employee_id=${employeeId}`);
    return response.data;
  },
  
  create: async (event: Omit<Event, 'id'>): Promise<Event> => {
    try {

      const modifiedEvent = {
        ...event,
      };
      
      console.log('API: Creating event with modified data:', modifiedEvent);
      const response = await api.post('/events', modifiedEvent);
      console.log('API: Create event response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Error creating event:', error);
      throw error;
    }
  },
  
  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    try {
      const modifiedEvent = {
        ...event,      
      };
      
      console.log(`API: Updating event ${id} with modified data:`, modifiedEvent);
      const response = await api.put(`/events/${id}`, modifiedEvent);
      console.log('API: Update event response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`API: Error updating event ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    try {
      console.log(`API: Deleting event ${id}`);
      await api.delete(`/events/${id}`);
      console.log(`API: Event ${id} deleted successfully`);
    } catch (error) {
      console.error(`API: Error deleting event ${id}:`, error);
      throw error;
    }
  },
};

// Reminders API
export const remindersApi = {
  getAll: async (): Promise<Reminder[]> => {
    const response = await api.get('/reminders');
    return response.data;
  },

  getRemindersByProjectId: async (projectId?: string): Promise<Reminder[]> => {
    const url = projectId ? `/reminders/?project_id=${projectId}` : '/reminders';
    const response = await api.get(url);

    return response.data;
  },
  
  getById: async (id: string): Promise<Reminder> => {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  },

  getByProjectId: async (projectId: string): Promise<Reminder[]> => {
    const response = await api.get(`/reminders?project_id=${projectId}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<Reminder[]> => {
    const response = await api.get(`/reminders?employee_id=${employeeId}`);
    return response.data;
  },

  create: async (reminder: Omit<Reminder, 'id'>): Promise<Reminder> => {
    const response = await api.post('/reminders', reminder);
    return response.data;
  },
  
  update: async (id: string, reminder: Partial<Reminder>): Promise<Reminder> => {
    const response = await api.put(`/reminders/${id}`, reminder);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
};

// Files API
export const filesApi = {
  getAll: async (projectId?: string): Promise<File[]> => {
    const url = projectId ? `/projects/${projectId}/files` : '/files';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<File> => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  getByProjectId: async (projectId: string): Promise<File[]> => {
    const response = await api.get(`/files?project_id=${projectId}`);
    return response.data;
  },

  getByEmployeeId: async (employeeId: string): Promise<File[]> => {
    const response = await api.get(`/files?employee_id=${employeeId}`);
    return response.data;
  },
  
  create: async (file: FormData): Promise<File> => {
    const response = await api.post('/files', file, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
  
  // New methods for uploading files related to tasks and notes
  uploadTaskFile: async (fileData: FormData): Promise<File> => {
    const response = await api.post('/files/task', fileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadNoteFile: async (fileData: FormData): Promise<File> => {
    const response = await api.post('/files/note', fileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default {
  projects: projectsApi,
  tasks: tasksApi,
  notes: notesApi,
  events: eventsApi,
  reminders: remindersApi,
  files: filesApi,
}; 