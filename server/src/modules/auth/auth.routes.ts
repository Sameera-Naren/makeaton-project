import { Router } from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  addStaff,
} from './auth.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected auth routes
router.get('/me', authenticateToken, getMe);

// Admin only: add staff
router.post('/add-staff', authenticateToken, requireRole('ADMIN'), addStaff);

export default router;
