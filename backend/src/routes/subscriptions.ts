import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth to all subscription routes
router.use(authMiddleware);

// GET /api/subscriptions
router.get('/', subscriptionController.list);

// GET /api/subscriptions/:id
router.get('/:id', subscriptionController.getById);

// PATCH /api/subscriptions/:id/status (generic status update)
router.patch('/:id/status', subscriptionController.updateStatus);

// POST /api/subscriptions/:id/pause
router.post('/:id/pause', subscriptionController.pause);

// POST /api/subscriptions/:id/resume
router.post('/:id/resume', subscriptionController.resume);

// POST /api/subscriptions/:id/close
router.post('/:id/close', subscriptionController.close);

export default router;
