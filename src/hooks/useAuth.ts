
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión de master almacenada
    const checkMasterSession = () => {
      const masterSession = localStorage.getItem('master_session');
      if (masterSession) {
        try {
          const data = JSON.parse(masterSession);
          setUser(data.user);
          setProfile(data.profile);
          setSession({ user: data.user, access_token: data.token } as any);
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error parsing master session:', error);
          localStorage.removeItem('master_session');
        }
      }
      return false;
    };

    // Si no hay sesión de master, configurar listener normal
    if (!checkMasterSession()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Buscar perfil del usuario
            setTimeout(async () => {
              await fetchUserProfile(session.user.id);
            }, 100);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      // Verificar sessión existente
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        // Se não encontrar perfil, limpar estados
        if (error.code === 'PGRST116') {
          setProfile(null);
        }
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Verificar si es el usuario master
    if (email === 'iamjorgear80@gmail.com' && password === 'Jorge41304254#') {
      try {
        const { data, error } = await supabase.functions.invoke('master-auth', {
          body: { email, password }
        });

        if (error) {
          console.error('Error en autenticación master:', error);
          return { error: { message: 'Error de conexión con el servidor' } };
        }

        if (data && data.success) {
          // Almacenar datos del master localmente
          localStorage.setItem('master_session', JSON.stringify(data));
          
          // Simular user y session para el master
          setUser({
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
            aud: 'authenticated'
          } as any);
          
          setProfile(data.profile);
          setSession({
            user: data.user,
            access_token: data.token
          } as any);

          return { error: null };
        } else {
          return { error: { message: data?.error || 'Credenciales inválidas' } };
        }
      } catch (error: any) {
        console.error('Error en login master:', error);
        return { error: { message: 'Error de conexión' } };
      }
    }

    // Login normal para otros usuarios
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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

    // Se há um token de convite, validar e usar
    if (!error && data.user && invitationToken) {
      try {
        const { data: success, error: inviteError } = await supabase
          .rpc('use_invitation', {
            user_uuid: data.user.id,
            token: invitationToken
          });

        if (inviteError || !success) {
          console.error('Erro ao usar convite:', inviteError);
          return { error: { message: 'Token de convite inválido' } };
        }
      } catch (inviteError) {
        console.error('Erro ao processar convite:', inviteError);
        return { error: { message: 'Erro ao processar convite' } };
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    // Verificar se é sessão de master
    const masterSession = localStorage.getItem('master_session');
    if (masterSession) {
      localStorage.removeItem('master_session');
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    }

    // Sign out normal para usuarios regulares
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const isClient = () => {
    return profile?.role === 'client';
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isClient,
    fetchUserProfile
  };
};
