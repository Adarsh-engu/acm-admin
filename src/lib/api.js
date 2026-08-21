import axios from 'axios';

// The backend is running on port 8080
const API_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
