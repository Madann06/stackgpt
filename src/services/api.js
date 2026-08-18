import axios from 'axios';

// Resolve API base URL: prioritized by VITE_API_BASE_URL env, falling back to local dev or production Render
const defaultBaseUrl = import.meta.env.DEV
  ? 'http://127.0.0.1:8000/api/v1'
  : 'https://stackgpt-backend.onrender.com/api/v1';

let rawUrl = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).trim().replace(/\/+$/, '');

// Ensure /api/v1 prefix is consistently present
if (!rawUrl.endsWith('/api/v1') && !rawUrl.includes('/api/')) {
  rawUrl += '/api/v1';
}

export const API_BASE_URL = rawUrl;

// Create Axios Instance with extended timeout for cloud spin-ups (e.g. Render free tier)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout
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

// Response Interceptor: Production error logging & Token Expiration Handling (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const fullUrl = (config.baseURL || '') + (config.url || '');
    const status = error.response ? error.response.status : 'NETWORK_TIMEOUT/UNREACHABLE';
    const detail = error.response?.data?.detail || error.message;

    // Log diagnostic error details to browser console for developer troubleshooting
    if (import.meta.env.DEV || (error.response && error.response.status >= 500) || !error.response) {
      console.warn(`[API Connection] ${config.method?.toUpperCase()} ${fullUrl} [Status: ${status}]:`, detail);
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
