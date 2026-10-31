import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

// BILLING, PAYMENTS & ANALYTICS MODULE
const router = Router();

// Staff/Admin view all invoices
router.get('/invoices', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  res.json({
    success: true,
    data: dbStore.invoices,
  });
});

// Staff/Admin view all payments
router.get('/payments', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  res.json({
    success: true,
    data: dbStore.payments,
  });
});

// Analytics overview
router.get('/analytics/overview', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  const activeSubs = dbStore.subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const totalRevenue = dbStore.payments.reduce((acc, p) => acc + p.amount, 0);
  const outstandingRevenue = dbStore.invoices
    .filter((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  res.json({
    success: true,
    data: {
      activeSubscriptions: activeSubs,
      totalRevenueCollected: totalRevenue,
      outstandingReceivables: outstandingRevenue,
      overdueInvoicesCount: dbStore.invoices.filter((i) => i.status === 'OVERDUE').length,
    },
  });
});

export default router;
