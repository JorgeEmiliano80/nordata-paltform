
import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);

// Admin only routes
router.get('/', requireRole('admin'), userController.getUsers);
router.get('/:id', requireRole('admin'), userController.getUser);
router.put('/:id', requireRole('admin'), userController.updateUser);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

export default router;
