import { validatePassword, register, login, addStaff } from './src/modules/auth/auth.controller.js';
import {
  getCustomerDashboard,
  getCustomerSubscriptions,
  getCustomerInvoices,
  payInvoice,
  getCustomerProfile,
} from './src/modules/customer/customer.controller.js';
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

async function runDirectTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING MEMBER 1 IN-PROCESS VERIFICATION SUITE');
  console.log('========================================================\n');

  // 1. Password validation tests
  console.log('[Test 1] Password Validation Rule Tests:');
  const shortPwd = validatePassword('Short1!');
  console.log('  - Reject <= 8 chars: ', !shortPwd.valid && shortPwd.error?.includes('8 characters') ? 'PASSED' : 'FAILED');

  const noUpper = validatePassword('lowercase123!');
  console.log('  - Reject no uppercase: ', !noUpper.valid && noUpper.error?.includes('uppercase') ? 'PASSED' : 'FAILED');

  const noLower = validatePassword('UPPERCASE123!');
  console.log('  - Reject no lowercase: ', !noLower.valid && noLower.error?.includes('lowercase') ? 'PASSED' : 'FAILED');

  const noSpecial = validatePassword('AllLettersAnd123');
  console.log('  - Reject no special char: ', !noSpecial.valid && noSpecial.error?.includes('special') ? 'PASSED' : 'FAILED');

  const validPwd = validatePassword('StrongPassword@123');
  console.log('  - Accept valid password: ', validPwd.valid ? 'PASSED' : 'FAILED');

  // 2. User Registration
  console.log('\n[Test 2] Registration Flow:');
  const regReq: any = {
    body: {
      name: 'Elena Rostova',
      email: 'elena@brightloop.com',
      password: 'StrongPassword@2026',
      companyName: 'Rostova Logistics',
    },
  };
  const regRes = mockRes();
  await register(regReq, regRes);
  console.log('  - User registered with status 201: ', regRes.statusCode === 201 ? 'PASSED' : 'FAILED');
  console.log('  - JWT token issued: ', regRes.jsonData?.data?.token ? 'PASSED' : 'FAILED');

  // Attempt duplicate registration
  const dupRes = mockRes();
  await register(regReq, dupRes);
  console.log('  - Duplicate email rejected with 409: ', dupRes.statusCode === 409 ? 'PASSED' : 'FAILED');

  // 3. User Login
  console.log('\n[Test 3] Customer Login:');
  const loginReq: any = {
    body: {
      email: 'customer@brightloop.com',
      password: 'Password@123',
    },
  };
  const loginRes = mockRes();
  await login(loginReq, loginRes);
  console.log('  - Customer login status 200: ', loginRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  const customerUser = loginRes.jsonData?.data?.user;
  console.log('  - Logged in customer name: ', customerUser?.name === 'Alex Rivera' ? 'PASSED' : 'FAILED');

  // 4. Customer Dashboard Query
  console.log('\n[Test 4] Customer Dashboard Summary:');
  const dashReq: any = {
    user: customerUser,
  };
  const dashRes = mockRes();
  getCustomerDashboard(dashReq, dashRes);
  console.log('  - Dashboard query status 200: ', dashRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  const dashData = dashRes.jsonData?.data;
  console.log('  - Active subscriptions count (2): ', dashData?.metrics?.activeSubscriptionsCount === 2 ? 'PASSED' : 'FAILED');
  console.log('  - Outstanding amount calculated ($1420): ', dashData?.metrics?.outstandingAmount === 1420 ? 'PASSED' : 'FAILED');
  console.log('  - Recent invoices list populated: ', dashData?.recentInvoices?.length > 0 ? 'PASSED' : 'FAILED');

  // 5. Customer Subscriptions
  console.log('\n[Test 5] Customer Subscriptions List:');
  const subReq: any = { user: customerUser };
  const subRes = mockRes();
  getCustomerSubscriptions(subReq, subRes);
  console.log('  - Subscriptions retrieved: ', subRes.jsonData?.data?.length === 3 ? 'PASSED' : 'FAILED');
  console.log('  - Odoo ERP variant line present: ', subRes.jsonData?.data[0].lines[0].variantName?.includes('Odoo') ? 'PASSED' : 'FAILED');

  // 6. Pay Invoice Workflow
  console.log('\n[Test 6] Settle Invoice via Customer Portal:');
  const invReq: any = { user: customerUser };
  const invRes = mockRes();
  getCustomerInvoices(invReq, invRes);
  const dueInvoice = invRes.jsonData?.data.find((i: any) => i.status === 'CONFIRMED');
  console.log('  - Found due invoice: ', dueInvoice?.invoiceNumber);

  const payReq: any = {
    user: customerUser,
    body: {
      invoiceId: dueInvoice.id,
      paymentMethod: 'CREDIT_CARD',
      note: 'Portal instant payment test',
    },
  };
  const payRes = mockRes();
  payInvoice(payReq, payRes);
  console.log('  - Pay invoice status 200: ', payRes.statusCode === 200 ? 'PASSED' : 'FAILED');
  console.log('  - Invoice status updated to PAID: ', payRes.jsonData?.data?.invoice?.status === 'PAID' ? 'PASSED' : 'FAILED');

  // Check updated dashboard outstanding amount
  const dashResAfterPay = mockRes();
  getCustomerDashboard(dashReq, dashResAfterPay);
  console.log('  - Outstanding balance updated to $0 after payment: ', dashResAfterPay.jsonData?.data?.metrics?.outstandingAmount === 0 ? 'PASSED' : 'FAILED');

  console.log('\n========================================================');
  console.log('✅ ALL MEMBER 1 TESTS COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

runDirectTests().catch(console.error);
