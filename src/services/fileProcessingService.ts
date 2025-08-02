
/**
 * File Processing Service
 * Orquesta el procesamiento de archivos con Databricks
 * Este servicio actúa como intermediario entre el cliente y las Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'done' | 'error';
  databricks_job_id?: string;
  databricks_run_id?: number;
  error_message?: string;
}

export interface ProcessingResult {
  success: boolean;
  runId?: number;
  jobId?: string;
  error?: string;
}

export class FileProcessingService {
  /**
   * Inicia el procesamiento de un archivo llamando a la Edge Function
   */
  async startProcessing(fileId: string, userId: string): Promise<ProcessingResult> {
    try {
      console.log(`[FileProcessingService] Iniciando procesamiento para archivo: ${fileId}`);

      // Llamar a la Edge Function para iniciar el procesamiento
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: {
          fileId,
          userId
        }
      });

      if (error) {
        console.error('[FileProcessingService] Error en Edge Function:', error);
        throw new Error(error.message || 'Error al iniciar procesamiento');
      }

      console.log('[FileProcessingService] Procesamiento iniciado exitosamente:', data);
      
      return {
        success: true,
        runId: data.runId,
        jobId: data.jobId
      };

    } catch (error: any) {
      console.error('[FileProcessingService] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Consulta el estado de un job en Databricks
   */
  async checkJobStatus(runId: number, fileId?: string): Promise<any> {
    try {
      console.log(`[FileProcessingService] Consultando estado del job: ${runId}`);

      const { data, error } = await supabase.functions.invoke('check-job-status', {
        body: {
          runId,
          fileId
        }
      });

      if (error) {
        console.error('[FileProcessingService] Error consultando estado:', error);
        throw new Error(error.message || 'Error al consultar estado del job');
      }

      return data.status;

    } catch (error: any) {
      console.error('[FileProcessingService] Error:', error);
      throw new Error(`Error checking job status: ${error.message}`);
    }
  }

  /**
   * Cancela un job en ejecución
   */
  async cancelJob(fileId: string, runId: number): Promise<boolean> {
    try {
      console.log(`[FileProcessingService] Cancelando job: ${runId} para archivo: ${fileId}`);

      // Actualizar el estado del archivo a error
      const { error: updateError } = await supabase
        .from('files')
        .update({ 
          status: 'error',
          error_message: 'Job cancelado por usuario'
        })
        .eq('id', fileId);

      if (updateError) {
        console.error('[FileProcessingService] Error actualizando archivo:', updateError);
        return false;
      }

      // TODO: Implementar cancelación real del job en Databricks
      // Esto requeriría otra Edge Function para hacer la llamada segura
      
      return true;

    } catch (error: any) {
      console.error('[FileProcessingService] Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Obtiene información de un archivo específico
   */
  async getFile(fileId: string, userId: string): Promise<FileRecord | null> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[FileProcessingService] Error obteniendo archivo:', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('[FileProcessingService] Error:', error);
      return null;
    }
  }

  /**
   * Obtiene archivos del usuario con estado específico
   */
  async getFilesByStatus(userId: string, status: string): Promise<FileRecord[]> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[FileProcessingService] Error obteniendo archivos por estado:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('[FileProcessingService] Error:', error);
      return [];
    }
  }
}

/**
 * Instancia singleton del servicio
 */
export const fileProcessingService = new FileProcessingService();
