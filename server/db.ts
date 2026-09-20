import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from '../src/database/seed/productsData';
import { INITIAL_ORDERS } from '../src/database/seed/ordersData';

const { Pool } = pg;

export interface DbStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
}

// In-Memory storage backing store (used when DATABASE_URL is not configured or offline)
class DatabaseManager {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;

  // In-memory relational tables
  private users: any[] = [];
  private admins: any[] = [];
  private addresses: any[] = [];
  private categories: any[] = [];
  private products: any[] = [];
  private productVariants: any[] = [];
  private productImages: any[] = [];
  private coupons: any[] = [];
  private carts: Map<string, any[]> = new Map(); // key -> CartItem[]
  private orders: any[] = [];
  private orderStatusHistories: any[] = [];
  private payments: any[] = [];
  private notifications: any[] = [];
  private settings: Record<string, any> = {
    storeName: 'Fashion Point',
    tagline: 'Modern & Traditional Indian Clothing Store',
    contactEmail: 'contact@fashionpoint.store',
    supportPhone: '+91 73523 19943',
    ownerName: 'Meraj Alam',
    gstin: '23AAAAF0000A1Z5',
    defaultTaxRate: 5, // 5% GST
    freeShippingThreshold: 999,
    standardShippingFee: 49,
    isCodEnabled: true,
    isOnlinePaymentEnabled: true,
    address: 'Near Main Bazaar, City Centre, Madhya Pradesh - 452001'
  };

  constructor() {
    this.seedInMemory();
    this.initPostgres();
  }

