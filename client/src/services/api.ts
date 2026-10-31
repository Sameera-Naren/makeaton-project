import {
  BillingAnalytics,
  CustomerDashboardSummary,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
  DiscountRule,
  DiscountValidationResult,
  InvoiceStatus,
  PaymentMethod,
  Plan,
  Product,
  ProductVariant,
  Quotation,
  QuotationStatus,
  User,
} from '../types';
import { mockFallback } from './mockFallback';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('brightloop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Robust fetch wrapper that gracefully handles empty bodies, non-JSON responses,
 * and seamlessly falls back to mock storage if the backend server is offline.
 */
async function safeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn?: () => Promise<T>
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    let json: any = null;

    if (text && text.trim()) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    // If proxy failed (502 / 504 / 500 with no JSON) or connection was refused
    if (!response.ok && (!json || response.status >= 502)) {
      if (fallbackFn) {
        console.warn(`[Brightloop API] Backend server at port 5000 is unreachable for ${endpoint}. Using client demo storage.`);
        return await fallbackFn();
      }
      throw new Error(
        json?.error ||
          json?.message ||
          `Backend server is unreachable on port 5000 (HTTP ${response.status}). Please start the backend with 'npm run dev:server'.`
      );
    }

    if (!response.ok || (json && json.success === false)) {
      throw new Error(json?.error || json?.message || `Request failed with status ${response.status}`);
    }

    return (json?.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    // If network error occurred (e.g. backend server is not running)
    if (fallbackFn) {
      console.warn(`[Brightloop API] Network fetch failed for ${endpoint}. Seamlessly falling back to client demo storage.`);
      return await fallbackFn();
    }
    throw new Error(err.message || 'Network request failed. Please check your backend connection.');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return safeRequest<T>(endpoint, options);
}

// Unified API Service
export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      return safeRequest<{ user: User; token: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        },
        () => mockFallback.login(credentials)
      );
    },

    register: async (userData: {
      name: string;
      email: string;
      password: string;
      companyName?: string;
    }) => {
      return safeRequest<{ user: User; token: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(userData),
        },
        () => mockFallback.register(userData)
      );
    },

    getMe: async (): Promise<User> => {
      return safeRequest<User>('/auth/me', {}, () => mockFallback.getMe());
    },

    forgotPassword: async (email: string): Promise<string> => {
      return safeRequest<string>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
        async () => `Password reset simulation: Instructions sent to ${email}`
      );
    },

    addStaff: async (staffData: {
      name: string;
      email: string;
      password: string;
      companyName?: string;
    }): Promise<User> => {
      return safeRequest<User>(
        '/auth/add-staff',
        {
          method: 'POST',
          body: JSON.stringify(staffData),
        },
        () => mockFallback.addStaff(staffData)
      );
    },

    logout: () => {
      localStorage.removeItem('brightloop_token');
      localStorage.removeItem('brightloop_user');
    },
  },

  customer: {
    getDashboard: async (): Promise<CustomerDashboardSummary> => {
      return safeRequest<CustomerDashboardSummary>(
        '/customer/dashboard',
        {},
        () => mockFallback.getDashboard()
      );
    },

    getDashboardSummary: async (): Promise<CustomerDashboardSummary> => {
      return safeRequest<CustomerDashboardSummary>(
        '/customer/dashboard/summary',
        {},
        () => mockFallback.getDashboardSummary()
      );
    },

    getSubscriptions: async (): Promise<CustomerSubscription[]> => {
      return safeRequest<CustomerSubscription[]>(
        '/customer/subscriptions',
        {},
        () => mockFallback.getCustomerSubscriptions()
      );
    },

    getSubscriptionById: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/customer/subscriptions/${id}`);
    },

    getInvoices: async (): Promise<CustomerInvoice[]> => {
      return safeRequest<CustomerInvoice[]>(
        '/customer/invoices',
        {},
        () => mockFallback.getCustomerInvoices()
      );
    },

    getInvoiceById: async (id: string): Promise<CustomerInvoice> => {
      return safeRequest<CustomerInvoice>(`/customer/invoices/${id}`);
    },

    getPayments: async (): Promise<CustomerPayment[]> => {
      return safeRequest<CustomerPayment[]>(
        '/customer/payments',
        {},
        () => mockFallback.getCustomerPayments()
      );
    },

    payInvoice: async (data: {
      invoiceId: string;
      paymentMethod: string;
      note?: string;
    }): Promise<{ payment: CustomerPayment; invoice: CustomerInvoice }> => {
      return safeRequest<{ payment: CustomerPayment; invoice: CustomerInvoice }>(
        '/customer/pay-invoice',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.payInvoice(data)
      );
    },

    getProfile: async (): Promise<User> => {
      return safeRequest<User>('/customer/profile', {}, () => mockFallback.getProfile());
    },

    updateProfile: async (updates: Partial<User>): Promise<User> => {
      return safeRequest<User>(
        '/customer/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        () => mockFallback.updateProfile(updates)
      );
    },

    getQuotations: async (): Promise<Quotation[]> => {
      return safeRequest<Quotation[]>(
        '/customer/quotations',
        {},
        () => mockFallback.getCustomerQuotations()
      );
    },

    requestQuotation: async (data: {
      planName?: string;
      notes: string;
      estimatedAmount?: number;
      items?: any[];
    }): Promise<Quotation> => {
      return safeRequest<Quotation>(
        '/customer/quotations/request',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.createQuotationRequest(data)
      );
    },
  },

  products: {
    getAll: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString();
      return safeRequest<Product[]>(
        `/products${qs ? `?${qs}` : ''}`,
        {},
        () => mockFallback.getProducts(params)
      );
    },

    getById: async (id: string): Promise<Product> => {
      return safeRequest<Product>(
        `/products/${id}`,
        {},
        () => mockFallback.getProductById(id)
      );
    },

    create: async (productData: Partial<Product>): Promise<Product> => {
      return safeRequest<Product>(
        '/products',
        {
          method: 'POST',
          body: JSON.stringify(productData),
        },
        () => mockFallback.createProduct(productData)
      );
    },

    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      return safeRequest<Product>(
        `/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        () => mockFallback.updateProduct(id, updates)
      );
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return safeRequest<{ success: boolean }>(
        `/products/${id}`,
        {
          method: 'DELETE',
        },
        () => mockFallback.deleteProduct(id)
      );
    },

    // Variants
    addVariant: async (productId: string, variantData: Partial<ProductVariant> | { name: string; priceAdjustment: number }): Promise<ProductVariant> => {
      return safeRequest<ProductVariant>(
        `/products/${productId}/variants`,
        {
          method: 'POST',
          body: JSON.stringify(variantData),
        },
        () => mockFallback.addVariant(productId, {
          name: variantData.name || 'Standard Variant',
          priceAdjustment: variantData.priceAdjustment || 0,
        })
      );
    },

    updateVariant: async (variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant> => {
      return safeRequest<ProductVariant>(
        `/products/variants/${variantId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        () => mockFallback.updateVariant(variantId, updates)
      );
    },

    deleteVariant: async (productIdOrVariantId: string, maybeVariantId?: string): Promise<{ success: boolean }> => {
      const variantId = maybeVariantId || productIdOrVariantId;
      return safeRequest<{ success: boolean }>(
        `/products/variants/${variantId}`,
        {
          method: 'DELETE',
        },
        () => mockFallback.deleteVariant(productIdOrVariantId, maybeVariantId)
      );
    },

    // Plans
    getPlans: async (): Promise<Plan[]> => {
      return safeRequest<Plan[]>(
        '/products/plans',
        {},
        () => mockFallback.getPlans()
      );
    },

    getPlansForProduct: async (productId: string): Promise<Plan[]> => {
      return safeRequest<Plan[]>(
        `/products/${productId}/plans`,
        {},
        () => mockFallback.getPlansForProduct(productId)
      );
    },

    createPlan: async (planData: Partial<Plan>): Promise<Plan> => {
      return safeRequest<Plan>(
        '/products/plans',
        {
          method: 'POST',
          body: JSON.stringify(planData),
        },
        () => mockFallback.createPlan(planData)
      );
    },

    updatePlan: async (id: string, updates: Partial<Plan>): Promise<Plan> => {
      return safeRequest<Plan>(
        `/products/plans/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        () => mockFallback.updatePlan(id, updates)
      );
    },

    deletePlan: async (id: string): Promise<{ success: boolean }> => {
      return safeRequest<{ success: boolean }>(
        `/products/plans/${id}`,
        {
          method: 'DELETE',
        },
        () => mockFallback.deletePlan(id)
      );
    },

    // Discounts
    getDiscounts: async (): Promise<DiscountRule[]> => {
      return safeRequest<DiscountRule[]>(
        '/products/discounts',
        {},
        () => mockFallback.getDiscounts()
      );
    },

    createDiscount: async (discountData: Partial<DiscountRule>): Promise<DiscountRule> => {
      return safeRequest<DiscountRule>(
        '/products/discounts',
        {
          method: 'POST',
          body: JSON.stringify(discountData),
        },
        () => mockFallback.createDiscount(discountData)
      );
    },

    updateDiscount: async (id: string, updates: Partial<DiscountRule>): Promise<DiscountRule> => {
      return safeRequest<DiscountRule>(
        `/products/discounts/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        () => mockFallback.updateDiscount(id, updates)
      );
    },

    deleteDiscount: async (id: string): Promise<{ success: boolean }> => {
      return safeRequest<{ success: boolean }>(
        `/products/discounts/${id}`,
        {
          method: 'DELETE',
        },
        () => mockFallback.deleteDiscount(id)
      );
    },

    validateDiscount: async (code: string, amount: number, planId?: string): Promise<DiscountValidationResult> => {
      return safeRequest<DiscountValidationResult>(
        '/products/discounts/validate',
        {
          method: 'POST',
          body: JSON.stringify({ code, amount, planId }),
        },
        () => mockFallback.validateDiscount(code, amount)
      );
    },
  },

  subscriptions: {
    getAll: async (): Promise<CustomerSubscription[]> => {
      return safeRequest<CustomerSubscription[]>(
        '/subscriptions/all',
        {},
        () => mockFallback.getAllSubscriptions()
      );
    },

    getById: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/subscriptions/${id}`);
    },

    updateStatus: async (id: string, status: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/subscriptions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    pause: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/subscriptions/${id}/pause`, {
        method: 'POST',
      });
    },

    resume: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/subscriptions/${id}/resume`, {
        method: 'POST',
      });
    },

    close: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(`/subscriptions/${id}/close`, {
        method: 'POST',
      });
    },

    getCustomers: async (): Promise<User[]> => {
      return safeRequest<User[]>('/subscriptions/customers');
    },

    getQuotations: async (customerId?: string): Promise<Quotation[]> => {
      return safeRequest<Quotation[]>(
        `/subscriptions/quotations${customerId ? `?customerId=${customerId}` : ''}`,
        {},
        () => mockFallback.getQuotations(customerId)
      );
    },

    requestQuotation: async (data: {
      planName?: string;
      notes: string;
      estimatedAmount?: number;
      items?: any[];
    }): Promise<Quotation> => {
      return safeRequest<Quotation>(
        '/subscriptions/quotations/request',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.createQuotationRequest(data)
      );
    },

    prepareQuotation: async (data: {
      customerId: string;
      planName: string;
      totalAmount: number;
      notes?: string;
      validDays?: number;
      items?: any[];
    }): Promise<Quotation> => {
      return safeRequest<Quotation>(
        '/subscriptions/quotations',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.prepareStaffQuotation(data)
      );
    },

    updateQuotationStatus: async (
      id: string,
      status: QuotationStatus
    ): Promise<Quotation> => {
      return safeRequest<Quotation>(
        `/subscriptions/quotations/${id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status }),
        },
        () => mockFallback.updateQuotationStatus(id, status)
      );
    },
  },

  quotations: {
    getAll: async (status?: string): Promise<Quotation[]> => {
      const query = status && status !== 'ALL' ? `?status=${status}` : '';
      return safeRequest<Quotation[]>(`/subscriptions/quotations${query}`);
    },

    getById: async (id: string): Promise<Quotation> => {
      return safeRequest<Quotation>(`/subscriptions/quotations/${id}`);
    },

    create: async (data: {
      customerId: string;
      planId?: string;
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
    }): Promise<Quotation> => {
      return safeRequest<Quotation>('/subscriptions/quotations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, updates: Partial<Quotation>): Promise<Quotation> => {
      return safeRequest<Quotation>(`/subscriptions/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    confirm: async (id: string): Promise<Quotation> => {
      return safeRequest<Quotation>(`/subscriptions/quotations/${id}/confirm`, {
        method: 'POST',
      });
    },

    convert: async (id: string): Promise<{ quotation: Quotation; subscription: CustomerSubscription }> => {
      return safeRequest<{ quotation: Quotation; subscription: CustomerSubscription }>(
        `/subscriptions/quotations/${id}/convert`,
        {
          method: 'POST',
        }
      );
    },
  },

  billing: {
    getAnalytics: async (): Promise<BillingAnalytics> => {
      return safeRequest<BillingAnalytics>('/billing/analytics');
    },

    getInvoices: async (params?: {
      status?: string;
      customerId?: string;
      search?: string;
    }): Promise<CustomerInvoice[]> => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.customerId) query.append('customerId', params.customerId);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString();
      return safeRequest<CustomerInvoice[]>(`/billing/invoices${qs ? `?${qs}` : ''}`);
    },

    getInvoiceById: async (
      id: string
    ): Promise<CustomerInvoice & { customer?: User; payments: CustomerPayment[] }> => {
      return safeRequest<CustomerInvoice & { customer?: User; payments: CustomerPayment[] }>(
        `/billing/invoices/${id}`
      );
    },

    generateInvoice: async (data: {
      subscriptionId: string;
      dueDate?: string;
      notes?: string;
      discountPercent?: number;
      status?: InvoiceStatus;
    }): Promise<CustomerInvoice> => {
      return safeRequest<CustomerInvoice>('/billing/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    createInvoice: async (data: {
      customerId: string;
      subscriptionId?: string;
      dueDate?: string;
      notes?: string;
      lines: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
      }>;
      discountAmount?: number;
      status?: InvoiceStatus;
    }): Promise<CustomerInvoice> => {
      return safeRequest<CustomerInvoice>('/billing/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateInvoiceStatus: async (
      id: string,
      status: InvoiceStatus
    ): Promise<CustomerInvoice> => {
      return safeRequest<CustomerInvoice>(`/billing/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },

    getPayments: async (params?: {
      invoiceId?: string;
      customerId?: string;
      paymentMethod?: string;
    }): Promise<CustomerPayment[]> => {
      const query = new URLSearchParams();
      if (params?.invoiceId) query.append('invoiceId', params.invoiceId);
      if (params?.customerId) query.append('customerId', params.customerId);
      if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
      const qs = query.toString();
      return safeRequest<CustomerPayment[]>(`/billing/payments${qs ? `?${qs}` : ''}`);
    },

    recordPayment: async (data: {
      invoiceId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      paymentDate?: string;
      referenceNote?: string;
    }): Promise<{
      payment: CustomerPayment;
      invoice: CustomerInvoice;
      remainingBalance: number;
    }> => {
      return safeRequest<{
        payment: CustomerPayment;
        invoice: CustomerInvoice;
        remainingBalance: number;
      }>('/billing/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
