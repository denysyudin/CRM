// Note type definitions
export interface Note {
  id: string;
  title: string;
  description: string;
  project_id: string;
  employee_id: string;
  category?: string;
  created_at: string;
  files?: File[];
  file_url?: string;
  existingFile?: {
    name: string;
    url: string;
  };
}

// Note creation/update payload types
export type CreateNotePayload = Omit<Note, 'id'> | FormData;
export type UpdateNotePayload = Partial<Note> | FormData;