
import { useAuth } from '@/context/AuthContext';

export const useRole = () => {
  const { user, loading } = useAuth();

  const hasPermission = (requiredRole: 'admin' | 'client') => {
    if (!user) return false;
    return user.role === requiredRole || user.role === 'admin';
  };

  const canAccessRoute = (pathname: string) => {
    if (!user) return false;

    const adminRoutes = ['/admin', '/admin-panel'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute) {
      return user.role === 'admin';
    }

    return true; // Client can access other routes
  };

  return {
    user,
    profile: user, // For backward compatibility
    loading,
    profileLoading: loading, // For backward compatibility
    hasPermission,
    canAccessRoute,
    // Legacy properties for backward compatibility
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client'
  };
};
