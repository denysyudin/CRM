import api from './config';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../../types';

// Tasks API service
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
  
  create: async (task: CreateTaskPayload): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  
  update: async (id: string, task: UpdateTaskPayload): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export default tasksApi; 