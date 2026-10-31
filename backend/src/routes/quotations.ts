import { Router } from 'express';
import { quotationController } from '../controllers/quotationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth to all quotation routes
router.use(authMiddleware);

// GET /api/quotations
router.get('/', quotationController.list);

// GET /api/quotations/:id
router.get('/:id', quotationController.getById);

// POST /api/quotations
router.post('/', quotationController.create);

// PATCH /api/quotations/:id
router.patch('/:id', quotationController.update);

// POST /api/quotations/:id/confirm
router.post('/:id/confirm', quotationController.confirm);

// POST /api/quotations/:id/convert
router.post('/:id/convert', quotationController.convert);

export default router;
