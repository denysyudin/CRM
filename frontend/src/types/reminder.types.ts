// Reminder type definitions
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

// Reminder creation/update payload types
export type CreateReminderPayload = Omit<Reminder, 'id'>;
export type UpdateReminderPayload = Partial<Reminder>; 