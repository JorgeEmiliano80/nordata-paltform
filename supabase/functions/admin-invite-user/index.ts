import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  fullName: string;
  companyName?: string;
  industry?: string;
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

    const { email, fullName, companyName, industry }: InviteUserRequest = await req.json();

    console.log(`Criando convite para: ${email} por admin: ${user.id}`);

    // Usar a função do banco para criar o convite
    const { data: invitationToken, error: inviteError } = await supabase
      .rpc('create_invitation', {
        invite_email: email,
        invite_name: fullName,
        invite_company: companyName,
        invite_industry: industry
      });

    if (inviteError) {
      throw new Error(`Erro ao criar convite: ${inviteError.message}`);
    }

    // Aqui você pode integrar com um serviço de email para enviar o convite
    // Por enquanto, apenas retornamos o token para o admin
    const inviteUrl = `${req.headers.get('origin') || 'https://nordata.ai'}/register?token=${invitationToken}`;

    console.log(`Convite criado com sucesso. Token: ${invitationToken}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Convite criado com sucesso',
        invitationToken,
        inviteUrl,
        email
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
    console.error('Erro ao criar convite:', error);

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