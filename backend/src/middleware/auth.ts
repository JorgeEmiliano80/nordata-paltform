
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';
import type { TokenPayload } from '@/types';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const authService = new AuthService();

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = authService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

export const requireRole = (requiredRole: 'admin' | 'client') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    next();
  };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const payload = authService.verifyAccessToken(token);
      req.user = payload;
    } catch (error) {
      // Token is invalid, but we don't fail the request
      logger.debug('Optional auth token invalid:', error);
    }
  }
  
  next();
};
