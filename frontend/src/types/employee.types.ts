// Employee type definitions
export interface Employee {
  id: string;
  name: string;
  project_id?: string;
  role?: string;
}

// Note creation/update payload types
export type CreateEmployeePayload = Omit<Employee, 'id'>;
export type UpdateEmployeePayload = Partial<Employee>; 