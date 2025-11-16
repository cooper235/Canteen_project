import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: false, // Set to false for simpler CORS
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response) {
        // Server responded with error status
        console.error('API Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response
        console.error('API No Response - Network Error');
        console.error('Request details:', {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        });
      } else {
        // Something else happened
        console.error('API Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;