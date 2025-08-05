
import { apiService } from './apiService';
import { API_ENDPOINTS } from '@/config/api';

export interface FileRecord {
  id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  processing_result?: any;
  error_message?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  uploaded_at: string;
}

export interface FileUploadResponse {
  file: FileRecord;
  message: string;
  success: boolean;
  fileId?: string;
  validationResult?: {
    stats: {
      totalRows: number;
      totalColumns: number;
      emptyRows: number;
    };
  };
  validationErrors?: Array<{
    message: string;
    type: string;
  }>;
}

class FileService {
  async getFiles(): Promise<FileRecord[]> {
    const response = await apiService.get<FileRecord[]>(API_ENDPOINTS.FILES.LIST);
    
    if (response.success && response.data) {
      // Transform backend response to match frontend expectations
      return response.data.map(file => ({
        ...file,
        file_name: file.filename || file.file_name,
        file_type: file.mime_type || file.file_type,
        uploaded_at: file.created_at,
        status: file.status === 'processed' ? 'done' : file.status
      }));
    }
    
    throw new Error(response.message || 'Failed to fetch files');
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const response = await apiService.uploadFile<FileUploadResponse>(
      API_ENDPOINTS.FILES.UPLOAD,
      file
    );
    
    if (response.success && response.data) {
      return {
        ...response.data,
        success: true,
        fileId: response.data.file.id
      };
    }
    
    throw new Error(response.message || 'File upload failed');
  }

  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    const response = await apiService.delete(API_ENDPOINTS.FILES.DELETE(fileId));
    
    return { success: response.success };
  }

  async processFile(fileId: string): Promise<{ success: boolean }> {
    const response = await apiService.post(API_ENDPOINTS.FILES.PROCESS(fileId));
    
    return { success: response.success };
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.FILES.DOWNLOAD(fileId), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const fileService = new FileService();
export default fileService;
