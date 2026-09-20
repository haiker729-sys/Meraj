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
    login: async (identifier: string, password: string) => {
      const res = await request<{ success: boolean; token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      if (res?.token) {
        setCustomerToken(res.token);
      }
      return res;
    },
    register: async (payload: { fullName: string; mobile: string; email?: string; password?: string }) => {
      const res = await request<{ success: boolean; token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res?.token) {
        setCustomerToken(res.token);
      }
      return res;
    },
    requestOtp: (mobile: string) =>
      request<{ success: boolean; message: string; providerConfigured: boolean; expiresInSeconds: number }>(
        '/auth/request-otp',
        {
          method: 'POST',
          body: JSON.stringify({ mobile })
        }
      ),
    verifyOtp: async (mobile: string, otp: string, fullName?: string) => {
      const res = await request<{ success: boolean; token: string; user: any }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile, otp, fullName })
      });
      if (res?.token) {
        setCustomerToken(res.token);
      }
      return res;
    },
    getMe: () => request<{ success: boolean; user: any }>('/auth/me'),
    logout: () => {
      setCustomerToken(null);
    }
  },

  adminAuth: {
    login: async (username: string, password: string) => {
      const res = await request<{ success: boolean; token: string; admin: any }>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (res?.token) {
        setAdminToken(res.token);
        if (typeof window !== 'undefined' && res.admin) {
          localStorage.setItem('fp_admin_session_v1', JSON.stringify(res.admin));
        }
      }
      return res;
    },
    logout: () => {
      setAdminToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fp_admin_session_v1');
      }
    },
    getStoredSession: () => {
      if (typeof window === 'undefined') return null;
      try {
        const str = localStorage.getItem('fp_admin_session_v1');
        return str ? JSON.parse(str) : null;
      } catch {
        return null;
      }
    },
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

  customer: {
    getProfile: () => request<{ success: boolean; profile: any }>('/customer/profile'),
    updateProfile: (data: { fullName: string; mobile: string; email?: string; dateOfBirth?: string; gender?: string }) =>
      request<{ success: boolean; profile: any; message: string }>('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getAddresses: () => request<{ success: boolean; addresses: any[] }>('/customer/addresses'),
    createAddress: (data: any) =>
      request<{ success: boolean; address: any; message: string }>('/customer/addresses', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateAddress: (id: string, data: any) =>
      request<{ success: boolean; address: any; message: string }>(`/customer/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteAddress: (id: string) =>
      request<{ success: boolean; message: string }>(`/customer/addresses/${id}`, {
        method: 'DELETE'
      }),
    setDefaultAddress: (id: string) =>
      request<{ success: boolean; message: string }>(`/customer/addresses/${id}/default`, {
        method: 'PATCH'
      }),
    getOrders: () => request<{ success: boolean; orders: any[]; total: number }>('/customer/orders')
  },

  postal: {
    lookupPincode: (pincode: string) =>
      request<{
        success: boolean;
        found: boolean;
        pincode: string;
        district: string;
        state: string;
        city: string;
        postOffices: string[];
      }>(`/postal/pincode/${pincode.trim()}`)
  },

  orders: {
    create: (orderPayload: any) =>
      request<{ success: boolean; order: any; message: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      }),
    track: (query: string, mobile?: string, scan = false) => {
      const params = new URLSearchParams();
      if (mobile) params.append('mobile', mobile);
      if (scan) params.append('scan', 'true');
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; order: any; trackingEvents?: any[] }>(
        `/orders/track/${encodeURIComponent(query.trim())}${qs}`
      );
    },
    getTracking: (id: string) =>
      request<{ success: boolean; order: any; trackingEvents: any[] }>(`/orders/${id}/tracking`),
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
    getIntegrationsStatus: () =>
      request<{
        success: boolean;
        launchTier: string;
        database: string;
        codAvailable: boolean;
        services: Record<string, string>;
      }>('/admin/integrations/status', {}, true),
    updateSettings: (data: any) =>
      request<{ success: boolean; settings: any }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      }, true),
    listAdmins: () => request<{ success: boolean; admins: any[] }>('/admin/users', {}, true),
    createAdmin: (data: any) =>
      request<{ success: boolean; admin: any }>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data)
      }, true),
    updateAdmin: (id: string, data: any) =>
      request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }, true),
    deleteAdmin: (id: string) =>
      request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
        method: 'DELETE'
      }, true),
    updateTracking: (orderId: string, payload: {
      status: string;
      location?: string;
      description: string;
      courierName?: string;
      awbNumber?: string;
    }) =>
      request<{ success: boolean; message: string; order: any; event: any }>(
        `/admin/orders/${orderId}/tracking`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      ),
    lookupScanToken: (token: string) =>
      request<{ success: boolean; order: any; trackingEvents: any[] }>(
        `/admin/tracking/scan/${encodeURIComponent(token.trim())}`,
        {},
        true
      ),
    submitScan: (payload: {
      token: string;
      status?: string;
      location?: string;
      description?: string;
      courierName?: string;
      awbNumber?: string;
    }) =>
      request<{ success: boolean; message: string; order?: any; event?: any }>(
        '/admin/tracking/scan',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      )
  }
};
