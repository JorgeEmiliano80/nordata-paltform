
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el usuario es admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
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
        JSON.stringify({ error: 'Access denied: Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener todos los perfiles de usuarios
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        company_name,
        role,
        created_at,
        is_active,
        industry
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para cada perfil, obtener estadísticas adicionales
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Contar archivos
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('id, status, uploaded_at')
          .eq('user_id', profile.user_id);

        // Contar mensajes de chat
        const { data: chatData, error: chatError } = await supabase
          .from('chat_history')
          .select('id')
          .eq('user_id', profile.user_id);

        const files = filesData || [];
        const totalFiles = files.length;
        const processedFiles = files.filter(f => f.status === 'done').length;
        const failedFiles = files.filter(f => f.status === 'error').length;
        const lastUpload = files.length > 0 ? 
          Math.max(...files.map(f => new Date(f.uploaded_at).getTime())) : null;

        return {
          user_id: profile.user_id,
          full_name: profile.full_name || 'Sin nombre',
          company_name: profile.company_name || 'Sin empresa',
          role: profile.role,
          user_created_at: profile.created_at,
          is_active: profile.is_active,
          total_files: totalFiles,
          processed_files: processedFiles,
          failed_files: failedFiles,
          last_upload: lastUpload ? new Date(lastUpload).toISOString() : null,
          total_chat_messages: (chatData || []).length,
          industry: profile.industry
        };
      })
    );

    console.log(`Returning ${usersWithStats.length} users from admin dashboard`);

    return new Response(
      JSON.stringify({
        success: true,
        users: usersWithStats
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in admin-get-users function:', error);
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
