
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileData {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  storage_url: string;
  databricks_job_id: string | null;
  uploaded_at: string;
  processed_at: string | null;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  error_message: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  insights?: InsightData[];
}

export interface InsightData {
  id: string;
  file_id: string;
  insight_type: 'cluster' | 'anomaly' | 'trend' | 'summary' | 'recommendation';
  title: string;
  description: string | null;
  data: any;
  confidence_score: number | null;
  created_at: string;
}

export const useFiles = (userId?: string) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [userId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar si es admin para mostrar todos los archivos
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('files')
        .select(`
          *,
          insights (*)
        `)
        .order('uploaded_at', { ascending: false });

      // Si no es admin, solo mostrar archivos del usuario
      if (profile?.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

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
      if (!user) throw new Error('Usuario no autenticado');

      // Validar tipo de archivo
      const allowedTypes = ['csv', 'xlsx', 'xls', 'json'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten: CSV, Excel, JSON');
      }

      // Validar tamaño (máximo 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Tamaño máximo: 50MB');
      }

      // 1. Upload del archivo para el storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obtener URL del archivo
      const { data: urlData } = supabase.storage
        .from('data-files')
        .getPublicUrl(fileName);

      // 3. Guardar metadatos en la base de datos
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: fileExt,
          file_size: file.size,
          storage_url: urlData.publicUrl,
          status: 'uploaded',
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString(),
            file_extension: fileExt
          }
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // 4. Triggerar procesamiento automático
      const { data: processData, error: processError } = await supabase.functions
        .invoke('process-file', {
          body: {
            fileId: fileRecord.id,
            userId: user.id,
            fileUrl: urlData.publicUrl,
            fileName: file.name,
            fileType: fileExt
          }
        });

      if (processError) {
        console.error('Error al iniciar procesamiento:', processError);
        // No lanzar error, el archivo se subió correctamente
        toast.warning('Archivo subido, pero hubo un error al iniciar el procesamiento automático');
      } else {
        toast.success('Archivo subido y enviado a procesamiento');
      }

      // Actualizar lista de archivos
      await fetchFiles();
      
      return { success: true, fileId: fileRecord.id };
      
    } catch (error: any) {
      console.error('Error en upload:', error);
      toast.error(`Error en upload: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar permisos
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Obtener información del archivo
      const { data: fileData } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (!fileData) {
        throw new Error('Archivo no encontrado');
      }

      // Solo el propietario o admin puede eliminar
      if (fileData.user_id !== user.id && profile?.role !== 'admin') {
        throw new Error('No tienes permisos para eliminar este archivo');
      }

      // Eliminar archivo del storage
      if (fileData.storage_url) {
        const fileName = fileData.storage_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('data-files')
            .remove([fileName]);
        }
      }

      // Usar función para limpiar todos los datos relacionados
      const { error } = await supabase.rpc('cleanup_file_data', {
        file_uuid: fileId
      });

      if (error) {
        throw error;
      }

      toast.success('Archivo eliminado exitosamente');
      await fetchFiles();
      
    } catch (error: any) {
      console.error('Error al eliminar archivo:', error);
      toast.error(`Error al eliminar archivo: ${error.message}`);
    }
  };

  const reprocessFile = async (fileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener información del archivo
      const { data: fileData } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (!fileData) {
        throw new Error('Archivo no encontrado');
      }

      // Actualizar status a processing
      await supabase
        .from('files')
        .update({ 
          status: 'processing',
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      // Enviar para reprocesamiento
      const { data: processData, error: processError } = await supabase.functions
        .invoke('process-file', {
          body: {
            fileId: fileId,
            userId: fileData.user_id,
            fileUrl: fileData.storage_url,
            fileName: fileData.file_name,
            fileType: fileData.file_type
          }
        });

      if (processError) {
        throw processError;
      }

      toast.success('Archivo enviado para reprocesamiento');
      await fetchFiles();
      
    } catch (error: any) {
      console.error('Error al reprocesar archivo:', error);
      toast.error(`Error al reprocesar archivo: ${error.message}`);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const { data: fileData } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (!fileData) {
        throw new Error('Archivo no encontrado');
      }

      // Crear URL de descarga
      const link = document.createElement('a');
      link.href = fileData.storage_url;
      link.download = fileData.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Descarga iniciada');
      
    } catch (error: any) {
      console.error('Error al descargar archivo:', error);
      toast.error(`Error al descargar archivo: ${error.message}`);
    }
  };

  const getFilesByStatus = (status: FileData['status']) => {
    return files.filter(file => file.status === status);
  };

  const getInsightsByType = (fileId: string, type?: InsightData['insight_type']) => {
    const file = files.find(f => f.id === fileId);
    if (!file?.insights) return [];
    
    if (type) {
      return file.insights.filter(insight => insight.insight_type === type);
    }
    
    return file.insights;
  };

  const getFileStats = () => {
    const stats = {
      total: files.length,
      uploaded: files.filter(f => f.status === 'uploaded').length,
      processing: files.filter(f => f.status === 'processing').length,
      done: files.filter(f => f.status === 'done').length,
      error: files.filter(f => f.status === 'error').length,
      totalInsights: files.reduce((acc, file) => acc + (file.insights?.length || 0), 0)
    };
    return stats;
  };

  return {
    files,
    loading,
    uploading,
    fetchFiles,
    uploadFile,
    deleteFile,
    reprocessFile,
    downloadFile,
    getFilesByStatus,
    getInsightsByType,
    getFileStats
  };
};
