
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckJobRequest {
  runId: number;
  fileId?: string;
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

    const { runId, fileId }: CheckJobRequest = await req.json();
    
    if (!runId) {
      throw new Error('Run ID requerido');
    }

    // Verificar configuración de Databricks
    const databricksWorkspaceUrl = Deno.env.get('DATABRICKS_WORKSPACE_URL');
    const databricksToken = Deno.env.get('DATABRICKS_TOKEN');

    if (!databricksWorkspaceUrl || !databricksToken) {
      throw new Error('Configuración de Databricks no disponible');
    }

    console.log(`[CHECK-JOB-STATUS] Consultando estado del job: ${runId}`);

    // Consultar estado en Databricks
    const databricksResponse = await fetch(`${databricksWorkspaceUrl}/api/2.1/jobs/runs/get?run_id=${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${databricksToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!databricksResponse.ok) {
      const errorData = await databricksResponse.json().catch(() => ({}));
      throw new Error(`Databricks API Error: ${databricksResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const jobStatus = await databricksResponse.json();

    // Log del estado actual
    if (fileId) {
      await supabase
        .from('processing_logs')
        .insert({
          file_id: fileId,
          user_id: user.id,
          operation: 'status_check',
          status: 'info',
          details: {
            run_id: runId,
            life_cycle_state: jobStatus.state?.life_cycle_state,
            result_state: jobStatus.state?.result_state,
            checked_at: new Date().toISOString()
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        runId: runId,
        status: jobStatus
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
    console.error('[CHECK-JOB-STATUS] Error:', error.message);

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
