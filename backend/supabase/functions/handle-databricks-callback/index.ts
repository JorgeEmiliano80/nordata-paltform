
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabricksCallback {
  jobId: string;
  fileId: string;
  userId: string;
  status: 'completed' | 'failed' | 'cancelled';
  results?: {
    insights?: Array<{
      type: string;
      title: string;
      description: string;
      data: any;
      confidence_score: number;
    }>;
    summary?: string;
    statistics?: any;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const callback: DatabricksCallback = await req.json();
    console.log('Callback de Databricks recibido:', callback);

    const { jobId, fileId, userId, status, results, error } = callback;

    // Verificar que el archivo existe y pertenece al usuario
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fileError || !file) {
      console.error('Archivo no encontrado:', fileError);
      throw new Error('Archivo no encontrado o acceso denegado');
    }

    // Registrar el callback en los logs
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: userId,
        operation: 'databricks_callback',
        status: status,
        details: {
          job_id: jobId,
          callback_data: callback,
          received_at: new Date().toISOString()
        }
      });

    if (status === 'completed') {
      console.log('Procesamiento completado exitosamente');

      // Actualizar estado del archivo
      await supabase
        .from('files')
        .update({
          status: 'done',
          processed_at: new Date().toISOString()
        })
        .eq('id', fileId);

      // Guardar insights si están disponibles
      if (results?.insights && results.insights.length > 0) {
        console.log(`Guardando ${results.insights.length} insights`);

        const insightsToInsert = results.insights.map(insight => ({
          file_id: fileId,
          user_id: userId,
          insight_type: insight.type as any,
          title: insight.title,
          description: insight.description,
          data: insight.data || {},
          confidence_score: insight.confidence_score || 0.5
        }));

        const { error: insightsError } = await supabase
          .from('insights')
          .insert(insightsToInsert);

        if (insightsError) {
          console.error('Error guardando insights:', insightsError);
        } else {
          console.log('Insights guardados exitosamente');
        }
      }

      // Crear notificación de éxito
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Procesamiento Completado',
          message: `Tu archivo "${file.file_name}" ha sido procesado exitosamente`,
          type: 'success',
          related_file_id: fileId,
          is_read: false
        });

    } else if (status === 'failed') {
      console.log('Procesamiento falló:', error);

      // Actualizar estado del archivo con error
      await supabase
        .from('files')
        .update({
          status: 'error',
          error_message: error || 'Error en el procesamiento de Databricks'
        })
        .eq('id', fileId);

      // Crear notificación de error
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Error en Procesamiento',
          message: `Hubo un error procesando tu archivo "${file.file_name}": ${error || 'Error desconocido'}`,
          type: 'error',
          related_file_id: fileId,
          is_read: false
        });

    } else if (status === 'cancelled') {
      console.log('Procesamiento cancelado');

      // Actualizar estado del archivo
      await supabase
        .from('files')
        .update({
          status: 'cancelled',
          error_message: 'Procesamiento cancelado'
        })
        .eq('id', fileId);

      // Crear notificación
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Procesamiento Cancelado',
          message: `El procesamiento de tu archivo "${file.file_name}" fue cancelado`,
          type: 'warning',
          related_file_id: fileId,
          is_read: false
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback procesado exitosamente'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error procesando callback de Databricks:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
