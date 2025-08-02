
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileValidator, ValidationResult } from '@/validators/fileValidator';

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
        toast.error('Archivo no encontrado');
        return { success: false };
      }

      // Validación adicional antes del procesamiento
      console.log('🔍 Realizando validación previa al procesamiento...');
      
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
          console.error('❌ Archivo no válido para procesamiento:', validationResult.errors);
          
          const errorMessage = validationResult.errors
            .slice(0, 2)
            .map(error => error.message)
            .join('; ');

          toast.error(`No se puede procesar: ${errorMessage}`);
          
          // Actualizar estado a error
          await supabase
            .from('files')
            .update({ 
              status: 'error',
              error_message: `Validación fallida: ${errorMessage}`
            })
            .eq('id', fileId);

          return { success: false, validationErrors: validationResult.errors };
        }

        console.log('✅ Archivo validado para procesamiento');
      } else {
        setValidating(false);
        console.warn('⚠️ No se pudo descargar el archivo para validación, continuando...');
      }
      
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

      // Registrar log de validación exitosa
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: file.user_id,
          operation: 'pre_processing_validation',
          status: 'success',
          details: {
            message: 'Archivo validado correctamente antes del procesamiento',
            timestamp: new Date().toISOString()
          }
        });

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
      return { success: true };
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar archivo');
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
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking job status:', error);
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
