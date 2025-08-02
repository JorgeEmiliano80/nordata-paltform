
/**
 * File Processing Service
 * Orquesta el procesamiento de archivos con Databricks
 */

import { createDatabricksClient, DatabricksJobParams } from '../lib/databricksClient.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  private supabase;
  private databricksClient;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.databricksClient = createDatabricksClient();
  }

  /**
   * Inicia el procesamiento de un archivo
   */
  async startProcessing(fileId: string, userId: string): Promise<ProcessingResult> {
    try {
      // 1. Obtener información del archivo
      const file = await this.getFile(fileId, userId);
      if (!file) {
        throw new Error('Archivo no encontrado');
      }

      // 2. Validar que el archivo esté en estado correcto
      if (file.status !== 'uploaded') {
        throw new Error(`Archivo en estado incorrecto: ${file.status}`);
      }

      // 3. Marcar como procesando
      await this.updateFileStatus(fileId, 'processing');

      // 4. Registrar inicio de procesamiento
      await this.logProcessingEvent(fileId, userId, 'databricks_start', 'started', {
        file_name: file.file_name,
        file_type: file.file_type,
        file_size: file.file_size,
        started_at: new Date().toISOString()
      });

      // 5. Preparar parámetros para Databricks
      const jobParams: DatabricksJobParams = {
        fileId: file.id,
        userId: file.user_id,
        fileUrl: file.storage_url,
        fileName: file.file_name,
        fileType: file.file_type
      };

      // 6. Enviar job a Databricks
      const jobResult = await this.databricksClient.runJob(jobParams);

      // 7. Actualizar archivo con run_id real
      await this.updateFileWithJobInfo(fileId, {
        databricks_run_id: jobResult.run_id,
        databricks_job_id: `databricks_${jobResult.run_id}`
      });

      // 8. Registrar job iniciado exitosamente
      await this.logProcessingEvent(fileId, userId, 'databricks_submitted', 'success', {
        run_id: jobResult.run_id,
        submitted_at: new Date().toISOString()
      });

      return {
        success: true,
        runId: jobResult.run_id,
        jobId: `databricks_${jobResult.run_id}`
      };

    } catch (error: any) {
      // Marcar archivo como error
      await this.updateFileStatus(fileId, 'error', error.message);

      // Registrar error
      await this.logProcessingEvent(fileId, userId, 'databricks_error', 'error', {
        error_message: error.message,
        error_at: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Consulta el estado de un job en Databricks
   */
  async checkJobStatus(runId: number): Promise<any> {
    try {
      return await this.databricksClient.getJobRun(runId);
    } catch (error: any) {
      throw new Error(`Error checking job status: ${error.message}`);
    }
  }

  /**
   * Cancela un job en ejecución
   */
  async cancelJob(fileId: string, runId: number): Promise<boolean> {
    try {
      await this.databricksClient.cancelJobRun(runId);
      await this.updateFileStatus(fileId, 'error', 'Job cancelado por usuario');
      return true;
    } catch (error: any) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Métodos privados de utilidad
   */
  private async getFile(fileId: string, userId: string): Promise<FileRecord | null> {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  private async updateFileStatus(fileId: string, status: string, errorMessage?: string) {
    const updateData: any = { status };
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await this.supabase
      .from('files')
      .update(updateData)
      .eq('id', fileId);
  }

  private async updateFileWithJobInfo(fileId: string, jobInfo: { databricks_run_id: number; databricks_job_id: string }) {
    await this.supabase
      .from('files')
      .update({
        databricks_run_id: jobInfo.databricks_run_id,
        databricks_job_id: jobInfo.databricks_job_id
      })
      .eq('id', fileId);
  }

  private async logProcessingEvent(fileId: string, userId: string, operation: string, status: string, details: any) {
    await this.supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: userId,
        operation,
        status,
        details,
        started_at: new Date().toISOString()
      });
  }
}
