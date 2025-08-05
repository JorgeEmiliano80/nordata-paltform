
// Configuración actualizada para usar Supabase exclusivamente
const SUPABASE_URL = 'https://sveaehifwnoetwfxkasn.supabase.co';

export const API_ENDPOINTS = {
  // Supabase Auth endpoints (ya manejados por el cliente de Supabase)
  AUTH: {
    LOGIN: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    REGISTER: `${SUPABASE_URL}/auth/v1/signup`,
    REFRESH: `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    LOGOUT: `${SUPABASE_URL}/auth/v1/logout`,
    PROFILE: `${SUPABASE_URL}/rest/v1/profiles`,
  },
  
  // Supabase Functions endpoints
  FILES: {
    LIST: `${SUPABASE_URL}/rest/v1/files`,
    UPLOAD: `${SUPABASE_URL}/functions/v1/upload-file`,
    DELETE: `${SUPABASE_URL}/functions/v1/delete-file`,
    PROCESS: `${SUPABASE_URL}/functions/v1/process-file`,
  },
  
  // Edge Functions
  ADMIN: {
    USERS: `${SUPABASE_URL}/functions/v1/admin-get-users`,
    CREATE_USER: `${SUPABASE_URL}/functions/v1/admin-create-user`,
    INVITE: `${SUPABASE_URL}/functions/v1/admin-invite-user`,
  },
  
  CHATBOT: {
    CHAT: `${SUPABASE_URL}/functions/v1/chatbot`,
  },
};

export default SUPABASE_URL;
