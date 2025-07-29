
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatbotRequest {
  message: string;
  fileId?: string;
  userId: string;
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

    const { message, fileId, userId }: ChatbotRequest = await req.json();

    if (!message || !userId) {
      throw new Error('Mensaje y usuario requeridos');
    }

    console.log(`Procesando mensaje del chatbot para usuario: ${userId}`);

    // Obtener contexto del archivo si se proporciona
    let fileContext = '';
    if (fileId) {
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('file_name, metadata')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (!fileError && file) {
        fileContext = `Archivo: ${file.file_name}\n`;
        
        // Obtener insights del archivo
        const { data: insights, error: insightsError } = await supabase
          .from('insights')
          .select('*')
          .eq('file_id', fileId)
          .limit(5);

        if (!insightsError && insights && insights.length > 0) {
          fileContext += `Insights disponibles:\n`;
          insights.forEach((insight) => {
            fileContext += `- ${insight.title}: ${insight.description}\n`;
          });
        }
      }
    }

    // Obtener historial reciente de chat
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_history')
      .select('message, response, is_user_message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    let conversationContext = '';
    if (!historyError && chatHistory && chatHistory.length > 0) {
      conversationContext = 'Contexto de conversación reciente:\n';
      chatHistory.reverse().forEach((msg) => {
        if (msg.is_user_message) {
          conversationContext += `Usuario: ${msg.message}\n`;
        } else {
          conversationContext += `Asistente: ${msg.response}\n`;
        }
      });
    }

    // Generar respuesta del chatbot (simulada)
    const response = await generateChatbotResponse(message, fileContext, conversationContext);

    return new Response(
      JSON.stringify({
        success: true,
        response: response,
        timestamp: new Date().toISOString()
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
    console.error('Error en chatbot:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        response: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
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

async function generateChatbotResponse(message: string, fileContext: string, conversationContext: string): Promise<string> {
  // Simular procesamiento de IA
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerMessage = message.toLowerCase();

  // Respuestas basadas en contexto
  if (fileContext && lowerMessage.includes('archivo')) {
    return `Veo que estás preguntando sobre tu archivo. ${fileContext}\n\n¿Hay algo específico que te gustaría saber sobre los datos o insights disponibles?`;
  }

  if (lowerMessage.includes('insights') || lowerMessage.includes('resultados')) {
    return 'Los insights son análisis automatizados que se generan después del procesamiento de tus datos. Estos pueden incluir tendencias, anomalías, patrones y resúmenes estadísticos. ¿Te gustaría saber más sobre algún tipo específico de insight?';
  }

  if (lowerMessage.includes('procesar') || lowerMessage.includes('processing')) {
    return 'El procesamiento de archivos se realiza a través de nuestra integración con Databricks. Una vez que subes un archivo, puedes enviarlo a procesamiento haciendo clic en el botón "Procesar". El sistema analizará tus datos y generará insights automatizados.';
  }

  if (lowerMessage.includes('subir') || lowerMessage.includes('upload')) {
    return 'Puedes subir archivos en formato CSV, JSON o XLSX. Simplemente ve a la sección de "Subir Archivo" y arrastra tu archivo o haz clic para seleccionarlo. El archivo se guardará de forma segura y estará listo para procesamiento.';
  }

  if (lowerMessage.includes('ayuda') || lowerMessage.includes('help')) {
    return 'Estoy aquí para ayudarte con:\n- Subida y procesamiento de archivos\n- Interpretación de insights\n- Navegación por la plataforma\n- Preguntas sobre tus datos\n\n¿En qué te puedo ayudar específicamente?';
  }

  if (lowerMessage.includes('hola') || lowerMessage.includes('hello')) {
    return '¡Hola! Soy tu asistente de análisis de datos. Puedo ayudarte con el procesamiento de archivos, interpretación de insights y responder preguntas sobre tus datos. ¿En qué puedo ayudarte hoy?';
  }

  // Respuesta genérica
  return 'Entiendo tu pregunta. Como asistente de análisis de datos, puedo ayudarte con el procesamiento de archivos, interpretación de insights y navegación por la plataforma. ¿Podrías ser más específico sobre lo que necesitas?';
}