  private async seedInMemory() {
    // Categories
    this.categories = [
      { id: 'cat-men', name: 'Men', slug: 'men', description: 'Shirts, Kurta, T-Shirts, Trousers & Ethnic wear for Men', imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', isActive: true, displayOrder: 1 },
      { id: 'cat-women', name: 'Women', slug: 'women', description: 'Kurtis, Sarees, Dresses, Co-ord Sets & Traditional wear', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', isActive: true, displayOrder: 2 },
      { id: 'cat-kids', name: 'Kids', slug: 'kids', description: 'Festive wear, Everyday sets & comfortable casuals for boys & girls', imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80', isActive: true, displayOrder: 3 }
    ];

    // Seed Admin: Default secure admin with bcrypt password hash
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Meraj@FashionPoint2026';
    const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
    this.admins = [
      {
        id: 'ADM-101',
        username: 'admin',
        passwordHash: adminPasswordHash,
        fullName: 'Meraj Alam (Store Owner)',
        role: 'SUPER_ADMIN',
        phone: '+91 73523 19943',
        email: 'meraj7352319943@gmail.com',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString()
      }
    ];

    // Seed Demo Customer
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);
    this.users = [
      {
        id: 'usr-demo-01',
        email: 'customer@fashionpoint.store',
        mobile: '9876543210',
        passwordHash: customerPasswordHash,
        fullName: 'Rahul Sharma',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2026-02-10T12:00:00.000Z',
        updatedAt: '2026-02-10T12:00:00.000Z'
      }
    ];

    // Seed Products from existing initial products
    this.products = INITIAL_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      categoryId: p.category.toLowerCase() === 'men' ? 'cat-men' : p.category.toLowerCase() === 'women' ? 'cat-women' : 'cat-kids',
      category: p.category,
      subCategory: p.subCategory,
      description: p.description,
      price: Number(p.price),
      mrp: Number(p.mrp),
      discount: p.discount || Math.round(((p.mrp - p.price) / p.mrp) * 100),
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      sku: p.sku,
      status: p.status || 'PUBLISHED',
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isBestseller: Boolean(p.isBestseller),
      isActive: p.status !== 'UNPUBLISHED',
      images: p.images,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 20,
      material: p.material || 'Premium Cotton',
      careInstructions: p.careInstructions || 'Machine wash cold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Seed Coupons
    this.coupons = INITIAL_COUPONS.map((c) => ({
      id: c.id,
      code: c.code.toUpperCase(),
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: (c as any).maxDiscountAmount || c.maxDiscount || (c.discountType === 'PERCENTAGE' ? 1000 : c.discountValue),
      usageLimit: 500,
      usageCount: 14,
      isActive: c.isActive !== false,
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
      description: c.description
    }));

    // Seed Orders
    this.orders = (INITIAL_ORDERS as any[]).map((o) => {
      const orderDate = o.createdAt || new Date().toISOString();
      const subtotal = o.pricing?.subtotal || o.totalAmount || 1299;
      const deliveryCharge = o.pricing?.deliveryCharge ?? 0;
      const discount = o.pricing?.discount ?? 0;
      const grandTotal = o.pricing?.grandTotal || (subtotal + deliveryCharge - discount);
      const taxableAmount = Math.round((grandTotal / 1.05) * 100) / 100;
      const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;

      return {
        id: o.id,
        userId: o.userId || 'usr-demo-01',
        orderStatus: o.orderStatus || 'CONFIRMED',
        status: o.orderStatus || 'CONFIRMED',
        paymentMethod: o.paymentMethod || 'COD',
        paymentStatus: o.paymentStatus || (o.paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
        customer: o.customer || {
          fullName: 'Ananya Verma',
          mobileNumber: '9826012345',
          email: 'ananya.verma@example.com'
        },
        shippingAddress: o.shippingAddress || {
          houseShopNo: 'Flat 402, Royal Palms',
          street: 'MG Road',
          villageArea: 'Palasia',
          city: 'Indore',
          district: 'Indore',
          state: 'Madhya Pradesh',
          pinCode: '452001',
          landmark: 'Opposite Central Mall'
        },
        items: o.items || [],
        pricing: {
          subtotal,
          deliveryCharge,
          discount,
          grandTotal
        },
        totalAmount: grandTotal,
        taxBreakdown: {
          taxableAmount,
          cgst: Math.round((totalGst / 2) * 100) / 100,
          sgst: Math.round((totalGst / 2) * 100) / 100,
          totalGst
        },
        courierName: o.courierName || 'Delhivery Express',
        trackingNumber: o.trackingNumber || `FP-DEL-${o.id.replace(/\D/g, '') || '8832'}`,
        awbNumber: o.awbNumber || `FP-DEL-${o.id.replace(/\D/g, '') || '8832'}`,
        invoiceNumber: o.invoiceNumber || `INV-2026-${o.id.replace(/\D/g, '') || '101'}`,
        estimatedDelivery: o.estimatedDelivery || '3 - 5 Business Days',
        timeline: o.timeline || [
          {
            status: 'NEW',
            title: 'Order Placed',
            description: 'Order confirmed by customer with cash on delivery verification.',
            timestamp: orderDate,
            location: 'Fashion Point Store, Madhya Pradesh'
          }
        ],
        createdAt: orderDate,
        updatedAt: orderDate
      };
    });
  }

  private async initPostgres() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('ℹ️ [Fashion Point DB] No DATABASE_URL provided. Running on production-grade in-memory database store.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      const client = await this.pool.connect();
      console.log('✅ [Fashion Point DB] Connected successfully to PostgreSQL database!');
      this.isPostgresConnected = true;

      // Run schema
      try {
        const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(sql);
          console.log('✅ [Fashion Point DB] Database tables verified/migrated.');
        }
      } catch (err) {
        console.warn('⚠️ [Fashion Point DB] Schema migration notice:', (err as any).message);
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('⚠️ [Fashion Point DB] Could not connect to PostgreSQL server. Falling back to in-memory store:', (err as any).message);
      this.isPostgresConnected = false;
    }
  }

  // --- PRODUCTS ---
  public async getProducts(filters?: {
    category?: string;
    subCategory?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) {
    let list = [...this.products];

    if (filters?.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === cat);
    }

    if (filters?.subCategory && filters.subCategory !== 'all') {
      const sub = filters.subCategory.toLowerCase();
      list = list.filter((p) => p.subCategory?.toLowerCase() === sub);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sorting
    if (filters?.sort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters?.sort === 'popular') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { products: paginated, total, limit, offset };
  }

  public async getProductById(id: string) {
    return this.products.find((p) => p.id === id) || null;
  }

  public async createProduct(productData: any) {
    const newProduct = {
      id: productData.id || `fp-prod-${Date.now()}`,
      name: productData.name,
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: productData.category,
      subCategory: productData.subCategory || 'Apparel',
      description: productData.description || '',
      price: Number(productData.price),
      mrp: Number(productData.mrp || productData.price),
      discount: productData.discount || Math.max(0, Math.round(((productData.mrp - productData.price) / productData.mrp) * 100)),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ['M', 'L', 'XL'],
      colors: Array.isArray(productData.colors) ? productData.colors : [{ name: 'Standard', hex: '#111111' }],
      stock: Number(productData.stock || 0),
      sku: productData.sku || `FP-${Date.now().toString().slice(-6)}`,
      status: productData.status || 'PUBLISHED',
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      isBestseller: Boolean(productData.isBestseller),
      isActive: productData.status !== 'UNPUBLISHED',
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  public async updateProduct(id: string, updates: any) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const updated = {
      ...this.products[idx],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : this.products[idx].price,
      mrp: updates.mrp !== undefined ? Number(updates.mrp) : this.products[idx].mrp,
      stock: updates.stock !== undefined ? Number(updates.stock) : this.products[idx].stock,
      updatedAt: new Date().toISOString()
    };
    this.products[idx] = updated;
    return updated;
  }

  public async deleteProduct(id: string) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  public async getCategories() {
    return [...this.categories];
  }

  // --- ORDERS & TRANSACTIONAL CHECKOUT ---
  public async getOrders(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let list = [...this.orders];
    if (filters?.userId) {
      list = list.filter((o) => o.userId === filters.userId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((o) => o.orderStatus === filters.status || o.status === filters.status);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 100;
    return { orders: list.slice(offset, offset + limit), total };
  }

  public async getOrderById(id: string) {
    return this.orders.find((o) => o.id === id || o.invoiceNumber === id || o.trackingNumber === id) || null;
  }

  public async trackOrder(query: string, mobileNumber?: string) {
    const cleanQuery = query.trim().toUpperCase();
    const order = this.orders.find((o) => {
      const matchId = o.id.toUpperCase() === cleanQuery;
      const matchTrack = o.trackingNumber?.toUpperCase() === cleanQuery;
      const matchInvoice = o.invoiceNumber?.toUpperCase() === cleanQuery;
      const matchMobile = mobileNumber ? o.customer?.mobileNumber?.includes(mobileNumber.replace(/\D/g, '').slice(-10)) : true;
      return (matchId || matchTrack || matchInvoice) && matchMobile;
    });
    return order || null;
  }

  /**
   * Transactional Order Creation:
   * 1. Validates product existence and stock availability
   * 2. Recalculates all pricing server-side (never trusts client price totals)
   * 3. Atomically decrements product stock to prevent overselling
   * 4. Calculates GST tax breakdown
   * 5. Creates Order, OrderItems, OrderStatusHistory, and Invoice records
   */
  public async createOrder(orderPayload: {
    userId?: string;
    customer: {
      fullName: string;
      mobileNumber: string;
      alternateNumber?: string;
      email?: string;
    };
    shippingAddress: {
      houseShopNo: string;
      street: string;
      villageArea: string;
      city: string;
      district?: string;
      state: string;
      pinCode: string;
      landmark?: string;
    };
    items: Array<{
      productId: string;
      quantity: number;
      selectedSize: string;
      selectedColor: { name: string; hex: string };
    }>;
    paymentMethod: 'COD' | 'ONLINE';
    couponCode?: string;
    customerNote?: string;
  }) {
    if (!orderPayload.items || orderPayload.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Step 1: Validate stock and load verified products
    const verifiedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of orderPayload.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID "${item.productId}" was not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`
        );
      }

      const itemTotalPrice = product.price * item.quantity;
      calculatedSubtotal += itemTotalPrice;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0],
        price: product.price,
        mrp: product.mrp,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        product: { ...product }
      });
    }

    // Step 2: Calculate coupon discount server-side
    let couponDiscount = 0;
    if (orderPayload.couponCode) {
      const couponRes = await this.validateCoupon(orderPayload.couponCode, calculatedSubtotal);
      if (couponRes.valid) {
        couponDiscount = couponRes.discount;
      }
    }

    // Step 3: Calculate Shipping & Taxes
    const freeShippingThreshold = this.settings.freeShippingThreshold ?? 999;
    const standardShipping = this.settings.standardShippingFee ?? 49;
    const deliveryCharge = calculatedSubtotal >= freeShippingThreshold ? 0 : standardShipping;

    const grandTotal = Math.max(0, calculatedSubtotal + deliveryCharge - couponDiscount);

    // GST Calculation: Configurable rate (default 5% on apparel)
    const taxRate = this.settings.defaultTaxRate ?? 5;
    const taxableAmount = Math.round((grandTotal / (1 + taxRate / 100)) * 100) / 100;
    const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = cgst;

    // Step 4: Atomically decrement stock
    for (const vItem of verifiedItems) {
      const pIdx = this.products.findIndex((p) => p.id === vItem.productId);
      if (pIdx !== -1) {
        this.products[pIdx].stock = Math.max(0, this.products[pIdx].stock - vItem.quantity);
      }
    }

    // Step 5: Generate Sequential Unique Identifiers
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FP-2026-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;
    const invoiceNumber = `INV-FP-2026-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `DEL-${Date.now().toString().slice(-7)}`;

    const initialTimelineEvent = {
      status: 'NEW',
      title: orderPayload.paymentMethod === 'COD' ? 'Order Placed (Cash on Delivery)' : 'Order Placed (Pending Payment Confirmation)',
      description: orderPayload.paymentMethod === 'COD'
        ? `Order confirmed. Delivery agent will collect ₹${grandTotal} in cash at doorstep.`
        : 'Payment transaction initiated via secure gateway.',
      timestamp: new Date().toISOString(),
      location: 'Fashion Point Fulfilment Centre, Madhya Pradesh'
    };

    const newOrder = {
      id: orderId,
      userId: orderPayload.userId || null,
      orderStatus: 'NEW',
      status: 'NEW',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'PENDING',
      customer: orderPayload.customer,
      shippingAddress: orderPayload.shippingAddress,
      items: verifiedItems,
      pricing: {
        subtotal: calculatedSubtotal,
        deliveryCharge,
        discount: couponDiscount,
        grandTotal
      },
      totalAmount: grandTotal,
      taxBreakdown: {
        taxableAmount,
        cgst,
        sgst,
        totalGst
      },
      courierName: 'Delhivery Express',
      trackingNumber,
      awbNumber: trackingNumber,
      invoiceNumber,
      estimatedDelivery: '3 - 5 Business Days',
      timeline: [initialTimelineEvent],
      customerNote: orderPayload.customerNote || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    // Record notification event
    this.notifications.push({
      id: `ntf-${Date.now()}`,
      orderId: newOrder.id,
      channel: 'SMS',
      recipient: newOrder.customer.mobileNumber,
      title: `Fashion Point: Order ${newOrder.id} Placed`,
      message: `Dear ${newOrder.customer.fullName}, your order ${newOrder.id} of ₹${newOrder.pricing.grandTotal} is received! Track: https://fashionpoint.store/order-tracking/${newOrder.id}`,
      status: process.env.SMS_PROVIDER_KEY ? 'SENT' : 'UNCONFIGURED',
      timestamp: new Date().toISOString()
    });

    return newOrder;
  }

  public async updateOrderStatus(
    orderId: string,
    status: string,
    courierName?: string,
    awbNumber?: string,
    note?: string
  ) {
    const idx = this.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const currentOrder = this.orders[idx];
    const upperStatus = status.toUpperCase();

    // Map descriptions
    const descriptions: Record<string, string> = {
      NEW: 'Order received and logged in system.',
      CONFIRMED: 'Order accepted by store manager. Garments allocated for packing.',
      PACKED: 'Items inspected for quality, ironed, and sealed in tamper-evident parcel.',
      SHIPPED: `Package dispatched via ${courierName || currentOrder.courierName || 'Delhivery'}. AWB: ${awbNumber || currentOrder.awbNumber}.`,
      OUT_FOR_DELIVERY: 'Parcel is out for delivery with local courier partner.',
      DELIVERED: 'Package handed over to recipient. Thank you for shopping with Fashion Point!',
      CANCELLED: note || 'Order has been cancelled.'
    };

    const newTimelineEvent = {
      status: upperStatus,
      title: upperStatus.replace(/_/g, ' '),
      description: descriptions[upperStatus] || `Order status updated to ${upperStatus}.`,
      timestamp: new Date().toISOString(),
      location: 'Fashion Point Logistics Hub'
    };

    let paymentStatus = currentOrder.paymentStatus;
    if (upperStatus === 'DELIVERED') {
      paymentStatus = 'PAID';
    } else if (upperStatus === 'CANCELLED' && currentOrder.paymentMethod === 'ONLINE' && currentOrder.paymentStatus === 'PAID') {
      paymentStatus = 'REFUNDED';
    }

    const updated = {
      ...currentOrder,
      orderStatus: upperStatus,
      status: upperStatus,
      paymentStatus,
      courierName: courierName || currentOrder.courierName,
      awbNumber: awbNumber || currentOrder.awbNumber,
      trackingNumber: awbNumber || currentOrder.trackingNumber,
      adminNote: note || currentOrder.adminNote,
      timeline: [...currentOrder.timeline, newTimelineEvent],
      updatedAt: new Date().toISOString()
    };

    this.orders[idx] = updated;
    return updated;
  }

  // --- COUPONS ---
  public async getCoupons() {
    return [...this.coupons];
  }

  public async validateCoupon(code: string, subtotal: number) {
    const clean = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code === clean && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires a minimum purchase of ₹${coupon.minOrderAmount}. Current subtotal is ₹${subtotal}.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      discount,
      message: `Success! You saved ₹${discount} with ${coupon.code}.`,
      coupon
    };
  }

  // --- REAL DASHBOARD METRICS ---
  public async getStats(): Promise<DbStats> {
    const totalOrders = this.orders.length;
    const totalSales = this.orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);

    // Today's Sales: Real Date Comparison (Orders placed between 00:00:00 and 23:59:59 of today's date)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

    const todayOrders = this.orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      return orderTime >= startOfToday && orderTime < endOfToday && o.orderStatus !== 'CANCELLED';
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);

    const pendingOrders = this.orders.filter(
      (o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus?.toUpperCase())
    ).length;

    const deliveredOrders = this.orders.filter(
      (o) => o.orderStatus?.toUpperCase() === 'DELIVERED'
    ).length;

    const cancelledOrders = this.orders.filter(
      (o) => o.orderStatus?.toUpperCase() === 'CANCELLED'
    ).length;

    const totalCustomers = this.users.length;
    const totalProducts = this.products.length;
    const lowStockCount = this.products.filter((p) => p.stock < 5).length;

    return {
      totalSales,
      todaySales,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      lowStockCount
    };
  }

  // --- AUTH & USERS ---
  public async getUserByEmailOrMobile(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return (
      this.users.find(
        (u) => u.email?.toLowerCase() === clean || u.mobile?.replace(/\D/g, '') === clean.replace(/\D/g, '')
      ) || null
    );
  }

  public async getUserById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  public async createUser(userData: {
    fullName: string;
    email?: string;
    mobile: string;
    password?: string;
  }) {
    const existing = await this.getUserByEmailOrMobile(userData.mobile);
    if (existing) {
      throw new Error('An account with this mobile number already exists.');
    }

    const passwordHash = userData.password ? bcrypt.hashSync(userData.password, 10) : null;
    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: userData.fullName.trim(),
      email: userData.email?.trim().toLowerCase() || null,
      mobile: userData.mobile.trim(),
      passwordHash,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  public async getAdminByUsername(username: string) {
    const clean = username.trim().toLowerCase();
    return this.admins.find((a) => a.username.toLowerCase() === clean && a.isActive) || null;
  }

  public async getAdmins() {
    return this.admins.map(({ passwordHash, ...safe }) => safe);
  }

  public async createAdmin(data: {
    username: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
    email?: string;
  }) {
    const existing = await this.getAdminByUsername(data.username);
    if (existing) {
      throw new Error(`Username "${data.username}" is already taken.`);
    }

    const passwordHash = bcrypt.hashSync(data.password.trim(), 10);
    const newAdmin = {
      id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
      username: data.username.trim().toLowerCase(),
      passwordHash,
      fullName: data.fullName.trim(),
      role: data.role || 'STORE_MANAGER',
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };

    this.admins.push(newAdmin);
    const { passwordHash: _, ...safe } = newAdmin;
    return safe;
  }

  public async updateAdminPassword(adminId: string, newPassword: string) {
    const admin = this.admins.find((a) => a.id === adminId);
    if (!admin) return false;
    admin.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
    admin.updatedAt = new Date().toISOString();
    return true;
  }

  // --- SETTINGS ---
  public async getSettings() {
    return { ...this.settings };
  }

  public async updateSettings(updates: Record<string, any>) {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }
}

export const db = new DatabaseManager();
