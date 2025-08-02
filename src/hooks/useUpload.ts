import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileValidator, ValidationResult, CUSTOMER_DATA_CONFIG } from '@/validators/fileValidator';
import { errorHandler } from '@/lib/errorHandler';

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
  const [validating, setValidating] = useState(false);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setValidating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        errorHandler.handleError(
          new Error('Usuario no autenticado'), 
          { category: 'authentication', operation: 'upload' }
        );
        return { success: false };
      }

      // Validar tipo de archivo
      const allowedTypes = ['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        errorHandler.handleError(
          new Error('Tipo de archivo no válido'), 
          { 
            category: 'validation', 
            operation: 'upload',
            fileName: file.name,
            userId: user.id
          }
        );
        return { success: false };
      }

      console.log('🔍 Iniciando validação profunda do arquivo...');
      
      // Realizar validação profunda do arquivo
      const validator = new FileValidator(CUSTOMER_DATA_CONFIG);
      const validationResult: ValidationResult = await validator.validateFile(file);
      
      setValidating(false);

      if (!validationResult.isValid) {
        console.error('❌ Arquivo não válido:', validationResult.errors);
        
        const processedError = errorHandler.handleValidationError(
          validationResult.errors, 
          {
            category: 'validation',
            operation: 'file_validation',
            fileName: file.name,
            userId: user.id
          }
        );
        
        return { 
          success: false, 
          validationErrors: validationResult.errors,
          validationStats: validationResult.stats 
        };
      }

      // Mostrar advertencias si las hay
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach(warning => {
          errorHandler.showWarning(warning);
        });
      }

      // Mostrar estadísticas de validação
      if (validationResult.stats) {
        console.log('📊 Estatísticas do arquivo:', validationResult.stats);
        errorHandler.showSuccess(
          `Arquivo validado: ${validationResult.stats.totalRows} linhas, ${validationResult.stats.totalColumns} colunas`
        );
      }

      console.log('✅ Arquivo validado corretamente, procedendo com upload...');

      // Subir arquivo a Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        errorHandler.handleError(uploadError, {
          category: 'upload',
          operation: 'storage_upload',
          fileName: file.name,
          userId: user.id
        });
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
            upload_timestamp: new Date().toISOString(),
            validation_stats: validationResult.stats,
            validation_warnings: validationResult.warnings
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving file record:', dbError);
        errorHandler.handleError(dbError, {
          category: 'supabase',
          operation: 'save_file_record',
          fileName: file.name,
          userId: user.id
        });
        return { success: false };
      }

      errorHandler.showSuccess('Arquivo enviado e validado com sucesso');
      return { 
        success: true, 
        fileId: fileRecord.id,
        validationResult
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      errorHandler.handleError(error, {
        category: 'upload',
        operation: 'upload_file',
        fileName: file.name
      });
      return { success: false };
    } finally {
      setUploading(false);
      setValidating(false);
    }
  };

  return {
    uploading,
    validating,
    uploadFile
  };
};
