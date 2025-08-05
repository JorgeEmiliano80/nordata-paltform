
import { apiService } from './apiService';
import { API_ENDPOINTS } from '@/config/api';

export interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  processing_result?: any;
  error_message?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  file: FileRecord;
  message: string;
}

class FileService {
  async getFiles(): Promise<FileRecord[]> {
    const response = await apiService.get<FileRecord[]>(API_ENDPOINTS.FILES.LIST);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to fetch files');
  }

  async uploadFile(file: File): Promise<FileRecord> {
    const response = await apiService.uploadFile<FileUploadResponse>(
      API_ENDPOINTS.FILES.UPLOAD,
      file
    );
    
    if (response.success && response.data) {
      return response.data.file;
    }
    
    throw new Error(response.message || 'File upload failed');
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await apiService.delete(API_ENDPOINTS.FILES.DELETE(fileId));
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete file');
    }
  }

  async processFile(fileId: string): Promise<void> {
    const response = await apiService.post(API_ENDPOINTS.FILES.PROCESS(fileId));
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to process file');
    }
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
