// Application configuration

// API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Default pagination settings
const DEFAULT_PAGE_SIZE = 10;

// Application configuration object
const config = {
  api: {
    baseUrl: API_URL,
    endpoints: {
      tasks: `${API_URL}/tasks`,
      notes: `${API_URL}/notes`,
      projects: `${API_URL}/projects`,
      events: `${API_URL}/events`,
      reminders: `${API_URL}/reminders`,
      files: `${API_URL}/files`
    },
    timeout: 10000 // 10 seconds
  },
  pagination: {
    defaultPageSize: DEFAULT_PAGE_SIZE,
    pageSizeOptions: [5, 10, 20, 50, 100]
  },
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm'
};

export default config; 