import { Router } from 'express';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getAllDiscounts,
  getDiscountById,
  validateDiscountCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from './products.controller.js';

const router = Router();

// =================================================================
// SUBSCRIPTION PLANS ROUTES (Must precede /:id)
// =================================================================
router.get('/plans', getAllPlans);
router.get('/plans/:id', getPlanById);
// RBAC: Only Admin can create, configure, update, and remove subscription plans
router.post('/plans', authenticateToken, requireRole('ADMIN'), createPlan);
router.put('/plans/:id', authenticateToken, requireRole('ADMIN'), updatePlan);
router.delete('/plans/:id', authenticateToken, requireRole('ADMIN'), deletePlan);

// =================================================================
// DISCOUNT RULES & PROMOTIONS ROUTES (Must precede /:id)
// =================================================================
router.get('/discounts', getAllDiscounts);
router.get('/discounts/validate/:code', validateDiscountCode);
router.get('/discounts/:id', getDiscountById);
// RBAC: Only Admin can create, modify, or remove discount promotion rules
router.post('/discounts', authenticateToken, requireRole('ADMIN'), createDiscount);
router.put('/discounts/:id', authenticateToken, requireRole('ADMIN'), updateDiscount);
router.delete('/discounts/:id', authenticateToken, requireRole('ADMIN'), deleteDiscount);

// =================================================================
// PRODUCTS & VARIANTS ROUTES
// =================================================================
// Public / Authenticated read routes: Customers, Staff, and Admins can search & review products
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// RBAC: Only Admin can add, update, and remove products
router.post('/', authenticateToken, requireRole('ADMIN'), createProduct);
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateProduct);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteProduct);

// RBAC: Only Admin can manage product variants
router.post('/:id/variants', authenticateToken, requireRole('ADMIN'), addProductVariant);
router.put('/:id/variants/:variantId', authenticateToken, requireRole('ADMIN'), updateProductVariant);
router.delete('/:id/variants/:variantId', authenticateToken, requireRole('ADMIN'), deleteProductVariant);

export default router;
