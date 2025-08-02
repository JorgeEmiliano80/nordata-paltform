
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileValidator, ValidationResult } from '@/validators/fileValidator';
import { errorHandler } from '@/lib/errorHandler';

export const useFileProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [validating, setValidating] = useState(false);

  const processFile = async (fileId: string) => {
    try {
      setProcessing(true);
      setValidating(true);

      // Obtener información del archivo
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fileError || !file) {
        errorHandler.handleError(
          new Error('Arquivo não encontrado'),
          {
            category: 'supabase',
            operation: 'fetch_file',
            fileId
          }
        );
        return { success: false };
      }

      // Validación adicional antes del procesamiento
      console.log('🔍 Realizando validação prévia ao processamento...');
      
      // Obtener el archivo desde storage para validación
      const { data: fileBlob } = await supabase.storage
        .from('data-files')
        .download(file.storage_url.split('/').pop() || '');

      if (fileBlob) {
        const validator = new FileValidator();
        const validationResult: ValidationResult = await validator.validateFile(
          new File([fileBlob], file.file_name, { type: file.file_type })
        );

        setValidating(false);

        if (!validationResult.isValid) {
          console.error('❌ Arquivo não válido para processamento:', validationResult.errors);
          
          errorHandler.handleValidationError(
            validationResult.errors,
            {
              category: 'validation',
              operation: 'pre_processing_validation',
              fileId,
              fileName: file.file_name,
              userId: file.user_id
            }
          );
          
          // Actualizar estado a error
          await supabase
            .from('files')
            .update({ 
              status: 'error',
              error_message: `Validação falhou: ${validationResult.errors.slice(0, 2).map(e => e.message).join('; ')}`
            })
            .eq('id', fileId);

          return { success: false, validationErrors: validationResult.errors };
        }

        console.log('✅ Arquivo validado para processamento');
      } else {
        setValidating(false);
        console.warn('⚠️ Não foi possível baixar o arquivo para validação, continuando...');
      }
      
      // Actualizar estado a processing
      const { error: updateError } = await supabase
        .from('files')
        .update({ status: 'processing' })
        .eq('id', fileId);

      if (updateError) {
        console.error('Error updating file status:', updateError);
        errorHandler.handleError(updateError, {
          category: 'supabase',
          operation: 'update_file_status',
          fileId,
          fileName: file.file_name,
          userId: file.user_id
        });
        return { success: false };
      }

      // Registrar log de validación exitosa
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: file.user_id,
          operation: 'pre_processing_validation',
          status: 'success',
          details: {
            message: 'Arquivo validado corretamente antes do processamento',
            timestamp: new Date().toISOString()
          }
        });

      // Llamar a la función de procesamiento
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { fileId }
      });

      if (error) {
        console.error('Error processing file:', error);
        errorHandler.handleError(error, {
          category: 'databricks',
          operation: 'process_file',
          fileId,
          fileName: file.file_name,
          userId: file.user_id
        });
        
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

      errorHandler.showSuccess('Arquivo enviado para processamento');
      return { success: true };
    } catch (error) {
      console.error('Error processing file:', error);
      errorHandler.handleError(error, {
        category: 'file_processing',
        operation: 'process_file',
        fileId
      });
      return { success: false };
    } finally {
      setProcessing(false);
      setValidating(false);
    }
  };

  const checkJobStatus = async (runId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-job-status', {
        body: { runId }
      });

      if (error) {
        console.error('Error checking job status:', error);
        errorHandler.handleError(error, {
          category: 'databricks',
          operation: 'check_job_status',
          technicalDetails: { runId }
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking job status:', error);
      errorHandler.handleError(error, {
        category: 'databricks',
        operation: 'check_job_status',
        technicalDetails: { runId }
      });
      return null;
    }
  };

  return {
    processing,
    validating,
    processFile,
    checkJobStatus
  };
};
