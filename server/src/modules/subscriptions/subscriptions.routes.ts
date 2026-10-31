import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

const router = Router();

// ==========================================
// CUSTOMERS LIST (Helper for Quotation Creation)
// ==========================================
router.get('/customers', authenticateToken, requireRole('ADMIN', 'STAFF'), (_req: Request, res: Response) => {
  try {
    const customers = dbStore.getAllCustomers();
    res.json({
      success: true,
      data: customers,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// QUOTATIONS API
// ==========================================

// 1. List quotations with RBAC filtering (?status=DRAFT&customerId=...)
router.get('/quotations', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    const status = req.query.status as string | undefined;
    const queryCustomer = req.query.customerId as string | undefined;
    const customerId = role === 'CUSTOMER' ? req.user!.id : queryCustomer;

    const quotations = dbStore.getQuotations({ status, customerId });
    res.json({
      success: true,
      data: quotations,
      count: quotations.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Customer asks for a custom quotation
router.post('/quotations/request', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { planName, notes, estimatedAmount, items } = req.body;
    if (!notes && !planName) {
      res.status(400).json({ success: false, error: 'Plan name or requirements notes are required.' });
      return;
    }

    const quotation = dbStore.createQuotationRequest({
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      planName,
      notes: notes || '',
      estimatedAmount: Number(estimatedAmount) || 0,
      items: items || [],
    });

    res.status(201).json({
      success: true,
      message: `Quotation request ${quotation.quotationNumber} submitted successfully.`,
      data: quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get single quotation by ID
router.get('/quotations/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.getQuotationById(id);
    if (!quotation) {
      res.status(404).json({ success: false, error: `Quotation '${id}' not found` });
      return;
    }

    // Customer can only view their own quotation
    if (req.user!.role === 'CUSTOMER' && quotation.customerId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'Forbidden: Access denied to other customer quotations.' });
      return;
    }

    res.json({ success: true, data: quotation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Staff prepares a commercial quotation for a customer
router.post('/quotations', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const { customerId, planId, planName, totalAmount, validDays, validUntil, notes, lines, items } = req.body;
    if (!customerId) {
      res.status(400).json({ success: false, error: 'Customer ID is required' });
      return;
    }

    // Support both line-item builder or direct amount quotation
    const quotationLines = lines || items || [];
    const quotation = dbStore.createQuotation({
      customerId,
      planId: planId || 'plan-001',
      planName: planName || 'Enterprise Subscription Plan',
      validUntil,
      notes: notes || '',
      lines: quotationLines,
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} prepared successfully.`,
      data: quotation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update quotation details
router.put('/quotations/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { notes, validUntil, lines } = req.body;
    const updated = dbStore.updateQuotation(id, { notes, validUntil, lines });
    res.json({
      success: true,
      message: `Quotation ${updated.quotationNumber} updated successfully`,
      data: updated,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 6. Send quotation to customer
router.post('/quotations/:id/send', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.sendQuotation(id);
    res.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} sent to customer. Status is now SENT.`,
      data: quotation,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 7. Staff/Admin updates quotation status directly
router.put('/quotations/:id/status', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = dbStore.updateQuotationStatus(id, status);
    if (!updated) {
      res.status(404).json({ success: false, error: `Quotation with ID '${id}' not found.` });
      return;
    }

    res.json({
      success: true,
      message: `Quotation status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Confirm quotation and convert into active subscription
router.post('/quotations/:id/confirm', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { quotation, subscription } = dbStore.confirmQuotation(id);
    res.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} confirmed! Subscription ${subscription.subscriptionNumber} created.`,
      data: {
        quotation,
        subscription,
      },
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 9. Delete quotation
router.delete('/quotations/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.deleteQuotation(id);
    res.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} deleted.`,
      data: quotation,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// ==========================================
// SUBSCRIPTIONS API
// ==========================================

// 10. Staff/Admin view all subscriptions
router.get('/all', authenticateToken, requireRole('ADMIN', 'STAFF'), (_req: Request, res: Response) => {
  try {
    const subs = dbStore.getAllSubscriptions();
    res.json({
      success: true,
      data: subs,
      count: subs.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. List subscriptions with RBAC: Customer gets their own, Staff/Admin gets all
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    if (role === 'STAFF' || role === 'ADMIN') {
      const subs = dbStore.getAllSubscriptions();
      res.json({
        success: true,
        data: subs,
        count: subs.length,
      });
    } else {
      const subs = dbStore.getCustomerSubscriptions(req.user!.id);
      res.json({
        success: true,
        data: subs,
        count: subs.length,
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Get subscription by ID
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const sub = dbStore.getSubscriptionById(id);
    if (!sub) {
      res.status(404).json({ success: false, error: `Subscription '${id}' not found` });
      return;
    }
    res.json({
      success: true,
      data: sub,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Update subscription status
router.put('/:id/status', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
      return;
    }
    const sub = dbStore.updateSubscriptionStatus(id, status);
    res.json({
      success: true,
      message: `Subscription ${sub.subscriptionNumber} status updated to ${status}`,
      data: sub,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 14. Pause subscription
router.post('/:id/pause', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const sub = dbStore.pauseSubscription(id);
    res.json({
      success: true,
      message: `Subscription ${sub.subscriptionNumber} is now paused.`,
      data: sub,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 15. Resume subscription
router.post('/:id/resume', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const sub = dbStore.resumeSubscription(id);
    res.json({
      success: true,
      message: `Subscription ${sub.subscriptionNumber} is now resumed and active.`,
      data: sub,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

// 16. Close subscription
router.post('/:id/close', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const sub = dbStore.closeSubscription(id);
    res.json({
      success: true,
      message: `Subscription ${sub.subscriptionNumber} has been closed.`,
      data: sub,
    });
  } catch (err: any) {
    const code = err.message.includes('not found') ? 404 : 400;
    res.status(code).json({ success: false, error: err.message });
  }
});

export default router;
