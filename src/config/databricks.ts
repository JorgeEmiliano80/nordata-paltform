
/**
 * Configuración para Databricks y GCP Cloud Functions
 * Nueva arquitectura migrada de Supabase
 */

// URLs base para los diferentes servicios
export const GCP_CONFIG = {
  PROJECT_ID: import.meta.env.VITE_GCP_PROJECT_ID || 'nordata-platform',
  REGION: import.meta.env.VITE_GCP_REGION || 'us-central1',
  CLOUD_FUNCTIONS_URL: import.meta.env.VITE_GCP_CLOUD_FUNCTIONS_URL || 'https://us-central1-nordata-platform.cloudfunctions.net'
};

export const DATABRICKS_CONFIG = {
  WORKSPACE_URL: import.meta.env.VITE_DATABRICKS_WORKSPACE_URL || 'https://adb-workspace.cloud.databricks.com',
  TOKEN: import.meta.env.VITE_DATABRICKS_TOKEN || '',
  CLUSTER_ID: import.meta.env.VITE_DATABRICKS_CLUSTER_ID || '',
  WAREHOUSE_ID: import.meta.env.VITE_DATABRICKS_WAREHOUSE_ID || ''
};

export const FIREBASE_CONFIG = {
  API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-login`,
    REGISTER: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-register`,
    LOGOUT: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-logout`,
    REFRESH: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-refresh`,
    PROFILE: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-profile`,
    CREATE_MASTER: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/auth-create-master`
  },
  
  // Gestión de archivos
  FILES: {
    UPLOAD: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/files-upload`,
    LIST: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/files-list`,
    DELETE: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/files-delete`,
    PROCESS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/files-process`,
    STATUS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/files-status`
  },

  // Databricks
  DATABRICKS: {
    JOBS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/databricks-jobs`,
    CLUSTERS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/databricks-clusters`,
    WAREHOUSES: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/databricks-warehouses`,
    EXECUTE_QUERY: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/databricks-query`,
    JOB_STATUS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/databricks-job-status`
  },

  // Administración
  ADMIN: {
    USERS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/admin-users`,
    INVITES: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/admin-invites`,
    SETTINGS: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/admin-settings`
  },

  // Chat/AI
  CHATBOT: {
    CHAT: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/chatbot-message`,
    HISTORY: `${GCP_CONFIG.CLOUD_FUNCTIONS_URL}/chatbot-history`
  }
};

// Configuraciones adicionales
export const APP_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FILE_TYPES: ['csv', 'xlsx', 'json', 'parquet'],
  PAGINATION_SIZE: 20,
  REQUEST_TIMEOUT: 30000 // 30 segundos
};
