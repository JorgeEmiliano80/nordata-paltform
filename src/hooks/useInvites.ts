
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PendingInvitation {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  industry: string | null;
  invitation_token: string;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  used_at: string | null;
}

export const useInvites = () => {
  const [loading, setLoading] = useState(false);

  const createInvitation = async (
    email: string,
    fullName: string,
    companyName?: string,
    industry?: string
  ) => {
    try {
      setLoading(true);

      // Obtener el token de sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase.functions.invoke('admin-invite-user', {
        body: {
          email,
          fullName,
          companyName,
          industry
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error calling function:', error);
        throw new Error(error.message || 'Error al crear invitación');
      }

      if (data && data.success) {
        if (data.emailSent) {
          toast.success('¡Invitación enviada por email exitosamente!', {
            description: `Se envió un email automático a ${email}`
          });
          toast.info('Enlace de respaldo disponible', {
            description: 'También puedes copiar el enlace para compartir manualmente'
          });
        } else {
          toast.warning('Email no enviado - Usa el enlace manual', {
            description: data.emailError || 'Problema con el envío automático'
          });
          toast.info('Invitación creada exitosamente', {
            description: 'Comparte el enlace con el usuario'
          });
        }

        return {
          success: true,
          invitationToken: data.invitationToken,
          inviteUrl: data.inviteUrl,
          emailSent: data.emailSent,
          emailError: data.emailError,
          instructions: data.instructions
        };
      } else {
        throw new Error(data?.error || 'Error al crear invitación');
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast.error('Error al crear invitación', {
        description: error.message || 'Error desconocido'
      });
      return { 
        success: false, 
        emailSent: false,
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      // Después de la limpieza, no deberían existir invitaciones pendientes
      console.log('Fetching invitations after database cleanup - should be empty');
      
      const { data: invitations, error: invitationsError } = await supabase
        .from('pending_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError);
        toast.error('Error al cargar invitaciones');
        return [];
      }

      console.log(`Found ${invitations?.length || 0} pending invitations after cleanup`);
      return invitations || [];
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Error al cargar invitaciones');
      return [];
    }
  };

  return {
    loading,
    createInvitation,
    fetchInvitations
  };
};
