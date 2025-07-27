import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  fileId?: string;
  conversationHistory?: Array<{ message: string; response: string; }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Token inválido');
    }

    const { message, fileId, conversationHistory }: ChatRequest = await req.json();

    console.log(`Mensagem do chatbot para usuário ${user.id}: ${message}`);

    // Buscar contexto do arquivo se fileId for fornecido
    let fileContext = '';
    let fileData = null;
    
    if (fileId) {
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*, insights(*)')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (!fileError && file) {
        fileData = file;
        fileContext = `
        Contexto do arquivo:
        - Nome: ${file.file_name}
        - Tipo: ${file.file_type}
        - Status: ${file.status}
        - Data de upload: ${file.uploaded_at}
        - Insights disponíveis: ${file.insights?.length || 0}
        `;

        if (file.insights && file.insights.length > 0) {
          fileContext += '\nInsights gerados:\n';
          file.insights.forEach((insight: any, index: number) => {
            fileContext += `${index + 1}. ${insight.title}: ${insight.description}\n`;
          });
        }
      }
    }

    // Preparar contexto da conversa
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = 'Histórico da conversa:\n';
      conversationHistory.slice(-5).forEach((turn, index) => {
        conversationContext += `Usuário: ${turn.message}\nAssistente: ${turn.response}\n\n`;
      });
    }

    // Preparar prompt para OpenAI
    const systemPrompt = `Você é um assistente de IA especializado em análise de dados da plataforma NORDATA.AI. 
    Você ajuda usuários a entender seus dados e insights gerados pelo processamento.
    
    Diretrizes:
    - Seja preciso e útil nas respostas
    - Use os insights disponíveis para fornecer análises relevantes
    - Se não houver dados suficientes, sugira ações que o usuário pode tomar
    - Mantenha um tom profissional mas amigável
    - Responda em português brasileiro
    
    ${fileContext}
    ${conversationContext}`;

    // Chamar OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`Erro da OpenAI: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const assistantResponse = openaiResult.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.';

    // Salvar no histórico de chat
    await supabase
      .from('chat_history')
      .insert([
        {
          user_id: user.id,
          file_id: fileId,
          message: message,
          response: assistantResponse,
          is_user_message: true
        }
      ]);

    console.log(`Resposta gerada para usuário ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        response: assistantResponse,
        fileContext: fileData ? {
          fileName: fileData.file_name,
          status: fileData.status,
          insightsCount: fileData.insights?.length || 0
        } : null
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
    console.error('Erro no chatbot:', error);

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