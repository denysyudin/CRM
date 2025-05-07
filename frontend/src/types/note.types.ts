// Note type definitions
export interface Note {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  employee_id: string | null;
  category?: string;
  created_at: string;
  file?: File[] | null;
  file_url?: string;
  existingFile?: {
    name: string;
    url: string;
  };
  status_code?: number;
}

// Note creation/update payload types
export type CreateNotePayload = Omit<Note, 'id'> | FormData;
export type UpdateNotePayload = Partial<Note> | FormData;