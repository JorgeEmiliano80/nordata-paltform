
import { useInvites } from './useInvites';
import { useMasterAuth } from './useMasterAuth';

// Re-export types for backward compatibility
export type { PendingInvitation } from './useInvites';
export type { AdminUser } from './useMasterAuth';

export const useAdmin = () => {
  const invites = useInvites();
  const masterAuth = useMasterAuth();

  const fetchAdminData = async () => {
    const adminData = await masterAuth.fetchAdminData();
    const invitations = await invites.fetchInvitations();
    
    return {
      users: adminData.users,
      invitations
    };
  };

  return {
    loading: invites.loading || masterAuth.loading,
    fetchAdminData,
    createInvitation: invites.createInvitation,
    manageUser: masterAuth.manageUser
  };
};
