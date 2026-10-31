import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

// QUOTATIONS & SUBSCRIPTIONS MODULE
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

// 1. List quotations with optional filters (?status=DRAFT&customerId=...)
router.get('/quotations', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const customerId = req.query.customerId as string | undefined;
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

// 2. Get single quotation by ID
router.get('/quotations/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.getQuotationById(id);
    if (!quotation) {
      res.status(404).json({ success: false, error: `Quotation '${id}' not found` });
      return;
    }
    res.json({ success: true, data: quotation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create a new quotation
router.post('/quotations', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const { customerId, planId, planName, validUntil, notes, lines } = req.body;
    if (!customerId) {
      res.status(400).json({ success: false, error: 'Customer is required' });
      return;
    }
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({ success: false, error: 'At least one line item is required' });
      return;
    }

    const quotation = dbStore.createQuotation({
      customerId,
      planId: planId || 'plan-001',
      planName,
      validUntil,
      notes,
      lines,
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} created successfully.`,
      data: quotation,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Update draft quotation
router.put('/quotations/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.updateQuotation(id, req.body);
    res.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} updated successfully.`,
      data: quotation,
    });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// 5. Confirm a draft quotation
router.post('/quotations/:id/confirm', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const quotation = dbStore.confirmQuotation(id);
    res.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} confirmed. Ready to activate subscription.`,
      data: quotation,
    });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// 6. Convert confirmed quotation into active subscription
router.post('/quotations/:id/convert', authenticateToken, requireRole('ADMIN', 'STAFF'), (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = dbStore.convertQuotationToSubscription(id);
    res.status(201).json({
      success: true,
      message: `Quotation ${result.quotation.quotationNumber} converted to Subscription ${result.subscription.subscriptionNumber}!`,
      data: result,
    });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// ==========================================
// SUBSCRIPTIONS API
// ==========================================

// 7. Staff/Admin view all subscriptions (alias for /all and /)
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

router.get('/', authenticateToken, requireRole('ADMIN', 'STAFF'), (_req: Request, res: Response) => {
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

// 8. Get subscription by ID
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

// 9. Update subscription status
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

// 10. Pause subscription
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

// 11. Resume subscription
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

// 12. Close subscription
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
