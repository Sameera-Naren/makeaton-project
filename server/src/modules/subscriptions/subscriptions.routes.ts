import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

// MEMBER 3 - QUOTATIONS & SUBSCRIPTIONS MODULE
const router = Router();

// Staff/Admin view all subscriptions
router.get('/', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  res.json({
    success: true,
    data: dbStore.subscriptions,
  });
});

// Create subscription or convert quotation stub (Member 3 hook)
router.post('/', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Subscription created/converted successfully (Member 3 Module).',
    data: req.body,
  });
});

export default router;
