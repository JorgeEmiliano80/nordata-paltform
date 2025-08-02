
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  created_at: string;
  updated_at: string;
  uploaded_at: string;
  processed_at: string | null;
  error_message: string | null;
  databricks_job_id: string | null;
  metadata: any;
}

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return { success: false };
      }

      // Validar tipo de archivo
      const allowedTypes = ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no válido. Solo se permiten CSV, JSON y XLSX');
        return { success: false };
      }

      // Subir archivo a Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Error al subir archivo');
        return { success: false };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('data-files')
        .getPublicUrl(fileName);

      // Guardar información del archivo en la base de datos
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_url: publicUrl,
          status: 'uploaded',
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving file record:', dbError);
        toast.error('Error al guardar información del archivo');
        return { success: false };
      }

      toast.success('Archivo subido exitosamente');
      return { success: true, fileId: fileRecord.id };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir archivo');
      return { success: false };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFile
  };
};
