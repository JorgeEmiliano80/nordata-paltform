
/**
 * Servicio de Archivos - Nueva Arquitectura GCP + Databricks
 * Migrado de Supabase a Google Cloud Storage
 */

import { API_ENDPOINTS } from '@/config/databricks';
import { databricksService, ProcessFileRequest } from './databricksService';

export interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_url: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error' | 'cancelled';
  databricks_job_id?: string;
  error_message?: string;
  uploaded_at: string;
  processed_at?: string;
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileService {
  /**
   * Realizar petición autenticada
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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
   * Obtener lista de archivos del usuario
   */
  async getFiles(): Promise<FileRecord[]> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.FILES.LIST);
      return response.files || [];
    } catch (error: any) {
      console.error('Error obteniendo archivos:', error);
      throw new Error(`Error loading files: ${error.message}`);
    }
  }

  /**
   * Subir archivo a Google Cloud Storage
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileRecord> {
    try {
      // Validaciones
      const maxSize = 100 * 1024 * 1024; // 100MB
      const allowedTypes = [
        'text/csv',
        'application/json',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 100MB permitido.');
      }

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten CSV, JSON y Excel.');
      }

      console.log('Subiendo archivo:', { name: file.name, size: file.size, type: file.type });

      // Crear FormData para envío
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      }));

      // Subir usando XMLHttpRequest para tracking de progreso
      const uploadResponse = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        const token = localStorage.getItem('auth_token');
        xhr.open('POST', API_ENDPOINTS.FILES.UPLOAD);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });

      console.log('Archivo subido exitosamente:', uploadResponse);
      return uploadResponse.file;

    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Procesar archivo con Databricks
   */
  async processFile(fileId: string): Promise<FileRecord> {
    try {
      console.log('Iniciando procesamiento del archivo:', fileId);

      // Obtener información del archivo
      const files = await this.getFiles();
      const file = files.find(f => f.id === fileId);
      
      if (!file) {
        throw new Error('Archivo no encontrado');
      }

      // Configurar request para Databricks
      const processRequest: ProcessFileRequest = {
        file_id: fileId,
        file_name: file.file_name,
        file_type: file.file_type,
        storage_path: file.storage_url,
        processing_config: {
          analysis_type: 'insights',
          output_format: 'json',
          parameters: {
            generate_visualizations: true,
            extract_trends: true,
            detect_anomalies: true
          }
        }
      };

      // Enviar a Databricks
      const job = await databricksService.submitJob(processRequest);

      // Actualizar estado del archivo
      const response = await this.makeRequest(API_ENDPOINTS.FILES.PROCESS, {
        method: 'POST',
        body: JSON.stringify({
          file_id: fileId,
          databricks_job_id: job.job_id,
          status: 'processing'
        }),
      });

      return response.file;

    } catch (error: any) {
      console.error('Error procesando archivo:', error);
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.FILES.DELETE, {
        method: 'DELETE',
        body: JSON.stringify({ file_id: fileId }),
      });

      console.log('Archivo eliminado exitosamente:', fileId);
    } catch (error: any) {
      console.error('Error eliminando archivo:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Obtener estado de procesamiento
   */
  async getProcessingStatus(fileId: string): Promise<FileRecord> {
    try {
      const response = await this.makeRequest(
        `${API_ENDPOINTS.FILES.STATUS}?file_id=${fileId}`
      );
      return response.file;
    } catch (error: any) {
      console.error('Error obteniendo estado:', error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de archivos del usuario
   */
  async getFileStats(): Promise<any> {
    try {
      const files = await this.getFiles();
      
      const stats = {
        total: files.length,
        by_status: {
          uploaded: files.filter(f => f.status === 'uploaded').length,
          processing: files.filter(f => f.status === 'processing').length,
          processed: files.filter(f => f.status === 'processed').length,
          error: files.filter(f => f.status === 'error').length,
        },
        total_size: files.reduce((sum, f) => sum + f.file_size, 0),
        recent_uploads: files
          .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
          .slice(0, 5)
      };

      return stats;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        by_status: { uploaded: 0, processing: 0, processed: 0, error: 0 },
        total_size: 0,
        recent_uploads: []
      };
    }
  }
}

// Instancia singleton
export const fileService = new FileService();
