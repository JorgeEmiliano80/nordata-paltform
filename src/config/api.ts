
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  
  // Users endpoints
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
    INVITE: `${API_BASE_URL}/users/invite`,
  },
  
  // Files endpoints
  FILES: {
    LIST: `${API_BASE_URL}/files`,
    UPLOAD: `${API_BASE_URL}/files/upload`,
    DELETE: (id: string) => `${API_BASE_URL}/files/${id}`,
    DOWNLOAD: (id: string) => `${API_BASE_URL}/files/${id}/download`,
    PROCESS: (id: string) => `${API_BASE_URL}/files/${id}/process`,
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    ANALYTICS: `${API_BASE_URL}/admin/analytics`,
  },
  
  // Chatbot endpoints
  CHATBOT: {
    CHAT: `${API_BASE_URL}/chatbot/chat`,
    HISTORY: `${API_BASE_URL}/chatbot/history`,
  },
  
  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: `${API_BASE_URL}/analytics/dashboard`,
    BEHAVIOR: `${API_BASE_URL}/analytics/behavior`,
    SEGMENTS: `${API_BASE_URL}/analytics/segments`,
  },
};

export default API_BASE_URL;
