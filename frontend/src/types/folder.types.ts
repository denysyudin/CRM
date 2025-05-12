// Folder type definitions
export interface Folder {
  id?: string;
  title: string;
  parent: string;
}

// Folder creation/update payload types
export type CreateFolderPayload = Omit<Folder, 'id'>;