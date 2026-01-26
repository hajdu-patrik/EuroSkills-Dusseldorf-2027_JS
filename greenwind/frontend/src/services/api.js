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

export const api = {
  // Requesting all projects
  getProjects: () => axios.get(`${BASE_URL}/projects`),
  
  // Requesting a specific project by ID
  getProject: (id) => axios.get(`${BASE_URL}/projects/${id}`),
  
  // Updating a project
  updateProject: (id, data) => axios.put(`${BASE_URL}/projects/${id}`, data)
};