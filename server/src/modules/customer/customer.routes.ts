import { Router } from 'express';
import {
  getCustomerDashboard,
  getCustomerSubscriptions,
  getSubscriptionById,
  getCustomerInvoices,
  getInvoiceById,
  getCustomerPayments,
  payInvoice,
  getCustomerProfile,
  updateCustomerProfile,
} from './customer.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

// Customer Dashboard
router.get('/dashboard', getCustomerDashboard);

// Customer Subscriptions
router.get('/subscriptions', getCustomerSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);

// Customer Invoices & Billing
router.get('/invoices', getCustomerInvoices);
router.get('/invoices/:id', getInvoiceById);

// Customer Payments
router.get('/payments', getCustomerPayments);
router.post('/pay-invoice', payInvoice);

// Customer Profile
router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);

export default router;
