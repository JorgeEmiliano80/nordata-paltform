
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
  fallbackPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/unauthorized'
}) => {
  const { user, profile, hasPermission, canAccessRoute } = useRole();
  const location = useLocation();

  // Still loading authentication state
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check route-based access
  if (!canAccessRoute(location.pathname)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
