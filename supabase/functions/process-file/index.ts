
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessFileRequest {
  fileId: string;
}

// Configuración estricta de validación de archivos
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/json'
];

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.json'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ValidationError {
  type: string;
  message: string;
}

const validateFileMetadata = (file: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  console.log(`[VALIDATION] Validando archivo: ${file.file_name}, tipo: ${file.file_type}, tamaño: ${file.file_size}`);
  
  // Validar tamaño
  if (file.file_size > MAX_FILE_SIZE) {
    errors.push({
      type: 'file_size',
      message: `Archivo excede el tamaño máximo de ${MAX_FILE_SIZE / (1024 * 1024)}MB. Tamaño: ${(file.file_size / (1024 * 1024)).toFixed(2)}MB`
    });
  }
  
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.file_type)) {
    errors.push({
      type: 'mime_type',
      message: `Tipo MIME no válido: ${file.file_type}. Tipos permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`
    });
  }
  
  // Validar extensión
  const fileExtension = '.' + file.file_name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    errors.push({
      type: 'file_extension',
      message: `Extensión no válida: ${fileExtension}. Extensiones permitidas: ${ALLOWED_EXTENSIONS.join(', ')}`
    });
  }
  
  // Validar correspondencia MIME type - extensión
  const mimeExtensionMap: { [key: string]: string[] } = {
    'text/csv': ['.csv'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/json': ['.json']
  };
  
  const allowedExtensions = mimeExtensionMap[file.file_type];
  if (allowedExtensions && !allowedExtensions.includes(fileExtension)) {
    errors.push({
      type: 'type_extension_mismatch',
      message: `El tipo de archivo (${file.file_type}) no coincide con su extensión (${fileExtension})`
    });
  }
  
  return errors;
};

const logValidationError = async (supabase: any, fileId: string, userId: string, errors: ValidationError[]) => {
  await supabase
    .from('processing_logs')
    .insert({
      file_id: fileId,
      user_id: userId,
      operation: 'backend_validation',
      status: 'failed',
      details: {
        validation_errors: errors,
        timestamp: new Date().toISOString(),
        error_count: errors.length
      }
    });
};

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

    // VALIDACIÓN ESTRICTA EN BACKEND
    console.log(`[PROCESS-FILE] Iniciando validación de backend para: ${file.file_name}`);
    
    const validationErrors = validateFileMetadata(file);
    
    if (validationErrors.length > 0) {
      console.error(`[PROCESS-FILE] Validación falló:`, validationErrors);
      
      // Registrar errores de validación
      await logValidationError(supabase, fileId, user.id, validationErrors);
      
      // Actualizar estado del archivo a error
      await supabase
        .from('files')
        .update({
          status: 'error',
          error_message: `Validación de backend falló: ${validationErrors.map(e => e.message).join('; ')}`
        })
        .eq('id', fileId);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Archivo no válido',
          validation_errors: validationErrors,
          message: 'El archivo no cumple con los requisitos de seguridad'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`[PROCESS-FILE] ✅ Validación de backend exitosa`);

    // Validar estado del archivo
    if (file.status !== 'uploaded') {
      throw new Error(`Archivo en estado incorrecto: ${file.status}`);
    }

    // Verificar variables de entorno de Databricks
    const databricksWorkspaceUrl = Deno.env.get('DATABRICKS_WORKSPACE_URL');
    const databricksToken = Deno.env.get('DATABRICKS_TOKEN');
    const databricksJobId = Deno.env.get('DATABRICKS_JOB_ID');

    if (!databricksWorkspaceUrl || !databricksToken || !databricksJobId) {
      console.error('[PROCESS-FILE] Missing Databricks environment variables');
      throw new Error('Configuración de Databricks no disponible');
    }

    // Actualizar estado a procesando
    await supabase
      .from('files')
      .update({ status: 'processing' })
      .eq('id', fileId);

    // Registrar validación exitosa
    await supabase
      .from('processing_logs')
      .insert({
        file_id: fileId,
        user_id: user.id,
        operation: 'backend_validation',
        status: 'success',
        details: {
          file_name: file.file_name,
          file_type: file.file_type,
          file_size: file.file_size,
          validation_passed: true,
          validated_at: new Date().toISOString()
        }
      });

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
        message: 'Archivo validado y enviado a Databricks para procesamiento',
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
          
        // Registrar error en logs
        await supabase
          .from('processing_logs')
          .insert({
            file_id: fileId,
            user_id: null, // No tenemos acceso al user_id aquí
            operation: 'process_file_error',
            status: 'error',
            details: {
              error_message: error.message,
              error_type: 'process_file_exception',
              timestamp: new Date().toISOString()
            }
          });
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
