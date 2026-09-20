import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_BANNERS, STORE_CONFIG } from '../src/database/seed/productsData';
import { INITIAL_ORDERS } from '../src/database/seed/ordersData';
import { INITIAL_POSTAL_CODES, PostalRecord } from './data/postalCodes';
import { DbStats } from './db';

export class InMemoryDatabaseManager {
  private products: any[] = [];
  private orders: any[] = [];
  private coupons: any[] = [];
  private banners: any[] = [];
  private admins: any[] = [];
  private users: any[] = [];
  private settings: any = null;
  private trackingEvents: any[] = [];
  private qrScans: any[] = [];
  private postalCodes: PostalRecord[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Products
    this.products = INITIAL_PRODUCTS.map((p) => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const categoryId = p.category.toLowerCase() === 'men' ? 'cat-men' : p.category.toLowerCase() === 'women' ? 'cat-women' : 'cat-kids';
      return {
        id: p.id,
        name: p.name,
        slug,
        categoryId,
        category: p.category,
        subCategory: p.subCategory || 'Apparel',
        description: p.description,
        price: Number(p.price),
        mrp: Number(p.mrp),
        discount: p.discount || Math.round(((p.mrp - p.price) / p.mrp) * 100),
        sizes: Array.isArray(p.sizes) ? p.sizes : ['M', 'L', 'XL'],
        colors: Array.isArray(p.colors) ? p.colors : [{ name: 'Standard', hex: '#111111' }],
        stock: Number(p.stock || 40),
        sku: p.sku,
        status: p.status || 'PUBLISHED',
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: Boolean(p.isNewArrival),
        isBestseller: Boolean(p.isBestseller),
        isActive: p.status !== 'UNPUBLISHED',
        images: Array.isArray(p.images) ? p.images : [],
        rating: Number(p.rating || 4.8),
        reviewsCount: Number(p.reviewsCount || 20),
        material: p.material || '100% Pure Combed Cotton',
        careInstructions: p.careInstructions || 'Machine wash cold with like colors',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // 2. Seed Coupons
    this.coupons = INITIAL_COUPONS.map((c) => ({
      id: c.id,
      code: c.code.toUpperCase(),
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderAmount: Number(c.minOrderAmount || 0),
      maxDiscountAmount: (c as any).maxDiscountAmount ? Number((c as any).maxDiscountAmount) : undefined,
      usageLimit: 500,
      usageCount: 0,
      isActive: c.isActive !== false,
      expiresAt: c.validUntil ? new Date(c.validUntil).toISOString() : new Date('2026-12-31T23:59:59Z').toISOString(),
      createdAt: new Date().toISOString()
    }));

    // 3. Seed Banners
    this.banners = INITIAL_BANNERS.map((b, i) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      link: b.link,
      badge: b.badge,
      image: b.imageUrl,
      isActive: true,
      sortOrder: i
    }));

    // 4. Seed Settings
    this.settings = {
      storeName: STORE_CONFIG.name,
      tagline: STORE_CONFIG.tagline,
      contactEmail: STORE_CONFIG.email,
      supportPhone: STORE_CONFIG.phone,
      ownerName: 'Meraj Alam',
      gstin: STORE_CONFIG.gstin,
      defaultTaxRate: 5,
      freeShippingThreshold: STORE_CONFIG.freeShippingThreshold || 999,
      standardShippingFee: 49,
      isCodEnabled: true,
      isOnlinePaymentEnabled: true,
      address: STORE_CONFIG.address
    };

    // 5. Seed Super Admin
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';
    this.admins = [
      {
        id: 'ADM-SUPER-01',
        username: 'admin',
        passwordHash: bcrypt.hashSync(defaultPassword, 10),
        fullName: 'Meraj Alam (Store Owner)',
        role: 'SUPER_ADMIN',
        phone: '+91 73523 19943',
        email: 'contact@fashionpoint.store',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    // 6. Seed Orders
    this.orders = (INITIAL_ORDERS || []).map((o) => {
      const order = {
        ...o,
        orderStatus: o.orderStatus || o.status || 'ORDER_PLACED',
        status: o.status || o.orderStatus || 'ORDER_PLACED',
        trackingToken: (o as any).trackingToken || o.trackingNumber || o.id,
        currentLocation: (o as any).currentLocation || 'Fashion Point Central Fulfilment Hub, Indore',
        expectedDeliveryDate: (o as any).expectedDeliveryDate || (o as any).estimatedDelivery || '3 - 5 Business Days',
        shippingName: (o as any).shippingName || o.customer?.fullName,
        shippingPhone: (o as any).shippingPhone || o.customer?.mobileNumber,
        shippingAddressLine: (o as any).shippingAddressLine || `${o.shippingAddress?.houseShopNo || ''}, ${o.shippingAddress?.street || ''}, ${o.shippingAddress?.villageArea || ''}`,
        shippingCity: (o as any).shippingCity || o.shippingAddress?.city,
        shippingDistrict: (o as any).shippingDistrict || o.shippingAddress?.district || o.shippingAddress?.city,
        shippingState: (o as any).shippingState || o.shippingAddress?.state,
        shippingPincode: (o as any).shippingPincode || o.shippingAddress?.pinCode,
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: o.createdAt || new Date().toISOString()
      };

      if (order.timeline && Array.isArray(order.timeline)) {
        order.timeline.forEach((evt: any) => {
          this.trackingEvents.push({
            id: `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            orderId: order.id,
            trackingNumber: order.trackingNumber,
            status: evt.status,
            location: evt.location || order.currentLocation,
            description: evt.description || evt.title,
            source: 'SYSTEM',
            scannedBy: 'SYSTEM',
            createdAt: evt.timestamp || new Date().toISOString()
          });
        });
      }

      return order;
    });

    // 7. Seed Postal Codes
    this.postalCodes = [...INITIAL_POSTAL_CODES];
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
    let list = this.products.filter((p) => p.isActive);

    if (filters?.category && filters.category.toLowerCase() !== 'all') {
      list = list.filter((p) => p.category?.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.subCategory && filters.subCategory.toLowerCase() !== 'all') {
      list = list.filter((p) => p.subCategory?.toLowerCase() === filters.subCategory?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters?.sort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === 'popular') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const paginated = list.slice(offset, offset + limit);

    return {
      products: paginated,
      total,
      limit,
      offset
    };
  }

  public async getProductById(id: string) {
    return this.products.find((p) => p.id === id || p.slug === id) || null;
  }

  public async createProduct(productData: any) {
    const id = productData.id || `fp-prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryId = productData.categoryId || (productData.category?.toLowerCase() === 'men' ? 'cat-men' : productData.category?.toLowerCase() === 'women' ? 'cat-women' : 'cat-kids');

    const product = {
      id,
      name: productData.name,
      slug,
      categoryId,
      category: productData.category,
      subCategory: productData.subCategory || 'Apparel',
      description: productData.description || '',
      price: Number(productData.price),
      mrp: Number(productData.mrp || productData.price),
      discount: Number(productData.discount || 0),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ['M', 'L', 'XL'],
      colors: Array.isArray(productData.colors) ? productData.colors : [{ name: 'Standard', hex: '#111111' }],
      stock: Number(productData.stock || 0),
      sku: productData.sku || `FP-${Date.now().toString().slice(-6)}`,
      status: productData.status || 'PUBLISHED',
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      isBestseller: Boolean(productData.isBestseller),
      isActive: productData.status !== 'UNPUBLISHED',
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
      rating: 5.0,
      reviewsCount: 1,
      material: productData.material || 'Cotton',
      careInstructions: productData.careInstructions || 'Machine wash cold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(product);
    return product;
  }

  public async updateProduct(id: string, updates: any) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.products[idx];
    const updated = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      mrp: updates.mrp !== undefined ? Number(updates.mrp) : existing.mrp,
      stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
      isActive: updates.status ? updates.status !== 'UNPUBLISHED' : existing.isActive,
      updatedAt: new Date().toISOString()
    };

    if (updates.name) {
      updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    this.products[idx] = updated;
    return updated;
  }

  public async deleteProduct(id: string) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products.splice(idx, 1);
      return true;
    }
    return false;
  }

  public async getCategories() {
    return [
      { id: 'cat-men', name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80' },
      { id: 'cat-women', name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
      { id: 'cat-kids', name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80' }
    ];
  }

  // --- ORDERS ---
  public async getOrders(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let list = [...this.orders];

    if (filters?.userId) {
      list = list.filter((o) => String(o.userId) === String(filters.userId));
    }

    if (filters?.status && filters.status.toUpperCase() !== 'ALL') {
      const s = filters.status.toUpperCase();
      list = list.filter((o) => (o.orderStatus?.toUpperCase() === s || o.status?.toUpperCase() === s));
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = list.length;
    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    return {
      orders: list.slice(offset, offset + limit),
      total
    };
  }

  public async getOrderById(id: string) {
    return this.orders.find(
      (o) => o.id === id || o.invoiceNumber === id || o.trackingNumber === id || o.razorpayOrderId === id
    ) || null;
  }

  public async trackOrder(query: string, mobileNumber?: string) {
    const clean = query.trim().toUpperCase();
    let order = this.orders.find(
      (o) =>
        o.id?.toUpperCase() === clean ||
        o.trackingNumber?.toUpperCase() === clean ||
        o.invoiceNumber?.toUpperCase() === clean ||
        o.trackingToken === query.trim()
    );

    if (order && mobileNumber) {
      const cleanDigits = mobileNumber.replace(/\D/g, '').slice(-10);
      const custMobile = (order.customer?.mobileNumber || '').replace(/\D/g, '').slice(-10);
      if (!custMobile.includes(cleanDigits)) {
        return null;
      }
    }

    return order || null;
  }

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

    const verifiedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of orderPayload.items) {
      const product = this.products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID "${item.productId}" was not found in catalog.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}.`
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        price: product.price,
        mrp: product.mrp,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        product: { ...product }
      });
    }

    // Coupon validation
    let couponDiscount = 0;
    if (orderPayload.couponCode) {
      const cleanCode = orderPayload.couponCode.trim().toUpperCase();
      const coupon = this.coupons.find((c) => c.code === cleanCode && c.isActive);
      if (coupon && calculatedSubtotal >= (coupon.minOrderAmount || 0)) {
        if (coupon.discountType === 'PERCENTAGE') {
          const val = Math.round((calculatedSubtotal * Number(coupon.discountValue)) / 100);
          const maxD = Number(coupon.maxDiscountAmount);
          couponDiscount = maxD && val > maxD ? maxD : val;
        } else {
          couponDiscount = Math.min(Number(coupon.discountValue), calculatedSubtotal);
        }
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }

    // Pricing & Tax
    const deliveryCharge = calculatedSubtotal >= 999 ? 0 : 49;
    const grandTotal = Math.max(0, calculatedSubtotal + deliveryCharge - couponDiscount);
    const taxRate = 5;
    const taxableAmount = Math.round((grandTotal / (1 + taxRate / 100)) * 100) / 100;
    const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = cgst;

    // Decrement stock in memory
    for (const item of orderPayload.items) {
      const p = this.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        p.updatedAt = new Date().toISOString();
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FP-2026-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`;
    const invoiceNumber = `INV-FP-2026-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `DEL-${Date.now().toString().slice(-7)}`;
    const trackingToken = `tk_${crypto.randomBytes(12).toString('hex')}`;
    const currentLocation = 'Fashion Point Central Fulfilment Hub, Indore';
    const expectedDelivery = '3 - 5 Business Days';

    const shippingAddr = (orderPayload.shippingAddress || {}) as any;
    const shippingName = orderPayload.customer?.fullName || 'Customer';
    const shippingPhone = orderPayload.customer?.mobileNumber || '';
    const shippingAddressLine = [
      shippingAddr.houseBuilding || shippingAddr.houseShopNo,
      shippingAddr.streetArea || shippingAddr.street,
      shippingAddr.landmark,
      shippingAddr.villageTownCity || shippingAddr.villageArea
    ].filter(Boolean).join(', ');
    const shippingCity = shippingAddr.villageTownCity || shippingAddr.city || 'Indore';
    const shippingDistrict = shippingAddr.district || 'Indore';
    const shippingState = shippingAddr.state || 'Madhya Pradesh';
    const shippingPincode = shippingAddr.pinCode || '452001';

    const initialTimelineEvent = {
      status: 'ORDER_PLACED',
      title: 'Order Placed',
      description: orderPayload.paymentMethod === 'COD'
        ? `Order confirmed (Cash on Delivery). Delivery partner will collect ₹${grandTotal} in cash at doorstep.`
        : 'Payment transaction initiated via secure gateway.',
      timestamp: new Date().toISOString(),
      location: currentLocation
    };

    const newOrder: any = {
      id: orderId,
      userId: orderPayload.userId || null,
      orderStatus: 'ORDER_PLACED',
      status: 'ORDER_PLACED',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'PENDING',
      customer: orderPayload.customer,
      shippingAddress: orderPayload.shippingAddress,
      shippingName,
      shippingPhone,
      shippingAddressLine,
      shippingCity,
      shippingDistrict,
      shippingState,
      shippingPincode,
      trackingToken,
      currentLocation,
      expectedDeliveryDate: expectedDelivery,
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
      estimatedDelivery: expectedDelivery,
      timeline: [initialTimelineEvent],
      customerNote: orderPayload.customerNote || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    this.trackingEvents.push({
      id: `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      trackingNumber,
      status: 'ORDER_PLACED',
      location: currentLocation,
      description: orderPayload.paymentMethod === 'COD' ? 'Order Placed (Cash on Delivery)' : 'Order Placed',
      source: 'SYSTEM',
      scannedBy: 'SYSTEM',
      createdAt: new Date().toISOString()
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
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const upperStatus = status.toUpperCase();
    const descriptions: Record<string, string> = {
      NEW: 'Order received and logged in system.',
      CONFIRMED: 'Order accepted by store manager. Garments allocated for packing.',
      PACKED: 'Items inspected for quality, ironed, and sealed in tamper-evident parcel.',
      SHIPPED: `Package dispatched via ${courierName || order.courierName || 'Delhivery'}. AWB: ${awbNumber || order.awbNumber}.`,
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

    let paymentStatus = order.paymentStatus;
    if (upperStatus === 'DELIVERED') {
      paymentStatus = 'PAID';
    } else if (upperStatus === 'CANCELLED' && order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID') {
      paymentStatus = 'REFUNDED';
    }

    order.orderStatus = upperStatus;
    order.status = upperStatus;
    order.paymentStatus = paymentStatus;
    if (courierName) order.courierName = courierName;
    if (awbNumber) {
      order.awbNumber = awbNumber;
      order.trackingNumber = awbNumber;
    }
    if (note) order.adminNote = note;
    order.timeline = [...(order.timeline || []), newTimelineEvent];
    order.updatedAt = new Date().toISOString();

    return order;
  }

  public async updateOrderPaymentVerified(
    orderId: string,
    data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      paymentDetails: any;
    }
  ) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const paymentTimelineEvent = {
      status: 'PAID',
      title: 'Payment Received',
      description: `Online payment of ₹${order.pricing?.grandTotal || order.totalAmount} captured successfully via Razorpay (Ref: ${data.razorpayPaymentId}).`,
      timestamp: new Date().toISOString(),
      location: 'Razorpay Gateway'
    };

    order.paymentStatus = 'PAID';
    order.orderStatus = 'CONFIRMED';
    order.status = 'CONFIRMED';
    order.razorpayOrderId = data.razorpayOrderId;
    order.razorpayPaymentId = data.razorpayPaymentId;
    order.paymentDetails = data.paymentDetails;
    order.timeline = [...(order.timeline || []), paymentTimelineEvent];
    order.updatedAt = new Date().toISOString();

    return order;
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

    const minOrder = Number(coupon.minOrderAmount || 0);
    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires a minimum purchase of ₹${minOrder}. Current subtotal is ₹${subtotal}.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
      const maxDiscount = Number(coupon.maxDiscountAmount);
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      discount = Math.min(Number(coupon.discountValue), subtotal);
    }

    return {
      valid: true,
      discount,
      message: `Success! You saved ₹${discount} with ${coupon.code}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue)
      }
    };
  }

  // --- DASHBOARD REAL METRICS ---
  public async getStats(): Promise<DbStats> {
    const nonCancelled = this.orders.filter((o) => o.orderStatus !== 'CANCELLED');
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = nonCancelled.filter((o) => (o.createdAt || '').slice(0, 10) === today);

    const totalSales = nonCancelled.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const pendingOrders = this.orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length;
    const deliveredOrders = this.orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrders = this.orders.filter((o) => o.orderStatus === 'CANCELLED').length;

    const uniqueCustomers = new Set(this.orders.map((o) => o.customer?.mobileNumber).filter(Boolean));
    const lowStockCount = this.products.filter((p) => p.stock < 5).length;

    return {
      totalSales,
      todaySales,
      totalOrders: this.orders.length,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers: uniqueCustomers.size,
      totalProducts: this.products.length,
      lowStockCount
    };
  }

  // --- USERS & AUTH ---
  public async getUserByEmailOrMobile(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '').slice(-10);

    return this.users.find(
      (u) => u.email?.toLowerCase() === clean || u.phone === clean || u.phone === cleanDigits
    ) || null;
  }

  public async getUserById(id: string) {
    return this.users.find((u) => String(u.id) === String(id) || u.uid === id) || null;
  }

  public async createUser(userData: {
    fullName: string;
    email?: string;
    mobile: string;
    password?: string;
  }) {
    const passwordHash = userData.password ? bcrypt.hashSync(userData.password, 10) : null;
    const uid = `usr-${Date.now()}`;
    const user = {
      id: this.users.length + 1,
      uid,
      email: userData.email?.trim().toLowerCase() || null,
      phone: userData.mobile.trim(),
      passwordHash,
      fullName: userData.fullName.trim(),
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  // --- ADMINS ---
  public async getAdminByUsername(username: string) {
    const clean = username.trim().toLowerCase();
    return this.admins.find((a) => a.username.toLowerCase() === clean && a.isActive) || null;
  }

  public async getAdmins() {
    return this.admins.map(({ passwordHash, ...a }) => a);
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
    const id = `ADM-${Math.floor(100 + Math.random() * 900)}`;

    const admin = {
      id,
      username: data.username.trim().toLowerCase(),
      passwordHash,
      fullName: data.fullName.trim(),
      role: data.role || 'STORE_MANAGER',
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.admins.push(admin);
    const { passwordHash: _, ...safe } = admin;
    return safe;
  }

  public async updateAdminPassword(adminId: string, newPassword: string) {
    const admin = this.admins.find((a) => a.id === adminId);
    if (admin) {
      admin.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
      return true;
    }
    return false;
  }

  public async updateAdmin(adminId: string, updates: {
    isActive?: boolean;
    role?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
  }) {
    const admin = this.admins.find((a) => a.id === adminId);
    if (!admin) return false;

    if (updates.isActive !== undefined) admin.isActive = updates.isActive;
    if (updates.role !== undefined) admin.role = updates.role;
    if (updates.fullName !== undefined) admin.fullName = updates.fullName;
    if (updates.phone !== undefined) admin.phone = updates.phone;
    if (updates.email !== undefined) admin.email = updates.email;
    if (updates.password) admin.passwordHash = bcrypt.hashSync(updates.password.trim(), 10);

    return true;
  }

  public async deleteAdmin(adminId: string) {
    const idx = this.admins.findIndex((a) => a.id === adminId);
    if (idx !== -1) {
      this.admins.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  public async getSettings() {
    return { ...this.settings };
  }

  public async updateSettings(updates: Record<string, any>) {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }

  // --- CUSTOMER PROFILE ---
  public async getCustomerProfile(userId: string | number) {
    return this.getUserById(String(userId));
  }

  public async updateCustomerProfile(userId: string | number, data: {
    fullName: string;
    mobile: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
  }) {
    const user = await this.getUserById(String(userId));
    if (!user) return null;

    if (data.fullName) user.fullName = data.fullName;
    if (data.mobile) user.phone = data.mobile;
    if (data.email) user.email = data.email;
    if (data.dateOfBirth) user.dateOfBirth = data.dateOfBirth;
    if (data.gender) user.gender = data.gender;
    user.updatedAt = new Date().toISOString();

    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  // --- POSTAL CODES ---
  public async lookupPostalCode(pincode: string) {
    const clean = pincode.replace(/\D/g, '');
    return this.postalCodes.filter((p) => p.pincode === clean);
  }

  // --- CUSTOMER ORDERS ---
  public async getCustomerOrders(userId: string | number, mobile?: string, email?: string) {
    const uidStr = String(userId);
    const cleanMobile = mobile ? mobile.replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    return this.orders.filter((o) => {
      if (o.userId && String(o.userId) === uidStr) return true;
      if (cleanMobile && o.customer?.mobileNumber?.replace(/\D/g, '').includes(cleanMobile)) return true;
      if (cleanEmail && o.customer?.email?.toLowerCase() === cleanEmail) return true;
      return false;
    });
  }

  // --- ORDER TRACKING & QR EVENTS ---
  public async getOrderByTrackingToken(tokenOrTracking: string) {
    const clean = tokenOrTracking.trim();
    return this.orders.find(
      (o) =>
        o.trackingToken === clean ||
        o.trackingNumber?.toUpperCase() === clean.toUpperCase() ||
        o.id?.toUpperCase() === clean.toUpperCase()
    ) || null;
  }

  public async getOrderTrackingEvents(orderId: string) {
    return this.trackingEvents.filter((e) => e.orderId === orderId);
  }

  public async addOrderTrackingEvent(payload: {
    orderId: string;
    status: string;
    stage?: string;
    location?: string;
    hubName?: string;
    description: string;
    source?: 'ADMIN' | 'COURIER' | 'WAREHOUSE' | 'HUB' | 'DELIVERY' | 'SYSTEM';
    scannedBy?: string;
    recipientName?: string;
    confirmationNote?: string;
    courierName?: string;
    awbNumber?: string;
  }) {
    const order = await this.getOrderById(payload.orderId);
    if (!order) return null;

    const eventId = `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const upperStatus = payload.status.toUpperCase();
    const trackingNum = payload.awbNumber || order.trackingNumber || `DEL-${Date.now().toString().slice(-7)}`;

    const event = {
      id: eventId,
      orderId: order.id,
      trackingNumber: trackingNum,
      status: upperStatus,
      stage: payload.stage,
      location: payload.location || order.currentLocation,
      hubName: payload.hubName,
      description: payload.description,
      source: payload.source || 'ADMIN',
      scannedBy: payload.scannedBy || 'STAFF',
      recipientName: payload.recipientName,
      confirmationNote: payload.confirmationNote,
      createdAt: new Date().toISOString()
    };
    this.trackingEvents.push(event);

    const newTimelineItem = {
      status: upperStatus,
      stage: payload.stage,
      title: upperStatus.replace(/_/g, ' '),
      description: payload.description,
      location: payload.location || order.currentLocation,
      hubName: payload.hubName,
      recipientName: payload.recipientName,
      timestamp: new Date().toISOString()
    };

    order.orderStatus = upperStatus;
    order.status = upperStatus;
    if (payload.location) order.currentLocation = payload.location;
    if (payload.courierName) order.courierName = payload.courierName;
    if (payload.awbNumber) {
      order.awbNumber = payload.awbNumber;
      order.trackingNumber = payload.awbNumber;
    }
    order.timeline = [...(order.timeline || []), newTimelineItem];
    order.updatedAt = new Date().toISOString();

    if (upperStatus === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    } else if (upperStatus === 'CANCELLED' && order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUNDED';
    }

    return {
      order,
      event
    };
  }

  public async recordQrScan(payload: {
    orderId: string;
    trackingNumber: string;
    scannedBy?: string;
    scannerType: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'COURIER';
    location?: string;
  }) {
    const id = `scan-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    this.qrScans.push({
      id,
      orderId: payload.orderId,
      trackingNumber: payload.trackingNumber,
      scannedBy: payload.scannedBy || null,
      scannerType: payload.scannerType,
      location: payload.location || null,
      createdAt: new Date().toISOString()
    });
    return id;
  }
}

export const inMemoryDb = new InMemoryDatabaseManager();
