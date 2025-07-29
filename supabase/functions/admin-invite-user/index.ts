
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

    console.log(`Creando convite para: ${email} por admin: ${user.id}`);

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
      throw new Error(`Error al crear convite: ${inviteError.message}`);
    }

    // Crear URL de invitación
    const inviteUrl = `${req.headers.get('origin') || 'https://nordata.ai'}/register?token=${invitationToken}`;

    console.log(`Convite creado con éxito. Token: ${invitationToken}`);

    // Aquí es donde deberías integrar el servicio de email
    // Por ahora, solo retornamos la información para que el admin pueda enviar manualmente
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitación creada con éxito',
        invitationToken,
        inviteUrl,
        email,
        note: 'La invitación ha sido creada. Comparte el enlace con el usuario para que pueda registrarse.'
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
    console.error('Error al crear convite:', error);

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
