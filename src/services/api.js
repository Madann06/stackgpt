import axios from 'axios';

/**
 * Robust API Base URL resolver.
 * Handles:
 * 1. Missing VITE_API_BASE_URL (defaults to localhost:8000/api/v1 in dev, stackgpt-backend.onrender.com/api/v1 in prod).
 * 2. Missing '/api/v1' suffix (e.g. 'https://stackgpt-backend.onrender.com' -> automatically normalizes to '.../api/v1').
 * 3. Trailing slashes.
 */
export const getApiBaseUrl = () => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  
  if (!envUrl) {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );
    return isLocal ? 'http://localhost:8000/api/v1' : 'https://stackgpt-backend.onrender.com/api/v1';
  }

  // Remove trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');

  // Ensure /api/v1 suffix is present
  if (!envUrl.endsWith('/api/v1')) {
    if (envUrl.endsWith('/api')) {
      envUrl = `${envUrl}/v1`;
    } else {
      envUrl = `${envUrl}/api/v1`;
    }
  }

  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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
      const url = error.config?.url || '';
      if (!url.includes('/login') && !url.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

