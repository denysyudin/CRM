// Task type definitions
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

// Task creation/update payload types
export type CreateTaskPayload = Omit<Task, 'id'>;
export type UpdateTaskPayload = Partial<Task>; 