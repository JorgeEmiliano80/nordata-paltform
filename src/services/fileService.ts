
import { supabase } from '@/integrations/supabase/client';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Create file record
      const { data: fileRecord, error: recordError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_url: uploadData.path,
          status: 'uploaded',
        })
        .select()
        .single();

      if (recordError) {
        throw new Error(recordError.message);
      }

      return {
        success: true,
        data: fileRecord,
        fileId: fileRecord.id,
        validationResult: {
          stats: {
            totalRows: 0,
            totalColumns: 0,
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use the cleanup function
      const { error } = await supabase.rpc('cleanup_file_data', {
        file_uuid: fileId
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
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
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { fileId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: data.success,
        error: data.success ? undefined : data.error
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .select('storage_url')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fileError || !fileRecord) {
        throw new Error('File not found');
      }

      // Download from storage
      const { data, error } = await supabase.storage
        .from('data-files')
        .download(fileRecord.storage_url);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
