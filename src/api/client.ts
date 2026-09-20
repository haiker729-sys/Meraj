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
    if (response.status === 401 && token) {
      if (isAdmin) {
        setAdminToken(null);
      } else {
        setCustomerToken(null);
      }
    }
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
      const res = await request<{ success: boolean; token: string; user: any; message?: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile, otp, fullName })
      });
      if (res?.token) {
        setCustomerToken(res.token);
      }
      return res;
    },
    forgotPasswordRequestOtp: (identifier: string) =>
      request<{ success: boolean; message: string; expiresInSeconds: number; identifier?: string }>(
        '/auth/forgot-password/request-otp',
        {
          method: 'POST',
          body: JSON.stringify({ identifier })
        }
      ),
    forgotPasswordReset: (payload: { identifier: string; otp: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getDevSandboxOtp: async (mobile: string, type: 'otp' | 'forgot' = 'otp') => {
      try {
        return await request<{ success: boolean; simulatedCode?: string; message?: string }>(
          `/auth/dev-sandbox-otp?mobile=${encodeURIComponent(mobile)}&type=${type}`
        );
      } catch {
        return { success: false };
      }
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
    getProfile: async () => {
      if (!getCustomerToken()) {
        return { success: false, profile: null };
      }
      return request<{ success: boolean; profile: any }>('/customer/profile');
    },
    updateProfile: (data: { fullName: string; mobile: string; email?: string; dateOfBirth?: string; gender?: string }) =>
      request<{ success: boolean; profile: any; message: string }>('/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getAddresses: async () => {
      if (!getCustomerToken()) {
        return { success: true, addresses: [] };
      }
      return request<{ success: boolean; addresses: any[] }>('/customer/addresses');
    },
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
    getOrders: async () => {
      if (!getCustomerToken()) {
        return { success: true, orders: [], total: 0 };
      }
      return request<{ success: boolean; orders: any[]; total: number }>('/customer/orders');
    }
  },

  postal: {
    lookupPincode: async (
      pincode: string
    ): Promise<{
      success: boolean;
      found: boolean;
      pincode: string;
      district: string;
      state: string;
      city: string;
      postOffices: string[];
    }> => {
      const clean = pincode.replace(/\D/g, '').slice(0, 6);
      if (clean.length !== 6) {
        return {
          success: false,
          found: false,
          pincode: clean,
          district: '',
          state: '',
          city: '',
          postOffices: []
        };
      }

      // 1. Try server endpoint
      try {
        const res = await request<{
          success: boolean;
          found: boolean;
          pincode: string;
          district: string;
          state: string;
          city: string;
          postOffices: string[];
        }>(`/postal/pincode/${clean}`);

        if (res && res.found) {
          return res;
        }
      } catch {
        // Fall back to direct browser lookup
      }

      // 2. Direct browser fallback via CORS-friendly Zippopotam
      try {
        const directRes = await fetch(`https://api.zippopotam.us/in/${clean}`);
        if (directRes.ok) {
          const data = await directRes.json();
          if (data?.places && data.places.length > 0) {
            const place = data.places[0];
            const names = data.places.map((p: any) => p['place name']).filter(Boolean);
            return {
              success: true,
              found: true,
              pincode: clean,
              district: place['place name'] || '',
              state: place['state'] || '',
              city: place['place name'] || '',
              postOffices: Array.from(new Set(names))
            };
          }
        }
      } catch {
        // Fall back to prefix map
      }

      // 3. Deterministic Regional fallback map
      const stateMap: Record<string, { state: string; city: string; district: string }> = {
        '11': { state: 'Delhi', city: 'New Delhi', district: 'Central Delhi' },
        '12': { state: 'Haryana', city: 'Gurugram', district: 'Gurugram' },
        '13': { state: 'Haryana', city: 'Ambala', district: 'Ambala' },
        '14': { state: 'Punjab', city: 'Amritsar', district: 'Amritsar' },
        '15': { state: 'Punjab', city: 'Bathinda', district: 'Bathinda' },
        '16': { state: 'Chandigarh', city: 'Chandigarh', district: 'Chandigarh' },
        '17': { state: 'Himachal Pradesh', city: 'Shimla', district: 'Shimla' },
        '18': { state: 'Jammu & Kashmir', city: 'Jammu', district: 'Jammu' },
        '19': { state: 'Jammu & Kashmir', city: 'Srinagar', district: 'Srinagar' },
        '20': { state: 'Uttar Pradesh', city: 'Aligarh', district: 'Aligarh' },
        '21': { state: 'Uttar Pradesh', city: 'Prayagraj', district: 'Prayagraj' },
        '22': { state: 'Uttar Pradesh', city: 'Lucknow', district: 'Lucknow' },
        '23': { state: 'Uttar Pradesh', city: 'Ayodhya', district: 'Ayodhya' },
        '24': { state: 'Uttarakhand', city: 'Dehradun', district: 'Dehradun' },
        '25': { state: 'Uttar Pradesh', city: 'Meerut', district: 'Meerut' },
        '26': { state: 'Uttar Pradesh', city: 'Bareilly', district: 'Bareilly' },
        '27': { state: 'Uttar Pradesh', city: 'Gorakhpur', district: 'Gorakhpur' },
        '28': { state: 'Uttar Pradesh', city: 'Jhansi', district: 'Jhansi' },
        '30': { state: 'Rajasthan', city: 'Jaipur', district: 'Jaipur' },
        '31': { state: 'Rajasthan', city: 'Udaipur', district: 'Udaipur' },
        '32': { state: 'Rajasthan', city: 'Kota', district: 'Kota' },
        '33': { state: 'Rajasthan', city: 'Bikaner', district: 'Bikaner' },
        '34': { state: 'Rajasthan', city: 'Jodhpur', district: 'Jodhpur' },
        '36': { state: 'Gujarat', city: 'Rajkot', district: 'Rajkot' },
        '37': { state: 'Gujarat', city: 'Jamnagar', district: 'Jamnagar' },
        '38': { state: 'Gujarat', city: 'Ahmedabad', district: 'Ahmedabad' },
        '39': { state: 'Gujarat', city: 'Surat', district: 'Surat' },
        '40': { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai' },
        '41': { state: 'Maharashtra', city: 'Pune', district: 'Pune' },
        '42': { state: 'Maharashtra', city: 'Nashik', district: 'Nashik' },
        '43': { state: 'Maharashtra', city: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar' },
        '44': { state: 'Maharashtra', city: 'Nagpur', district: 'Nagpur' },
        '45': { state: 'Madhya Pradesh', city: 'Indore', district: 'Indore' },
        '46': { state: 'Madhya Pradesh', city: 'Bhopal', district: 'Bhopal' },
        '47': { state: 'Madhya Pradesh', city: 'Gwalior', district: 'Gwalior' },
        '48': { state: 'Madhya Pradesh', city: 'Jabalpur', district: 'Jabalpur' },
        '49': { state: 'Chhattisgarh', city: 'Raipur', district: 'Raipur' },
        '50': { state: 'Telangana', city: 'Hyderabad', district: 'Hyderabad' },
        '51': { state: 'Andhra Pradesh', city: 'Tirupati', district: 'Tirupati' },
        '52': { state: 'Andhra Pradesh', city: 'Vijayawada', district: 'Krishna' },
        '53': { state: 'Andhra Pradesh', city: 'Visakhapatnam', district: 'Visakhapatnam' },
        '56': { state: 'Karnataka', city: 'Bengaluru', district: 'Bengaluru' },
        '57': { state: 'Karnataka', city: 'Mangaluru', district: 'Dakshina Kannada' },
        '58': { state: 'Karnataka', city: 'Hubli', district: 'Dharwad' },
        '59': { state: 'Karnataka', city: 'Belagavi', district: 'Belagavi' },
        '60': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
        '61': { state: 'Tamil Nadu', city: 'Tiruchirappalli', district: 'Tiruchirappalli' },
        '62': { state: 'Tamil Nadu', city: 'Madurai', district: 'Madurai' },
        '63': { state: 'Tamil Nadu', city: 'Coimbatore', district: 'Coimbatore' },
        '64': { state: 'Tamil Nadu', city: 'Salem', district: 'Salem' },
        '67': { state: 'Kerala', city: 'Kozhikode', district: 'Kozhikode' },
        '68': { state: 'Kerala', city: 'Kochi', district: 'Ernakulam' },
        '69': { state: 'Kerala', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram' },
        '70': { state: 'West Bengal', city: 'Kolkata', district: 'Kolkata' },
        '71': { state: 'West Bengal', city: 'Howrah', district: 'Howrah' },
        '72': { state: 'West Bengal', city: 'Kharagpur', district: 'Paschim Medinipur' },
        '73': { state: 'West Bengal', city: 'Siliguri', district: 'Darjeeling' },
        '74': { state: 'West Bengal', city: 'Barasat', district: 'North 24 Parganas' },
        '75': { state: 'Odisha', city: 'Bhubaneswar', district: 'Khurda' },
        '76': { state: 'Odisha', city: 'Cuttack', district: 'Cuttack' },
        '77': { state: 'Odisha', city: 'Rourkela', district: 'Sundargarh' },
        '78': { state: 'Assam', city: 'Guwahati', district: 'Kamrup' },
        '79': { state: 'Meghalaya', city: 'Shillong', district: 'East Khasi Hills' },
        '80': { state: 'Bihar', city: 'Patna', district: 'Patna' },
        '81': { state: 'Bihar', city: 'Bhagalpur', district: 'Bhagalpur' },
        '82': { state: 'Bihar', city: 'Gaya', district: 'Gaya' },
        '83': { state: 'Jharkhand', city: 'Ranchi', district: 'Ranchi' },
        '84': { state: 'Bihar', city: 'Muzaffarpur', district: 'Muzaffarpur' },
        '85': { state: 'Bihar', city: 'Purnia', district: 'Purnia' }
      };

      const match = stateMap[clean.slice(0, 2)];
      if (match) {
        return {
          success: true,
          found: true,
          pincode: clean,
          district: match.district,
          state: match.state,
          city: match.city,
          postOffices: [match.city + ' S.O.']
        };
      }

      return {
        success: false,
        found: false,
        pincode: clean,
        district: '',
        state: '',
        city: '',
        postOffices: []
      };
    }
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
    myOrders: async () => {
      if (!getCustomerToken()) {
        return { success: true, orders: [], total: 0 };
      }
      return request<{ success: boolean; orders: any[]; total: number }>('/orders/my-orders');
    },
    list: async (params?: Record<string, any>) => {
      if (!getAdminToken()) {
        return { success: false, orders: [], total: 0 };
      }
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
      request<{
        success: boolean;
        order: any;
        trackingEvents: any[];
        currentStatus?: string;
        recommendedStage?: string;
        allowedStages?: string[];
        isDelivered?: boolean;
        isCancelled?: boolean;
      }>(
        `/admin/tracking/scan/${encodeURIComponent(token.trim())}`,
        {},
        true
      ),
    processJourneyScan: (payload: {
      scanInput: string;
      stage: string;
      location?: string;
      hubName?: string;
      targetStatus?: string;
      notes?: string;
      recipientName?: string;
      confirmationCode?: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        order: any;
        event: any;
        trackingEvents: any[];
      }>(
        '/admin/tracking/journey-scan',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      ),
    submitScan: (payload: {
      token: string;
      stage?: string;
      status?: string;
      location?: string;
      description?: string;
      courierName?: string;
      awbNumber?: string;
      recipientName?: string;
      hubName?: string;
    }) =>
      request<{ success: boolean; message: string; order?: any; event?: any; trackingEvents?: any[] }>(
        '/admin/tracking/scan',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        },
        true
      )
  }
};
