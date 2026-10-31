import { Request, Response } from 'express';
import { dbStore } from '../../lib/store.js';
import { Frequency } from '../../types/index.js';

// -----------------------------------------------------------------
// PRODUCTS CONTROLLERS
// -----------------------------------------------------------------

export const getAllProducts = (req: Request, res: Response): void => {
  try {
    const search = req.query.search as string | undefined;
    const type = req.query.type as string | undefined;
    const activeOnly = req.query.activeOnly === 'true';

    const products = dbStore.getProducts({ search, type, activeOnly });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProductById = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const product = dbStore.getProductById(id);

    if (!product) {
      res.status(404).json({ success: false, error: `Product with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProduct = (req: Request, res: Response): void => {
  try {
    const { name, type, salesPrice, costPrice, notes, isActive, variants } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Product name is required.' });
      return;
    }

    if (salesPrice === undefined || isNaN(Number(salesPrice)) || Number(salesPrice) < 0) {
      res.status(400).json({ success: false, error: 'Valid sales price is required (>= 0).' });
      return;
    }

    const product = dbStore.createProduct({
      name: name.trim(),
      type: type ? String(type).trim() : 'Software',
      salesPrice: Number(salesPrice),
      costPrice: costPrice !== undefined ? Number(costPrice) : 0,
      notes: notes || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      variants: Array.isArray(variants) ? variants : [],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProduct = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const { name, type, salesPrice, costPrice, notes, isActive } = req.body;

    const updated = dbStore.updateProduct(id, {
      name,
      type,
      salesPrice: salesPrice !== undefined ? Number(salesPrice) : undefined,
      costPrice: costPrice !== undefined ? Number(costPrice) : undefined,
      notes,
      isActive,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: `Product with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const deleted = dbStore.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: `Product with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// -----------------------------------------------------------------
// PRODUCT VARIANTS CONTROLLERS
// -----------------------------------------------------------------

export const addProductVariant = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const { name, priceAdjustment } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Variant name is required.' });
      return;
    }

    const variant = dbStore.addVariant(id, {
      name: name.trim(),
      priceAdjustment: priceAdjustment !== undefined ? Number(priceAdjustment) : 0,
    });

    if (!variant) {
      res.status(404).json({ success: false, error: `Product with ID '${id}' not found.` });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Product variant added successfully.',
      data: variant,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProductVariant = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const variantId = req.params.variantId as string;
    const { name, priceAdjustment } = req.body;

    const variant = dbStore.updateVariant(id, variantId, {
      name,
      priceAdjustment: priceAdjustment !== undefined ? Number(priceAdjustment) : undefined,
    });

    if (!variant) {
      res.status(404).json({ success: false, error: `Product variant not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product variant updated successfully.',
      data: variant,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProductVariant = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const variantId = req.params.variantId as string;

    const deleted = dbStore.deleteVariant(id, variantId);
    if (!deleted) {
      res.status(404).json({ success: false, error: `Product variant not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product variant deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// -----------------------------------------------------------------
// SUBSCRIPTION PLANS CONTROLLERS
// -----------------------------------------------------------------

export const getAllPlans = (req: Request, res: Response): void => {
  try {
    const frequency = req.query.frequency as Frequency | undefined;
    const activeOnly = req.query.activeOnly === 'true';

    const plans = dbStore.getPlans({ frequency, activeOnly });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPlanById = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const plan = dbStore.getPlanById(id);

    if (!plan) {
      res.status(404).json({ success: false, error: `Subscription plan with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPlan = (req: Request, res: Response): void => {
  try {
    const {
      name,
      description,
      price,
      billingFrequency,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      canPause,
      canRenew,
      isActive,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Subscription plan name is required.' });
      return;
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      res.status(400).json({ success: false, error: 'Valid plan price is required (>= 0).' });
      return;
    }

    const validFrequencies: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    const freq = billingFrequency ? (String(billingFrequency).toUpperCase() as Frequency) : 'MONTHLY';
    if (!validFrequencies.includes(freq)) {
      res.status(400).json({
        success: false,
        error: `Invalid billing frequency. Allowed values: ${validFrequencies.join(', ')}`,
      });
      return;
    }

    const plan = dbStore.createPlan({
      name: name.trim(),
      description: description || '',
      price: Number(price),
      billingFrequency: freq,
      minQuantity: minQuantity !== undefined ? Number(minQuantity) : 1,
      startDate,
      endDate,
      autoClose: Boolean(autoClose),
      canPause: canPause !== undefined ? Boolean(canPause) : true,
      canRenew: canRenew !== undefined ? Boolean(canRenew) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully.',
      data: plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePlan = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const {
      name,
      description,
      price,
      billingFrequency,
      minQuantity,
      startDate,
      endDate,
      autoClose,
      canPause,
      canRenew,
      isActive,
    } = req.body;

    const updated = dbStore.updatePlan(id, {
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      billingFrequency,
      minQuantity: minQuantity !== undefined ? Number(minQuantity) : undefined,
      startDate,
      endDate,
      autoClose,
      canPause,
      canRenew,
      isActive,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: `Subscription plan with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePlan = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const deleted = dbStore.deletePlan(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: `Subscription plan with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// -----------------------------------------------------------------
// DISCOUNT RULES & PROMOTIONS CONTROLLERS
// -----------------------------------------------------------------

export const getAllDiscounts = (req: Request, res: Response): void => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const rules = dbStore.getDiscountRules(activeOnly);

    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiscountById = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const rule = dbStore.getDiscountRuleById(id);

    if (!rule) {
      res.status(404).json({ success: false, error: `Discount rule with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const validateDiscountCode = (req: Request, res: Response): void => {
  try {
    const code = req.params.code as string;
    const purchaseAmount = Number(req.query.amount || req.body?.amount || 0);

    const validation = dbStore.validateDiscount(code, purchaseAmount);

    res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDiscount = (req: Request, res: Response): void => {
  try {
    const { code, description, type, value, minPurchase, startDate, endDate, maxUsage, isActive } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ success: false, error: 'Discount promo code is required.' });
      return;
    }

    if (value === undefined || isNaN(Number(value)) || Number(value) <= 0) {
      res.status(400).json({ success: false, error: 'Valid discount value (> 0) is required.' });
      return;
    }

    const discountType = type ? String(type).toUpperCase() : 'PERCENTAGE';
    if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
      res.status(400).json({ success: false, error: "Discount type must be 'PERCENTAGE' or 'FIXED'." });
      return;
    }

    if (discountType === 'PERCENTAGE' && Number(value) > 100) {
      res.status(400).json({ success: false, error: 'Percentage discount value cannot exceed 100%.' });
      return;
    }

    const rule = dbStore.createDiscountRule({
      code: code.trim().toUpperCase(),
      description: description || '',
      type: discountType as any,
      value: Number(value),
      minPurchase: minPurchase !== undefined ? Number(minPurchase) : undefined,
      startDate,
      endDate,
      maxUsage: maxUsage !== undefined ? Number(maxUsage) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Discount rule created successfully.',
      data: rule,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDiscount = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const { code, description, type, value, minPurchase, startDate, endDate, maxUsage, isActive } = req.body;

    const updated = dbStore.updateDiscountRule(id, {
      code,
      description,
      type,
      value: value !== undefined ? Number(value) : undefined,
      minPurchase: minPurchase !== undefined ? Number(minPurchase) : undefined,
      startDate,
      endDate,
      maxUsage: maxUsage !== undefined ? Number(maxUsage) : undefined,
      isActive,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: `Discount rule with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Discount rule updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDiscount = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const deleted = dbStore.deleteDiscountRule(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: `Discount rule with ID '${id}' not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Discount rule deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
