import { Router } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { dbStore } from '../../lib/store.js';

const router = Router();

// =================================================================
// SUBSCRIPTIONS ROUTES
// =================================================================

// GET /api/subscriptions: List subscriptions according to RBAC
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const role = req.user!.role;
    if (role === 'STAFF' || role === 'ADMIN') {
      res.json({
        success: true,
        data: dbStore.getAllSubscriptions(),
      });
    } else {
      res.json({
        success: true,
        data: dbStore.getCustomerSubscriptions(req.user!.id),
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/subscriptions/all: Staff and Admin view of all customer subscriptions
router.get('/all', authenticateToken, requireRole('ADMIN', 'STAFF'), (req, res) => {
  try {
    res.json({
      success: true,
      data: dbStore.getAllSubscriptions(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================================================================
// QUOTATIONS ROUTES (CUSTOMER & STAFF RBAC)
// =================================================================

// GET /api/subscriptions/quotations: Customer sees their own; Staff/Admin see all
router.get('/quotations', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const role = req.user!.role;
    const customerId = role === 'CUSTOMER' ? req.user!.id : undefined;
    const quotations = dbStore.getQuotations(customerId);

    res.json({
      success: true,
      data: quotations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/subscriptions/quotations/request: Customer asks for a custom quotation
router.post('/quotations/request', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { planName, notes, estimatedAmount, items } = req.body;

    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please describe your custom quotation requirements or notes.',
      });
      return;
    }

    const quotation = dbStore.createQuotationRequest({
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      planName: planName || 'Custom Enterprise Configuration',
      notes: notes.trim(),
      estimatedAmount: Number(estimatedAmount) || 0,
      items: Array.isArray(items) ? items : [],
    });

    res.status(201).json({
      success: true,
      message: `Quotation request ${quotation.quotationNumber} submitted successfully. A staff specialist will review it.`,
      data: quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/subscriptions/quotations: Staff prepares a new quotation for a customer
router.post('/quotations', authenticateToken, requireRole('STAFF', 'ADMIN'), (req, res) => {
  try {
    const { customerId, planName, totalAmount, notes, validDays, items } = req.body;

    if (!customerId) {
      res.status(400).json({ success: false, error: 'Customer ID is required to prepare a quotation.' });
      return;
    }

    if (!planName) {
      res.status(400).json({ success: false, error: 'Plan or service bundle name is required.' });
      return;
    }

    const quotation = dbStore.prepareStaffQuotation({
      customerId,
      planName,
      totalAmount: Number(totalAmount) || 0,
      notes,
      validDays: Number(validDays) || 30,
      items,
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} prepared successfully for customer.`,
      data: quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/subscriptions/quotations/:id/status: Staff/Admin updates quotation status
router.put('/quotations/:id/status', authenticateToken, requireRole('STAFF', 'ADMIN'), (req, res) => {
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

export default router;
