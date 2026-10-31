import {
  CustomerDashboardSummary,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
  DiscountRule,
  DiscountValidationResult,
  Plan,
  Product,
  ProductVariant,
  Role,
  User,
} from '../types';

// Default mock users
const DEFAULT_USERS: Array<User & { password: string }> = [
  {
    id: 'cust-uuid-001',
    name: 'Alex Rivera',
    email: 'customer@brightloop.com',
    companyName: 'Apex Retail Solutions Ltd.',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 300, Austin, TX 78701',
    role: 'CUSTOMER',
    password: 'Password@123',
  },
  {
    id: 'staff-uuid-002',
    name: 'Sarah Chen',
    email: 'staff@brightloop.com',
    companyName: 'Brightloop Software Internal',
    phone: '+1 (555) 876-5432',
    address: 'Brightloop HQ, 100 Innovation Way, San Francisco, CA',
    role: 'STAFF',
    password: 'Staff@12345',
  },
  {
    id: 'admin-uuid-003',
    name: 'Marcus Vance',
    email: 'admin@brightloop.com',
    companyName: 'Brightloop Software Management',
    phone: '+1 (555) 999-1122',
    address: 'Brightloop HQ, Executive Suite, San Francisco, CA',
    role: 'ADMIN',
    password: 'Admin@12345',
  },
];

