
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileProcessing = () => {
  const [processing, setProcessing] = useState(false);

  const processFile = async (fileId: string) => {
    try {
      setProcessing(true);
      
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
    processFile,
    checkJobStatus
  };
};
