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
  User,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('brightloop_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.error || json.message || 'Request failed');
  }

  return json.data as T;
}

// Auth API Calls
export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
      return data.data as { user: User; token: string };
    },

    register: async (userData: {
      name: string;
      email: string;
      password: string;
      companyName?: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      return data.data as { user: User; token: string };
    },

    getMe: async (): Promise<User> => {
      return request<User>('/auth/me');
    },

    forgotPassword: async (email: string): Promise<string> => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Password reset failed');
      return data.message || 'Reset link sent';
    },

    addStaff: async (staffData: {
      name: string;
      email: string;
      password: string;
      companyName?: string;
    }): Promise<User> => {
      return request<User>('/auth/add-staff', {
        method: 'POST',
        body: JSON.stringify(staffData),
      });
    },
  },

  customer: {
    getDashboard: async (): Promise<CustomerDashboardSummary> => {
      return request<CustomerDashboardSummary>('/customer/dashboard');
    },

    getSubscriptions: async (): Promise<CustomerSubscription[]> => {
      return request<CustomerSubscription[]>('/customer/subscriptions');
    },

    getSubscriptionById: async (id: string): Promise<CustomerSubscription> => {
      return request<CustomerSubscription>(`/customer/subscriptions/${id}`);
    },

    getInvoices: async (): Promise<CustomerInvoice[]> => {
      return request<CustomerInvoice[]>('/customer/invoices');
    },

    getInvoiceById: async (id: string): Promise<CustomerInvoice> => {
      return request<CustomerInvoice>(`/customer/invoices/${id}`);
    },

    getPayments: async (): Promise<CustomerPayment[]> => {
      return request<CustomerPayment[]>('/customer/payments');
    },

    payInvoice: async (data: {
      invoiceId: string;
      paymentMethod: string;
      note?: string;
    }): Promise<{ payment: CustomerPayment; invoice: CustomerInvoice }> => {
      return request<{ payment: CustomerPayment; invoice: CustomerInvoice }>(
        '/customer/pay-invoice',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    getProfile: async (): Promise<User> => {
      return request<User>('/customer/profile');
    },

    updateProfile: async (updates: Partial<User>): Promise<User> => {
      return request<User>('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
  },

  products: {
    getAll: async (params?: { search?: string; type?: string; activeOnly?: boolean }): Promise<Product[]> => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.type && params.type !== 'ALL') query.append('type', params.type);
      if (params?.activeOnly) query.append('activeOnly', 'true');
      const qs = query.toString();
      return request<Product[]>(`/products${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: string): Promise<Product> => {
      return request<Product>(`/products/${id}`);
    },

    create: async (data: Partial<Product>): Promise<Product> => {
      return request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: Partial<Product>): Promise<Product> => {
      return request<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<void> => {
      return request<void>(`/products/${id}`, { method: 'DELETE' });
    },

    addVariant: async (productId: string, data: { name: string; priceAdjustment: number }): Promise<ProductVariant> => {
      return request<ProductVariant>(`/products/${productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateVariant: async (
      productId: string,
      variantId: string,
      data: { name?: string; priceAdjustment?: number }
    ): Promise<ProductVariant> => {
      return request<ProductVariant>(`/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteVariant: async (productId: string, variantId: string): Promise<void> => {
      return request<void>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
    },

    // Plans
    getPlans: async (params?: { frequency?: string; activeOnly?: boolean }): Promise<Plan[]> => {
      const query = new URLSearchParams();
      if (params?.frequency && params.frequency !== 'ALL') query.append('frequency', params.frequency);
      if (params?.activeOnly) query.append('activeOnly', 'true');
      const qs = query.toString();
      return request<Plan[]>(`/products/plans${qs ? `?${qs}` : ''}`);
    },

    getPlanById: async (id: string): Promise<Plan> => {
      return request<Plan>(`/products/plans/${id}`);
    },

    createPlan: async (data: Partial<Plan>): Promise<Plan> => {
      return request<Plan>('/products/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
      return request<Plan>(`/products/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deletePlan: async (id: string): Promise<void> => {
      return request<void>(`/products/plans/${id}`, { method: 'DELETE' });
    },

    // Discounts
    getDiscounts: async (activeOnly?: boolean): Promise<DiscountRule[]> => {
      return request<DiscountRule[]>(`/products/discounts${activeOnly ? '?activeOnly=true' : ''}`);
    },

    validateDiscount: async (code: string, amount: number): Promise<DiscountValidationResult> => {
      return request<DiscountValidationResult>(
        `/products/discounts/validate/${encodeURIComponent(code)}?amount=${amount}`
      );
    },

    createDiscount: async (data: Partial<DiscountRule>): Promise<DiscountRule> => {
      return request<DiscountRule>('/products/discounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateDiscount: async (id: string, data: Partial<DiscountRule>): Promise<DiscountRule> => {
      return request<DiscountRule>(`/products/discounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteDiscount: async (id: string): Promise<void> => {
      return request<void>(`/products/discounts/${id}`, { method: 'DELETE' });
    },
  },
};
