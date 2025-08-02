
import { useAuth } from '@/context/AuthContext';

export const useRole = () => {
  const { user, profile, isAdmin, isClient } = useAuth();

  const hasPermission = (requiredRole: 'admin' | 'client') => {
    if (!user || !profile) return false;
    
    if (requiredRole === 'admin') {
      return isAdmin();
    }
    
    if (requiredRole === 'client') {
      return isClient() || isAdmin(); // Admins can access client features
    }
    
    return false;
  };

  const canAccessRoute = (route: string) => {
    // Admin-only routes
    const adminRoutes = [
      '/admin',
      '/admin-panel',
      '/analytics',
      '/admin/clients',
      '/admin/insights', 
      '/admin/settings'
    ];
    
    // Client routes (also accessible by admins)
    const clientRoutes = [
      '/dashboard',
      '/upload',
      '/data',
      '/pipelines',
      '/insights',
      '/chatbot',
      '/ai',
      '/ai-assistant',
      '/customers',
      '/settings'
    ];
    
    if (adminRoutes.some(adminRoute => route.startsWith(adminRoute))) {
      return hasPermission('admin');
    }
    
    if (clientRoutes.some(clientRoute => route.startsWith(clientRoute))) {
      return hasPermission('client');
    }
    
    return true; // Public routes
  };

  return {
    user,
    profile,
    isAdmin: isAdmin(),
    isClient: isClient(),
    hasPermission,
    canAccessRoute,
    role: profile?.role || null
  };
};
