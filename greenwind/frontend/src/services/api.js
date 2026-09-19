import axios from 'axios';

// Backend API szolgáltatás kezelése
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the base URL for debugging purposes
console.log(`📡 API Service connecting to: ${BASE_URL}`);

// API token used to authenticate requests against the backend
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Axios instance creation
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    },
});

export const api = {
  // Requesting all projects
  getProjects: () => apiClient.get('/projects'),
  
  // Requesting a specific project by ID
  getProject: (id) => apiClient.get(`/projects/${id}`),
  
  // Updating a project
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data)
};