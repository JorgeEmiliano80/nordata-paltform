
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SecurityContextType {
  isSecureConnection: boolean;
  sessionTimeout: number;
  lastActivity: number;
  updateActivity: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecureConnection, setIsSecureConnection] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    // Check if connection is secure
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';
    
    setIsSecureConnection(isSecure);
    
    if (!isSecure && process.env.NODE_ENV === 'production') {
      toast.error('Conexión insegura detectada. Redirigiendo a HTTPS...', {
        duration: 5000
      });
      
      // Redirect to HTTPS in production
      setTimeout(() => {
        window.location.href = window.location.href.replace('http:', 'https:');
      }, 2000);
    }
  }, []);

  useEffect(() => {
    // Session timeout management
    const checkSessionTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity > sessionTimeout) {
        toast.warning('Sesión expirada por inactividad', {
          description: 'Por seguridad, debes iniciar sesión nuevamente'
        });
        
        // Clear auth state
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '/login';
      }
    };

    // Check every minute
    const interval = setInterval(checkSessionTimeout, 60000);

    // Activity listeners
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Warn 5 minutes before timeout
    const warningInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeUntilTimeout = sessionTimeout - timeSinceLastActivity;
      
      if (timeUntilTimeout <= 5 * 60 * 1000 && timeUntilTimeout > 4 * 60 * 1000) {
        toast.warning('Tu sesión expirará en 5 minutos', {
          description: 'Mueve el mouse o presiona una tecla para mantenerla activa'
        });
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(warningInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [lastActivity, sessionTimeout]);

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const value: SecurityContextType = {
    isSecureConnection,
    sessionTimeout,
    lastActivity,
    updateActivity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
