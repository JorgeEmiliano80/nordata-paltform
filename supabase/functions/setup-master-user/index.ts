import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Configurando usuario master...');

    // Crear usuario en auth.users si no existe
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'iamjorgear80@gmail.com',
      password: 'Jorge41304254#',
      email_confirm: true,
      user_metadata: {
        full_name: 'Jorge Enrique Arrieta'
      }
    });

    if (authError && !authError.message.includes('already been registered')) {
      console.error('Error creando usuario auth:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: authError.message
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

    const userId = authUser?.user?.id || '00000000-0000-0000-0000-000000000001';

    // Crear o actualizar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: 'Jorge Enrique Arrieta',
        company_name: 'NORDATA.AI',
        industry: 'technology',
        role: 'admin',
        accepted_terms: true,
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: profileError.message
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

    console.log('Usuario master configurado exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario master configurado exitosamente',
        user_id: userId,
        profile: profile
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
    console.error('Error configurando usuario master:', error);

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