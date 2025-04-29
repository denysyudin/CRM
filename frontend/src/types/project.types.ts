// Project type definitions
export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

// Project creation/update payload types
export type CreateProjectPayload = Omit<Project, 'id'>;
export type UpdateProjectPayload = Partial<Project>; 