
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '@/services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileLoading: boolean;
  profile: User | null;
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isClient: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      const cachedUser = authService.getCurrentUser();
      
      if (token && cachedUser) {
        setUser(cachedUser);
        // Refresh user profile in background
        refreshUserProfile();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      setProfileLoading(true);
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // If profile refresh fails, user might need to login again
      await signOut();
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshUser = async () => {
    await refreshUserProfile();
  };

  const signIn = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      toast.success('Sesión iniciada exitosamente');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      toast.success('Cuenta creada exitosamente');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Error al crear cuenta';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
      // Clear local data anyway
      setUser(null);
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || false;
  };

  const isClient = (): boolean => {
    return user?.role === 'client' || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileLoading,
        profile: user, // For compatibility with existing code
        signIn,
        signUp,
        signOut,
        isAdmin,
        isClient,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
