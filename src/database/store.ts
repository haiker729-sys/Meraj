import {
  Product,
  Order,
  Coupon,
  Banner,
  CartItem,
  OrderStatus,
  ShippingAddress,
  CustomerDetails,
  OrderItem,
  AdminUser,
  AdminRole
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_BANNERS } from './seed/productsData';
import { INITIAL_ORDERS } from './seed/ordersData';
import { apiClient, setAdminToken } from '../api/client';

const PRODUCTS_STORAGE_KEY = 'fashion_point_products_v1';
const ORDERS_STORAGE_KEY = 'fashion_point_orders_v1';
const CART_STORAGE_KEY = 'fashion_point_cart_v1';
const WISHLIST_STORAGE_KEY = 'fashion_point_wishlist_v1';
const COUPONS_STORAGE_KEY = 'fashion_point_coupons_v1';
const BANNERS_STORAGE_KEY = 'fashion_point_banners_v1';
const ADMINS_STORAGE_KEY = 'fashion_point_admins_v1';
const ADMIN_SESSION_STORAGE_KEY = 'fashion_point_admin_session_v1';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'ADM-101',
    username: 'admin',
    password: 'admin123',
    fullName: 'Meraj (Store Owner)',
    role: 'SUPER_ADMIN',
    phone: '+91 73523 19943',
    email: 'meraj7352319943@gmail.com',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-09-19T10:00:00.000Z'
  }
];

