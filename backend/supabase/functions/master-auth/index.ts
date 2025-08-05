
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MasterLoginRequest {
  email: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get master credentials from environment variables (Supabase secrets)
    const masterEmail = Deno.env.get('MASTER_EMAIL');
    const masterPassword = Deno.env.get('MASTER_PASSWORD');
    
    if (!masterEmail || !masterPassword) {
      console.error('Master credentials not configured in environment');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuración de sistema incompleta'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email, password }: MasterLoginRequest = await req.json();

    console.log(`Intento de login master para: ${email}`);

    // Validate credentials against environment variables
    if (email !== masterEmail || password !== masterPassword) {
      console.log('Credenciales incorrectas para master');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Buscar perfil del usuario master
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('full_name', 'Jorge Emiliano')
      .eq('company_name', 'NORDATA.AI')
      .single();

    if (profileError || !profile) {
      console.error('Perfil de master no encontrado:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario master no configurado correctamente'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create secure token with expiration
    const masterToken = btoa(JSON.stringify({
      user_id: profile.user_id,
      email: email,
      role: 'admin',
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iat: Date.now()
    }));

    console.log('Login de master exitoso');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: profile.user_id,
          email: email,
          user_metadata: {
            full_name: profile.full_name,
            company_name: profile.company_name
          }
        },
        profile: profile,
        token: masterToken
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error en login de master:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
