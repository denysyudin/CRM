// Export all common components
export { default as Button } from './Button';
export { default as ReminderModal } from '../forms/ReminderModal';
// Import types from the correct locations
import { Reminder } from '../../types/reminder.types';
import { Project } from '../../types/project.types';
import { Employee } from '../../types/employee.types';

// Re-export types with the expected names
export type { Reminder as ReminderData };
export type { Project };
export type { Employee };
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
