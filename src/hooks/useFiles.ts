
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  databricks_job_id?: string;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  error_message?: string;
  uploaded_at: string;
  processed_at?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('Error al cargar archivos');
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

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
      await fetchFiles();
      return { success: true, fileId: fileRecord.id };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir archivo');
      return { success: false };
    } finally {
      setUploading(false);
    }
  };

  const processFile = async (fileId: string) => {
    try {
      // Actualizar estado a processing
      const { error: updateError } = await supabase
        .from('files')
        .update({ status: 'processing' })
        .eq('id', fileId);

      if (updateError) {
        console.error('Error updating file status:', updateError);
        toast.error('Error al iniciar procesamiento');
        return { success: false };
      }

      // Llamar a la función de procesamiento
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { fileId }
      });

      if (error) {
        console.error('Error processing file:', error);
        toast.error('Error al procesar archivo');
        
        // Actualizar estado a error
        await supabase
          .from('files')
          .update({ 
            status: 'error',
            error_message: error.message 
          })
          .eq('id', fileId);
          
        return { success: false };
      }

      toast.success('Archivo enviado a procesamiento');
      await fetchFiles();
      return { success: true };
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar archivo');
      return { success: false };
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      // Usar función de limpieza que elimina todo lo relacionado
      const { error } = await supabase.rpc('cleanup_file_data', {
        file_uuid: fileId
      });

      if (error) {
        console.error('Error deleting file:', error);
        toast.error('Error al eliminar archivo');
        return { success: false };
      }

      toast.success('Archivo eliminado exitosamente');
      await fetchFiles();
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar archivo');
      return { success: false };
    }
  };

  const getFileInsights = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching insights:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    loading,
    uploading,
    uploadFile,
    processFile,
    deleteFile,
    getFileInsights,
    refetchFiles: fetchFiles
  };
};
