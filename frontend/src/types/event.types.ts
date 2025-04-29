// Event type definitions
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

// Event creation/update payload types
export type CreateEventPayload = Omit<Event, 'id'>;
export type UpdateEventPayload = Partial<Event>; 