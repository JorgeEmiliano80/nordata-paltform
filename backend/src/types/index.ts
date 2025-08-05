
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  industry?: string;
  role: 'admin' | 'client';
  is_active: boolean;
  accepted_terms: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
  industry?: string;
  role?: 'admin' | 'client';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  status: 'uploaded' | 'processing' | 'done' | 'error' | 'cancelled';
  databricks_job_id?: string;
  error_message?: string;
  uploaded_at: Date;
  processed_at?: Date;
  metadata?: any;
}

export interface ProcessFileData {
  fileId: string;
  userId: string;
  filePath: string;
  fileName: string;
  fileType: string;
}

export interface Insight {
  id: string;
  file_id: string;
  insight_type: 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'summary';
  title: string;
  description: string;
  data: any;
  confidence_score: number;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  file_id?: string;
  message: string;
  response: string;
  is_user_message: boolean;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_file_id?: string;
  created_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
