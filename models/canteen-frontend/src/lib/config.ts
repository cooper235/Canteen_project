// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// Remove /api from API_URL for base URL
export const BASE_URL = API_URL.replace('/api', '');
