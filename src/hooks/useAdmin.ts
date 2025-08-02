
import { useInvites } from './useInvites';
import { useMasterAuth } from './useMasterAuth';
import { errorHandler } from '@/lib/errorHandler';

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

  const manageUser = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      const result = await masterAuth.manageUser(userId, action);
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
    manageUser
  };
};
