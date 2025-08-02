
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  industry: string | null;
  role: 'admin' | 'client';
  accepted_terms: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, invitationToken?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isClient: () => boolean;
  fetchUserProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Función para limpiar el estado de autenticación
const cleanupAuthState = () => {
  // Limpiar localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpiar sessionStorage
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const createDefaultProfile = async (user: User) => {
    try {
      console.log('Creating default profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          company_name: user.user_metadata?.company_name || null,
          industry: user.user_metadata?.industry || null,
          role: 'client',
          accepted_terms: false,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default profile:', error);
        return null;
      }

      console.log('Default profile created:', data);
      return data;
    } catch (error) {
      console.error('Error creating default profile:', error);
      return null;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          // Get current user to create profile
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const newProfile = await createDefaultProfile(user);
            if (newProfile) {
              setProfile(newProfile);
              return;
            }
          }
        }
        
        setProfile(null);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 100);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        setLoading(false);
      }
    );

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, invitationToken?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          invitation_token: invitationToken
        }
      }
    });

    // If there's an invitation token, validate and use it
    if (!error && data.user && invitationToken) {
      try {
        const { data: success, error: inviteError } = await supabase
          .rpc('use_invitation', {
            user_uuid: data.user.id,
            token: invitationToken
          });

        if (inviteError || !success) {
          console.error('Error using invitation:', inviteError);
          return { data, error: { message: 'Token de convite inválido' } };
        }
      } catch (inviteError) {
        console.error('Error processing invitation:', inviteError);
        return { data, error: { message: 'Error al procesar convite' } };
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Error during sign out:', err);
      }
      
      // Clear state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Force page reload for clean state
      window.location.href = '/';
      
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const isClient = () => {
    return profile?.role === 'client';
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isClient,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
