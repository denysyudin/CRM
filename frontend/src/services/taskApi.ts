import axios from 'axios';
import { Task } from '../redux/features/tasksSlice';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout
});

// Backend task interface
export interface BackendTask {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: string;
}

// Frontend to backend mapping
export const mapTaskToBackend = (task: Partial<Task>): Partial<BackendTask> => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    project_id: task.project_id,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    assignee: task.assignee
  };
};

// Backend to frontend mapping
export const mapTaskFromBackend = (backendTask: BackendTask): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description,
    status: backendTask.status as 'todo' | 'in-progress' | 'completed',
    priority: backendTask.priority as 'low' | 'medium' | 'high',
    dueDate: backendTask.due_date,
    createdAt: backendTask.created_at,
    updatedAt: backendTask.updated_at,
    project_id: backendTask.project_id,
    assignee: backendTask.assignee
  };
};

// Tasks API
export const taskApi = {
  // Get all tasks
  getAllTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      const url = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
      const response = await api.get<BackendTask[]>(url);
      return response.data.map(mapTaskFromBackend);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      const response = await api.get<BackendTask>(`/tasks/${taskId}`);
      return mapTaskFromBackend(response.data);
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  },

  // Create new task
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const backendTask = mapTaskToBackend(task);
      const response = await api.post<BackendTask>('/tasks', backendTask);
      return mapTaskFromBackend(response.data);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    try {
      const backendUpdates = mapTaskToBackend(updates);
      const response = await api.put<BackendTask>(`/tasks/${taskId}`, backendUpdates);
      return mapTaskFromBackend(response.data);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }
};

export default taskApi; 