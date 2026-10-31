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
  createPlan,
  updatePlan,
  deletePlan,
  getAllDiscounts,
  createDiscount,
  validateDiscountCode,
  updateDiscount,
  deleteDiscount,
} from './src/modules/products/products.controller.js';
import { dbStore } from './src/lib/store.js';

function mockReq(options: { params?: any; query?: any; body?: any } = {}) {
  return {
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
  } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function runProductsTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING PRODUCTS, PLANS & DISCOUNTS VERIFICATION SUITE');
  console.log('========================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(title: string, condition: boolean) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  ✓ ${title}: PASSED`);
    } else {
      console.error(`  ✗ ${title}: FAILED`);
    }
  }

  // 1. PRODUCTS MANAGEMENT
  console.log('[Section 1] Product Creation & Management:');
  const initialProductsRes = mockRes();
  getAllProducts(mockReq(), initialProductsRes);
  assert('Fetch initial seeded products list', initialProductsRes.statusCode === 200 && initialProductsRes.jsonData.data.length >= 5);

  const createProdReq = mockReq({
    body: {
      name: 'Brightloop Data Gateway',
      type: 'Service',
      salesPrice: 420.0,
      costPrice: 80.0,
      notes: 'Real-time webhook and Kafka data sync bridge',
      isActive: true,
      variants: [
        { name: 'Standard Throughput', priceAdjustment: 0 },
        { name: 'High-Volume Enterprise Pipe', priceAdjustment: 350.0 },
      ],
    },
  });
  const createProdRes = mockRes();
  createProduct(createProdReq, createProdRes);
  const createdProd = createProdRes.jsonData?.data;
  assert('Create product with initial variants (status 201)', createProdRes.statusCode === 201 && createdProd?.name === 'Brightloop Data Gateway');
  assert('Product has 2 nested variants created', createdProd?.variants?.length === 2);

  // Filter products by search and type
  const filterReq = mockReq({ query: { search: 'Gateway', type: 'Service' } });
  const filterRes = mockRes();
  getAllProducts(filterReq, filterRes);
  assert('Filter products by keyword and type', filterRes.jsonData?.data?.length === 1 && filterRes.jsonData.data[0].id === createdProd.id);

  // Update product
  const updateProdReq = mockReq({
    params: { id: createdProd.id },
    body: { salesPrice: 460.0, notes: 'Updated notes with enhanced SLA' },
  });
  const updateProdRes = mockRes();
  updateProduct(updateProdReq, updateProdRes);
  assert('Update product sales price and notes', updateProdRes.statusCode === 200 && updateProdRes.jsonData.data.salesPrice === 460.0);

  // 2. PRODUCT VARIANTS MANAGEMENT
  console.log('\n[Section 2] Product Variants Management:');
  const addVarReq = mockReq({
    params: { id: createdProd.id },
    body: { name: 'Ultra Low-Latency Direct Connect', priceAdjustment: 750.0 },
  });
  const addVarRes = mockRes();
  addProductVariant(addVarReq, addVarRes);
  const createdVariant = addVarRes.jsonData?.data;
  assert('Add new variant to existing product (status 201)', addVarRes.statusCode === 201 && createdVariant?.name === 'Ultra Low-Latency Direct Connect');

  // Verify variant was attached to product
  const getUpdatedProdRes = mockRes();
  getProductById(mockReq({ params: { id: createdProd.id } }), getUpdatedProdRes);
  assert('Product now contains 3 variants', getUpdatedProdRes.jsonData?.data?.variants?.length === 3);

  // Update variant
  const updateVarReq = mockReq({
    params: { id: createdProd.id, variantId: createdVariant.id },
    body: { priceAdjustment: 800.0 },
  });
  const updateVarRes = mockRes();
  updateProductVariant(updateVarReq, updateVarRes);
  assert('Update variant price adjustment to $800.00', updateVarRes.statusCode === 200 && updateVarRes.jsonData.data.priceAdjustment === 800.0);

  // Delete variant
  const deleteVarReq = mockReq({
    params: { id: createdProd.id, variantId: createdVariant.id },
  });
  const deleteVarRes = mockRes();
  deleteProductVariant(deleteVarReq, deleteVarRes);
  assert('Delete product variant (status 200)', deleteVarRes.statusCode === 200);

  // 3. SUBSCRIPTION PLANS & BILLING FREQUENCIES
  console.log('\n[Section 3] Subscription Plans & Billing Frequencies:');
  const getPlansRes = mockRes();
  getAllPlans(mockReq(), getPlansRes);
  assert('List seeded subscription plans (status 200)', getPlansRes.statusCode === 200 && getPlansRes.jsonData.data.length >= 5);

  // Reject invalid billing frequency
  const invalidFreqReq = mockReq({
    body: {
      name: 'Invalid Frequency Plan',
      price: 99.0,
      billingFrequency: 'BI_WEEKLY',
    },
  });
  const invalidFreqRes = mockRes();
  createPlan(invalidFreqReq, invalidFreqRes);
  assert('Reject invalid billing frequency with status 400', invalidFreqRes.statusCode === 400);

  // Create valid plan with configuration flags
  const createPlanReq = mockReq({
    body: {
      name: 'Cloud Scale Bi-Yearly Reserve',
      description: 'Dedicated multi-cloud reserve cluster',
      price: 2600.0,
      billingFrequency: 'YEARLY',
      minQuantity: 2,
      canPause: true,
      canRenew: true,
      autoClose: false,
      isActive: true,
    },
  });
  const createPlanRes = mockRes();
  createPlan(createPlanReq, createPlanRes);
  const createdPlan = createPlanRes.jsonData?.data;
  assert('Create subscription plan with YEARLY frequency (status 201)', createPlanRes.statusCode === 201 && createdPlan?.billingFrequency === 'YEARLY');
  assert('Plan configuration flags preserved (canPause, canRenew)', createdPlan?.canPause === true && createdPlan?.canRenew === true && createdPlan?.minQuantity === 2);

  // Filter plans by frequency
  const filterFreqRes = mockRes();
  getAllPlans(mockReq({ query: { frequency: 'YEARLY' } }), filterFreqRes);
  const yearlyPlans = filterFreqRes.jsonData?.data;
  assert('Filter subscription plans by YEARLY frequency', yearlyPlans.length >= 2 && yearlyPlans.every((p: any) => p.billingFrequency === 'YEARLY'));

  // Update plan
  const updatePlanReq = mockReq({
    params: { id: createdPlan.id },
    body: { price: 2450.0, canPause: false },
  });
  const updatePlanRes = mockRes();
  updatePlan(updatePlanReq, updatePlanRes);
  assert('Update plan pricing and pause configuration', updatePlanRes.statusCode === 200 && updatePlanRes.jsonData.data.price === 2450.0 && updatePlanRes.jsonData.data.canPause === false);

  // 4. DISCOUNT RULES & PROMOTIONS MANAGEMENT
  console.log('\n[Section 4] Discount Rules & Promo Code Validation:');
  const getDiscountsRes = mockRes();
  getAllDiscounts(mockReq(), getDiscountsRes);
  assert('List seeded discount rules', getDiscountsRes.statusCode === 200 && getDiscountsRes.jsonData.data.length >= 3);

  // Create percentage discount
  const createDiscReq = mockReq({
    body: {
      code: 'SUPERFALL30',
      description: 'Autumn seasonal 30% discount on orders over $400',
      type: 'PERCENTAGE',
      value: 30.0,
      minPurchase: 400.0,
      maxUsage: 250,
      isActive: true,
    },
  });
  const createDiscRes = mockRes();
  createDiscount(createDiscReq, createDiscRes);
  const createdDisc = createDiscRes.jsonData?.data;
  assert('Create 30% percentage discount rule (status 201)', createDiscRes.statusCode === 201 && createdDisc?.code === 'SUPERFALL30');

  // Reject duplicate code
  const dupDiscRes = mockRes();
  createDiscount(createDiscReq, dupDiscRes);
  assert('Reject duplicate promo code with status 400', dupDiscRes.statusCode === 400);

  // Validate discount calculation: $1,000 purchase with 30% discount = $300 off -> $700 final
  const validCheckRes = mockRes();
  validateDiscountCode(mockReq({ params: { code: 'SUPERFALL30' }, query: { amount: 1000.0 } }), validCheckRes);
  const validData = validCheckRes.jsonData?.data;
  assert('Valid discount calculation (30% of $1,000 = $300 deduction)', validData?.valid === true && validData?.discountAmount === 300.0 && validData?.finalAmount === 700.0);

  // Validate discount minimum purchase enforcement: $200 purchase with $400 min requirement should reject
  const minCheckRes = mockRes();
  validateDiscountCode(mockReq({ params: { code: 'SUPERFALL30' }, query: { amount: 200.0 } }), minCheckRes);
  const minData = minCheckRes.jsonData?.data;
  assert('Enforce minimum purchase condition ($400 minimum)', minData?.valid === false && minData?.error?.includes('Minimum purchase'));

  // Test fixed discount rule calculation (FLAT100OFF on $1,200 purchase = $100 off -> $1,100 final)
  const fixedCheckRes = mockRes();
  validateDiscountCode(mockReq({ params: { code: 'FLAT100OFF' }, query: { amount: 1200.0 } }), fixedCheckRes);
  const fixedData = fixedCheckRes.jsonData?.data;
  assert('Fixed discount calculation ($100 off $1,200 = $1,100 final)', fixedData?.valid === true && fixedData?.discountAmount === 100.0 && fixedData?.finalAmount === 1100.0);

  // Validate non-existent code
  const invalidCodeRes = mockRes();
  validateDiscountCode(mockReq({ params: { code: 'NONEXISTENT999' }, query: { amount: 500.0 } }), invalidCodeRes);
  assert('Reject invalid/non-existent promo code', invalidCodeRes.jsonData?.data?.valid === false);

  // ----------------------------------------------------
  // SECTION 5: ROLE-BASED ACCESS CONTROL & QUOTATIONS
  // ----------------------------------------------------
  console.log('\n[Section 5] Role-Based Access Control & Quotation Workflows:');

  // Customer asks for a custom quotation
  const customerQuote = dbStore.createQuotationRequest({
    customerId: 'cust-uuid-001',
    customerName: 'Alex Rivera',
    customerEmail: 'customer@brightloop.com',
    planName: 'Enterprise Custom Tier',
    notes: 'Require 25 staff seats and dedicated cloud backup',
    estimatedAmount: 950.0,
    items: [{ productName: 'Enterprise Custom Tier', quantity: 1, unitPrice: 950.0, amount: 950.0 }],
  });
  assert('Customer creates custom quotation request (status SENT)', customerQuote.status === 'SENT' && customerQuote.totalAmount === 950.0);

  // Staff prepares a quotation for a customer
  const staffQuote = dbStore.prepareStaffQuotation({
    customerId: 'cust-uuid-001',
    customerName: 'Alex Rivera',
    customerEmail: 'customer@brightloop.com',
    planName: 'Commercial Multi-Tier Package',
    totalAmount: 1450.0,
    validDays: 45,
    notes: 'Staff negotiated 15% discount for annual billing',
    items: [{ productName: 'Commercial Multi-Tier Package', quantity: 1, unitPrice: 1450.0, amount: 1450.0 }],
  });
  assert('Staff prepares new quotation for customer (status DRAFT)', staffQuote.status === 'DRAFT' && staffQuote.totalAmount === 1450.0);

  // Staff updates quotation status
  const updatedQuote = dbStore.updateQuotationStatus(staffQuote.id, 'ACCEPTED');
  assert('Staff/Admin updates quotation status to ACCEPTED', updatedQuote?.status === 'ACCEPTED');

  // Staff and Admin can view all customer subscriptions
  const allSubs = dbStore.getAllSubscriptions();
  assert('Staff/Admin retrieves all customer subscriptions across platform', allSubs.length > 0 && allSubs[0].subscriptionNumber !== undefined);

  // Clean up created entities
  deletePlan(mockReq({ params: { id: createdPlan.id } }), mockRes());
  deleteProduct(mockReq({ params: { id: createdProd.id } }), mockRes());
  deleteDiscount(mockReq({ params: { id: createdDisc.id } }), mockRes());

  console.log('\n========================================================');
  console.log(`📊 SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED`);
  if (passedCount === totalCount) {
    console.log('✅ ALL PRODUCT, PLAN & DISCOUNT MODULE TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
  console.log('========================================================\n');
}

runProductsTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
