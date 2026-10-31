import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

// PRODUCTS, PLANS & DISCOUNTS MODULE
const router = Router();

// Demo products data
const demoProducts = [
  {
    id: 'prod-001',
    name: 'Brightloop Core ERP',
    type: 'Software',
    salesPrice: 300.0,
    costPrice: 50.0,
    notes: 'Base enterprise platform',
    variants: [
      { id: 'var-001', name: 'Standard Edition', priceAdjustment: 0 },
      { id: 'var-002', name: 'Odoo Brand Edition', priceAdjustment: 560.0 },
    ],
  },
  {
    id: 'prod-002',
    name: 'User License Seat',
    type: 'License',
    salesPrice: 35.0,
    costPrice: 5.0,
    notes: 'Per-user recurring seat',
    variants: [],
  },
  {
    id: 'prod-003',
    name: 'Advanced Financial Analytics Module',
    type: 'Add-on',
    salesPrice: 210.0,
    costPrice: 30.0,
    notes: 'Real-time financial BI dashboards',
    variants: [],
  },
];

const demoPlans = [
  {
    id: 'plan-001',
    name: 'Brightloop Starter',
    price: 199.0,
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    canPause: true,
    canRenew: true,
  },
  {
    id: 'plan-002',
    name: 'Brightloop Enterprise Cloud Suite',
    price: 1420.0,
    billingFrequency: 'MONTHLY',
    minQuantity: 5,
    canPause: true,
    canRenew: true,
  },
  {
    id: 'plan-003',
    name: 'Secure Cloud Automated Backup & DR',
    price: 850.0,
    billingFrequency: 'YEARLY',
    minQuantity: 1,
    canPause: false,
    canRenew: true,
  },
];

// Public / Authenticated route to view available products & plans
router.get('/', (req, res) => {
  res.json({ success: true, data: demoProducts });
});

router.get('/plans', (req, res) => {
  res.json({ success: true, data: demoPlans });
});

// Admin product creation hook
router.post('/', authenticateToken, requireRole('ADMIN'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: req.body,
  });
});

export default router;
