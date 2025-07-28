import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
  user_id: string;
  full_name: string;
  company_name: string;
  role: 'admin' | 'client';
  user_created_at: string;
  is_active: boolean;
  total_files: number;
  processed_files: number;
  failed_files: number;
  last_upload: string | null;
  total_chat_messages: number;
}

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

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de usuarios
      const { data: users, error: usersError } = await supabase
        .rpc('get_admin_dashboard');

      if (usersError) {
        throw usersError;
      }

      // Obtener invitaciones pendientes
      const { data: invitations, error: invitationsError } = await supabase
        .from('pending_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (invitationsError) {
        throw invitationsError;
      }

      return {
        users: users || [],
        invitations: invitations || []
      };
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar datos del panel admin');
      return { users: [], invitations: [] };
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (
    email: string,
    fullName: string,
    companyName?: string,
    industry?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-invite-user', {
        body: {
          email,
          fullName,
          companyName,
          industry
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        toast.success('Invitación creada exitosamente');
        return {
          success: true,
          invitationToken: data.invitationToken,
          inviteUrl: data.inviteUrl
        };
      } else {
        throw new Error(data?.error || 'Error al crear invitación');
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast.error(error.message || 'Error al crear invitación');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const manageUser = async (
    action: 'update_profile' | 'deactivate_user' | 'activate_user',
    userId: string,
    data?: {
      fullName?: string;
      company?: string;
      industry?: string;
      role?: 'admin' | 'client';
    }
  ) => {
    try {
      setLoading(true);

      // Por ahora usaremos actualización directa hasta que se implemente la función RPC
      if (action === 'update_profile') {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: data?.fullName,
            company_name: data?.company,
            industry: data?.industry,
            role: data?.role,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        toast.success('Perfil actualizado exitosamente');
        return { success: true };
      } else if (action === 'deactivate_user') {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        toast.success('Usuario desactivado');
        return { success: true };
      } else if (action === 'activate_user') {
        const { error } = await supabase
          .from('profiles')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        toast.success('Usuario activado');
        return { success: true };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Error managing user:', error);
      toast.error(error.message || 'Error al gestionar usuario');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const setupMasterUser = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('setup-master-user');

      if (error) {
        throw error;
      }

      if (data && data.success) {
        toast.success('Usuario master configurado exitosamente');
        return { success: true };
      } else {
        throw new Error(data?.error || 'Error al configurar usuario master');
      }
    } catch (error: any) {
      console.error('Error setting up master user:', error);
      toast.error(error.message || 'Error al configurar usuario master');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchAdminData,
    createInvitation,
    manageUser,
    setupMasterUser
  };
};