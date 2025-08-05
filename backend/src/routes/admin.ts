
import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';

const router = Router();

// All admin routes require admin role
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin dashboard endpoint - to be implemented'
    }
  });
});

export default router;
