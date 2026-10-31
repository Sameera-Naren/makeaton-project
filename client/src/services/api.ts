import {
  CustomerDashboardSummary,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
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

    register: async (details: {
      name: string;
      email: string;
      password: string;
      companyName?: string;
      phone?: string;
      address?: string;
      role?: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      return data.data as { user: User; token: string };
    },

    getMe: async () => {
      return request<User>('/auth/me');
    },

    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Password reset request failed');
      return data;
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
};
