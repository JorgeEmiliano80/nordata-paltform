
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStorage = () => {
  const [loading, setLoading] = useState(false);

  const deleteFile = async (fileId: string) => {
    try {
      setLoading(true);
      
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
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error al eliminar archivo');
      return { success: false };
    } finally {
      setLoading(false);
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

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return [];
      }

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('Error al cargar archivos');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error al cargar archivos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteFile,
    getFileInsights,
    fetchFiles
  };
};
