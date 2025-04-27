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
  name: string;
  icon: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  tasks: string[];
  notes: string[];
  events: string[];
  reminders: string[];
  files: string[];
}

export interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string;
  employee_id: string | null;
  description?: string;
  project_id?: string;
}

export interface Note {
  id: string;
  title: string;
  date: string;
  category: string;
  project: string;
  content?: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  participants?: string;
  notes?: string;
  projectId?: string;
}

export interface Reminder {
  id: string;
  name: string;
  dueDate: string;
  priority: string;
  projectId?: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  projectId?: string;
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
    const url = projectId ? `/projects/${projectId}/notes` : '/notes';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  create: async (note: Omit<Note, 'id'>): Promise<Note> => {
    const response = await api.post('/notes', note);
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
    const url = projectId ? `/projects/${projectId}/events` : '/events';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  create: async (event: Omit<Event, 'id'>): Promise<Event> => {
    const response = await api.post('/events', event);
    return response.data;
  },
  
  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// Reminders API
export const remindersApi = {
  getAll: async (projectId?: string): Promise<Reminder[]> => {
    const url = projectId ? `/projects/${projectId}/reminders` : '/reminders';
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id: string): Promise<Reminder> => {
    const response = await api.get(`/reminders/${id}`);
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
};

export default {
  projects: projectsApi,
  tasks: tasksApi,
  notes: notesApi,
  events: eventsApi,
  reminders: remindersApi,
  files: filesApi,
}; 