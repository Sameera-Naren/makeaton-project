import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import {
  generateInvoiceFromSubscription,
  getAllInvoices,
  getInvoiceById,
  createManualInvoice,
  updateInvoiceStatus,
  recordManualPayment,
  getAllPayments,
  getBillingAnalytics,
} from './billing.controller.js';

// MEMBER 4 - BILLING, PAYMENTS & ANALYTICS MODULE
const router = Router();

// Invoices Endpoints
router.post(
  '/invoices/generate',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  generateInvoiceFromSubscription
);
router.get(
  '/invoices',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  getAllInvoices
);
router.get(
  '/invoices/:id',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  getInvoiceById
);
router.post(
  '/invoices',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  createManualInvoice
);
router.put(
  '/invoices/:id/status',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  updateInvoiceStatus
);

// Payments Endpoints
router.post(
  '/payments',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  recordManualPayment
);
router.get(
  '/payments',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  getAllPayments
);

// Billing & Revenue Analytics
router.get(
  '/analytics',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  getBillingAnalytics
);
router.get(
  '/analytics/overview',
  authenticateToken,
  requireRole('ADMIN', 'STAFF'),
  getBillingAnalytics
);

export default router;