function normalizeOrder(o: any): Order {
  const totalAmount = o.totalAmount ?? o.pricing?.grandTotal ?? 0;
  const taxableAmount = Math.round((totalAmount / 1.05) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = cgst;

  const normalizedStatus = o.status || o.orderStatus || 'NEW';

  const normalizedItems = (o.items || []).map((item: any) => {
    const product = item.product || {
      id: item.productId,
      name: item.name,
      sku: item.sku,
      images: item.image ? [item.image] : ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
      price: item.price,
      mrp: item.mrp || item.price,
      discount: 0,
      sizes: [item.size || 'M'],
      colors: [{ name: item.colorName || 'Standard', hex: item.colorHex || '#111' }],
      stock: 20,
      rating: 4.8,
      reviewsCount: 15
    };

    return {
      ...item,
      product,
      selectedSize: item.selectedSize || item.size || 'M',
      selectedColor: item.selectedColor || {
        name: item.colorName || 'Default',
        hex: item.colorHex || '#111111'
      }
    };
  });

  return {
    ...o,
    orderStatus: normalizedStatus,
    status: normalizedStatus,
    totalAmount,
    pricing: o.pricing || {
      subtotal: totalAmount,
      deliveryCharge: 0,
      discount: 0,
      grandTotal: totalAmount
    },
    items: normalizedItems,
    trackingNumber: o.trackingNumber || o.awbNumber || `FP-DEL-${o.id.replace(/\D/g, '') || '9912'}`,
    awbNumber: o.awbNumber || o.trackingNumber || `FP-DEL-${o.id.replace(/\D/g, '') || '9912'}`,
    courierName: o.courierName || 'Delhivery Express',
    invoiceNumber: o.invoiceNumber || `INV-2026-${o.id.replace(/\D/g, '') || '101'}`,
    estimatedDelivery: o.estimatedDelivery || '2 - 4 Business Days',
    taxBreakdown: o.taxBreakdown || {
      taxableAmount,
      cgst,
      sgst,
      totalGst
    }
  };
}

class StoreDatabase {
  private products: Product[] = [];
  private orders: Order[] = [];
  private cart: CartItem[] = [];
  private wishlist: string[] = []; // product IDs
  private coupons: Coupon[] = [];
  private banners: Banner[] = [];
  private admins: AdminUser[] = [];
  private adminSession: AdminUser | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Load or initialize Products
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (savedProducts) {
      try {
        this.products = JSON.parse(savedProducts);
      } catch {
        this.products = [...INITIAL_PRODUCTS];
      }
    } else {
      this.products = [...INITIAL_PRODUCTS];
      this.persistProducts();
    }

    // Load or initialize Orders
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (savedOrders) {
      try {
        const raw = JSON.parse(savedOrders);
        this.orders = raw.map(normalizeOrder);
      } catch {
        this.orders = INITIAL_ORDERS.map(normalizeOrder);
      }
    } else {
      this.orders = INITIAL_ORDERS.map(normalizeOrder);
      this.persistOrders();
    }

    // Load or initialize Cart
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch {
        this.cart = [];
      }
    }

    // Load or initialize Wishlist
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (savedWishlist) {
      try {
        this.wishlist = JSON.parse(savedWishlist);
      } catch {
        this.wishlist = [];
      }
    }

    // Load or initialize Coupons
    const savedCoupons = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (savedCoupons) {
      try {
        this.coupons = JSON.parse(savedCoupons);
      } catch {
        this.coupons = [...INITIAL_COUPONS];
      }
    } else {
      this.coupons = [...INITIAL_COUPONS];
      this.persistCoupons();
    }

    // Load or initialize Banners
    const savedBanners = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (savedBanners) {
      try {
        this.banners = JSON.parse(savedBanners);
      } catch {
        this.banners = [...INITIAL_BANNERS];
      }
    } else {
      this.banners = [...INITIAL_BANNERS];
      this.persistBanners();
    }

    // Load or initialize Admins
    const savedAdmins = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (savedAdmins) {
      try {
        this.admins = JSON.parse(savedAdmins);
      } catch {
        this.admins = [...INITIAL_ADMINS];
      }
    } else {
      this.admins = [...INITIAL_ADMINS];
      this.persistAdmins();
    }

    // Load Admin Session
    const savedSession = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        this.adminSession = JSON.parse(savedSession);
      } catch {
        this.adminSession = null;
      }
    }
  }

  private persistProducts() {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistOrders() {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(this.orders));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistWishlist() {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.wishlist));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistCoupons() {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(this.coupons));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistBanners() {
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(this.banners));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistAdmins() {
    try {
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(this.admins));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private persistAdminSession() {
    try {
      if (this.adminSession) {
        sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(this.adminSession));
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(this.adminSession));
      } else {
        sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
        localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('SessionStorage error', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener notify error', e);
      }
    });
  }

  // --- Products API ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.sku === id);
  }

  public addProduct(productData: Omit<Product, 'id'>): Product {
    const newId = `fp-prod-${Date.now().toString().slice(-4)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    this.products = [newProduct, ...this.products];
    this.persistProducts();
    this.notify();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updates };
    this.persistProducts();
    this.notify();
    return this.products[idx];
  }

  public updateStock(productId: string, newStock: number): Product | null {
    return this.updateProduct(productId, { stock: Math.max(0, newStock) });
  }

  public deleteProduct(id: string): boolean {
    const cleanId = id.trim();
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== cleanId && p.sku !== cleanId);
    if (this.products.length !== initialLen) {
      // Also clean from cart and wishlist
      this.cart = this.cart.filter((c) => c.productId !== cleanId);
      this.wishlist = this.wishlist.filter((wId) => wId !== cleanId);
      this.persistProducts();
      this.persistCart();
      this.persistWishlist();
      this.notify();
      return true;
    }
    return false;
  }

  // --- Cart API ---
  public getCart(): CartItem[] {
    return [...this.cart];
  }

  public addToCart(item: CartItem) {
    const existingIndex = this.cart.findIndex(
      (c) =>
        c.productId === item.productId &&
        c.selectedSize === item.selectedSize &&
        c.selectedColor.name === item.selectedColor.name
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += item.quantity;
    } else {
      this.cart.push(item);
    }
    this.persistCart();
    this.notify();
  }

  public updateCartQuantity(index: number, quantity: number) {
    if (index >= 0 && index < this.cart.length) {
      if (quantity <= 0) {
        this.cart.splice(index, 1);
      } else {
        this.cart[index].quantity = quantity;
      }
      this.persistCart();
      this.notify();
    }
  }

  public removeFromCart(index: number) {
    if (index >= 0 && index < this.cart.length) {
      this.cart.splice(index, 1);
      this.persistCart();
      this.notify();
    }
  }

  public clearCart() {
    this.cart = [];
    this.persistCart();
    this.notify();
  }

  // --- Wishlist API ---
  public getWishlist(): string[] {
    return [...this.wishlist];
  }

  public toggleWishlist(productId: string): boolean {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist.push(productId);
    }
    this.persistWishlist();
    this.notify();
    return !exists;
  }

  public isInWishlist(productId: string): boolean {
    return this.wishlist.includes(productId);
  }

  // --- Orders API ---
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    const cleanId = id.trim().toUpperCase();
    return this.orders.find(
      (o) => o.id.toUpperCase() === cleanId || o.id.toUpperCase() === `FP-${cleanId}`
    );
  }

  public findOrderByTracking(orderId: string, mobileNumber?: string): Order | undefined {
    const cleanOrderId = orderId.trim().toUpperCase();
    const cleanMobile = mobileNumber ? mobileNumber.replace(/\D/g, '').slice(-10) : '';

    return this.orders.find((o) => {
      const matchId =
        o.id.toUpperCase() === cleanOrderId ||
        o.id.toUpperCase() === `FP-${cleanOrderId}` ||
        `FP-${o.id.toUpperCase()}` === cleanOrderId;
      const orderMobile = (o.customer.mobileNumber || '').replace(/\D/g, '').slice(-10);
      return matchId && (orderMobile === cleanMobile || !cleanMobile);
    });
  }

  public findOrder(orderId: string, mobileNumber?: string): Order | undefined {
    return this.findOrderByTracking(orderId, mobileNumber);
  }

  public createOrder(params: {
    customer: CustomerDetails;
    shippingAddress: ShippingAddress;
    items: CartItem[];
    paymentMethod: 'COD' | 'ONLINE';
    couponCode?: string;
    discount?: number;
  }): Order {
    const nextOrderNum = 10001 + this.orders.length;
    const orderId = `FP-${nextOrderNum}`;

    let subtotal = 0;
    const orderItems: OrderItem[] = params.items.map((item) => {
      subtotal += item.product.price * item.quantity;
      return {
        productId: item.productId,
        name: item.product.name,
        sku: item.product.sku,
        image: item.product.images[0] || '',
        size: item.selectedSize,
        colorName: item.selectedColor.name,
        colorHex: item.selectedColor.hex,
        price: item.product.price,
        mrp: item.product.mrp,
        quantity: item.quantity,
        product: item.product,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      };
    });

    const deliveryCharge = subtotal >= 999 ? 0 : 49;
    const discount = params.discount || 0;
    const grandTotal = Math.max(0, subtotal + deliveryCharge - discount);

    const now = new Date().toISOString();
    const rawOrder: any = {
      id: orderId,
      customer: params.customer,
      shippingAddress: params.shippingAddress,
      items: orderItems,
      pricing: {
        subtotal,
        deliveryCharge,
        discount,
        couponCode: params.couponCode,
        grandTotal
      },
      totalAmount: grandTotal,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
      orderStatus: 'NEW',
      status: 'Order Placed',
      createdAt: now,
      courierName: 'Delhivery Express',
      awbNumber: `DEL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      trackingNumber: `DEL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      invoiceNumber: `INV-2026-${nextOrderNum}`,
      timeline: [
        {
          status: 'NEW',
          timestamp: now,
          title: 'Order Placed',
          description: `Order ${orderId} received with ${
            params.paymentMethod === 'ONLINE' ? 'Instant Online Payment' : 'Cash on Delivery'
          }.`,
          location: 'Fashion Point Store'
        }
      ]
    };

    const newOrder = normalizeOrder(rawOrder);
    this.orders = [newOrder, ...this.orders];
    this.persistOrders();
    this.clearCart();
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string,
    note?: string
  ): Order | null {
    const cleanId = orderId.trim().toUpperCase();
    const idx = this.orders.findIndex(
      (o) =>
        o.id.toUpperCase() === cleanId ||
        o.id.toUpperCase() === `FP-${cleanId}` ||
        `FP-${o.id.toUpperCase()}` === cleanId
    );
    if (idx === -1) return null;

    const currentOrder = this.orders[idx];
    const now = new Date().toISOString();

    const titleMap: Record<string, string> = {
      NEW: 'Order Received',
      CONFIRMED: 'Order Confirmed',
      PACKED: 'Order Packed & Label Printed',
      SHIPPED: 'Order Dispatched with Courier',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Order Delivered Successfully',
      CANCELLED: 'Order Cancelled',
      'Order Placed': 'Order Placed',
      Confirmed: 'Order Confirmed',
      Packed: 'Order Packed & Label Printed',
      Shipped: 'Order Dispatched with Courier',
      'Out for Delivery': 'Out for Delivery',
      Delivered: 'Order Delivered Successfully',
      Cancelled: 'Order Cancelled'
    };

    const isCancelled =
      status.toUpperCase() === 'CANCELLED' || status.toLowerCase() === 'cancelled';
    const isDelivered =
      status.toUpperCase() === 'DELIVERED' || status.toLowerCase() === 'delivered';
    const isShipped =
      status.toUpperCase() === 'SHIPPED' || status.toLowerCase() === 'shipped';

    const normalizedDisplayStatus: OrderStatus = isCancelled
      ? 'Cancelled'
      : isDelivered
      ? 'Delivered'
      : isShipped
      ? 'Shipped'
      : status;

    const normalizedOrderStatus: OrderStatus = isCancelled
      ? 'CANCELLED'
      : isDelivered
      ? 'DELIVERED'
      : isShipped
      ? 'SHIPPED'
      : status;

    const newTimelineEvent = {
      status: normalizedDisplayStatus,
      timestamp: now,
      title: titleMap[status] || (isCancelled ? 'Order Cancelled' : String(status)),
      description: note || `Status updated to ${normalizedDisplayStatus} by store manager.`,
      location: 'Fashion Point Logistics Hub'
    };

    let updatedPaymentStatus = currentOrder.paymentStatus;
    if (isDelivered) {
      updatedPaymentStatus = 'PAID';
    } else if (isCancelled && currentOrder.paymentMethod === 'ONLINE') {
      updatedPaymentStatus = 'REFUNDED';
    }

    const updatedOrder: Order = normalizeOrder({
      ...currentOrder,
      orderStatus: normalizedOrderStatus,
      status: normalizedDisplayStatus,
      courierName: courierName || currentOrder.courierName,
      awbNumber: trackingNumber || currentOrder.awbNumber,
      trackingNumber: trackingNumber || currentOrder.trackingNumber,
      paymentStatus: updatedPaymentStatus,
      timeline: [...currentOrder.timeline, newTimelineEvent]
    });

    this.orders[idx] = updatedOrder;
    this.persistOrders();
    this.notify();
    return updatedOrder;
  }

  public cancelOrder(orderId: string, note?: string): Order | null {
    return this.updateOrderStatus(orderId, 'Cancelled', undefined, undefined, note || 'Cancelled by store admin');
  }

  // --- Dashboard KPI Stats ---
  public getStats() {
    const totalOrders = this.orders.length;
    const totalSales = this.orders.reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);

    // Real Today's Sales calculation based on calendar day (00:00:00 - 23:59:59)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
    const todaySales = this.orders
      .filter((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        return (
          orderTime >= startOfToday &&
          orderTime < endOfToday &&
          o.status !== 'Cancelled' &&
          o.status !== 'CANCELLED' &&
          o.orderStatus !== 'CANCELLED'
        );
      })
      .reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);

    const pendingOrders = this.orders.filter(
      (o) => o.status !== 'Delivered' && o.status !== 'DELIVERED' && o.status !== 'Cancelled' && o.status !== 'CANCELLED'
    ).length;
    const deliveredOrders = this.orders.filter((o) => o.status === 'Delivered' || o.status === 'DELIVERED').length;
    const lowStockCount = this.products.filter((p) => p.stock < 5).length;

    return {
      totalSales,
      todaySales,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      lowStockCount
    };
  }

  // --- Coupons API ---
  public getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  public applyCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const clean = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Min. order amount of ₹${coupon.minOrderAmount} required for coupon ${coupon.code}.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      discount,
      message: `Coupon ${coupon.code} applied! Saved ₹${discount}.`
    };
  }

  // --- Admin User & Session API ---
  public getAdmins(): AdminUser[] {
    return [...this.admins];
  }

  public getAdminById(id: string): AdminUser | null {
    return this.admins.find((a) => a.id === id) || null;
  }

  public addAdmin(data: {
    username: string;
    password: string;
    fullName: string;
    role: AdminRole;
    phone?: string;
    email?: string;
    isActive?: boolean;
  }): { success: boolean; message: string; admin?: AdminUser } {
    const trimmedUsername = data.username.trim().toLowerCase();
    if (!trimmedUsername) {
      return { success: false, message: 'Username is required.' };
    }
    if (trimmedUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (!data.password || data.password.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }
    if (!data.fullName.trim()) {
      return { success: false, message: 'Full name is required.' };
    }

    const exists = this.admins.some((a) => a.username.toLowerCase() === trimmedUsername);
    if (exists) {
      return { success: false, message: `Username "${data.username}" is already taken. Please choose another.` };
    }

    const newAdmin: AdminUser = {
      id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      username: trimmedUsername,
      password: data.password.trim(),
      fullName: data.fullName.trim(),
      role: data.role || 'STORE_MANAGER',
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString()
    };

    this.admins.push(newAdmin);
    this.persistAdmins();
    this.notify();
    return { success: true, message: `Admin account "${newAdmin.username}" created successfully!`, admin: newAdmin };
  }

  public updateAdmin(
    id: string,
    updates: Partial<Pick<AdminUser, 'password' | 'fullName' | 'role' | 'phone' | 'email' | 'isActive'>>
  ): { success: boolean; message: string } {
    const idx = this.admins.findIndex((a) => a.id === id);
    if (idx === -1) {
      return { success: false, message: 'Admin user not found.' };
    }

    this.admins[idx] = {
      ...this.admins[idx],
      ...updates
    };

    // If current session belongs to this admin, update session as well
    if (this.adminSession && this.adminSession.id === id) {
      this.adminSession = { ...this.admins[idx] };
      this.persistAdminSession();
    }

    this.persistAdmins();
    this.notify();
    return { success: true, message: 'Admin details updated successfully!' };
  }

  public deleteAdmin(id: string, currentSessionAdminId?: string): { success: boolean; message: string } {
    if (currentSessionAdminId && id === currentSessionAdminId) {
      return { success: false, message: 'You cannot delete your own logged-in admin account.' };
    }

    const targetAdmin = this.admins.find((a) => a.id === id);
    if (!targetAdmin) {
      return { success: false, message: 'Admin user not found.' };
    }

    // Ensure at least one SUPER_ADMIN remains
    const superAdmins = this.admins.filter((a) => a.role === 'SUPER_ADMIN' && a.isActive);
    if (targetAdmin.role === 'SUPER_ADMIN' && superAdmins.length <= 1) {
      return { success: false, message: 'Cannot delete the only active Super Admin account.' };
    }

    this.admins = this.admins.filter((a) => a.id !== id);
    this.persistAdmins();
    this.notify();
    return { success: true, message: `Admin "${targetAdmin.username}" has been removed.` };
  }

  public verifyAdminLogin(
    usernameInput: string,
    passwordInput: string
  ): { success: boolean; message: string; admin?: AdminUser } {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    const admin = this.admins.find((a) => a.username.toLowerCase() === cleanUser);
    if (!admin) {
      return { success: false, message: 'Invalid Admin username or password.' };
    }

    if (!admin.isActive) {
      return { success: false, message: 'This admin account has been deactivated. Please contact Super Admin.' };
    }

    // Match password securely
    const matchesPassword = admin.password === cleanPass;

    if (!matchesPassword) {
      return { success: false, message: 'Invalid Admin username or password.' };
    }

    // Update lastLoginAt
    admin.lastLoginAt = new Date().toISOString();
    this.persistAdmins();

    this.adminSession = admin;
    this.persistAdminSession();
    this.notify();

    return {
      success: true,
      message: `Welcome back, ${admin.fullName}!`,
      admin
    };
  }

  public async verifyAdminLoginAsync(
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; message: string; admin?: AdminUser }> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    try {
      const res = await apiClient.adminAuth.login(cleanUser, cleanPass);
      if (res.success && res.token) {
        setAdminToken(res.token);
        const adminObj: AdminUser = {
          id: res.admin.id,
          username: res.admin.username,
          fullName: res.admin.fullName,
          role: res.admin.role,
          phone: res.admin.phone,
          email: res.admin.email,
          isActive: res.admin.isActive !== false,
          createdAt: res.admin.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        this.adminSession = adminObj;
        this.persistAdminSession();
        this.notify();
        return { success: true, message: `Welcome back, ${adminObj.fullName}!`, admin: adminObj };
      }
      return { success: false, message: 'Invalid Admin credentials.' };
    } catch (err: any) {
      // Fallback to local admin verification if offline
      return this.verifyAdminLogin(usernameInput, passwordInput);
    }
  }

  public getAdminSession(): AdminUser | null {
    if (this.adminSession) return this.adminSession;
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const existing = this.admins.find((a) => a.id === parsed.id && a.isActive);
        if (existing) {
          this.adminSession = existing;
          return existing;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  public setAdminSession(admin: AdminUser | null): void {
    this.adminSession = admin;
    this.persistAdminSession();
    this.notify();
  }

  public logoutAdmin(): void {
    this.adminSession = null;
    this.persistAdminSession();
    this.notify();
  }
}

export const storeDb = new StoreDatabase();
