
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessFileRequest {
  fileId: string;
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

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorización requerido');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Token inválido');
    }

    const { fileId }: ProcessFileRequest = await req.json();
    
    if (!fileId) {
      throw new Error('ID de archivo requerido');
    }

    console.log(`[PROCESS-FILE] Iniciando procesamiento: ${fileId} por usuario: ${user.id}`);

    // Verificar variables de entorno de Databricks
    const databricksWorkspaceUrl = Deno.env.get('DATABRICKS_WORKSPACE_URL');
    const databricksToken = Deno.env.get('DATABRICKS_TOKEN');
    const databricksJobId = Deno.env.get('DATABRICKS_JOB_ID');

    if (!databricksWorkspaceUrl || !databricksToken || !databricksJobId) {
      console.error('[PROCESS-FILE] Missing Databricks environment variables');
      throw new Error('Configuración de Databricks no disponible');
    }

    // Obtener información del archivo
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fileError || !file) {
      throw new Error('Archivo no encontrado');
    }

    // Validar estado del archivo
    if (file.status !== 'uploaded') {
      throw new Error(`Archivo en estado incorrecto: ${file.status}`);
    }

    console.log(`[PROCESS-FILE] Archivo encontrado: ${file.file_name}`);

    // Actualizar estado a procesando
    await supabase
      .from('files')
      .update({ status: 'processing' })
      .eq('id', fileId);

    // Registrar inicio de procesamiento
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: user.id,
        operation: 'databricks_start',
        status: 'started',
        details: {
          file_name: file.file_name,
          file_type: file.file_type,
          started_at: new Date().toISOString()
        }
      });

    // Preparar payload para Databricks
    const databricksPayload = {
      job_id: parseInt(databricksJobId),
      job_parameters: {
        file_id: fileId,
        user_id: user.id,
        file_url: file.storage_url,
        file_name: file.file_name,
        file_type: file.file_type,
        callback_url: `${supabaseUrl}/functions/v1/handle-databricks-callback`
      }
    };

    console.log(`[PROCESS-FILE] Enviando job a Databricks: ${databricksWorkspaceUrl}`);

    // Llamada real a Databricks Jobs API
    const databricksResponse = await fetch(`${databricksWorkspaceUrl}/api/2.1/jobs/run-now`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${databricksToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(databricksPayload)
    });

    if (!databricksResponse.ok) {
      const errorData = await databricksResponse.json().catch(() => ({}));
      throw new Error(`Databricks API Error: ${databricksResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const databricksResult = await databricksResponse.json();
    const runId = databricksResult.run_id;

    console.log(`[PROCESS-FILE] Job iniciado en Databricks. Run ID: ${runId}`);

    // Actualizar archivo con información real del job
    await supabase
      .from('files')
      .update({
        databricks_job_id: `databricks_${runId}`,
        databricks_run_id: runId
      })
      .eq('id', fileId);

    // Registrar job enviado exitosamente
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: user.id,
        operation: 'databricks_submitted',
        status: 'success',
        details: {
          run_id: runId,
          databricks_job_id: databricksJobId,
          submitted_at: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Archivo enviado a Databricks para procesamiento',
        runId: runId,
        jobId: `databricks_${runId}`
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
    console.error('[PROCESS-FILE] Error:', error.message);

    // Si tenemos el fileId, marcar como error
    try {
      const { fileId } = await req.json().catch(() => ({}));
      if (fileId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        
        await supabase
          .from('files')
          .update({
            status: 'error',
            error_message: error.message
          })
          .eq('id', fileId);
      }
    } catch (logError) {
      console.error('[PROCESS-FILE] Error logging failure:', logError);
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
