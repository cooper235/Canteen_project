// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

// Remove /api from API_URL for base URL
export const BASE_URL = API_URL.replace('/api', '');
