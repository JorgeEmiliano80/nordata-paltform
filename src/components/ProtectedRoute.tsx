
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Se ainda está carregando e não passou do timeout
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário ou passou do timeout sem carregar
  if (!user || timeoutReached) {
    return <Navigate to="/login" replace />;
  }

  // Se tem usuário mas não tem perfil (pode ser normal para alguns casos)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Configurando perfil...</p>
        </div>
      </div>
    );
  }

  // Se tem perfil mas não está ativo
  if (!profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Conta Inativa</h2>
          <p className="text-muted-foreground">
            Sua conta está inativa. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
