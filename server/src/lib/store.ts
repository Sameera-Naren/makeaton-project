import bcrypt from 'bcryptjs';
import {
  CustomerDashboardSummary,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
  DiscountRule,
  DiscountType,
  DiscountValidationResult,
  Frequency,
  Plan,
  Product,
  ProductVariant,
  Quotation,
  QuotationStatus,
  Role,
  UserPayload,
} from '../types/index.js';

export interface StoredUser extends UserPayload {
  passwordHash: string;
}

// In-memory persistent demo store (also used as mock repository & fallback)
class Store {
  users: StoredUser[] = [];
  subscriptions: CustomerSubscription[] = [];
  invoices: CustomerInvoice[] = [];
  payments: CustomerPayment[] = [];
  products: Product[] = [];
  plans: Plan[] = [];
  discountRules: DiscountRule[] = [];
  quotations: Quotation[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const salt = bcrypt.genSaltSync(10);

    // Default Customer
    const customerUser: StoredUser = {
      id: 'cust-uuid-001',
      name: 'Alex Rivera',
      email: 'customer@brightloop.com',
      companyName: 'Apex Retail Solutions Ltd.',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 300, Austin, TX 78701',
      role: 'CUSTOMER',
      passwordHash: bcrypt.hashSync('Password@123', salt),
    };

    // Default Staff
    const staffUser: StoredUser = {
      id: 'staff-uuid-002',
      name: 'Sarah Chen',
      email: 'staff@brightloop.com',
      companyName: 'Brightloop Software Internal',
      phone: '+1 (555) 876-5432',
      address: 'Brightloop HQ, 100 Innovation Way, San Francisco, CA',
      role: 'STAFF',
      passwordHash: bcrypt.hashSync('Staff@12345', salt),
    };

    // Default Admin
    const adminUser: StoredUser = {
      id: 'admin-uuid-003',
      name: 'Marcus Vance',
      email: 'admin@brightloop.com',
      companyName: 'Brightloop Software Management',
      phone: '+1 (555) 999-1122',
      address: 'Brightloop HQ, Executive Suite, San Francisco, CA',
      role: 'ADMIN',
      passwordHash: bcrypt.hashSync('Admin@12345', salt),
    };

    this.users.push(customerUser, staffUser, adminUser);

    // Seed Subscriptions for Alex
    this.subscriptions = [
      {
        id: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        customerId: customerUser.id,
        planName: 'Brightloop Enterprise Cloud Suite',
        billingFrequency: 'MONTHLY',
        startDate: '2026-01-15T00:00:00.000Z',
        expiryDate: '2027-01-15T00:00:00.000Z',
        paymentTerms: 'Net 15',
        status: 'ACTIVE',
        autoRenew: true,
        notes: 'Includes high-availability cluster and premium 24/7 SLA.',
        totalAmount: 1420.0,
        lines: [
          {
            id: 'subl-1',
            productName: 'Core ERP Software Base',
            variantName: 'Odoo Brand Edition (+560)',
            quantity: 1,
            unitPrice: 860.0,
            taxRate: 10,
            amount: 860.0,
          },
          {
            id: 'subl-2',
            productName: 'Staff User Seats (Concurrent)',
            variantName: 'Standard User Seat',
            quantity: 10,
            unitPrice: 35.0,
            taxRate: 10,
            amount: 350.0,
          },
          {
            id: 'subl-3',
            productName: 'Advanced Financial Analytics Module',
            variantName: 'Full Reporting Pack',
            quantity: 1,
            unitPrice: 210.0,
            taxRate: 10,
            amount: 210.0,
          },
        ],
      },
      {
        id: 'sub-002',
        subscriptionNumber: 'SUB-2026-0089',
        customerId: customerUser.id,
        planName: 'Secure Cloud Automated Backup & DR',
        billingFrequency: 'YEARLY',
        startDate: '2026-03-01T00:00:00.000Z',
        expiryDate: '2027-03-01T00:00:00.000Z',
        paymentTerms: 'Immediate',
        status: 'ACTIVE',
        autoRenew: true,
        notes: 'Continuous real-time geo-redundant backup storage (2TB quota).',
        totalAmount: 850.0,
        lines: [
          {
            id: 'subl-4',
            productName: 'Cloud Vault 2TB Tier',
            variantName: 'Encrypted Hot Storage',
            quantity: 1,
            unitPrice: 850.0,
            taxRate: 0,
            amount: 850.0,
          },
        ],
      },
      {
        id: 'sub-003',
        subscriptionNumber: 'SUB-2026-0012',
        customerId: customerUser.id,
        planName: 'Legacy Marketing Automation Add-on',
        billingFrequency: 'MONTHLY',
        startDate: '2025-06-01T00:00:00.000Z',
        expiryDate: '2026-01-01T00:00:00.000Z',
        paymentTerms: 'Net 30',
        status: 'CLOSED',
        autoRenew: false,
        notes: 'Contract completed and transitioned to Enterprise Suite.',
        totalAmount: 340.0,
        lines: [
          {
            id: 'subl-5',
            productName: 'Campaign Dispatcher Pro',
            quantity: 1,
            unitPrice: 340.0,
            taxRate: 5,
            amount: 340.0,
          },
        ],
      },
    ];

    // Seed Invoices for Alex
    this.invoices = [
      {
        id: 'inv-1044',
        invoiceNumber: 'INV-2026-1044',
        customerId: customerUser.id,
        subscriptionId: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        issueDate: '2026-10-15T00:00:00.000Z',
        dueDate: '2026-11-15T00:00:00.000Z',
        subtotal: 1420.0,
        taxAmount: 142.0,
        discountAmount: 142.0,
        totalAmount: 1420.0,
        status: 'CONFIRMED',
        notes: 'October 2026 recurring monthly cycle. Please remit before due date.',
        lines: [
          {
            id: 'invl-1',
            description: 'Core ERP Software Base (Odoo Brand Edition)',
            quantity: 1,
            unitPrice: 860.0,
            taxRate: 10,
            amount: 860.0,
          },
          {
            id: 'invl-2',
            description: 'Staff User Seats (10 seats)',
            quantity: 10,
            unitPrice: 35.0,
            taxRate: 10,
            amount: 350.0,
          },
          {
            id: 'invl-3',
            description: 'Advanced Financial Analytics Module',
            quantity: 1,
            unitPrice: 210.0,
            taxRate: 10,
            amount: 210.0,
          },
        ],
      },
      {
        id: 'inv-0982',
        invoiceNumber: 'INV-2026-0982',
        customerId: customerUser.id,
        subscriptionId: 'sub-002',
        subscriptionNumber: 'SUB-2026-0089',
        issueDate: '2026-09-01T00:00:00.000Z',
        dueDate: '2026-09-15T00:00:00.000Z',
        subtotal: 850.0,
        taxAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 850.0,
        status: 'PAID',
        notes: 'Annual subscription fee for Secure Cloud Automated Backup.',
        lines: [
          {
            id: 'invl-4',
            description: 'Cloud Vault 2TB Tier (Annual)',
            quantity: 1,
            unitPrice: 850.0,
            taxRate: 0,
            amount: 850.0,
          },
        ],
      },
      {
        id: 'inv-0815',
        invoiceNumber: 'INV-2026-0815',
        customerId: customerUser.id,
        subscriptionId: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        issueDate: '2026-09-15T00:00:00.000Z',
        dueDate: '2026-10-15T00:00:00.000Z',
        subtotal: 1420.0,
        taxAmount: 142.0,
        discountAmount: 142.0,
        totalAmount: 1420.0,
        status: 'PAID',
        notes: 'September 2026 recurring monthly cycle. Fully paid via Bank Transfer.',
        lines: [
          {
            id: 'invl-5',
            description: 'Core ERP Software Base (Odoo Brand Edition)',
            quantity: 1,
            unitPrice: 860.0,
            taxRate: 10,
            amount: 860.0,
          },
          {
            id: 'invl-6',
            description: 'Staff User Seats (10 seats)',
            quantity: 10,
            unitPrice: 35.0,
            taxRate: 10,
            amount: 350.0,
          },
          {
            id: 'invl-7',
            description: 'Advanced Financial Analytics Module',
            quantity: 1,
            unitPrice: 210.0,
            taxRate: 10,
            amount: 210.0,
          },
        ],
      },
      {
        id: 'inv-0740',
        invoiceNumber: 'INV-2026-0740',
        customerId: customerUser.id,
        subscriptionId: 'sub-003',
        subscriptionNumber: 'SUB-2026-0012',
        issueDate: '2025-12-01T00:00:00.000Z',
        dueDate: '2025-12-31T00:00:00.000Z',
        subtotal: 340.0,
        taxAmount: 17.0,
        discountAmount: 0.0,
        totalAmount: 357.0,
        status: 'PAID',
        notes: 'Final settlement for legacy marketing automation package.',
        lines: [
          {
            id: 'invl-8',
            description: 'Campaign Dispatcher Pro',
            quantity: 1,
            unitPrice: 340.0,
            taxRate: 5,
            amount: 340.0,
          },
        ],
      },
    ];

    // Seed Payments
    this.payments = [
      {
        id: 'pay-001',
        paymentNumber: 'PAY-2026-0982',
        invoiceId: 'inv-0982',
        invoiceNumber: 'INV-2026-0982',
        customerId: customerUser.id,
        amount: 850.0,
        paymentMethod: 'CREDIT_CARD',
        paymentDate: '2026-09-02T14:32:00.000Z',
        status: 'COMPLETED',
        referenceNote: 'Visa ending in 4242 (Stripe txn_89230491)',
      },
      {
        id: 'pay-002',
        paymentNumber: 'PAY-2026-0815',
        invoiceId: 'inv-0815',
        invoiceNumber: 'INV-2026-0815',
        customerId: customerUser.id,
        amount: 1420.0,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2026-09-20T09:15:00.000Z',
        status: 'COMPLETED',
        referenceNote: 'Wire Ref: ACH-882910-APEX',
      },
      {
        id: 'pay-003',
        paymentNumber: 'PAY-2025-0740',
        invoiceId: 'inv-0740',
        invoiceNumber: 'INV-2026-0740',
        customerId: customerUser.id,
        amount: 357.0,
        paymentMethod: 'STRIPE',
        paymentDate: '2025-12-05T16:04:00.000Z',
        status: 'COMPLETED',
        referenceNote: 'Mastercard ending in 1198',
      },
    ];

    // Seed Products & Product Variants
    this.products = [
      {
        id: 'prod-001',
        name: 'Core ERP Software Base',
        type: 'Software',
        salesPrice: 300.0,
        costPrice: 50.0,
        notes: 'Base enterprise platform with inventory, CRM, financial ledger, and multi-currency accounting.',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        variants: [
          { id: 'var-001', productId: 'prod-001', name: 'Standard Edition', priceAdjustment: 0.0 },
          { id: 'var-002', productId: 'prod-001', name: 'Odoo Brand Edition', priceAdjustment: 560.0 },
          { id: 'var-003', productId: 'prod-001', name: 'Multi-Company Enterprise', priceAdjustment: 850.0 },
        ],
      },
      {
        id: 'prod-002',
        name: 'Staff User Seats (Concurrent)',
        type: 'License',
        salesPrice: 35.0,
        costPrice: 5.0,
        notes: 'Per-user recurring seat with granular role-based permissions and session auditing.',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        variants: [
          { id: 'var-004', productId: 'prod-002', name: 'Standard User Seat', priceAdjustment: 0.0 },
          { id: 'var-005', productId: 'prod-002', name: 'Read-Only Auditor Seat', priceAdjustment: -15.0 },
          { id: 'var-006', productId: 'prod-002', name: 'Executive Power User Seat', priceAdjustment: 25.0 },
        ],
      },
      {
        id: 'prod-003',
        name: 'Advanced Financial Analytics Module',
        type: 'Add-on',
        salesPrice: 210.0,
        costPrice: 30.0,
        notes: 'Real-time financial BI dashboards, revenue recognition, and predictive cash flow modeling.',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        variants: [
          { id: 'var-007', productId: 'prod-003', name: 'Standard BI Reporting', priceAdjustment: 0.0 },
          { id: 'var-008', productId: 'prod-003', name: 'Full Multi-Currency Pack', priceAdjustment: 90.0 },
        ],
      },
      {
        id: 'prod-004',
        name: 'Cloud Vault Backup Tier',
        type: 'Service',
        salesPrice: 450.0,
        costPrice: 60.0,
        notes: 'Continuous geo-redundant snapshot storage with point-in-time recovery and compliance retention.',
        isActive: true,
        createdAt: '2026-01-10T00:00:00.000Z',
        updatedAt: '2026-01-10T00:00:00.000Z',
        variants: [
          { id: 'var-009', productId: 'prod-004', name: '1TB Standard Storage', priceAdjustment: 0.0 },
          { id: 'var-010', productId: 'prod-004', name: '2TB Hot Encrypted Tier', priceAdjustment: 400.0 },
          { id: 'var-011', productId: 'prod-004', name: '5TB Multi-Region Vault', priceAdjustment: 950.0 },
        ],
      },
      {
        id: 'prod-005',
        name: '24/7 SLA Dedicated Support Engineer',
        type: 'Service',
        salesPrice: 500.0,
        costPrice: 150.0,
        notes: 'Guaranteed 15-minute response time SLA and direct escalation engineering line.',
        isActive: true,
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
        variants: [
          { id: 'var-012', productId: 'prod-005', name: 'Business Hours Only', priceAdjustment: -200.0 },
          { id: 'var-013', productId: 'prod-005', name: '24/7/365 Dedicated Escort', priceAdjustment: 0.0 },
        ],
      },
    ];

    // Seed Subscription Plans & Billing Configuration
    this.plans = [
      {
        id: 'plan-001',
        name: 'Brightloop Starter Suite',
        description: 'Essential operations suite designed for growing startups, small teams, and boutique agencies.',
        price: 199.0,
        billingFrequency: 'MONTHLY',
        minQuantity: 1,
        autoClose: false,
        canPause: true,
        canRenew: true,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'plan-002',
        name: 'Brightloop Enterprise Cloud Suite',
        description: 'Flagship enterprise bundle: Core ERP platform, 10 user seats, financial BI reporting, and premium SLA.',
        price: 1420.0,
        billingFrequency: 'MONTHLY',
        minQuantity: 5,
        autoClose: false,
        canPause: true,
        canRenew: true,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'plan-003',
        name: 'Secure Cloud Automated Backup & DR',
        description: 'Annual enterprise disaster recovery, automated immutable backup replication, and security compliance.',
        price: 850.0,
        billingFrequency: 'YEARLY',
        minQuantity: 1,
        autoClose: false,
        canPause: false,
        canRenew: true,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'plan-004',
        name: 'Rapid Sprint DevOps Cluster',
        description: 'Weekly burst compute cluster and isolated testing bench for fast-paced feature releases.',
        price: 80.0,
        billingFrequency: 'WEEKLY',
        minQuantity: 1,
        autoClose: true,
        canPause: true,
        canRenew: false,
        isActive: true,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 'plan-005',
        name: 'Pay-As-You-Go Daily Standby',
        description: 'Daily elastic provisioning for seasonal staff surges, event workloads, and sandbox demonstrations.',
        price: 15.0,
        billingFrequency: 'DAILY',
        minQuantity: 1,
        autoClose: false,
        canPause: true,
        canRenew: true,
        isActive: true,
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-02-15T00:00:00.000Z',
      },
    ];

    // Seed Discount Rules
    this.discountRules = [
      {
        id: 'disc-001',
        code: 'WELCOME2026',
        description: 'Welcome promotion granting 10% off subscriptions with minimum purchase of $500.',
        type: 'PERCENTAGE',
        value: 10.0,
        minPurchase: 500.0,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        maxUsage: 100,
        timesUsed: 14,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'disc-002',
        code: 'FLAT100OFF',
        description: 'Direct $100 concession on enterprise subscriptions valued at $1,000 or greater.',
        type: 'FIXED',
        value: 100.0,
        minPurchase: 1000.0,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        maxUsage: 50,
        timesUsed: 7,
        isActive: true,
        createdAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'disc-003',
        code: 'HACKATHON25',
        description: 'Exclusive 25% discount voucher for live hackathon showcase and partner deployments.',
        type: 'PERCENTAGE',
        value: 25.0,
        minPurchase: 200.0,
        startDate: '2026-02-01T00:00:00.000Z',
        endDate: '2026-12-31T23:59:59.000Z',
        maxUsage: 500,
        timesUsed: 42,
        isActive: true,
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ];

    // Seed Initial Quotations
    this.quotations = [
      {
        id: 'quo-001',
        quotationNumber: 'QUO-2026-0041',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        planId: 'plan-002',
        planName: 'Brightloop Enterprise Cloud Suite',
        totalAmount: 1420.0,
        status: 'SENT',
        notes: 'Custom enterprise quotation requested with Odoo Brand Edition.',
        validUntil: '2026-11-30T00:00:00.000Z',
        createdAt: '2026-10-15T00:00:00.000Z',
        items: [
          {
            productName: 'Core ERP Software Base',
            variantName: 'Odoo Brand Edition (+560)',
            quantity: 1,
            unitPrice: 860.0,
            amount: 860.0,
          },
          {
            productName: 'Staff User Seats (Concurrent)',
            variantName: 'Standard User Seat',
            quantity: 10,
            unitPrice: 35.0,
            amount: 350.0,
          },
          {
            productName: 'Advanced Financial Analytics Module',
            variantName: 'Full Reporting Pack',
            quantity: 1,
            unitPrice: 210.0,
            amount: 210.0,
          },
        ],
      },
      {
        id: 'quo-002',
        quotationNumber: 'QUO-2026-0089',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerEmail: customerUser.email,
        planId: 'plan-003',
        planName: 'Secure Cloud Automated Backup & DR',
        totalAmount: 850.0,
        status: 'DRAFT',
        notes: 'Draft quotation prepared by staff member Sarah Chen for 2TB vault tier.',
        validUntil: '2026-12-15T00:00:00.000Z',
        createdAt: '2026-10-20T00:00:00.000Z',
        items: [
          {
            productName: 'Cloud Vault 2TB Tier',
            variantName: 'Encrypted Hot Storage',
            quantity: 1,
            unitPrice: 850.0,
            amount: 850.0,
          },
        ],
      },
    ];
  }

  // User methods
  findUserByEmail(email: string): StoredUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(user: StoredUser): StoredUser {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<UserPayload>): StoredUser | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  // Subscriptions methods
  getCustomerSubscriptions(customerId: string): CustomerSubscription[] {
    return this.subscriptions.filter((s) => s.customerId === customerId);
  }

  getSubscriptionById(id: string, customerId?: string): CustomerSubscription | undefined {
    return this.subscriptions.find((s) => s.id === id && (!customerId || s.customerId === customerId));
  }

  // Invoices methods
  getCustomerInvoices(customerId: string): CustomerInvoice[] {
    return this.invoices.filter((i) => i.customerId === customerId);
  }

  getInvoiceById(id: string, customerId?: string): CustomerInvoice | undefined {
    return this.invoices.find((i) => i.id === id && (!customerId || i.customerId === customerId));
  }

  // Payments methods
  getCustomerPayments(customerId: string): CustomerPayment[] {
    return this.payments.filter((p) => p.customerId === customerId);
  }

  // Settle invoice instant simulator
  settleInvoice(
    invoiceId: string,
    customerId: string,
    paymentMethod: any,
    note?: string
  ): { payment: CustomerPayment; invoice: CustomerInvoice } | null {
    const invoice = this.getInvoiceById(invoiceId, customerId);
    if (!invoice) return null;

    if (invoice.status === 'PAID') {
      throw new Error('This invoice is already settled and marked as PAID.');
    }

    const amount = invoice.totalAmount;
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}`;

    const payment: CustomerPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId,
      amount,
      paymentMethod,
      paymentDate: new Date().toISOString(),
      status: 'COMPLETED',
      referenceNote: note || `Instant customer portal payment via ${paymentMethod}`,
    };

    this.payments.unshift(payment);
    invoice.status = 'PAID';

    return { payment, invoice };
  }

  recordCustomerPayment(
    customerId: string,
    invoiceId: string,
    amount: number,
    paymentMethod: any,
    note?: string
  ): { payment: CustomerPayment; invoice: CustomerInvoice } | null {
    return this.settleInvoice(invoiceId, customerId, paymentMethod, note);
  }

  // Customer Dashboard Summary Builder
  getCustomerDashboard(customerId: string): CustomerDashboardSummary | null {
    const user = this.findUserById(customerId);
    if (!user) return null;

    const subs = this.getCustomerSubscriptions(customerId);
    const activeSubs = subs.filter((s) => s.status === 'ACTIVE');
    const invoices = this.getCustomerInvoices(customerId);
    const payments = this.getCustomerPayments(customerId);

    // Compute outstanding amounts: Invoices that are NOT 'PAID' and NOT 'CANCELLED'
    const outstandingInvoices = invoices.filter(
      (inv) => inv.status === 'CONFIRMED' || inv.status === 'OVERDUE' || inv.status === 'DRAFT'
    );
    const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Find nearest upcoming renewal date
    const futureRenewals = activeSubs
      .map((s) => s.expiryDate)
      .filter((d): d is string => !!d && new Date(d) > new Date())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const nextRenewalDate = futureRenewals[0] || null;

    return {
      customer: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyName: user.companyName,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      metrics: {
        activeSubscriptionsCount: activeSubs.length,
        nextRenewalDate,
        outstandingAmount,
        paidInvoicesCount: invoices.filter((i) => i.status === 'PAID').length,
        totalInvoicesCount: invoices.length,
      },
      activeSubscriptions: activeSubs,
      recentInvoices: invoices.slice(0, 5),
      recentPayments: payments.slice(0, 5),
    };
  }

  // -------------------------------------------------------------
  // PRODUCTS & VARIANTS METHODS
  // -------------------------------------------------------------

  getProducts(filters?: { search?: string; type?: string; activeOnly?: boolean }): Product[] {
    let result = [...this.products];

    if (filters?.activeOnly) {
      result = result.filter((p) => p.isActive);
    }

    if (filters?.type && filters.type !== 'ALL') {
      result = result.filter((p) => p.type.toLowerCase() === filters.type!.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          p.variants.some((v) => v.name.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getProductById(id: string): Product | null {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }

  createProduct(data: {
    name: string;
    type: string;
    salesPrice: number;
    costPrice: number;
    notes?: string;
    isActive?: boolean;
    variants?: Array<{ name: string; priceAdjustment: number }>;
  }): Product {
    const productId = `prod-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const variants: ProductVariant[] = (data.variants || []).map((v, idx) => ({
      id: `var-${Date.now().toString().slice(-6)}-${idx + 1}`,
      productId,
      name: v.name,
      priceAdjustment: Number(v.priceAdjustment) || 0,
    }));

    const product: Product = {
      id: productId,
      name: data.name.trim(),
      type: data.type.trim() || 'Software',
      salesPrice: Number(data.salesPrice) || 0,
      costPrice: Number(data.costPrice) || 0,
      notes: data.notes || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      variants,
      createdAt: now,
      updatedAt: now,
    };

    this.products.unshift(product);
    return product;
  }

