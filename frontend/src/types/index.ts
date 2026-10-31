// Shared TypeScript types for the frontend

export type QuotationStatus = 'DRAFT' | 'CONFIRMED' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'EXPIRED';
export type BillingFrequency = 'MONTHLY' | 'YEARLY';

export interface Customer {
  id: string;
  companyName: string;
  phone?: string;
  user: { name: string; email: string };
}

export interface Product {
  id: string;
  name: string;
  basePrice: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: string;
}

export interface Plan {
  id: string;
  name: string;
  billingFrequency: BillingFrequency;
  description?: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  planId: string;
  plan: Plan;
  quantity: number;
  unitPrice: string;
  discountPct: string;
  subtotal: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer: Customer;
  status: QuotationStatus;
  discountPct: string;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  notes?: string;
  expiresAt?: string;
  confirmedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  subscription?: { id: string; subscriptionRef: string; status: SubscriptionStatus } | null;
}

export interface SubscriptionItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  planId: string;
  plan: Plan;
  quantity: number;
  agreedUnitPrice: string;
  subtotal: string;
}

export interface Subscription {
  id: string;
  subscriptionRef: string;
  customerId: string;
  customer: Customer;
  quotationId: string;
  quotation: { id: string; quotationNumber: string };
  status: SubscriptionStatus;
  billingFrequency: BillingFrequency;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  pausedAt?: string;
  closedAt?: string;
  totalAmount: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: SubscriptionItem[];
}

// Form types
export interface QuotationItemInput {
  productId: string;
  variantId?: string;
  planId: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

export interface CreateQuotationInput {
  customerId: string;
  discountPct: number;
  notes: string;
  expiresAt: string;
  items: QuotationItemInput[];
}
