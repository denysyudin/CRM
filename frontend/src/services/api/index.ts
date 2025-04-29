// Export all API services
import projectsApi from './projectsApi';
import tasksApi from './tasksApi';

// Re-export everything
export {
  projectsApi,
  tasksApi,
};

// Default export for convenience
export default {
  projects: projectsApi,
  tasks: tasksApi,
}; 