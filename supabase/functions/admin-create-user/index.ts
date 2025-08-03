
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar autorización
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verificar que sea admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Permisos insuficientes' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obtener datos del request
    const { email, fullName, companyName, industry, temporaryPassword } = await req.json();

    console.log(`Creando usuario: ${email} por admin: ${user.id}`);

    // Crear usuario en Supabase Auth con contraseña temporal
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
        industry: industry || 'tecnologia',
        require_password_change: true
      }
    });

    if (createError) {
      console.error('Error creando usuario:', createError);
      return new Response(
        JSON.stringify({
          success: false,
          error: createError.message.includes('already been registered') 
            ? 'Este email ya está registrado en el sistema' 
            : createError.message
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Crear perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        full_name: fullName,
        company_name: companyName,
        industry: industry || 'tecnologia',
        role: 'client',
        accepted_terms: true,
        is_active: true
      });

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      // Intentar eliminar el usuario de auth si falló el perfil
      try {
        await supabase.auth.admin.deleteUser(newUser.user.id);
      } catch (e) {
        console.error('Error eliminando usuario tras fallo de perfil:', e);
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error creando perfil de usuario'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Usuario creado exitosamente:', newUser.user.id);

    // Intentar enviar email con credenciales
    let emailSent = false;
    let emailError = null;

    if (resendApiKey) {
      try {
        const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '') || 'https://dabcbcd3-532f-4a38-9ed3-ee8822d33b3e.lovableproject.com'}/login`;
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'NORDATA.AI <jorgeemiliano@nordataai.com>',
            to: [email],
            subject: companyName ? `Acceso a NORDATA.AI para ${companyName}` : 'Acceso a NORDATA.AI',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #8B5CF6;">¡Bienvenido a NORDATA.AI!</h1>
                <p>Hola ${fullName},</p>
                <p>Se ha creado tu cuenta en NORDATA.AI. Aquí están tus credenciales de acceso:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
                  <p><strong>URL de acceso:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>⚠️ Importante:</strong></p>
                  <ul>
                    <li>Deberás cambiar tu contraseña en el primer acceso</li>
                    <li>Esta contraseña temporal expira en 7 días</li>
                    <li>Completa tu perfil una vez dentro de la plataforma</li>
                  </ul>
                </div>
                
                <h3>¿Qué puedes hacer en NORDATA.AI?</h3>
                <ul>
                  <li>📊 Cargar y analizar archivos de datos</li>
                  <li>🤖 Interactuar con nuestro chatbot especializado</li>
                  <li>📈 Generar insights automáticos</li>
                  <li>💼 Gestionar tus datos empresariales</li>
                </ul>
                
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>¡Bienvenido al futuro del análisis de datos!</p>
                <p><strong>El equipo de NORDATA.AI</strong></p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log('Email enviado exitosamente');
        } else {
          const errorData = await emailResponse.json();
          emailError = errorData.message || 'Error desconocido al enviar email';
          console.error('Error enviando email:', errorData);
        }
      } catch (error) {
        emailError = error.message;
        console.error('Error enviando email:', error);
      }
    } else {
      emailError = 'RESEND_API_KEY no configurada';
      console.log('RESEND_API_KEY no encontrada, saltando envío de email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario creado exitosamente',
        user_id: newUser.user.id,
        emailSent: emailSent,
        emailError: emailError
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error general:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
