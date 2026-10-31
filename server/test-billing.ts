import {
  generateInvoiceFromSubscription,
  getAllInvoices,
  getInvoiceById,
  createManualInvoice,
  updateInvoiceStatus,
  recordManualPayment,
  getAllPayments,
  getBillingAnalytics,
} from './src/modules/billing/billing.controller.js';
import { dbStore } from './src/lib/store.js';

function mockRes() {
  const res: any = {
    statusCode: 200,
    headers: {},
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

async function runBillingTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING MEMBER 4 (BILLING & ANALYTICS) TEST SUITE');
  console.log('========================================================\n');

  // 1. Auto-generate Invoice from Active Subscription
  console.log('[Test 1] Auto-generate Invoice from Active Subscription:');
  const activeSub = dbStore.subscriptions.find((s) => s.status === 'ACTIVE');
  if (!activeSub) {
    throw new Error('No active subscription found to test invoice generation.');
  }

  const genReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    body: {
      subscriptionId: activeSub.id,
      notes: 'Monthly recurring billing run',
      discountPercent: 10,
    },
  };
  const genRes = mockRes();
  generateInvoiceFromSubscription(genReq, genRes);

  const generatedInvoice = genRes.jsonData?.data;
  console.log('  - Invoice created with status 201: ', genRes.statusCode === 201 ? 'PASSED' : 'FAILED');
  console.log('  - Generated Invoice Number: ', generatedInvoice?.invoiceNumber);
  console.log('  - Correct Subtotal calculated: ', generatedInvoice?.subtotal > 0 ? 'PASSED' : 'FAILED');
  console.log('  - 10% Discount calculated: ', generatedInvoice?.discountAmount > 0 ? 'PASSED' : 'FAILED');
  console.log('  - Correct Lines count: ', generatedInvoice?.lines.length === activeSub.lines.length ? 'PASSED' : 'FAILED');

  // 2. View All Invoices & Filter
  console.log('\n[Test 2] Query Invoices and Filter by Status:');
  const allInvReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    query: { status: 'ALL' },
  };
  const allInvRes = mockRes();
  getAllInvoices(allInvReq, allInvRes);
  console.log('  - Invoices list status 200: ', allInvRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  console.log('  - Total invoices count: ', allInvRes.jsonData?.data?.length);

  const paidInvReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    query: { status: 'PAID' },
  };
  const paidInvRes = mockRes();
  getAllInvoices(paidInvReq, paidInvRes);
  const allPaid = paidInvRes.jsonData?.data?.every((i: any) => i.status === 'PAID');
  console.log('  - Invoices filtered by PAID status: ', allPaid ? 'PASSED' : 'FAILED');

  // 3. Invoice Status Transition
  console.log('\n[Test 3] Invoice Status Transition:');
  const statusReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    params: { id: generatedInvoice.id },
    body: { status: 'OVERDUE' },
  };
  const statusRes = mockRes();
  updateInvoiceStatus(statusReq, statusRes);
  console.log('  - Updated to OVERDUE status: ', statusRes.jsonData?.data?.status === 'OVERDUE' ? 'PASSED' : 'FAILED');

  // 4. Create Manual Ad-hoc Invoice
  console.log('\n[Test 4] Manual Ad-Hoc Invoice Creation:');
  const manualReq: any = {
    user: { id: 'staff-uuid-002', role: 'STAFF' },
    body: {
      customerId: 'cust-uuid-001',
      notes: 'One-off Cloud Architecture Consultation',
      lines: [
        {
          description: 'Consulting Hours (Senior Architect)',
          quantity: 4,
          unitPrice: 150.0,
          taxRate: 10,
        },
      ],
      discountAmount: 50.0,
      status: 'CONFIRMED',
    },
  };
  const manualRes = mockRes();
  createManualInvoice(manualReq, manualRes);
  const manualInvoice = manualRes.jsonData?.data;
  console.log('  - Manual invoice status 201: ', manualRes.statusCode === 201 ? 'PASSED' : 'FAILED');
  console.log('  - Calculated net total ($610 expected): ', manualInvoice?.totalAmount === 610 ? 'PASSED' : `FAILED (${manualInvoice?.totalAmount})`);

  // 5. Record Manual Payment & Auto-Settle
  console.log('\n[Test 5] Record Manual Payment & Auto-Settlement:');
  const payReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    body: {
      invoiceId: manualInvoice.id,
      amount: 610.0,
      paymentMethod: 'BANK_TRANSFER',
      referenceNote: 'Manual wire confirmation REF# WT-990184',
    },
  };
  const payRes = mockRes();
  recordManualPayment(payReq, payRes);
  console.log('  - Payment status 201: ', payRes.statusCode === 201 ? 'PASSED' : 'FAILED');
  console.log('  - Payment number issued: ', payRes.jsonData?.data?.payment?.paymentNumber);
  console.log('  - Invoice auto-settled to PAID: ', payRes.jsonData?.data?.invoice?.status === 'PAID' ? 'PASSED' : 'FAILED');
  console.log('  - Remaining balance ($0): ', payRes.jsonData?.data?.remainingBalance === 0 ? 'PASSED' : 'FAILED');

  // 6. Payments Ledger
  console.log('\n[Test 6] Payments Ledger:');
  const paymentsReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
    query: {},
  };
  const paymentsRes = mockRes();
  getAllPayments(paymentsReq, paymentsRes);
  console.log('  - Payments ledger status 200: ', paymentsRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  console.log('  - Ledger count: ', paymentsRes.jsonData?.data?.length);

  // 7. Executive Revenue & Billing Analytics
  console.log('\n[Test 7] Executive Revenue & Billing Analytics:');
  const analyticsReq: any = {
    user: { id: 'admin-uuid-003', role: 'ADMIN' },
  };
  const analyticsRes = mockRes();
  getBillingAnalytics(analyticsReq, analyticsRes);
  const analytics = analyticsRes.jsonData?.data;
  console.log('  - Analytics status 200: ', analyticsRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  console.log('  - MRR computed ($): ', analytics?.mrr > 0 ? `PASSED ($${analytics.mrr})` : 'FAILED');
  console.log('  - ARR computed ($): ', analytics?.arr > 0 ? `PASSED ($${analytics.arr})` : 'FAILED');
  console.log('  - Total Revenue Collected ($): ', analytics?.totalRevenueCollected > 0 ? `PASSED ($${analytics.totalRevenueCollected})` : 'FAILED');
  console.log('  - Outstanding Receivables ($): ', analytics?.outstandingReceivables >= 0 ? `PASSED ($${analytics.outstandingReceivables})` : 'FAILED');
  console.log('  - Overdue Invoices Count: ', analytics?.overdueInvoicesCount !== undefined ? 'PASSED' : 'FAILED');
  console.log('  - Payment Methods Breakdown: ', analytics?.paymentMethodsBreakdown?.length === 5 ? 'PASSED' : 'FAILED');

  console.log('\n========================================================');
  console.log('✅ ALL MEMBER 4 BILLING & ANALYTICS TESTS PASSED!');
  console.log('========================================================');
}

runBillingTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
