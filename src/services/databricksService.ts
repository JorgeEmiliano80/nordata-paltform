
/**
 * Servicio para integración con Databricks
 * Maneja jobs, clusters y procesamiento de datos
 */

import { API_ENDPOINTS } from '@/config/databricks';

export interface DatabricksJob {
  job_id: string;
  run_id?: number;
  status: 'PENDING' | 'RUNNING' | 'TERMINATED' | 'FAILED' | 'SUCCESS';
  file_id: string;
  user_id: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  progress?: number;
}

export interface ProcessFileRequest {
  file_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  processing_config?: {
    analysis_type: 'insights' | 'analytics' | 'ml_training';
    output_format: 'json' | 'csv' | 'parquet';
    parameters?: Record<string, any>;
  };
}

export interface DatabricksInsight {
  id: string;
  job_id: string;
  insight_type: 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'summary';
  title: string;
  description: string;
  data: any;
  confidence_score: number;
  created_at: string;
}

class DatabricksService {
  /**
   * Realizar petición autenticada a las Cloud Functions
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Enviar archivo para procesamiento en Databricks
   */
  async submitJob(request: ProcessFileRequest): Promise<DatabricksJob> {
    try {
      console.log('Enviando archivo a Databricks:', request);
      
      const response = await this.makeRequest(API_ENDPOINTS.DATABRICKS.SUBMIT_JOB, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      console.log('Job enviado exitosamente:', response);
      return response.job;
    } catch (error: any) {
      console.error('Error enviando job a Databricks:', error);
      throw new Error(`Error processing file: ${error.message}`);
    }
  }

  /**
   * Consultar estado de un job
   */
  async getJobStatus(jobId: string): Promise<DatabricksJob> {
    try {
      const response = await this.makeRequest(
        `${API_ENDPOINTS.DATABRICKS.JOB_STATUS}?job_id=${jobId}`
      );

      return response.job;
    } catch (error: any) {
      console.error('Error consultando estado del job:', error);
      throw new Error(`Error checking job status: ${error.message}`);
    }
  }

  /**
   * Cancelar un job en ejecución
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      await this.makeRequest(API_ENDPOINTS.DATABRICKS.CANCEL_JOB, {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId }),
      });

      console.log('Job cancelado exitosamente:', jobId);
      return true;
    } catch (error: any) {
      console.error('Error cancelando job:', error);
      return false;
    }
  }

  /**
   * Obtener insights generados por un job
   */
  async getJobInsights(jobId: string): Promise<DatabricksInsight[]> {
    try {
      const response = await this.makeRequest(
        `${API_ENDPOINTS.ANALYTICS.INSIGHTS}?job_id=${jobId}`
      );

      return response.insights || [];
    } catch (error: any) {
      console.error('Error obteniendo insights:', error);
      return [];
    }
  }

  /**
   * Obtener lista de jobs del usuario
   */
  async getUserJobs(): Promise<DatabricksJob[]> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.DATABRICKS.JOB_STATUS);
      return response.jobs || [];
    } catch (error: any) {
      console.error('Error obteniendo jobs del usuario:', error);
      return [];
    }
  }

  /**
   * Monitorear progreso de un job (polling)
   */
  async monitorJob(
    jobId: string, 
    onUpdate: (job: DatabricksJob) => void,
    interval = 5000
  ): Promise<void> {
    const checkStatus = async () => {
      try {
        const job = await this.getJobStatus(jobId);
        onUpdate(job);

        // Continuar monitoreando si el job está en ejecución
        if (job.status === 'PENDING' || job.status === 'RUNNING') {
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        console.error('Error monitoreando job:', error);
      }
    };

    await checkStatus();
  }
}

// Instancia singleton
export const databricksService = new DatabricksService();
