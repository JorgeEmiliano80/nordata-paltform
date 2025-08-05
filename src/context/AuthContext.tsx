
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      const userData: User = {
        id: authUser.id,
        email: authUser.email!,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        role: profile?.role || 'client',
        company_name: profile?.company_name,
        industry: profile?.industry,
        is_active: profile?.is_active ?? true,
        created_at: profile?.created_at || authUser.created_at,
        updated_at: profile?.updated_at || authUser.updated_at,
      };

      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }

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
      
      if (inviteToken) {
        // Handle invitation registration
        const { data: inviteData, error: inviteError } = await supabase.rpc('validate_invitation', {
          token: inviteToken
        });

        if (inviteError || !inviteData?.valid) {
          return { error: 'Invalid invitation token' };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: inviteData.full_name,
              company_name: inviteData.company_name,
              industry: inviteData.industry,
            }
          }
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          await supabase.rpc('use_invitation', {
            user_uuid: data.user.id,
            token: inviteToken
          });
        }
      } else {
        // Regular registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });

        if (error) {
          return { error: error.message };
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
    profile: user,
    loading,
    profileLoading: loading,
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
