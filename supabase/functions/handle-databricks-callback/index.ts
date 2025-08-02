
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabricksCallback {
  run_id: number;
  job_id: string;
  file_id: string;
  user_id: string;
  status: 'completed' | 'failed';
  results?: {
    summary?: any;
    insights?: Array<{
      type: string;
      title: string;
      description: string;
      data: any;
      confidence_score?: number;
    }>;
    processed_data_url?: string;
    execution_time?: number;
  };
  error?: {
    error_code: string;
    error_message: string;
    stack_trace?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const callbackData: DatabricksCallback = await req.json();
    console.log(`[DATABRICKS-CALLBACK] Recibido callback para run_id: ${callbackData.run_id}`);

    const { run_id, job_id, file_id, user_id, status, results, error } = callbackData;

    if (status === 'completed' && results) {
      console.log(`[DATABRICKS-CALLBACK] Procesamiento completado exitosamente`);
      
      // 1. Actualizar estado del archivo a 'done'
      await supabase
        .from('files')
        .update({ 
          status: 'done',
          processed_at: new Date().toISOString(),
          metadata: { 
            databricks_results: results,
            run_id: run_id,
            execution_time: results.execution_time
          }
        })
        .eq('id', file_id);

      // 2. Guardar insights si existen
      if (results.insights && results.insights.length > 0) {
        const insightsToInsert = results.insights.map(insight => ({
          file_id: file_id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          data: insight.data,
          confidence_score: insight.confidence_score || null
        }));

        await supabase
          .from('insights')
          .insert(insightsToInsert);

        console.log(`[DATABRICKS-CALLBACK] Guardados ${insightsToInsert.length} insights`);
      }

      // 3. Registrar log de conclusión exitosa
      await supabase
        .from('processing_logs')
        .insert({
          file_id: file_id,
          user_id: user_id,
          operation: 'databricks_complete',
          status: 'success',
          completed_at: new Date().toISOString(),
          details: {
            run_id: run_id,
            job_id: job_id,
            insights_count: results.insights?.length || 0,
            execution_time: results.execution_time,
            processed_data_url: results.processed_data_url
          }
        });

      // 4. Crear notificación de éxito
      await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          title: 'Procesamiento Completado',
          message: `Tu archivo fue procesado exitosamente. ${results.insights?.length || 0} insights fueron generados.`,
          type: 'success',
          related_file_id: file_id
        });

    } else {
      // Procesamiento falló
      console.log(`[DATABRICKS-CALLBACK] Procesamiento falló:`, error);
      
      const errorMessage = error?.error_message || 'Error desconocido en Databricks';
      
      await supabase
        .from('files')
        .update({ 
          status: 'error',
          error_message: errorMessage
        })
        .eq('id', file_id);

      await supabase
        .from('processing_logs')
        .insert({
          file_id: file_id,
          user_id: user_id,
          operation: 'databricks_failed',
          status: 'error',
          completed_at: new Date().toISOString(),
          error_details: errorMessage,
          details: { 
            run_id: run_id,
            job_id: job_id,
            error_code: error?.error_code,
            stack_trace: error?.stack_trace
          }
        });

      await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          title: 'Error en Procesamiento',
          message: `Hubo un error al procesar tu archivo: ${errorMessage}`,
          type: 'error',
          related_file_id: file_id
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback procesado correctamente',
        run_id: run_id
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
    console.error('[DATABRICKS-CALLBACK] Error procesando callback:', error.message);

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
