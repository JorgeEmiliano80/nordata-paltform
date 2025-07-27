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
      
      const { data, error } = await supabase
        .from('files')
        .select(`
          *,
          insights (*)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar arquivos:', error);
        toast.error('Erro ao carregar arquivos');
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Upload do arquivo para o storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter URL do arquivo
      const { data: urlData } = supabase.storage
        .from('data-files')
        .getPublicUrl(fileName);

      // 3. Salvar metadados no banco
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: fileExt || 'unknown',
          file_size: file.size,
          storage_url: urlData.publicUrl,
          status: 'uploaded',
          metadata: {
            original_name: file.name,
            upload_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // 4. Triggerar processamento no Databricks
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
        console.error('Erro ao iniciar processamento:', processError);
        toast.error('Arquivo enviado, mas erro ao iniciar processamento');
      } else {
        toast.success('Arquivo enviado e processamento iniciado!');
      }

      // Atualizar lista de arquivos
      await fetchFiles();
      
      return { success: true, fileId: fileRecord.id };
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(`Erro no upload: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) {
        throw error;
      }

      toast.success('Arquivo excluído com sucesso');
      await fetchFiles();
      
    } catch (error: any) {
      console.error('Erro ao excluir arquivo:', error);
      toast.error(`Erro ao excluir arquivo: ${error.message}`);
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

  return {
    files,
    loading,
    uploading,
    fetchFiles,
    uploadFile,
    deleteFile,
    getFilesByStatus,
    getInsightsByType
  };
};