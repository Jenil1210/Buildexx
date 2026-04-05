// Backend API URL configuration
// In development, this uses localhost:8081 directly or through proxy
// In production, this uses the deployed backend URL
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

// Helper to construct full API URLs
export const getApiUrl = (path = '') => {
    if (!path) return API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
