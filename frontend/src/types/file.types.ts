// File type definitions
export interface File {
  id: string;
  title: string;
  type: string;
  project_id?: string;
  employee_id?: string;
  note_id?: string;
  event_id?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
  size?: string;
}

// File creation/update payload types
export type UpdateFilePayload = Partial<File>; 