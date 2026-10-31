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
router.post('/plans', authenticateToken, requireRole('ADMIN', 'STAFF'), createPlan);
router.put('/plans/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), updatePlan);
router.delete('/plans/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), deletePlan);

// =================================================================
// DISCOUNT RULES & PROMOTIONS ROUTES (Must precede /:id)
// =================================================================
router.get('/discounts', getAllDiscounts);
router.get('/discounts/validate/:code', validateDiscountCode);
router.get('/discounts/:id', getDiscountById);
router.post('/discounts', authenticateToken, requireRole('ADMIN', 'STAFF'), createDiscount);
router.put('/discounts/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), updateDiscount);
router.delete('/discounts/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), deleteDiscount);

// =================================================================
// PRODUCTS & VARIANTS ROUTES
// =================================================================
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireRole('ADMIN', 'STAFF'), createProduct);
router.put('/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), updateProduct);
router.delete('/:id', authenticateToken, requireRole('ADMIN', 'STAFF'), deleteProduct);

// Product Variants sub-routes
router.post('/:id/variants', authenticateToken, requireRole('ADMIN', 'STAFF'), addProductVariant);
router.put('/:id/variants/:variantId', authenticateToken, requireRole('ADMIN', 'STAFF'), updateProductVariant);
router.delete('/:id/variants/:variantId', authenticateToken, requireRole('ADMIN', 'STAFF'), deleteProductVariant);

export default router;
