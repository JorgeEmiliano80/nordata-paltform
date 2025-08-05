
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import type { User as AuthUser } from '@/services/authService';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
  company_name?: string;
  industry?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: User | null;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, inviteToken?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  // Legacy methods for backward compatibility
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, inviteToken?: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Transform AuthUser to User
const transformUser = (authUser: AuthUser): User => ({
  id: authUser.id,
  email: authUser.email,
  full_name: authUser.full_name,
  role: authUser.role,
  company_name: authUser.company_name,
  industry: undefined, // Set to undefined since AuthUser doesn't have this field
  is_active: true, // Default to true since backend doesn't return this field
  created_at: authUser.created_at,
  updated_at: authUser.updated_at,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await authService.getProfile();
        setUser(transformUser(userData));
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const credentials = { email, password };
      const result = await authService.login(credentials);
      setUser(transformUser(result.user));
      return {};
    } catch (error: any) {
      return { error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, inviteToken?: string) => {
    try {
      setLoading(true);
      const userData = { email, password, full_name: email.split('@')[0] };
      const result = await authService.register(userData);
      return {};
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Legacy method aliases for backward compatibility
  const signIn = login;
  const signUp = register;
  const signOut = logout;

  const value: AuthContextType = {
    user,
    profile: user, // For backward compatibility
    loading,
    profileLoading: loading, // For backward compatibility
    login,
    register,
    logout,
    signOut,
    isAdmin,
    signIn,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
