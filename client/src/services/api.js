import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const projectAPI = {
  create: async (name, description) => {
    const response = await api.post('/projects', { name, description });
    return response.data;
  },
  list: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  get: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  update: async (projectId, name, description) => {
    const response = await api.put(`/projects/${projectId}`, { name, description });
    return response.data;
  },
  delete: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
  permanentDelete: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}/permanent`, {
      data: { confirm: 'DELETE' }
    });
    return response.data;
  },
};

export const secretAPI = {
  create: async (projectId, environment, key, value) => {
    const response = await api.post('/secrets', {
      projectId,
      environment,
      key,
      value,
    });
    return response.data;
  },
  list: async (projectId, environment) => {
    const response = await api.get('/secrets', {
      params: { projectId, environment },
    });
    return response.data;
  },
  getValue: async (secretId) => {
    const response = await api.get(`/secrets/${secretId}/value`);
    return response.data;
  },
  update: async (secretId, key, value) => {
    const response = await api.put(`/secrets/${secretId}`, { key, value });
    return response.data;
  },
  delete: async (secretId) => {
    const response = await api.delete(`/secrets/${secretId}`);
    return response.data;
  },
  bulkDelete: async (projectId, environment) => {
    const response = await api.post('/secrets/bulk-delete', {
      projectId,
      environment,
      confirm: 'DELETE'
    });
    return response.data;
  },
};

export const auditAPI = {
  list: async () => {
    const response = await api.get('/audit');
    return response.data;
  },
};

export const runtimeAPI = {
  getSecrets: async (projectId, environment) => {
    const response = await api.post('/runtime/secrets', {
      projectId,
      environment,
    });
    return response.data;
  },
};

export default api;

