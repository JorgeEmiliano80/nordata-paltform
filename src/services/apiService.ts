
import { API_ENDPOINTS } from '@/config/databricks';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RateLimitState {
  requests: number[];
  lastReset: number;
}

class ApiService {
  private rateLimitMap = new Map<string, RateLimitState>();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = endpoint;
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, {
        requests: [],
        lastReset: now
      });
    }
    
    const state = this.rateLimitMap.get(key)!;
    
    // Reset if a minute has passed
    if (now - state.lastReset > 60000) {
      state.requests = [];
      state.lastReset = now;
    }
    
    // Remove requests older than 1 minute
    state.requests = state.requests.filter(time => now - time < 60000);
    
    // Check if we're at the limit
    if (state.requests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Add current request
    state.requests.push(now);
    return true;
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
        throw new Error('Only HTTPS requests are allowed in production');
      }
      return parsedUrl.toString();
    } catch (error) {
      throw new Error('Invalid URL provided');
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          // Log security-relevant errors
          if (response.status === 401 || response.status === 403) {
            console.warn(`Authentication/Authorization error: ${response.status}`);
          }
          throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } else {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { success: true, data: null as T };
      }
    } catch (error) {
      console.error('Response handling error:', error);
      throw error;
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      
      if (!this.checkRateLimit(sanitizedUrl)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const response = await fetch(sanitizedUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'same-origin', // Security: only send cookies for same-origin requests
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      
      if (!this.checkRateLimit(sanitizedUrl)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Validate and sanitize data
      let body: string | undefined;
      if (data !== undefined) {
        if (typeof data === 'object' && data !== null) {
          // Remove any potentially dangerous properties
          const sanitizedData = this.sanitizeObject(data);
          body = JSON.stringify(sanitizedData);
        } else {
          body = JSON.stringify(data);
        }
      }

      const response = await fetch(sanitizedUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body,
        credentials: 'same-origin',
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      
      if (!this.checkRateLimit(sanitizedUrl)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      let body: string | undefined;
      if (data !== undefined) {
        const sanitizedData = this.sanitizeObject(data);
        body = JSON.stringify(sanitizedData);
      }

      const response = await fetch(sanitizedUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body,
        credentials: 'same-origin',
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      
      if (!this.checkRateLimit(sanitizedUrl)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const response = await fetch(sanitizedUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'same-origin',
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      
      if (!this.checkRateLimit(sanitizedUrl)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Validate file
      if (!this.isValidFile(file)) {
        throw new Error('Invalid file type or size');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        const sanitizedData = this.sanitizeObject(additionalData);
        Object.entries(sanitizedData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(sanitizedUrl, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'same-origin',
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially dangerous properties
      if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Recursively sanitize nested objects
      sanitized[key] = this.sanitizeObject(value);
    }
    
    return sanitized;
  }

  private isValidFile(file: File): boolean {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    return true;
  }

  // Security utility to clear all cached data
  clearCache(): void {
    this.rateLimitMap.clear();
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;
