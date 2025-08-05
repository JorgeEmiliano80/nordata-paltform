
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobStatusRequest {
  jobId: string;
  fileId: string;
}

serve(async (req) => {
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

    const { jobId, fileId }: JobStatusRequest = await req.json();

    console.log(`Verificando estado del job: ${jobId} para archivo: ${fileId}`);

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

    // Verificar variables de entorno de Databricks
    const databricksWorkspaceUrl = Deno.env.get('DATABRICKS_WORKSPACE_URL');
    const databricksToken = Deno.env.get('DATABRICKS_TOKEN');

    if (!databricksWorkspaceUrl || !databricksToken) {
      // Simular estado si no hay configuración real
      console.log('Simulando estado de job (no hay configuración Databricks)');
      
      const simulatedStatus = Math.random() > 0.3 ? 'RUNNING' : 'SUCCESS';
      
      return new Response(
        JSON.stringify({
          success: true,
          status: simulatedStatus,
          jobId: jobId,
          message: simulatedStatus === 'SUCCESS' ? 'Procesamiento completado' : 'Procesamiento en curso',
          simulated: true
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Consulta real a Databricks Jobs API
    const runId = file.databricks_run_id;
    if (!runId) {
      throw new Error('No se encontró run ID de Databricks');
    }

    const databricksResponse = await fetch(
      `${databricksWorkspaceUrl}/api/2.1/jobs/runs/get?run_id=${runId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${databricksToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!databricksResponse.ok) {
      throw new Error(`Databricks API Error: ${databricksResponse.status}`);
    }

    const databricksResult = await databricksResponse.json();
    const status = databricksResult.state?.life_cycle_state || 'UNKNOWN';

    // Actualizar estado del archivo si es necesario
    if (status === 'TERMINATED') {
      const resultState = databricksResult.state?.result_state;
      if (resultState === 'SUCCESS') {
        await supabase
          .from('files')
          .update({ status: 'done', processed_at: new Date().toISOString() })
          .eq('id', fileId);
      } else if (resultState === 'FAILED') {
        await supabase
          .from('files')
          .update({ 
            status: 'error', 
            error_message: 'Job de Databricks falló'
          })
          .eq('id', fileId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: status,
        jobId: jobId,
        runId: runId,
        databricksResult: databricksResult
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
    console.error('Error verificando estado de job:', error);

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
