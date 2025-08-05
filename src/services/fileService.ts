
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
  error_message?: string;
  uploaded_at: string;
  processed_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export class FileService {
  async uploadFile(file: File): Promise<{ data?: FileRecord; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file);

      if (uploadError) {
        return { error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      // Create file record
      const { data, error } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_url: publicUrl,
          status: 'uploaded'
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Map database status to interface status
      const mappedData: FileRecord = {
        ...data,
        status: data.status === 'done' ? 'processed' : data.status as 'uploaded' | 'processing' | 'processed' | 'error'
      };

      return { data: mappedData };
    } catch (error: any) {
      return { error: error.message || 'Upload failed' };
    }
  }

  async getFiles(): Promise<FileRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      // Map database status to interface status
      return data?.map(file => ({
        ...file,
        status: file.status === 'done' ? 'processed' : file.status as 'uploaded' | 'processing' | 'processed' | 'error'
      })) || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }

  async getFile(id: string): Promise<FileRecord | null> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      // Map database status to interface status
      return {
        ...data,
        status: data.status === 'done' ? 'processed' : data.status as 'uploaded' | 'processing' | 'processed' | 'error'
      };
    } catch (error) {
      return null;
    }
  }

  async processFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { fileId }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const fileService = new FileService();
