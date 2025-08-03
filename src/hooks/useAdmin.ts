
import { useInvites } from './useInvites';
import { useMasterAuth } from './useMasterAuth';
import { errorHandler } from '@/lib/errorHandler';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log('useAdmin: Iniciando creación de usuario', { email, fullName });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          fullName,
          companyName,
          industry,
          temporaryPassword
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      console.log('useAdmin: Respuesta de función edge:', { data, error });

      if (error) {
        console.error('useAdmin: Error de función edge:', error);
        throw new Error(error.message || 'Error en la función edge');
      }

      if (data && data.success) {
        toast.success('Usuario creado exitosamente');
        return {
          success: true,
          user_id: data.user_id,
          emailSent: data.emailSent,
          emailError: data.emailError
        };
      } else {
        const errorMsg = data?.error || 'Error desconocido al crear usuario';
        console.error('useAdmin: Error en respuesta:', errorMsg);
        toast.error(errorMsg);
        return { 
          success: false, 
          error: errorMsg 
        };
      }
    } catch (error: any) {
      console.error('useAdmin: Error general:', error);
      const errorMsg = error.message || 'Error interno al crear usuario';
      toast.error(errorMsg);
      return { 
        success: false, 
        error: errorMsg 
      };
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
