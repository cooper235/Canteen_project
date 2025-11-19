import { API_URL, BASE_URL } from '@/lib/config';
// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '${API_URL}';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '${BASE_URL}';

// Remove /api from API_URL for base URL
export const BASE_URL = API_URL.replace('/api', '');
