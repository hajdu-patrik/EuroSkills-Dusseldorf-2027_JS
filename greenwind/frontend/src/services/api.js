import axios from 'axios';
const API_URL = 'http://localhost:3000';

export const api = {
  // Requesting all projects
  getProjects: () => axios.get(`${API_URL}/projects`),
  
  // Requesting a specific project by ID
  getProject: (id) => axios.get(`${API_URL}/projects/${id}`),
  
  // Updating a project
  updateProject: (id, data) => axios.put(`${API_URL}/projects/${id}`, data)
};