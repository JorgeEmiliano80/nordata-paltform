
import { useAuth } from '@/context/AuthContext';

export const useRole = () => {
  const { user, loading, profileLoading, isAdmin, isClient } = useAuth();

  const hasPermission = (requiredRole: 'admin' | 'client'): boolean => {
    if (!user) return false;
    
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    // Clients can access client routes, admins can access both
    return user.role === 'client' || user.role === 'admin';
  };

  const canAccessRoute = (pathname: string): boolean => {
    if (!user) return false;

    // Admin routes - only for admins
    if (pathname.startsWith('/admin') || pathname === '/analytics') {
      return user.role === 'admin';
    }

    // All other protected routes - accessible by both roles
    return true;
  };

  return {
    user,
    profile: user,
    loading,
    profileLoading,
    isAdmin,
    isClient,
    hasPermission,
    canAccessRoute,
  };
};
