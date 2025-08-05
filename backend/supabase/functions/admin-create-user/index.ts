import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  fullName: string;
  companyName: string;
  industry: string;
  temporaryPassword: string;
}

// Función para normalizar valores de industria permitidos
function normalizeIndustry(industry: string): string {
  if (!industry) return 'tecnologia';
  
  const normalized = industry.toLowerCase().trim();
  
  // Mapear valores comunes a los valores permitidos en la base de datos
  const industryMap: Record<string, string> = {
    'tecnologia': 'tecnologia',
    'tecnología': 'tecnologia',
    'technology': 'tecnologia',
    'tech': 'tecnologia',
    'salud': 'salud',
    'health': 'salud',
    'financiero': 'financiero',
    'finanzas': 'financiero',
    'finance': 'financiero',
    'educacion': 'educacion',
    'educación': 'educacion',
    'education': 'educacion',
    'retail': 'retail',
    'comercio': 'retail',
    'manufactura': 'manufactura',
    'manufacturing': 'manufactura',
    'servicios': 'servicios',
    'services': 'servicios'
  };

  return industryMap[normalized] || 'tecnologia'; // Default a 'tecnologia' si no se encuentra
}

serve(async (req) => {
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
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el usuario es admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar rol de admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.error('Profile error or not admin:', profileError, profile);
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, fullName, companyName, industry, temporaryPassword }: CreateUserRequest = await req.json();

    console.log(`Creating user: ${email} by admin: ${user.id}`);
    console.log('Input industry value:', industry);

    // Normalizar el valor de industria
    const normalizedIndustry = normalizeIndustry(industry);
    console.log('Normalized industry value:', normalizedIndustry);

    // Verificar si ya existe un usuario con este email y nombre
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('full_name', fullName)
      .eq('company_name', companyName)
      .maybeSingle();

    if (profileCheckError) {
      console.error('Error checking existing profile:', profileCheckError);
    }

    if (existingProfile) {
      console.log('User already exists in profiles:', existingProfile);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Un usuario con este nombre y empresa ya existe' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Intentar crear usuario en Supabase Auth
    let authUser;
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          company_name: companyName
        }
      });

      if (userError) {
        console.error('Error creating auth user:', userError);
        
        // Si el usuario ya existe en auth, intentar obtenerlo
        if (userError.message?.includes('already been registered') || userError.code === 'email_exists') {
          console.log('User already exists in auth, trying to get existing user...');
          
          // Buscar usuario por email usando el service key
          const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
          
          if (listError) {
            console.error('Error listing users:', listError);
            throw new Error('Error buscando usuarios existentes');
          }
          
          const existingUser = existingUsers.users.find(u => u.email === email);
          if (existingUser) {
            authUser = existingUser;
            console.log('Existing auth user found:', existingUser.id);
          } else {
            throw new Error('No se pudo crear ni encontrar el usuario');
          }
        } else {
          throw userError;
        }
      } else {
        authUser = userData.user;
        console.log('Auth user created successfully:', authUser.id);
      }
    } catch (authErr: any) {
      console.error('Error in user creation process:', authErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error creando usuario: ${authErr.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'No se pudo crear o encontrar el usuario' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear o actualizar perfil en la tabla profiles
    try {
      console.log('Creating profile with data:', {
        user_id: authUser.id,
        full_name: fullName,
        company_name: companyName,
        industry: normalizedIndustry,
        role: 'client',
        is_active: true,
        accepted_terms: true
      });

      const { data: profileData, error: profileInsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authUser.id,
          full_name: fullName,
          company_name: companyName,
          industry: normalizedIndustry, // Usar valor normalizado
          role: 'client',
          is_active: true,
          accepted_terms: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileInsertError) {
        console.error('Error creating profile:', profileInsertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Error creando perfil: ${profileInsertError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Profile created/updated successfully:', profileData);

    } catch (profileErr: any) {
      console.error('Error in profile creation:', profileErr);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error creando perfil de usuario: ${profileErr.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Intentar enviar email de bienvenida (opcional)
    let emailSent = false;
    let emailError = null;

    try {
      const { error: emailErr } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
          company_name: companyName,
          temporary_password: temporaryPassword
        }
      });
      
      if (emailErr) {
        emailError = emailErr.message;
        console.log('Email not sent:', emailErr.message);
      } else {
        emailSent = true;
        console.log('Welcome email sent successfully');
      }
    } catch (emailException: any) {
      emailError = emailException.message;
      console.log('Exception sending email:', emailException.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser.id,
        message: 'Usuario creado exitosamente',
        emailSent,
        emailError,
        credentials: {
          email: email,
          temporaryPassword: temporaryPassword
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('General error in admin-create-user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
