// File type definitions
export interface File {
  id: string;
  title: string;
  file_type: string;
  file_path: string;
  file_size: string;
  project_id?: string;
  employee_id?: string;
  note_id?: string;
  task_id?: string;
  created_at?: string;
  folder_id: string;
}

// File creation/update payload types
export type UpdateFilePayload = Partial<File>; 