import axios from 'axios';

// Base API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (could redirect to login)
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 