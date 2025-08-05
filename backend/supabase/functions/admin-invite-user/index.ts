
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteUserRequest {
  email: string;
  fullName: string;
  companyName: string;
  industry: string;
  message?: string;
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
      return new Response(
        JSON.stringify({ success: false, error: 'Access denied: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, fullName, companyName, industry, message }: InviteUserRequest = await req.json();

    console.log(`Admin ${user.id} invitando usuario: ${email}`);

    // Verificar si ya existe una invitación pendiente
    const { data: existingInvite, error: inviteCheckError } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (inviteCheckError) {
      console.error('Error verificando invitaciones existentes:', inviteCheckError);
    }

    if (existingInvite) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ya existe una invitación pendiente para este email' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar token de invitación único
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    // Crear registro de invitación
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        email: email,
        invited_by: user.id,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        user_data: {
          full_name: fullName,
          company_name: companyName,
          industry: industry
        },
        custom_message: message
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creando invitación:', invitationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error creando invitación: ${invitationError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar email de invitación usando Supabase Auth
    try {
      const inviteUrl = `${supabaseUrl.replace('supabase.co', 'vercel.app')}/invite/${inviteToken}`;
      
      const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          full_name: fullName,
          company_name: companyName,
          industry: industry,
          invite_token: inviteToken,
          custom_message: message
        }
      });

      if (emailError) {
        console.error('Error enviando email:', emailError);
        
        // Marcar invitación como fallida pero no fallar completamente
        await supabase
          .from('invitations')
          .update({ 
            status: 'email_failed',
            error_message: emailError.message 
          })
          .eq('id', invitation.id);
      } else {
        console.log('Email de invitación enviado exitosamente');
        
        // Actualizar estado de invitación
        await supabase
          .from('invitations')
          .update({ status: 'email_sent' })
          .eq('id', invitation.id);
      }
    } catch (emailException: any) {
      console.error('Excepción enviando email:', emailException);
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitation_id: invitation.id,
        message: 'Invitación creada exitosamente',
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error general en admin-invite-user:', error);
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
