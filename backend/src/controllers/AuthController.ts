
import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { UserModel } from '@/models/User';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
import type { AuthenticatedRequest } from '@/middleware/auth';

export class AuthController {
  private authService: AuthService;
  private userModel: UserModel;

  constructor() {
    this.authService = new AuthService();
    this.userModel = new UserModel();
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createError('Email and password are required', 400);
      }

      const result = await this.authService.login({ email, password });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 401;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, company_name, industry } = req.body;

      if (!email || !password || !full_name) {
        throw createError('Email, password and full name are required', 400);
      }

      const result = await this.authService.register({
        email,
        password,
        full_name,
        company_name,
        industry
      });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 400;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  refreshTokens = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw createError('Refresh token not provided', 401);
      }

      const result = await this.authService.refreshTokens(refreshToken);

      // Set new refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.userId);
      }

      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const user = await this.userModel.findById(req.user.userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile'
      });
    }
  };
}
