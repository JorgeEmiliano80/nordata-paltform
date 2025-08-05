
import { Router } from 'express';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Placeholder for chatbot routes
router.use(authenticate);

router.post('/message', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Chatbot endpoint - to be implemented'
    }
  });
});

export default router;
