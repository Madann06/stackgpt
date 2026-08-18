import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
rawUrl = (rawUrl || '').trim().replace(/\/+$/, '');

// Automatically append /api/v1 if not present in the URL
if (!rawUrl.endsWith('/api/v1') && !rawUrl.includes('/api/')) {
  rawUrl += '/api/v1';
}

export const API_BASE_URL = rawUrl;

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for cloud backend spin-up
});

// Request Interceptor: Inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token if necessary
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
