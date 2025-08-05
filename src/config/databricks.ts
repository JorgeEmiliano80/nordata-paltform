
/**
 * Configuración para Databricks + GCP
 * Nueva arquitectura sin Supabase
 */

export const DATABRICKS_CONFIG = {
  // URLs base para diferentes entornos
  WORKSPACE_URL: import.meta.env.VITE_DATABRICKS_WORKSPACE_URL || 'https://your-workspace.cloud.databricks.com',
  API_VERSION: 'v2.1',
  
  // Endpoints principales
  ENDPOINTS: {
    JOBS: '/api/2.1/jobs',
    RUNS: '/api/2.1/jobs/runs',
    CLUSTERS: '/api/2.1/clusters',
    WORKSPACE: '/api/2.1/workspace',
    FILES: '/api/2.1/workspace/import'
  }
};

export const GCP_CONFIG = {
  // Google Cloud Platform
  PROJECT_ID: import.meta.env.VITE_GCP_PROJECT_ID || 'nordata-platform',
  REGION: import.meta.env.VITE_GCP_REGION || 'us-central1',
  
  // Cloud Storage
  STORAGE_BUCKET: import.meta.env.VITE_GCP_STORAGE_BUCKET || 'nordata-files',
  
  // Cloud Functions
  FUNCTIONS_BASE_URL: import.meta.env.VITE_GCP_FUNCTIONS_URL || 'https://us-central1-nordata-platform.cloudfunctions.net',
  
  // BigQuery
  BIGQUERY_DATASET: import.meta.env.VITE_GCP_BIGQUERY_DATASET || 'nordata_analytics'
};

export const API_ENDPOINTS = {
  // Nuevos endpoints para la arquitectura GCP + Databricks
  AUTH: {
    LOGIN: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/auth-login`,
    REGISTER: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/auth-register`,
    REFRESH: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/auth-refresh`,
    LOGOUT: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/auth-logout`,
    PROFILE: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/user-profile`,
  },
  
  FILES: {
    LIST: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/files-list`,
    UPLOAD: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/files-upload`,
    DELETE: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/files-delete`,
    PROCESS: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/files-process`,
    STATUS: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/files-status`,
  },
  
  DATABRICKS: {
    SUBMIT_JOB: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/databricks-submit`,
    JOB_STATUS: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/databricks-status`,
    CANCEL_JOB: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/databricks-cancel`,
  },
  
  ANALYTICS: {
    DASHBOARD: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/analytics-dashboard`,
    INSIGHTS: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/analytics-insights`,
    REPORTS: `${GCP_CONFIG.FUNCTIONS_BASE_URL}/analytics-reports`,
  }
};

export default API_ENDPOINTS;
