
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading, profileLoading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but profile is still loading, show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // If profile failed to load after attempts, show error and redirect options
  if (!profile && !profileLoading) {
    console.error('Failed to load or create user profile');
    
    const handleBackToLogin = async () => {
      try {
        await signOut();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error signing out:', error);
        // Force navigation even if signOut fails
        navigate('/login', { replace: true });
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-destructive">Error al cargar el perfil</h2>
            <p className="text-muted-foreground text-sm">
              No se pudo cargar o crear el perfil de usuario. Esto puede ser un problema temporal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="min-w-[120px]"
            >
              Reintentar
            </Button>
            <Button 
              variant="default"
              onClick={handleBackToLogin}
              className="min-w-[120px]"
            >
              Volver al login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
