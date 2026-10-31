export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  role: Role;
  phone?: string;
  address?: string;
}

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type QuotationStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'CONVERTED' | 'EXPIRED';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'STRIPE' | 'CASH' | 'UPI';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface SubscriptionLineItem {
  id: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface CustomerSubscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName?: string;
  customerCompany?: string;
  quotationId?: string;
  quotationNumber?: string;
  planName: string;
  billingFrequency: Frequency;
  startDate: string;
  expiryDate?: string;
  paymentTerms: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  notes?: string;
  totalAmount: number;
  lines: SubscriptionLineItem[];
}

export interface QuotationLineItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName?: string;
  customerCompany?: string;
  customerEmail?: string;
  planId: string;
  planName?: string;
  validUntil: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  lines: QuotationLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  lines: InvoiceLineItem[];
}

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: PaymentStatus;
  referenceNote?: string;
}

export interface CustomerDashboardSummary {
  customer: UserPayload;
  metrics: {
    activeSubscriptionsCount: number;
    nextRenewalDate: string | null;
    outstandingAmount: number;
    paidInvoicesCount: number;
    totalInvoicesCount: number;
  };
  activeSubscriptions: CustomerSubscription[];
  recentInvoices: CustomerInvoice[];
  recentPayments: CustomerPayment[];
}

export interface BillingAnalytics {
  totalActiveSubscriptions: number;
  totalSubscriptions: number;
  mrr: number;
  arr: number;
  totalRevenueCollected: number;
  outstandingReceivables: number;
  overdueAmount: number;
  overdueInvoicesCount: number;
  paidInvoicesCount: number;
  totalInvoicesCount: number;
  invoicesByStatus: {
    DRAFT: { count: number; amount: number };
    CONFIRMED: { count: number; amount: number };
    PAID: { count: number; amount: number };
    OVERDUE: { count: number; amount: number };
    CANCELLED: { count: number; amount: number };
  };
  paymentMethodsBreakdown: {
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];
  recentInvoices: CustomerInvoice[];
  recentPayments: CustomerPayment[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
