
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

    console.log(`Procesando archivo: ${fileId} por usuario: ${user.id}`);

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

    // Registrar inicio de procesamiento
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: user.id,
        operation: 'databricks_process',
        status: 'started',
        details: {
          file_name: file.file_name,
          file_type: file.file_type,
          started_at: new Date().toISOString()
        }
      });

    // Simular llamada a Databricks (en implementación real, aquí harías la llamada real)
    const databricksJobId = `job_${Date.now()}`;
    
    // Actualizar archivo con job ID
    await supabase
      .from('files')
      .update({
        databricks_job_id: databricksJobId,
        status: 'processing'
      })
      .eq('id', fileId);

    // Simular procesamiento asíncrono
    setTimeout(async () => {
      try {
        // Simular resultados de procesamiento
        const mockInsights = [
          {
            file_id: fileId,
            insight_type: 'summary',
            title: 'Resumen de Datos',
            description: 'Análisis estadístico básico del archivo',
            data: {
              total_rows: Math.floor(Math.random() * 10000) + 1000,
              columns: Math.floor(Math.random() * 20) + 5,
              null_values: Math.floor(Math.random() * 100),
              data_types: ['string', 'number', 'date']
            },
            confidence_score: 0.95
          },
          {
            file_id: fileId,
            insight_type: 'trend',
            title: 'Tendencias Detectadas',
            description: 'Patrones identificados en los datos',
            data: {
              trends: [
                { name: 'Incremento mensual', value: 12.5 },
                { name: 'Estacionalidad', value: 8.3 }
              ]
            },
            confidence_score: 0.78
          }
        ];

        // Insertar insights
        await supabase
          .from('insights')
          .insert(mockInsights);

        // Actualizar archivo como completado
        await supabase
          .from('files')
          .update({
            status: 'done',
            processed_at: new Date().toISOString(),
            metadata: {
              ...file.metadata,
              processing_completed: true,
              insights_generated: mockInsights.length
            }
          })
          .eq('id', fileId);

        // Registrar finalización exitosa
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            user_id: user.id,
            operation: 'databricks_complete',
            status: 'success',
            completed_at: new Date().toISOString(),
            details: {
              job_id: databricksJobId,
              insights_generated: mockInsights.length
            }
          });

        console.log(`Procesamiento completado para archivo: ${fileId}`);
        
      } catch (error: any) {
        console.error('Error en procesamiento:', error);
        
        // Actualizar archivo con error
        await supabase
          .from('files')
          .update({
            status: 'error',
            error_message: error.message || 'Error en procesamiento'
          })
          .eq('id', fileId);

        // Registrar error
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            user_id: user.id,
            operation: 'databricks_error',
            status: 'error',
            completed_at: new Date().toISOString(),
            error_details: error.message,
            details: { job_id: databricksJobId }
          });
      }
    }, 5000); // Simular 5 segundos de procesamiento

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Archivo enviado a procesamiento',
        jobId: databricksJobId
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
    console.error('Error procesando archivo:', error);

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
