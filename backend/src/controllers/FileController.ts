
import { Response } from 'express';
import { FileModel } from '@/models/File';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
import type { AuthenticatedRequest } from '@/middleware/auth';

export class FileController {
  private fileModel: FileModel;

  constructor() {
    this.fileModel = new FileModel();
  }

  getFiles = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const files = await this.fileModel.findByUserId(req.user.userId, limit, offset);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      logger.error('Get files error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get files'
      });
    }
  };

  getFile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const { id } = req.params;
      const file = await this.fileModel.findById(id);

      if (!file) {
        throw createError('File not found', 404);
      }

      // Check if user owns the file or is admin
      if (file.user_id !== req.user.userId && req.user.role !== 'admin') {
        throw createError('Access denied', 403);
      }

      res.json({
        success: true,
        data: file
      });
    } catch (error) {
      logger.error('Get file error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file'
      });
    }
  };

  deleteFile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const { id } = req.params;
      const file = await this.fileModel.findById(id);

      if (!file) {
        throw createError('File not found', 404);
      }

      // Check if user owns the file or is admin
      if (file.user_id !== req.user.userId && req.user.role !== 'admin') {
        throw createError('Access denied', 403);
      }

      await this.fileModel.delete(id);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      });
    }
  };

  getFileStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const userId = req.user.role === 'admin' ? undefined : req.user.userId;
      const stats = await this.fileModel.getStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get file stats error:', error);
      const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file stats'
      });
    }
  };
}
