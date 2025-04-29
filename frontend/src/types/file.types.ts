// File type definitions
export interface File {
  id: string;
  title: string;
  type: string;
  project_id?: string;
  employee_id?: string;
}

// File creation/update payload types
export type UpdateFilePayload = Partial<File>; 