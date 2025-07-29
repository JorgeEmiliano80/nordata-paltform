
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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

const generateInvitationEmailHTML = (
  fullName: string, 
  companyName: string | undefined, 
  inviteUrl: string
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a NORDATA.AI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="color: #2563eb; font-size: 28px; margin: 0;">NORDATA.AI</h1>
    <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">Plataforma de Análisis de Datos con IA</p>
  </div>

  <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <h2 style="color: #1f2937; margin-top: 0;">¡Hola ${fullName}!</h2>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Has sido invitado a unirte a <strong>NORDATA.AI</strong>, la plataforma líder en análisis de datos con inteligencia artificial.
    </p>

    ${companyName ? `<p style="font-size: 16px; margin-bottom: 20px;">Esta invitación es para <strong>${companyName}</strong>.</p>` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" 
         style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Completar Registro
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:
    </p>
    <p style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; word-break: break-all; color: #475569;">
      ${inviteUrl}
    </p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">¿Qué puedes hacer en NORDATA.AI?</h3>
      <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
        <li>📊 Procesar y analizar archivos de datos con IA</li>
        <li>🤖 Chat inteligente para consultas sobre tus datos</li>
        <li>📈 Dashboards y visualizaciones automáticas</li>
        <li>💡 Insights y recomendaciones personalizadas</li>
      </ul>
    </div>
  </div>

  <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 13px;">
    <p>Esta invitación expira en 7 días.</p>
    <p>Si no esperabas esta invitación, puedes ignorar este email.</p>
    <p style="margin-top: 20px;">
      <strong>NORDATA.AI</strong><br>
      Transformando datos en decisiones inteligentes
    </p>
  </div>

</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorización necesario');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Token inválido');
    }

    // Verificar que el usuario es admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Solo los administradores pueden enviar invitaciones');
    }

    const { email, fullName, companyName, industry }: InviteUserRequest = await req.json();

    console.log(`Creando invitación para: ${email} por admin: ${user.id}`);

    // Crear el token de invitación
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Guardar la invitación en la base de datos
    const { error: inviteError } = await supabase
      .from('pending_invitations')
      .insert({
        email,
        full_name: fullName,
        company_name: companyName,
        industry,
        invitation_token: invitationToken,
        invited_by: user.id,
        expires_at: expiresAt.toISOString()
      });

    if (inviteError) {
      throw new Error(`Error al crear invitación: ${inviteError.message}`);
    }

    // Crear URL de invitación
    const baseUrl = req.headers.get('origin') || 'https://www.nordataai.com';
    const inviteUrl = `${baseUrl}/register?token=${invitationToken}`;

    console.log(`Invitación creada. Token: ${invitationToken}`);

    // Intentar envío automático de email
    let emailSent = false;
    let emailError = null;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailSubject = companyName 
          ? `Invitación a NORDATA.AI para ${companyName}`
          : `Invitación a NORDATA.AI`;

        const emailHtml = generateInvitationEmailHTML(fullName, companyName, inviteUrl);

        const { data: emailData, error: sendError } = await resend.emails.send({
          from: 'NORDATA.AI <jorgeemiliano@nordataai.com>',
          to: [email],
          subject: emailSubject,
          html: emailHtml,
        });

        if (sendError) {
          throw sendError;
        }

        emailSent = true;
        console.log(`Email enviado exitosamente a ${email}:`, emailData);

      } catch (error: any) {
        emailError = error.message;
        console.error(`Error enviando email a ${email}:`, error);
      }
    } else {
      emailError = 'RESEND_API_KEY no configurada';
      console.log('RESEND_API_KEY no encontrada, saltando envío de email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitación creada exitosamente',
        invitationToken,
        inviteUrl,
        email,
        emailSent,
        emailError,
        note: emailSent 
          ? `Email enviado automáticamente a ${email}. También puedes compartir el enlace manualmente.`
          : `Invitación creada. Comparte el enlace con ${email} para que pueda registrarse.`,
        instructions: {
          automatic: emailSent ? 'Email enviado exitosamente' : 'Email no enviado',
          manual: 'Enlace disponible para compartir manualmente',
          expiration: 'La invitación expira en 7 días'
        }
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
    console.error('Error al crear invitación:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        emailSent: false
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
