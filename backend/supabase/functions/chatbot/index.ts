
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
    console.log('Chatbot function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token de autorización requerido',
          response: 'Lo siento, necesitas estar autenticado para usar el chatbot.'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Invalid token:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido',
          response: 'Lo siento, tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { message, fileId, userId }: ChatbotRequest = await req.json();

    if (!message || !userId) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Mensaje y usuario requeridos',
          response: 'Lo siento, hubo un error en la solicitud. Por favor, intenta de nuevo.'
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

    console.log(`Procesando mensaje del chatbot para usuario: ${userId}, mensaje: "${message}"`);

    // Obtener contexto del archivo si se proporciona
    let fileContext = '';
    if (fileId) {
      console.log(`Obteniendo contexto del archivo: ${fileId}`);
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('file_name, metadata')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (!fileError && file) {
        fileContext = `Archivo: ${file.file_name}\n`;
        console.log(`Archivo encontrado: ${file.file_name}`);
        
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
          console.log(`${insights.length} insights encontrados`);
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
          conversationContext += `Asistente: ${msg.response || msg.message}\n`;
        }
      });
      console.log(`Historial de chat cargado: ${chatHistory.length} mensajes`);
    }

    // Generar respuesta del chatbot
    console.log('Generando respuesta del chatbot...');
    const response = await generateChatbotResponse(message, fileContext, conversationContext);
    console.log('Respuesta generada:', response);

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
  console.log('Simulando procesamiento de IA...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerMessage = message.toLowerCase();

  // Respuestas basadas en contexto de archivo
  if (fileContext && (lowerMessage.includes('archivo') || lowerMessage.includes('datos') || lowerMessage.includes('información'))) {
    return `Basándome en tu archivo:\n\n${fileContext}\n¿Hay algo específico que te gustaría saber sobre los datos o insights disponibles?`;
  }

  // Respuestas temáticas
  if (lowerMessage.includes('insights') || lowerMessage.includes('resultados') || lowerMessage.includes('análisis')) {
    return 'Los insights son análisis automatizados que se generan después del procesamiento de tus datos. Estos pueden incluir:\n\n• Tendencias y patrones\n• Anomalías detectadas\n• Resúmenes estadísticos\n• Correlaciones importantes\n\n¿Te gustaría saber más sobre algún tipo específico de insight?';
  }

  if (lowerMessage.includes('procesar') || lowerMessage.includes('processing') || lowerMessage.includes('subir')) {
    return 'Para procesar archivos en nuestra plataforma:\n\n1. **Subir archivo**: Ve a la sección "Subir Archivo" y arrastra tu archivo CSV, JSON o XLSX\n2. **Procesamiento**: Una vez subido, haz clic en "Procesar" para iniciar el análisis\n3. **Insights**: El sistema analizará automáticamente tus datos usando Databricks\n4. **Resultados**: Podrás ver los insights generados en tu dashboard\n\n¿Necesitas ayuda con algún paso específico?';
  }

  if (lowerMessage.includes('chatbot') || lowerMessage.includes('asistente') || lowerMessage.includes('ayuda')) {
    return '¡Hola! Soy tu asistente de análisis de datos. Puedo ayudarte con:\n\n🔍 **Análisis de datos**: Interpretar insights y resultados\n📊 **Procesamiento**: Guiarte en la subida y procesamiento de archivos\n💡 **Recomendaciones**: Sugerir mejores prácticas para tu análisis\n🔧 **Navegación**: Ayudarte a usar la plataforma\n\n¿En qué te puedo ayudar específicamente hoy?';
  }

  if (lowerMessage.includes('dashboard') || lowerMessage.includes('panel') || lowerMessage.includes('visualiz')) {
    return 'El dashboard te permite visualizar y analizar tus datos de diferentes formas:\n\n📈 **Analytics**: Métricas y KPIs principales\n👥 **Clientes**: Segmentación y análisis de comportamiento\n💰 **Finanzas**: Análisis de ingresos y costos\n📊 **Performance**: Indicadores de rendimiento\n\n¿Qué sección del dashboard te interesa más?';
  }

  if (lowerMessage.includes('databricks') || lowerMessage.includes('integración')) {
    return 'Nuestra integración con Databricks permite:\n\n⚡ **Procesamiento escalable**: Análisis de grandes volúmenes de datos\n🤖 **Machine Learning**: Algoritmos avanzados de análisis\n🔄 **Automatización**: Pipelines de datos automáticos\n📊 **Insights avanzados**: Análisis predictivos y descriptivos\n\nTodos los procesamientos se realizan de forma segura en la nube.';
  }

  if (lowerMessage.includes('hola') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return '¡Hola! 👋 Bienvenido/a a tu asistente de análisis de datos.\n\nEstoy aquí para ayudarte a sacar el máximo provecho de tus datos. Puedo asistirte con análisis, procesamiento de archivos, interpretación de insights y navegación por la plataforma.\n\n¿En qué puedo ayudarte hoy?';
  }

  if (lowerMessage.includes('gracias') || lowerMessage.includes('thanks')) {
    return '¡De nada! 😊 Me alegra poder ayudarte. Si tienes más preguntas sobre tus datos o necesitas ayuda con alguna funcionalidad de la plataforma, no dudes en preguntarme.\n\n¿Hay algo más en lo que pueda asistirte?';
  }

  // Respuesta genérica mejorada
  return `Entiendo tu consulta sobre "${message}".\n\nComo asistente de análisis de datos, puedo ayudarte con:\n\n• **Análisis de datos** y interpretación de resultados\n• **Procesamiento de archivos** (CSV, JSON, XLSX)\n• **Navegación** por las funcionalidades de la plataforma\n• **Insights** y recomendaciones basadas en tus datos\n\n¿Podrías ser más específico sobre lo que necesitas? Así podré darte una respuesta más precisa y útil.`;
}
