import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessFileRequest {
  fileId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const databricksUrl = Deno.env.get('DATABRICKS_API_URL');
    const databricksToken = Deno.env.get('DATABRICKS_TOKEN');

    if (!databricksUrl || !databricksToken) {
      throw new Error('Configuração do Databricks não encontrada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fileId, userId, fileUrl, fileName, fileType }: ProcessFileRequest = await req.json();

    console.log(`Iniciando processamento do arquivo: ${fileName} para usuário: ${userId}`);

    // 1. Atualizar status do arquivo para 'processing'
    await supabase
      .from('files')
      .update({ status: 'processing' })
      .eq('id', fileId);

    // 2. Registrar log de início do processamento
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: userId,
        operation: 'databricks_start',
        status: 'processing',
        details: {
          file_name: fileName,
          file_type: fileType,
          started_at: new Date().toISOString()
        }
      });

    // 3. Preparar payload para Databricks
    const databricksPayload = {
      userId: userId,
      fileId: fileId,
      fileUrl: fileUrl,
      fileName: fileName,
      fileType: fileType,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando arquivo para Databricks:', databricksPayload);

    // 4. Enviar para Databricks
    const databricksResponse = await fetch(databricksUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${databricksToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(databricksPayload),
    });

    if (!databricksResponse.ok) {
      const errorText = await databricksResponse.text();
      throw new Error(`Erro do Databricks: ${databricksResponse.status} - ${errorText}`);
    }

    const databricksResult = await databricksResponse.json();
    console.log('Resposta do Databricks:', databricksResult);

    // 5. Atualizar arquivo com job ID do Databricks
    await supabase
      .from('files')
      .update({ 
        databricks_job_id: databricksResult.job_id || databricksResult.id,
        metadata: { databricks_response: databricksResult }
      })
      .eq('id', fileId);

    // 6. Registrar log de sucesso
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: userId,
        operation: 'databricks_submit',
        status: 'success',
        details: {
          job_id: databricksResult.job_id || databricksResult.id,
          databricks_response: databricksResult
        }
      });

    // 7. Criar notificação para o usuário
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Processamento Iniciado',
        message: `O arquivo ${fileName} foi enviado para processamento. Você será notificado quando estiver pronto.`,
        type: 'info',
        related_file_id: fileId
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo enviado para processamento com sucesso',
        jobId: databricksResult.job_id || databricksResult.id
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
    console.error('Erro ao processar arquivo:', error);

    // Em caso de erro, atualizar status do arquivo
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { fileId, userId } = await req.json();
      
      await supabase
        .from('files')
        .update({ 
          status: 'error',
          error_message: error.message
        })
        .eq('id', fileId);

      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: userId,
          operation: 'databricks_error',
          status: 'error',
          error_details: error.message
        });

      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Erro no Processamento',
          message: `Ocorreu um erro ao processar o arquivo. Tente novamente ou contate o suporte.`,
          type: 'error',
          related_file_id: fileId
        });
    } catch (updateError) {
      console.error('Erro ao atualizar status após falha:', updateError);
    }

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