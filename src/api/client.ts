const API_BASE = '/api';

const CUSTOMER_TOKEN_KEY = 'fashion_point_customer_jwt';
const ADMIN_TOKEN_KEY = 'fashion_point_admin_jwt';

export function getCustomerToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(CUSTOMER_TOKEN_KEY) : null;
}

export function setCustomerToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  }
}

export function getAdminToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
}

export function setAdminToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, isAdmin = false): Promise<T> {
  const token = isAdmin ? getAdminToken() : getCustomerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const apiClient = {
  auth: {
    login: (identifier: string, password: string) =>
      request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
    register: (payload: { fullName: string; mobile: string; email?: string; password?: string }) =>
      request<{ success: boolean; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    requestOtp: (mobile: string) =>
      request<{ success: boolean; message: string; providerConfigured: boolean; expiresInSeconds: number }>(
        '/auth/request-otp',
        {
          method: 'POST',
          body: JSON.stringify({ mobile })
        }
      ),
    verifyOtp: (mobile: string, otp: string, fullName?: string) =>
      request<{ success: boolean; token: string; user: any }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile, otp, fullName })
      }),
    getMe: () => request<{ success: boolean; user: any }>('/auth/me')
  },

  adminAuth: {
    login: (username: string, password: string) =>
      request<{ success: boolean; token: string; admin: any }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }),
    getMe: () => request<{ success: boolean; admin: any }>('/admin/auth/me', {}, true),
    list: () => request<{ success: boolean; admins: any[] }>('/admin/auth/list', {}, true),
    create: (data: any) =>
      request<{ success: boolean; admin: any }>('/admin/auth/create', {
        method: 'POST',
        body: JSON.stringify(data)
      }, true),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/admin/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      }, true)
  },

  products: {
    list: (params?: Record<string, any>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            searchParams.append(k, String(v));
          }
        });
      }
      return request<{ success: boolean; products: any[]; total: number }>(
        `/products?${searchParams.toString()}`
      );
    },
    getById: (id: string) => request<{ success: boolean; product: any }>(`/products/${id}`),
    categories: () => request<{ success: boolean; categories: any[] }>('/products/categories'),
    create: (data: any) =>
      request<{ success: boolean; product: any }>('/products', {
        method: 'POST',
        body: JSON.stringify(data)
      }, true),
    update: (id: string, data: any) =>
      request<{ success: boolean; product: any }>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }, true),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/products/${id}`, {
        method: 'DELETE'
      }, true),
    updateStock: (id: string, stock: number) =>
      request<{ success: boolean; product: any }>(`/products/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
      }, true)
  },

  orders: {
    create: (orderPayload: any) =>
      request<{ success: boolean; order: any; message: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      }),
    track: (query: string, mobile?: string) => {
      const qs = mobile ? `?mobile=${encodeURIComponent(mobile)}` : '';
      return request<{ success: boolean; order: any }>(`/orders/track/${encodeURIComponent(query)}${qs}`);
    },
    myOrders: () => request<{ success: boolean; orders: any[]; total: number }>('/orders/my-orders'),
    list: (params?: Record<string, any>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) searchParams.append(k, String(v));
        });
      }
      return request<{ success: boolean; orders: any[]; total: number }>(
        `/orders?${searchParams.toString()}`,
        {},
        true
      );
    },
    getById: (id: string) => request<{ success: boolean; order: any }>(`/orders/${id}`),
    updateStatus: (id: string, updateData: any) =>
      request<{ success: boolean; order: any }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      }, true)
  },

  payments: {
    getConfig: () => request<{ success: boolean; config: { isConfigured: boolean; keyId: string | null; currency: string } }>('/payments/config'),
    createOrder: (orderId: string) =>
      request<{ success: boolean; gatewayOrderId: string; amount: number; currency: string; keyId: string }>('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ orderId })
      }),
    verify: (data: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      request<{ success: boolean; order: any; message: string }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  coupons: {
    validate: (code: string, subtotal: number) =>
      request<{ success: boolean; valid: boolean; discount: number; message: string; coupon?: any }>(
        '/coupons/validate',
        {
          method: 'POST',
          body: JSON.stringify({ code, subtotal })
        }
      ),
    list: () => request<{ success: boolean; coupons: any[] }>('/coupons')
  },

  admin: {
    getStats: () => request<{ success: boolean; stats: any }>('/admin/stats', {}, true),
    getInventory: () => request<{ success: boolean; inventory: any }>('/admin/inventory', {}, true),
    getSettings: () => request<{ success: boolean; settings: any }>('/admin/settings', {}, true),
    updateSettings: (data: any) =>
      request<{ success: boolean; settings: any }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      }, true)
  }
};
