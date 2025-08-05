
import { supabase } from '@/integrations/supabase/client';

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company_name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Error loading user profile');
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      full_name: profile.full_name || '',
      role: profile.role || 'client',
      company_name: profile.company_name,
      industry: profile.industry,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      user,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          company_name: userData.company_name,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        full_name: userData.full_name,
        company_name: userData.company_name,
        role: 'client',
        is_active: true,
        accepted_terms: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue even if profile creation fails
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      full_name: userData.full_name,
      role: 'client',
      company_name: userData.company_name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      user,
      token: data.session?.access_token || '',
      refresh_token: data.session?.refresh_token || '',
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  }

  async getProfile(): Promise<User> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('Error loading user profile');
    }

    return {
      id: user.id,
      email: user.email!,
      full_name: profile.full_name || '',
      role: profile.role || 'client',
      company_name: profile.company_name,
      industry: profile.industry,
      is_active: profile.is_active,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  async refreshToken(): Promise<string> {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      throw new Error('Token refresh failed');
    }
    
    return data.session.access_token;
  }

  getCurrentUser(): User | null {
    // This will be handled by the AuthContext
    return null;
  }

  getToken(): string | null {
    // Handled by Supabase internally
    return null;
  }

  isAuthenticated(): boolean {
    // This will be handled by the AuthContext
    return false;
  }

  isAdmin(): boolean {
    // This will be handled by the AuthContext
    return false;
  }
}

export const authService = new AuthService();
export default authService;
