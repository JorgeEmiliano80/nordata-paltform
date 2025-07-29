
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Crear o actualizar usuario en auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'iamjorgear80@gmail.com',
      password: 'Jorge41304254#',
      email_confirm: true,
      user_metadata: {
        full_name: 'Jorge Enrique Arrieta',
        company_name: 'NORDATA.AI',
        industry: 'tecnologia'
      }
    });

    let userId = '00000000-0000-0000-0000-000000000001';
    
    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('Usuario ya existe en auth.users');
        // Buscar el usuario existente
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError) {
          const existingMaster = users.users.find(u => u.email === 'iamjorgear80@gmail.com');
          if (existingMaster) {
            userId = existingMaster.id;
            console.log('Usuario encontrado con ID:', userId);
          }
        }
      } else {
        console.error('Error creando usuario auth:', authError);
        return new Response(
          JSON.stringify({
            success: false,
            error: authError.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    } else if (authUser?.user) {
      userId = authUser.user.id;
      console.log('Usuario creado con ID:', userId);
    }

    // Crear o actualizar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: 'Jorge Enrique Arrieta',
        company_name: 'NORDATA.AI',
        industry: 'tecnologia',
        role: 'admin',
        accepted_terms: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error creando perfil: ${profileError.message}`
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