// Initial mock products
const INITIAL_PRODUCTS: Product[] = [
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

// Initial mock plans
const INITIAL_PLANS: Plan[] = [
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

// Initial mock discounts
const INITIAL_DISCOUNTS: DiscountRule[] = [
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
    description: 'Exclusive 25% discount voucher for live showcase demo partners.',
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

class MockFallbackService {
  private getStoredUsers(): Array<User & { password: string }> {
    const raw = localStorage.getItem('brightloop_local_users');
    if (!raw) {
      localStorage.setItem('brightloop_local_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS;
    }
  }

  private saveStoredUsers(users: Array<User & { password: string }>) {
    localStorage.setItem('brightloop_local_users', JSON.stringify(users));
  }

  // Auth
  async register(details: {
    name: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
    address?: string;
    role?: Role;
  }): Promise<{ user: User; token: string }> {
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === details.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User & { password: string } = {
      id: `usr-${Date.now()}`,
      name: details.name.trim(),
      email: details.email.trim().toLowerCase(),
      companyName: details.companyName || '',
      phone: details.phone || '',
      address: details.address || '',
      role: details.role || 'CUSTOMER',
      password: details.password,
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    const token = `mock_token_${Date.now()}_${newUser.id}`;
    localStorage.setItem('brightloop_current_user', JSON.stringify(newUser));

    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const users = this.getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.password && user.password !== credentials.password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const token = `mock_token_${Date.now()}_${user.id}`;
    localStorage.setItem('brightloop_current_user', JSON.stringify(user));

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getMe(): Promise<User> {
    const raw = localStorage.getItem('brightloop_current_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        const { password, ...safeUser } = u;
        return safeUser;
      } catch {
        // Fall back to default
      }
    }
    const defaultUser = DEFAULT_USERS[0];
    const { password, ...safeUser } = defaultUser;
    return safeUser;
  }

  // Customer Dashboard
  async getDashboard(): Promise<CustomerDashboardSummary> {
    const user = await this.getMe();
    const subs = await this.getSubscriptions();
    const invoices = await this.getInvoices();
    const payments = await this.getPayments();

    const outstandingInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      customer: user,
      metrics: {
        activeSubscriptionsCount: subs.filter((s) => s.status === 'ACTIVE').length,
        nextRenewalDate: '2026-11-15T00:00:00.000Z',
        outstandingAmount,
        paidInvoicesCount: invoices.filter((i) => i.status === 'PAID').length,
        totalInvoicesCount: invoices.length,
      },
      activeSubscriptions: subs.filter((s) => s.status === 'ACTIVE'),
      recentInvoices: invoices.slice(0, 5),
      recentPayments: payments.slice(0, 5),
    };
  }

  async getSubscriptions(): Promise<CustomerSubscription[]> {
    return [
      {
        id: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        customerId: 'cust-uuid-001',
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
        customerId: 'cust-uuid-001',
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
        customerId: 'cust-uuid-001',
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
  }

  async getInvoices(): Promise<CustomerInvoice[]> {
    const raw = localStorage.getItem('brightloop_local_invoices');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fall back
      }
    }

    const defaultInvoices: CustomerInvoice[] = [
      {
        id: 'inv-1044',
        invoiceNumber: 'INV-2026-1044',
        customerId: 'cust-uuid-001',
        subscriptionId: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        issueDate: '2026-10-15T00:00:00.000Z',
        dueDate: '2026-11-15T00:00:00.000Z',
        subtotal: 1420.0,
        taxAmount: 142.0,
        discountAmount: 142.0,
        totalAmount: 1420.0,
        status: 'CONFIRMED',
        notes: 'October 2026 recurring monthly cycle.',
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
        customerId: 'cust-uuid-001',
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
        customerId: 'cust-uuid-001',
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
        ],
      },
    ];

    localStorage.setItem('brightloop_local_invoices', JSON.stringify(defaultInvoices));
    return defaultInvoices;
  }

  async payInvoice(data: {
    invoiceId: string;
    paymentMethod: string;
    note?: string;
  }): Promise<{ payment: CustomerPayment; invoice: CustomerInvoice }> {
    const invoices = await this.getInvoices();
    const inv = invoices.find((i) => i.id === data.invoiceId);
    if (!inv) throw new Error('Invoice not found');

    inv.status = 'PAID';
    localStorage.setItem('brightloop_local_invoices', JSON.stringify(invoices));

    const payment: CustomerPayment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      amount: inv.totalAmount,
      paymentMethod: (data.paymentMethod as any) || 'CREDIT_CARD',
      paymentDate: new Date().toISOString(),
      status: 'COMPLETED',
      referenceNote: data.note || 'Settled via Customer Portal Instant Settlement',
    };

    const payments = await this.getPayments();
    payments.unshift(payment);
    localStorage.setItem('brightloop_local_payments', JSON.stringify(payments));

    return { payment, invoice: inv };
  }

  async getPayments(): Promise<CustomerPayment[]> {
    const raw = localStorage.getItem('brightloop_local_payments');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fall back
      }
    }

    const defaultPayments: CustomerPayment[] = [
      {
        id: 'pay-001',
        paymentNumber: 'PAY-2026-0982',
        invoiceId: 'inv-0982',
        invoiceNumber: 'INV-2026-0982',
        customerId: 'cust-uuid-001',
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
        customerId: 'cust-uuid-001',
        amount: 1420.0,
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2026-09-20T09:15:00.000Z',
        status: 'COMPLETED',
        referenceNote: 'Wire Ref: ACH-882910-APEX',
      },
    ];

    localStorage.setItem('brightloop_local_payments', JSON.stringify(defaultPayments));
    return defaultPayments;
  }

  // Products
  async getProducts(params?: { search?: string; type?: string }): Promise<Product[]> {
    const raw = localStorage.getItem('brightloop_local_products');
    let list: Product[] = raw ? JSON.parse(raw) : INITIAL_PRODUCTS;

    if (params?.type && params.type !== 'ALL') {
      list = list.filter((p) => p.type.toLowerCase() === params.type!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    return list;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const prods = await this.getProducts();
    const newProd: Product = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: data.name || 'New Product',
      type: data.type || 'Software',
      salesPrice: Number(data.salesPrice) || 0,
      costPrice: Number(data.costPrice) || 0,
      notes: data.notes || '',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      variants: (data.variants || []).map((v, i) => ({
        id: `var-${Date.now().toString().slice(-6)}-${i + 1}`,
        productId: `prod-${Date.now().toString().slice(-6)}`,
        name: v.name,
        priceAdjustment: Number(v.priceAdjustment) || 0,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    prods.unshift(newProd);
    localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
    return newProd;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const prods = await this.getProducts();
    const p = prods.find((x) => x.id === id);
    if (!p) throw new Error('Product not found');
    Object.assign(p, data, { updatedAt: new Date().toISOString() });
    localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
    return p;
  }

  async deleteProduct(id: string): Promise<void> {
    let prods = await this.getProducts();
    prods = prods.filter((x) => x.id !== id);
    localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
  }

  async addVariant(productId: string, data: { name: string; priceAdjustment: number }): Promise<ProductVariant> {
    const prods = await this.getProducts();
    const p = prods.find((x) => x.id === productId);
    if (!p) throw new Error('Product not found');

    const v: ProductVariant = {
      id: `var-${Date.now().toString().slice(-6)}`,
      productId,
      name: data.name,
      priceAdjustment: Number(data.priceAdjustment) || 0,
    };
    p.variants.push(v);
    localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
    return v;
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    const prods = await this.getProducts();
    const p = prods.find((x) => x.id === productId);
    if (!p) return;
    p.variants = p.variants.filter((v) => v.id !== variantId);
    localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
  }

  // Plans
  async getPlans(params?: { frequency?: string }): Promise<Plan[]> {
    const raw = localStorage.getItem('brightloop_local_plans');
    let list: Plan[] = raw ? JSON.parse(raw) : INITIAL_PLANS;
    if (params?.frequency && params.frequency !== 'ALL') {
      list = list.filter((p) => p.billingFrequency === params.frequency);
    }
    return list;
  }

  async createPlan(data: Partial<Plan>): Promise<Plan> {
    const plans = await this.getPlans();
    const newPlan: Plan = {
      id: `plan-${Date.now().toString().slice(-6)}`,
      name: data.name || 'New Plan',
      description: data.description || '',
      price: Number(data.price) || 0,
      billingFrequency: (data.billingFrequency as any) || 'MONTHLY',
      minQuantity: Number(data.minQuantity) || 1,
      canPause: data.canPause !== undefined ? Boolean(data.canPause) : true,
      canRenew: data.canRenew !== undefined ? Boolean(data.canRenew) : true,
      autoClose: Boolean(data.autoClose),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    plans.unshift(newPlan);
    localStorage.setItem('brightloop_local_plans', JSON.stringify(plans));
    return newPlan;
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    const plans = await this.getPlans();
    const pl = plans.find((x) => x.id === id);
    if (!pl) throw new Error('Plan not found');
    Object.assign(pl, data, { updatedAt: new Date().toISOString() });
    localStorage.setItem('brightloop_local_plans', JSON.stringify(plans));
    return pl;
  }

  async deletePlan(id: string): Promise<void> {
    let plans = await this.getPlans();
    plans = plans.filter((x) => x.id !== id);
    localStorage.setItem('brightloop_local_plans', JSON.stringify(plans));
  }

  // Discounts
  async getDiscounts(): Promise<DiscountRule[]> {
    const raw = localStorage.getItem('brightloop_local_discounts');
    return raw ? JSON.parse(raw) : INITIAL_DISCOUNTS;
  }

  async validateDiscount(code: string, amount: number): Promise<DiscountValidationResult> {
    const discounts = await this.getDiscounts();
    const rule = discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());

    if (!rule) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: `Promo code '${code.toUpperCase()}' is invalid or does not exist.`,
      };
    }

    if (rule.minPurchase && amount < rule.minPurchase) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        rule,
        error: `Minimum purchase of $${rule.minPurchase.toFixed(2)} is required to use '${rule.code}'.`,
      };
    }

    const deduction =
      rule.type === 'PERCENTAGE'
        ? Math.round(((amount * rule.value) / 100) * 100) / 100
        : Math.min(rule.value, amount);

    return {
      valid: true,
      discountAmount: deduction,
      finalAmount: Math.max(0, amount - deduction),
      rule,
    };
  }

  async createDiscount(data: Partial<DiscountRule>): Promise<DiscountRule> {
    const discounts = await this.getDiscounts();
    const code = (data.code || '').trim().toUpperCase();
    if (discounts.some((d) => d.code === code)) {
      throw new Error(`Discount code '${code}' already exists.`);
    }

    const newRule: DiscountRule = {
      id: `disc-${Date.now().toString().slice(-6)}`,
      code,
      description: data.description || '',
      type: data.type || 'PERCENTAGE',
      value: Number(data.value) || 0,
      minPurchase: data.minPurchase !== undefined ? Number(data.minPurchase) : undefined,
      maxUsage: data.maxUsage !== undefined ? Number(data.maxUsage) : undefined,
      timesUsed: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    discounts.unshift(newRule);
    localStorage.setItem('brightloop_local_discounts', JSON.stringify(discounts));
    return newRule;
  }

  async deleteDiscount(id: string): Promise<void> {
    let discounts = await this.getDiscounts();
    discounts = discounts.filter((d) => d.id !== id);
    localStorage.setItem('brightloop_local_discounts', JSON.stringify(discounts));
  }
}

export const mockFallback = new MockFallbackService();
