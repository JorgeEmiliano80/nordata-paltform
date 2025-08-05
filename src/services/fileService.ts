
import { apiService } from './apiService';
import { API_ENDPOINTS } from '@/config/api';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  databricks_job_id?: string;
  databricks_run_id?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  success: boolean;
  data?: FileRecord;
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
  }>;
  message?: string;
  error?: string;
}

export interface FileOperationResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class FileService {
  async getFiles(): Promise<FileRecord[]> {
    try {
      const response = await apiService.get<FileRecord[]>(API_ENDPOINTS.FILES.LIST);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const response = await apiService.uploadFile<FileRecord>(
        API_ENDPOINTS.FILES.UPLOAD,
        file
      );
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'File upload failed'
        };
      }

      // Transform backend response to match frontend interface
      const backendFile = response.data as any;
      const transformedFile: FileRecord = {
        id: backendFile.id,
        user_id: backendFile.user_id,
        file_name: backendFile.file_name || backendFile.filename,
        file_type: backendFile.file_type || backendFile.mime_type,
        file_size: backendFile.file_size,
        storage_url: backendFile.storage_url,
        status: backendFile.status === 'done' ? 'processed' : backendFile.status,
        databricks_job_id: backendFile.databricks_job_id,
        databricks_run_id: backendFile.databricks_run_id,
        error_message: backendFile.error_message,
        created_at: backendFile.created_at,
        updated_at: backendFile.updated_at
      };

      return {
        success: true,
        data: transformedFile,
        fileId: transformedFile.id,
        validationResult: {
          stats: {
            totalRows: 100, // Mock data for now
            totalColumns: 5,
            emptyRows: 0
          }
        }
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async deleteFile(fileId: string): Promise<FileOperationResponse> {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.FILES.DELETE}/${fileId}`);
      
      return {
        success: response.success,
        error: response.success ? undefined : (response.error || 'File deletion failed')
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  async processFile(fileId: string): Promise<FileOperationResponse> {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.FILES.PROCESS}/${fileId}`);
      
      return {
        success: response.success,
        error: response.success ? undefined : (response.error || 'File processing failed')
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Process failed'
      };
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_ENDPOINTS.FILES.DOWNLOAD}/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('File download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
