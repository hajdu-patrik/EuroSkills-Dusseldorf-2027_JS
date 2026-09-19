import axios from 'axios';

// Backend API szolgáltatás kezelése
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the base URL for debugging purposes
console.log(`📡 API Service connecting to: ${BASE_URL}`);

// Axios instance creation
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach the authentication token (if present) to every outgoing request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
  // Requesting all projects
  getProjects: () => apiClient.get('/projects'),
  
  // Requesting a specific project by ID
  getProject: (id) => apiClient.get(`/projects/${id}`),
  
  // Updating a project
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data)
};