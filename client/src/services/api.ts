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
        async () => {
          const res = await mockFallback.register({ ...staffData, role: 'STAFF' });
          return res.user;
        }
      );
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

    getSubscriptions: async (): Promise<CustomerSubscription[]> => {
      return safeRequest<CustomerSubscription[]>(
        '/customer/subscriptions',
        {},
        () => mockFallback.getSubscriptions()
      );
    },

    getSubscriptionById: async (id: string): Promise<CustomerSubscription> => {
      return safeRequest<CustomerSubscription>(
        `/customer/subscriptions/${id}`,
        {},
        async () => {
          const subs = await mockFallback.getSubscriptions();
          const s = subs.find((x) => x.id === id);
          if (!s) throw new Error('Subscription not found');
          return s;
        }
      );
    },

    getInvoices: async (): Promise<CustomerInvoice[]> => {
      return safeRequest<CustomerInvoice[]>(
        '/customer/invoices',
        {},
        () => mockFallback.getInvoices()
      );
    },

    getInvoiceById: async (id: string): Promise<CustomerInvoice> => {
      return safeRequest<CustomerInvoice>(
        `/customer/invoices/${id}`,
        {},
        async () => {
          const invs = await mockFallback.getInvoices();
          const i = invs.find((x) => x.id === id);
          if (!i) throw new Error('Invoice not found');
          return i;
        }
      );
    },

    getPayments: async (): Promise<CustomerPayment[]> => {
      return safeRequest<CustomerPayment[]>(
        '/customer/payments',
        {},
        () => mockFallback.getPayments()
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
      return safeRequest<User>('/customer/profile', {}, () => mockFallback.getMe());
    },

    updateProfile: async (updates: Partial<User>): Promise<User> => {
      return safeRequest<User>(
        '/customer/profile',
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        async () => {
          const u = await mockFallback.getMe();
          Object.assign(u, updates);
          localStorage.setItem('brightloop_current_user', JSON.stringify(u));
          return u;
        }
      );
    },
  },

  products: {
    getAll: async (params?: { search?: string; type?: string; activeOnly?: boolean }): Promise<Product[]> => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.type && params.type !== 'ALL') query.append('type', params.type);
      if (params?.activeOnly) query.append('activeOnly', 'true');
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
        async () => {
          const prods = await mockFallback.getProducts();
          const p = prods.find((x) => x.id === id);
          if (!p) throw new Error('Product not found');
          return p;
        }
      );
    },

    create: async (data: Partial<Product>): Promise<Product> => {
      return safeRequest<Product>(
        '/products',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.createProduct(data)
      );
    },

    update: async (id: string, data: Partial<Product>): Promise<Product> => {
      return safeRequest<Product>(
        `/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        () => mockFallback.updateProduct(id, data)
      );
    },

    delete: async (id: string): Promise<void> => {
      return safeRequest<void>(
        `/products/${id}`,
        { method: 'DELETE' },
        () => mockFallback.deleteProduct(id)
      );
    },

    addVariant: async (productId: string, data: { name: string; priceAdjustment: number }): Promise<ProductVariant> => {
      return safeRequest<ProductVariant>(
        `/products/${productId}/variants`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.addVariant(productId, data)
      );
    },

    updateVariant: async (
      productId: string,
      variantId: string,
      data: { name?: string; priceAdjustment?: number }
    ): Promise<ProductVariant> => {
      return safeRequest<ProductVariant>(
        `/products/${productId}/variants/${variantId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        async () => {
          const prods = await mockFallback.getProducts();
          const p = prods.find((x) => x.id === productId);
          if (!p) throw new Error('Product not found');
          const v = p.variants.find((x) => x.id === variantId);
          if (!v) throw new Error('Variant not found');
          Object.assign(v, data);
          localStorage.setItem('brightloop_local_products', JSON.stringify(prods));
          return v;
        }
      );
    },

    deleteVariant: async (productId: string, variantId: string): Promise<void> => {
      return safeRequest<void>(
        `/products/${productId}/variants/${variantId}`,
        { method: 'DELETE' },
        () => mockFallback.deleteVariant(productId, variantId)
      );
    },

    // Plans
    getPlans: async (params?: { frequency?: string; activeOnly?: boolean }): Promise<Plan[]> => {
      const query = new URLSearchParams();
      if (params?.frequency && params.frequency !== 'ALL') query.append('frequency', params.frequency);
      if (params?.activeOnly) query.append('activeOnly', 'true');
      const qs = query.toString();
      return safeRequest<Plan[]>(
        `/products/plans${qs ? `?${qs}` : ''}`,
        {},
        () => mockFallback.getPlans(params)
      );
    },

    getPlanById: async (id: string): Promise<Plan> => {
      return safeRequest<Plan>(
        `/products/plans/${id}`,
        {},
        async () => {
          const plans = await mockFallback.getPlans();
          const pl = plans.find((x) => x.id === id);
          if (!pl) throw new Error('Plan not found');
          return pl;
        }
      );
    },

    createPlan: async (data: Partial<Plan>): Promise<Plan> => {
      return safeRequest<Plan>(
        '/products/plans',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.createPlan(data)
      );
    },

    updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
      return safeRequest<Plan>(
        `/products/plans/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        () => mockFallback.updatePlan(id, data)
      );
    },

    deletePlan: async (id: string): Promise<void> => {
      return safeRequest<void>(
        `/products/plans/${id}`,
        { method: 'DELETE' },
        () => mockFallback.deletePlan(id)
      );
    },

    // Discounts
    getDiscounts: async (activeOnly?: boolean): Promise<DiscountRule[]> => {
      return safeRequest<DiscountRule[]>(
        `/products/discounts${activeOnly ? '?activeOnly=true' : ''}`,
        {},
        () => mockFallback.getDiscounts()
      );
    },

    validateDiscount: async (code: string, amount: number): Promise<DiscountValidationResult> => {
      return safeRequest<DiscountValidationResult>(
        `/products/discounts/validate/${encodeURIComponent(code)}?amount=${amount}`,
        {},
        () => mockFallback.validateDiscount(code, amount)
      );
    },

    createDiscount: async (data: Partial<DiscountRule>): Promise<DiscountRule> => {
      return safeRequest<DiscountRule>(
        '/products/discounts',
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
        () => mockFallback.createDiscount(data)
      );
    },

    updateDiscount: async (id: string, data: Partial<DiscountRule>): Promise<DiscountRule> => {
      return safeRequest<DiscountRule>(
        `/products/discounts/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
        async () => {
          const discounts = await mockFallback.getDiscounts();
          const d = discounts.find((x) => x.id === id);
          if (!d) throw new Error('Discount not found');
          Object.assign(d, data);
          localStorage.setItem('brightloop_local_discounts', JSON.stringify(discounts));
          return d;
        }
      );
    },

    deleteDiscount: async (id: string): Promise<void> => {
      return safeRequest<void>(
        `/products/discounts/${id}`,
        { method: 'DELETE' },
        () => mockFallback.deleteDiscount(id)
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
};
