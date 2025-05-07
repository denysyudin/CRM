// File type definitions
export interface File {
  id: string;
  title: string;
  file_type: string;
  file_path: string;
  file_size: number;
  project_id?: string;
  employee_id?: string;
  note_id?: string;
  task_id?: string;
  created_at?: string;
}

// File creation/update payload types
export type UpdateFilePayload = Partial<File>; 