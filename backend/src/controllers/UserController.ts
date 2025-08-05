
import { Response } from 'express';
import { UserModel } from '@/models/User';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
import type { AuthenticatedRequest } from '@/middleware/auth';

export class UserController {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

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

  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const { full_name, company_name, industry } = req.body;
      const updates: any = {};

      if (full_name) updates.full_name = full_name;
      if (company_name) updates.company_name = company_name;
      if (industry) updates.industry = industry;

      const user = await this.userModel.update(req.user.userId, updates);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      });
    }
  };

  getUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await this.userModel.findAll(limit, offset);
      const total = await this.userModel.count();

      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  };

  getUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userModel.findById(id);

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user'
      });
    }
  };

  updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updates.password;
      delete updates.password_hash;

      const user = await this.userModel.update(id, updates);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Update user error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (req.user?.userId === id) {
        throw createError('Cannot delete your own account', 400);
      }

      await this.userModel.delete(id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  };
}