  updateProduct(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>>
  ): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;

    if (data.name !== undefined) product.name = data.name.trim();
    if (data.type !== undefined) product.type = data.type.trim();
    if (data.salesPrice !== undefined) product.salesPrice = Number(data.salesPrice);
    if (data.costPrice !== undefined) product.costPrice = Number(data.costPrice);
    if (data.notes !== undefined) product.notes = data.notes;
    if (data.isActive !== undefined) product.isActive = Boolean(data.isActive);
    product.updatedAt = new Date().toISOString();

    return product;
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }

  addVariant(productId: string, data: { name: string; priceAdjustment: number }): ProductVariant | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    const variant: ProductVariant = {
      id: `var-${Date.now().toString().slice(-6)}`,
      productId,
      name: data.name.trim(),
      priceAdjustment: Number(data.priceAdjustment) || 0,
    };

    product.variants.push(variant);
    product.updatedAt = new Date().toISOString();
    return variant;
  }

  updateVariant(
    productId: string,
    variantId: string,
    data: { name?: string; priceAdjustment?: number }
  ): ProductVariant | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return null;

    if (data.name !== undefined) variant.name = data.name.trim();
    if (data.priceAdjustment !== undefined) variant.priceAdjustment = Number(data.priceAdjustment);
    product.updatedAt = new Date().toISOString();

    return variant;
  }

  deleteVariant(productId: string, variantId: string): boolean {
    const product = this.getProductById(productId);
    if (!product) return false;

    const index = product.variants.findIndex((v) => v.id === variantId);
    if (index === -1) return false;

    product.variants.splice(index, 1);
    product.updatedAt = new Date().toISOString();
    return true;
  }

  // -------------------------------------------------------------
  // SUBSCRIPTION PLANS METHODS
  // -------------------------------------------------------------

  getPlans(filters?: { frequency?: Frequency; activeOnly?: boolean }): Plan[] {
    let result = [...this.plans];

    if (filters?.activeOnly) {
      result = result.filter((p) => p.isActive);
    }

    if (filters?.frequency) {
      result = result.filter((p) => p.billingFrequency === filters.frequency);
    }

    return result;
  }

  getPlanById(id: string): Plan | null {
    const plan = this.plans.find((p) => p.id === id);
    return plan || null;
  }

  createPlan(data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Plan {
    const planId = `plan-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const plan: Plan = {
      id: planId,
      name: data.name.trim(),
      description: data.description || '',
      price: Number(data.price) || 0,
      billingFrequency: data.billingFrequency || 'MONTHLY',
      minQuantity: Number(data.minQuantity) || 1,
      startDate: data.startDate,
      endDate: data.endDate,
      autoClose: Boolean(data.autoClose),
      canPause: data.canPause !== undefined ? Boolean(data.canPause) : true,
      canRenew: data.canRenew !== undefined ? Boolean(data.canRenew) : true,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: now,
      updatedAt: now,
    };

    this.plans.unshift(plan);
    return plan;
  }

  updatePlan(id: string, data: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>): Plan | null {
    const plan = this.getPlanById(id);
    if (!plan) return null;

    if (data.name !== undefined) plan.name = data.name.trim();
    if (data.description !== undefined) plan.description = data.description;
    if (data.price !== undefined) plan.price = Number(data.price);
    if (data.billingFrequency !== undefined) plan.billingFrequency = data.billingFrequency;
    if (data.minQuantity !== undefined) plan.minQuantity = Number(data.minQuantity);
    if (data.startDate !== undefined) plan.startDate = data.startDate;
    if (data.endDate !== undefined) plan.endDate = data.endDate;
    if (data.autoClose !== undefined) plan.autoClose = Boolean(data.autoClose);
    if (data.canPause !== undefined) plan.canPause = Boolean(data.canPause);
    if (data.canRenew !== undefined) plan.canRenew = Boolean(data.canRenew);
    if (data.isActive !== undefined) plan.isActive = Boolean(data.isActive);
    plan.updatedAt = new Date().toISOString();

    return plan;
  }

  deletePlan(id: string): boolean {
    const index = this.plans.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.plans.splice(index, 1);
    return true;
  }

  // -------------------------------------------------------------
  // DISCOUNT RULES & PROMOTIONS METHODS
  // -------------------------------------------------------------

  getDiscountRules(activeOnly?: boolean): DiscountRule[] {
    let result = [...this.discountRules];
    if (activeOnly) {
      result = result.filter((r) => r.isActive);
    }
    return result;
  }

  getDiscountRuleById(id: string): DiscountRule | null {
    return this.discountRules.find((r) => r.id === id) || null;
  }

  getDiscountRuleByCode(code: string): DiscountRule | null {
    const q = code.trim().toUpperCase();
    return this.discountRules.find((r) => r.code.toUpperCase() === q) || null;
  }

  createDiscountRule(data: Omit<DiscountRule, 'id' | 'createdAt' | 'timesUsed'>): DiscountRule {
    const existing = this.getDiscountRuleByCode(data.code);
    if (existing) {
      throw new Error(`Discount rule with promo code '${data.code.toUpperCase()}' already exists.`);
    }

    const rule: DiscountRule = {
      id: `disc-${Date.now().toString().slice(-6)}`,
      code: data.code.trim().toUpperCase(),
      description: data.description || '',
      type: data.type || 'PERCENTAGE',
      value: Number(data.value) || 0,
      minPurchase: data.minPurchase !== undefined ? Number(data.minPurchase) : undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      maxUsage: data.maxUsage !== undefined ? Number(data.maxUsage) : undefined,
      timesUsed: 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date().toISOString(),
    };

    this.discountRules.unshift(rule);
    return rule;
  }

  updateDiscountRule(
    id: string,
    data: Partial<Omit<DiscountRule, 'id' | 'createdAt' | 'timesUsed'>>
  ): DiscountRule | null {
    const rule = this.getDiscountRuleById(id);
    if (!rule) return null;

    if (data.code !== undefined) {
      const formattedCode = data.code.trim().toUpperCase();
      const existing = this.getDiscountRuleByCode(formattedCode);
      if (existing && existing.id !== id) {
        throw new Error(`Discount rule with code '${formattedCode}' already exists.`);
      }
      rule.code = formattedCode;
    }
    if (data.description !== undefined) rule.description = data.description;
    if (data.type !== undefined) rule.type = data.type;
    if (data.value !== undefined) rule.value = Number(data.value);
    if (data.minPurchase !== undefined) rule.minPurchase = Number(data.minPurchase);
    if (data.startDate !== undefined) rule.startDate = data.startDate;
    if (data.endDate !== undefined) rule.endDate = data.endDate;
    if (data.maxUsage !== undefined) rule.maxUsage = Number(data.maxUsage);
    if (data.isActive !== undefined) rule.isActive = Boolean(data.isActive);

    return rule;
  }

  deleteDiscountRule(id: string): boolean {
    const index = this.discountRules.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.discountRules.splice(index, 1);
    return true;
  }

  validateDiscount(code: string, purchaseAmount: number): DiscountValidationResult {
    const rule = this.getDiscountRuleByCode(code);
    if (!rule) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        error: `Promo code '${code.toUpperCase()}' is invalid or does not exist.`,
      };
    }

    if (!rule.isActive) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        rule,
        error: `Promo code '${rule.code}' is currently inactive.`,
      };
    }

    const now = new Date();
    if (rule.startDate && new Date(rule.startDate) > now) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        rule,
        error: `Promo code '${rule.code}' is not yet active.`,
      };
    }

    if (rule.endDate && new Date(rule.endDate) < now) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        rule,
        error: `Promo code '${rule.code}' has expired.`,
      };
    }

    if (rule.maxUsage && rule.timesUsed >= rule.maxUsage) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        rule,
        error: `Promo code '${rule.code}' has reached its maximum usage limit.`,
      };
    }

    if (rule.minPurchase && purchaseAmount < rule.minPurchase) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: purchaseAmount,
        rule,
        error: `Minimum purchase of $${rule.minPurchase.toFixed(2)} is required to use '${rule.code}'.`,
      };
    }

    let discountAmount = 0;
    if (rule.type === 'PERCENTAGE') {
      discountAmount = (purchaseAmount * rule.value) / 100;
    } else {
      discountAmount = Math.min(rule.value, purchaseAmount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, Math.round((purchaseAmount - discountAmount) * 100) / 100);

    return {
      valid: true,
      discountAmount,
      finalAmount,
      rule,
    };
  }

  // -------------------------------------------------------------
  // ALL SUBSCRIPTIONS & QUOTATIONS (STAFF & CUSTOMER RBAC)
  // -------------------------------------------------------------

  getAllSubscriptions(): CustomerSubscription[] {
    return this.subscriptions;
  }

  getQuotations(customerId?: string): Quotation[] {
    if (customerId) {
      return this.quotations.filter((q) => q.customerId === customerId);
    }
    return this.quotations;
  }

  getQuotationById(id: string): Quotation | null {
    return this.quotations.find((q) => q.id === id) || null;
  }

  createQuotationRequest(data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    planName?: string;
    notes: string;
    estimatedAmount?: number;
    items?: Array<{ productName: string; variantName?: string; quantity: number; unitPrice: number; amount: number }>;
  }): Quotation {
    const quotationNumber = `QUO-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const quote: Quotation = {
      id: `quo-${Date.now().toString().slice(-6)}`,
      quotationNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      planName: data.planName || 'Custom Enterprise Configuration',
      totalAmount: data.estimatedAmount || 0,
      status: 'SENT',
      notes: data.notes,
      items: data.items || [],
      validUntil,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.quotations.unshift(quote);
    return quote;
  }

  prepareStaffQuotation(data: {
    customerId: string;
    planName: string;
    totalAmount: number;
    notes?: string;
    validDays?: number;
    items?: Array<{ productName: string; variantName?: string; quantity: number; unitPrice: number; amount: number }>;
  }): Quotation {
    const customer = this.findUserById(data.customerId);
    const quotationNumber = `QUO-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const days = data.validDays || 30;
    const validUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const quote: Quotation = {
      id: `quo-${Date.now().toString().slice(-6)}`,
      quotationNumber,
      customerId: data.customerId,
      customerName: customer ? customer.name : 'Valued Customer',
      customerEmail: customer ? customer.email : '',
      planName: data.planName,
      totalAmount: Number(data.totalAmount) || 0,
      status: 'DRAFT',
      notes: data.notes || '',
      items: data.items || [],
      validUntil,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.quotations.unshift(quote);
    return quote;
  }

  updateQuotationStatus(id: string, status: QuotationStatus): Quotation | null {
    const quote = this.getQuotationById(id);
    if (!quote) return null;
    quote.status = status;
    quote.updatedAt = new Date().toISOString();
    return quote;
  }
}

export const dbStore = new Store();
