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
    processedFileUrl?: string;
  };
  error?: string;
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
    console.log('Callback recebido do Databricks:', callbackData);

    const { jobId, fileId, userId, status, results, error } = callbackData;

    if (status === 'completed' && results) {
      // 1. Atualizar status do arquivo para 'done'
      await supabase
        .from('files')
        .update({ 
          status: 'done',
          processed_at: new Date().toISOString(),
          metadata: { 
            databricks_results: results,
            job_id: jobId
          }
        })
        .eq('id', fileId);

      // 2. Salvar insights se existirem
      if (results.insights && results.insights.length > 0) {
        const insightsToInsert = results.insights.map(insight => ({
          file_id: fileId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          data: insight.data,
          confidence_score: insight.confidence_score
        }));

        await supabase
          .from('insights')
          .insert(insightsToInsert);
      }

      // 3. Registrar log de conclusão
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: userId,
          operation: 'databricks_complete',
          status: 'success',
          completed_at: new Date().toISOString(),
          details: {
            job_id: jobId,
            insights_count: results.insights?.length || 0,
            processed_file_url: results.processedFileUrl
          }
        });

      // 4. Criar notificação de sucesso
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Processamento Concluído',
          message: `Seu arquivo foi processado com sucesso! ${results.insights?.length || 0} insights foram gerados.`,
          type: 'success',
          related_file_id: fileId
        });

    } else {
      // Processamento falhou
      await supabase
        .from('files')
        .update({ 
          status: 'error',
          error_message: error || 'Erro desconhecido do Databricks'
        })
        .eq('id', fileId);

      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: userId,
          operation: 'databricks_failed',
          status: 'error',
          completed_at: new Date().toISOString(),
          error_details: error || 'Erro desconhecido',
          details: { job_id: jobId }
        });

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Erro no Processamento',
          message: `Houve um erro ao processar seu arquivo: ${error || 'Erro desconhecido'}`,
          type: 'error',
          related_file_id: fileId
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback processado com sucesso'
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
    console.error('Erro ao processar callback do Databricks:', error);

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