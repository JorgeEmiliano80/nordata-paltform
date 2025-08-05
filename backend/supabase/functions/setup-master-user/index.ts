
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupMasterRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, fullName, companyName }: SetupMasterRequest = await req.json();

    console.log(`Setup de usuario maestro: ${email}`);

    // Verificar que no existe ya un usuario admin
    const { data: existingAdmins, error: adminCheckError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    if (adminCheckError) {
      console.error('Error verificando admins existentes:', adminCheckError);
      throw new Error('Error verificando configuración existente');
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ya existe un usuario administrador configurado'
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creando usuario auth:', authError);
      throw new Error(`Error creando usuario: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('No se pudo crear el usuario');
    }

    console.log('Usuario auth creado:', authUser.user.id);

    // Crear perfil de administrador
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        full_name: fullName,
        company_name: companyName,
        industry: 'tecnologia',
        role: 'admin',
        is_active: true,
        accepted_terms: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      
      // Eliminar usuario auth si falla el perfil
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      throw new Error(`Error creando perfil: ${profileError.message}`);
    }

    console.log('Perfil de admin creado exitosamente');

    // Crear notificación de bienvenida
    await supabase
      .from('notifications')
      .insert({
        user_id: authUser.user.id,
        title: 'Bienvenido a NORDATA.AI',
        message: 'Tu cuenta de administrador ha sido configurada exitosamente. Ya puedes comenzar a usar la plataforma.',
        type: 'success',
        is_read: false
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario maestro configurado exitosamente',
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          profile: profile
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error en setup de usuario maestro:', error);
    
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
