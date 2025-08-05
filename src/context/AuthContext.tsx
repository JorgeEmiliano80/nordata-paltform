
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

// Security utility functions
const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  // Minimum 8 characters, at least one letter and one number
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_IN' && session?.user) {
              // Defer user profile loading to prevent deadlocks
              setTimeout(async () => {
                if (mounted) {
                  await loadUserProfile(session.user);
                }
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              cleanupAuthState();
            }
            
            if (mounted) {
              setLoading(false);
            }
          }
        );

        // Then check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          cleanupAuthState();
        } else if (session?.user && mounted) {
          await loadUserProfile(session.user);
        }

        if (mounted) {
          setLoading(false);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

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
      
      // Input validation
      if (!isValidEmail(email)) {
        return { error: 'Email inválido' };
      }
      
      if (!password || password.length < 6) {
        return { error: 'Contraseña debe tener al menos 6 caracteres' };
      }

      // Clean up existing state before login
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Global signout failed:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }

      if (data.user) {
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }

      return {};
    } catch (error: any) {
      console.error('Login exception:', error);
      return { error: error.message || 'Error de login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, inviteToken?: string) => {
    try {
      setLoading(true);
      
      // Input validation
      if (!isValidEmail(email)) {
        return { error: 'Email inválido' };
      }
      
      if (!isValidPassword(password)) {
        return { error: 'Contraseña debe tener al menos 8 caracteres, incluyendo letras y números' };
      }

      // Clean up existing state
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      if (inviteToken) {
        // Handle invitation registration
        const { data: inviteData, error: inviteError } = await supabase.rpc('validate_invitation', {
          token: inviteToken
        });

        if (inviteError || !inviteData) {
          return { error: 'Token de invitación inválido' };
        }

        const validInvite = inviteData as any;
        if (!validInvite?.valid) {
          return { error: 'Token de invitación inválido' };
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: validInvite.full_name || '',
              company_name: validInvite.company_name || '',
              industry: validInvite.industry || '',
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
          email: email.toLowerCase().trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
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
      console.error('Registration error:', error);
      return { error: error.message || 'Error de registro' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Logout error:', err);
      }
      
      setUser(null);
      
      // Force page reload for clean state
      window.location.href = '/login';
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
