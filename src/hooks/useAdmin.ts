
import { useInvites } from './useInvites';
import { useMasterAuth } from './useMasterAuth';
import { errorHandler } from '@/lib/errorHandler';
import { supabase } from '@/integrations/supabase/client';

// Re-export types for backward compatibility
export type { PendingInvitation } from './useInvites';
export type { AdminUser } from './useMasterAuth';

export const useAdmin = () => {
  const invites = useInvites();
  const masterAuth = useMasterAuth();

  const fetchAdminData = async () => {
    try {
      const adminData = await masterAuth.fetchAdminData();
      const invitations = await invites.fetchInvitations();
      
      return {
        users: adminData.users,
        invitations
      };
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'supabase',
        operation: 'fetch_admin_data'
      });
      return {
        users: [],
        invitations: []
      };
    }
  };

  const createInvitation = async (email: string, name: string, company: string, industry?: string) => {
    try {
      const result = await invites.createInvitation(email, name, company, industry);
      if (result.success) {
        errorHandler.showSuccess('Convite criado com sucesso');
      }
      return result;
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'supabase',
        operation: 'create_invitation',
        technicalDetails: { email, name, company, industry }
      });
      return { success: false };
    }
  };

  const createUserWithPassword = async (
    email: string, 
    fullName: string, 
    companyName: string, 
    industry: string, 
    temporaryPassword: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          fullName,
          companyName,
          industry,
          temporaryPassword
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'supabase',
        operation: 'create_user_with_password',
        technicalDetails: { email, fullName, companyName, industry }
      });
      return { success: false, error: error.message };
    }
  };

  const manageUser = async (
    action: 'activate' | 'deactivate' | 'delete',
    userId: string,
    data?: {
      fullName?: string;
      company?: string;
      industry?: string;
      role?: 'admin' | 'client';
    }
  ) => {
    try {
      let masterAction: 'update_profile' | 'deactivate_user' | 'activate_user';
      
      switch (action) {
        case 'activate':
          masterAction = 'activate_user';
          break;
        case 'deactivate':
          masterAction = 'deactivate_user';
          break;
        case 'delete':
          masterAction = 'deactivate_user'; // We'll deactivate instead of delete
          break;
        default:
          throw new Error('Invalid action');
      }

      const result = await masterAuth.manageUser(masterAction, userId, data);
      if (result.success) {
        errorHandler.showSuccess(`Usuário ${action === 'activate' ? 'ativado' : action === 'deactivate' ? 'desativado' : 'removido'} com sucesso`);
      }
      return result;
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'supabase',
        operation: 'manage_user',
        userId,
        technicalDetails: { action }
      });
      return { success: false };
    }
  };

  return {
    loading: invites.loading || masterAuth.loading,
    fetchAdminData,
    createInvitation,
    createUserWithPassword,
    manageUser
  };
};
