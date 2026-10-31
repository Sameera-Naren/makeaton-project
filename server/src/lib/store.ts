import bcrypt from 'bcryptjs';
import {
  CustomerDashboardSummary,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
  Quotation,
  QuotationStatus,
  Role,
  SubscriptionStatus,
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
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
        quotationId: 'quo-001',
        quotationNumber: 'QUO-2026-0098',
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
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
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
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
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

    // Seed Member 3 Quotations
    this.quotations = [
      {
        id: 'quo-001',
        quotationNumber: 'QUO-2026-0098',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
        customerEmail: customerUser.email,
        planId: 'plan-002',
        planName: 'Brightloop Enterprise Cloud Suite',
        validUntil: '2026-03-31T00:00:00.000Z',
        subtotal: 1420.0,
        taxAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 1420.0,
        status: 'CONVERTED',
        subscriptionId: 'sub-001',
        subscriptionNumber: 'SUB-2026-0041',
        notes: 'Converted to initial production subscription on Jan 15.',
        createdAt: '2026-01-10T09:00:00.000Z',
        updatedAt: '2026-01-15T11:20:00.000Z',
        lines: [
          {
            id: 'ql-001',
            productId: 'prod-001',
            productName: 'Core ERP Software Base',
            variantId: 'var-002',
            variantName: 'Odoo Brand Edition (+560)',
            quantity: 1,
            unitPrice: 860.0,
            taxRate: 0,
            discount: 0,
            amount: 860.0,
          },
          {
            id: 'ql-002',
            productId: 'prod-002',
            productName: 'Staff User Seats (Concurrent)',
            quantity: 10,
            unitPrice: 35.0,
            taxRate: 0,
            discount: 0,
            amount: 350.0,
          },
          {
            id: 'ql-003',
            productId: 'prod-003',
            productName: 'Advanced Financial Analytics Module',
            quantity: 1,
            unitPrice: 210.0,
            taxRate: 0,
            discount: 0,
            amount: 210.0,
          },
        ],
      },
      {
        id: 'quo-002',
        quotationNumber: 'QUO-2026-0142',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
        customerEmail: customerUser.email,
        planId: 'plan-002',
        planName: 'Brightloop Enterprise Cloud Suite',
        validUntil: '2026-11-30T00:00:00.000Z',
        subtotal: 960.0,
        taxAmount: 96.0,
        discountAmount: 50.0,
        totalAmount: 1006.0,
        status: 'CONFIRMED',
        notes: 'Approved by CFO for Q4 regional sales expansion. Ready for subscription activation.',
        createdAt: '2026-10-25T14:30:00.000Z',
        updatedAt: '2026-10-28T16:45:00.000Z',
        lines: [
          {
            id: 'ql-004',
            productId: 'prod-001',
            productName: 'Brightloop Core ERP (Standard)',
            quantity: 1,
            unitPrice: 300.0,
            taxRate: 10,
            discount: 0,
            amount: 300.0,
          },
          {
            id: 'ql-005',
            productId: 'prod-002',
            productName: 'User License Seat',
            quantity: 12,
            unitPrice: 35.0,
            taxRate: 10,
            discount: 0,
            amount: 420.0,
          },
          {
            id: 'ql-006',
            productId: 'prod-003',
            productName: 'Advanced Financial Analytics Module',
            quantity: 1,
            unitPrice: 210.0,
            taxRate: 10,
            discount: 50,
            amount: 160.0,
          },
        ],
      },
      {
        id: 'quo-003',
        quotationNumber: 'QUO-2026-0155',
        customerId: customerUser.id,
        customerName: customerUser.name,
        customerCompany: customerUser.companyName,
        customerEmail: customerUser.email,
        planId: 'plan-003',
        planName: 'Secure Cloud Automated Backup & DR',
        validUntil: '2026-12-15T00:00:00.000Z',
        subtotal: 850.0,
        taxAmount: 0.0,
        discountAmount: 0.0,
        totalAmount: 850.0,
        status: 'DRAFT',
        notes: 'Draft proposal for high-capacity disaster recovery vault expansion.',
        createdAt: '2026-10-30T10:15:00.000Z',
        updatedAt: '2026-10-30T10:15:00.000Z',
        lines: [
          {
            id: 'ql-007',
            productId: 'prod-003',
            productName: 'Cloud Vault 2TB Tier (Annual)',
            quantity: 1,
            unitPrice: 850.0,
            taxRate: 0,
            discount: 0,
            amount: 850.0,
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
        dueDate: '2026-10-30T00:00:00.000Z',
        subtotal: 1420.0,
        taxAmount: 142.0,
        discountAmount: 142.0,
        totalAmount: 1420.0,
        status: 'CONFIRMED',
        notes: 'October 2026 recurring monthly invoice. Discount code FALL2026 applied.',
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
  }

  // User methods
  findUserByEmail(email: string): StoredUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  getAllCustomers(): UserPayload[] {
    return this.users.filter((u) => u.role === 'CUSTOMER');
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

  // ==========================================
  // MEMBER 3: QUOTATIONS METHODS
  // ==========================================

  getQuotations(filters?: { status?: string; customerId?: string }): Quotation[] {
    return this.quotations.filter((q) => {
      const matchStatus = !filters?.status || filters.status === 'ALL' || q.status === filters.status;
      const matchCustomer = !filters?.customerId || q.customerId === filters.customerId;
      return matchStatus && matchCustomer;
    });
  }

  getQuotationById(id: string): Quotation | undefined {
    return this.quotations.find((q) => q.id === id || q.quotationNumber === id);
  }

  createQuotation(data: {
    customerId: string;
    planId: string;
    planName?: string;
    validUntil?: string;
    notes?: string;
    lines: Array<{
      productId: string;
      productName: string;
      variantId?: string;
      variantName?: string;
      quantity: number;
      unitPrice: number;
      taxRate?: number;
      discount?: number;
    }>;
  }): Quotation {
    const customer = this.findUserById(data.customerId);
    const quotationNumber = `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntil =
      data.validUntil ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const lines = (data.lines || []).map((l, index) => {
      const taxRate = l.taxRate ?? 0;
      const discount = l.discount ?? 0;
      const lineSubtotal = l.quantity * l.unitPrice;
      const lineDiscount = discount;
      const taxable = Math.max(0, lineSubtotal - lineDiscount);
      const lineTax = (taxable * taxRate) / 100;
      const amount = taxable + lineTax;

      subtotal += lineSubtotal;
      taxAmount += lineTax;
      discountAmount += lineDiscount;

      return {
        id: `ql-${Date.now()}-${index}`,
        productId: l.productId,
        productName: l.productName,
        variantId: l.variantId,
        variantName: l.variantName,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate,
        discount,
        amount,
      };
    });

    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

    const quotation: Quotation = {
      id: `quo-${Date.now()}`,
      quotationNumber,
      customerId: data.customerId,
      customerName: customer?.name || 'Customer',
      customerCompany: customer?.companyName || 'Brightloop Client',
      customerEmail: customer?.email,
      planId: data.planId,
      planName: data.planName || 'Enterprise Plan',
      validUntil,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      status: 'DRAFT',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines,
    };

    this.quotations.unshift(quotation);
    return quotation;
  }

  updateQuotation(
    id: string,
    updates: {
      notes?: string;
      validUntil?: string;
      lines?: Array<{
        productId: string;
        productName: string;
        variantId?: string;
        variantName?: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        discount?: number;
      }>;
    }
  ): Quotation {
    const q = this.getQuotationById(id);
    if (!q) throw new Error(`Quotation '${id}' not found`);
    if (q.status !== 'DRAFT') {
      throw new Error(`Only DRAFT quotations can be edited. Current status: ${q.status}`);
    }

    if (updates.notes !== undefined) q.notes = updates.notes;
    if (updates.validUntil) q.validUntil = updates.validUntil;

    if (updates.lines) {
      let subtotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;

      q.lines = updates.lines.map((l, index) => {
        const taxRate = l.taxRate ?? 0;
        const discount = l.discount ?? 0;
        const lineSubtotal = l.quantity * l.unitPrice;
        const lineDiscount = discount;
        const taxable = Math.max(0, lineSubtotal - lineDiscount);
        const lineTax = (taxable * taxRate) / 100;
        const amount = taxable + lineTax;

        subtotal += lineSubtotal;
        taxAmount += lineTax;
        discountAmount += lineDiscount;

        return {
          id: `ql-${Date.now()}-${index}`,
          productId: l.productId,
          productName: l.productName,
          variantId: l.variantId,
          variantName: l.variantName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          taxRate,
          discount,
          amount,
        };
      });

      q.subtotal = subtotal;
      q.taxAmount = taxAmount;
      q.discountAmount = discountAmount;
      q.totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
    }

    q.updatedAt = new Date().toISOString();
    return q;
  }

  confirmQuotation(id: string): Quotation {
    const q = this.getQuotationById(id);
    if (!q) throw new Error(`Quotation '${id}' not found`);
    if (q.status !== 'DRAFT') {
      throw new Error(`Only DRAFT quotations can be confirmed. Current status: ${q.status}`);
    }

    q.status = 'CONFIRMED';
    q.updatedAt = new Date().toISOString();
    return q;
  }

  convertQuotationToSubscription(id: string): {
    quotation: Quotation;
    subscription: CustomerSubscription;
  } {
    const q = this.getQuotationById(id);
    if (!q) throw new Error(`Quotation '${id}' not found`);
    if (q.status !== 'CONFIRMED') {
      throw new Error(
        `Only CONFIRMED quotations can be converted to subscriptions. Current status: ${q.status}`
      );
    }
    if (q.subscriptionId) {
      throw new Error(
        `Quotation ${q.quotationNumber} has already been converted to subscription ${q.subscriptionNumber}`
      );
    }

    const subNumber = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subId = `sub-${Date.now()}`;

    const newSub: CustomerSubscription = {
      id: subId,
      subscriptionNumber: subNumber,
      customerId: q.customerId,
      customerName: q.customerName,
      customerCompany: q.customerCompany,
      quotationId: q.id,
      quotationNumber: q.quotationNumber,
      planName: q.planName || 'Enterprise Subscription',
      billingFrequency: 'MONTHLY',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: 'Net 15',
      status: 'ACTIVE',
      autoRenew: true,
      notes: `Generated from Quotation ${q.quotationNumber}. ${q.notes || ''}`,
      totalAmount: q.totalAmount,
      lines: q.lines.map((ql, i) => ({
        id: `subl-${Date.now()}-${i}`,
        productName: ql.productName,
        variantName: ql.variantName,
        quantity: ql.quantity,
        unitPrice: ql.unitPrice,
        taxRate: ql.taxRate,
        amount: ql.amount,
      })),
    };

    // Update Quotation state
    q.status = 'CONVERTED';
    q.subscriptionId = newSub.id;
    q.subscriptionNumber = newSub.subscriptionNumber;
    q.updatedAt = new Date().toISOString();

    // Store new subscription
    this.subscriptions.unshift(newSub);

    return { quotation: q, subscription: newSub };
  }

  // ==========================================
  // MEMBER 3: SUBSCRIPTIONS METHODS
  // ==========================================

  getAllSubscriptions(): CustomerSubscription[] {
    return this.subscriptions;
  }

  updateSubscriptionStatus(id: string, status: SubscriptionStatus): CustomerSubscription {
    const sub = this.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
    if (!sub) throw new Error(`Subscription '${id}' not found`);

    const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
      DRAFT: ['QUOTATION', 'CONFIRMED', 'CLOSED'],
      QUOTATION: ['CONFIRMED', 'CLOSED'],
      CONFIRMED: ['ACTIVE', 'CLOSED'],
      ACTIVE: ['PAUSED', 'CLOSED'],
      PAUSED: ['ACTIVE', 'CLOSED'],
      CLOSED: [],
    };

    const allowed = validTransitions[sub.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Cannot transition subscription from ${sub.status} to ${status}`);
    }

    sub.status = status;
    return sub;
  }

  pauseSubscription(id: string): CustomerSubscription {
    return this.updateSubscriptionStatus(id, 'PAUSED');
  }

  resumeSubscription(id: string): CustomerSubscription {
    return this.updateSubscriptionStatus(id, 'ACTIVE');
  }

  closeSubscription(id: string): CustomerSubscription {
    return this.updateSubscriptionStatus(id, 'CLOSED');
  }

  // ==========================================
  // CUSTOMER PORTAL & INVOICE METHODS
  // ==========================================

  getCustomerSubscriptions(customerId: string): CustomerSubscription[] {
    return this.subscriptions.filter((s) => s.customerId === customerId);
  }

  getSubscriptionById(id: string, customerId?: string): CustomerSubscription | undefined {
    const sub = this.subscriptions.find((s) => s.id === id || s.subscriptionNumber === id);
    if (!sub) return undefined;
    if (customerId && sub.customerId !== customerId) return undefined;
    return sub;
  }

  getCustomerInvoices(customerId: string): CustomerInvoice[] {
    return this.invoices.filter((i) => i.customerId === customerId);
  }

  getInvoiceById(id: string, customerId?: string): CustomerInvoice | undefined {
    const inv = this.invoices.find((i) => i.id === id || i.invoiceNumber === id);
    if (!inv) return undefined;
    if (customerId && inv.customerId !== customerId) return undefined;
    return inv;
  }

  getCustomerPayments(customerId: string): CustomerPayment[] {
    return this.payments.filter((p) => p.customerId === customerId);
  }

  recordCustomerPayment(
    customerId: string,
    invoiceId: string,
    amount: number,
    paymentMethod: any,
    note?: string
  ): { payment: CustomerPayment; invoice: CustomerInvoice } | null {
    const invoice = this.getInvoiceById(invoiceId, customerId);
    if (!invoice) return null;

    const paymentNumber = `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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

  getCustomerDashboard(customerId: string): CustomerDashboardSummary | null {
    const user = this.findUserById(customerId);
    if (!user) return null;

    const subs = this.getCustomerSubscriptions(customerId);
    const activeSubs = subs.filter((s) => s.status === 'ACTIVE');
    const invoices = this.getCustomerInvoices(customerId);
    const payments = this.getCustomerPayments(customerId);

    const outstandingInvoices = invoices.filter(
      (inv) => inv.status === 'CONFIRMED' || inv.status === 'OVERDUE' || inv.status === 'DRAFT'
    );
    const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

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
}

export const dbStore = new Store();
