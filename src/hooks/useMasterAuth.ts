
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

export const useMasterAuth = () => {
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const { data: users, error: usersError } = await supabase
        .rpc('get_admin_dashboard');

      if (usersError) {
        console.error('Error from RPC:', usersError);
        toast.error('Error al cargar datos del panel admin');
        return { users: [] };
      }

      return {
        users: users || []
      };
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar datos del panel admin');
      return { users: [] };
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

  return {
    loading,
    fetchAdminData,
    manageUser
  };
};
