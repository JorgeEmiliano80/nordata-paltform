
/**
 * Servicio de Autenticación - Nueva Arquitectura GCP
 * Migrado de Supabase a Google Cloud Functions + Firebase Auth
 */

import { API_ENDPOINTS } from '@/config/databricks';

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  industry?: string;
  role: 'admin' | 'client';
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refresh_token?: string;
  message?: string;
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
  industry?: string;
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Cargar tokens desde localStorage al inicializar
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  /**
   * Realizar petición HTTP autenticada
   */
  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, intentar renovar
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Reintentar la petición original
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return retryResponse.json();
        } else {
          // No se pudo renovar, limpiar sesión
          this.logout();
          throw new Error('Sesión expirada');
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.token) {
        this.token = response.token;
        this.refreshToken = response.refresh_token;
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', this.token);
        if (this.refreshToken) {
          localStorage.setItem('refresh_token', this.refreshToken);
        }
        
        console.log('Login exitoso:', response.user);
      }

      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.token) {
        this.token = response.token;
        this.refreshToken = response.refresh_token;
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', this.token);
        if (this.refreshToken) {
          localStorage.setItem('refresh_token', this.refreshToken);
        }
      }

      return response;
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Renovar token de acceso
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        localStorage.setItem('auth_token', this.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.makeRequest(API_ENDPOINTS.AUTH.PROFILE);
      return response.user || null;
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar tokens localmente
      this.token = null;
      this.refreshToken = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return this.token;
  }
}

// Instancia singleton
export const authService = new AuthService();
