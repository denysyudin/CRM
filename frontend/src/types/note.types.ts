// Note type definitions
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

// Note creation/update payload types
export type CreateNotePayload = Omit<Note, 'id'>;
export type UpdateNotePayload = Partial<Note>; 