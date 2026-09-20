import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '../src/db/index';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_BANNERS, STORE_CONFIG } from '../src/database/seed/productsData';

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

// Map database snake_case row to camelCase Product
function mapProductRow(r: any) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    categoryId: r.category_id,
    category: r.category,
    subCategory: r.sub_category,
    description: r.description,
    price: Number(r.price),
    mrp: Number(r.mrp),
    discount: Number(r.discount || 0),
    sizes: Array.isArray(r.sizes) ? r.sizes : (typeof r.sizes === 'string' ? JSON.parse(r.sizes) : ['M', 'L', 'XL']),
    colors: Array.isArray(r.colors) ? r.colors : (typeof r.colors === 'string' ? JSON.parse(r.colors) : []),
    stock: Number(r.stock || 0),
    sku: r.sku,
    status: r.status || 'PUBLISHED',
    isFeatured: Boolean(r.is_featured),
    isNewArrival: Boolean(r.is_new_arrival),
    isBestseller: Boolean(r.is_bestseller),
    isActive: Boolean(r.is_active),
    images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images) : []),
    rating: Number(r.rating || 4.8),
    reviewsCount: Number(r.reviews_count || 0),
    material: r.material,
    careInstructions: r.care_instructions,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
  };
}

// Map database snake_case row to camelCase Order
function mapOrderRow(r: any) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    orderStatus: r.order_status,
    status: r.status || r.order_status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
    shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    pricing: typeof r.pricing === 'string' ? JSON.parse(r.pricing) : r.pricing,
    totalAmount: Number(r.total_amount),
    taxBreakdown: typeof r.tax_breakdown === 'string' ? JSON.parse(r.tax_breakdown) : r.tax_breakdown,
    razorpayOrderId: r.razorpay_order_id,
    razorpayPaymentId: r.razorpay_payment_id,
    courierName: r.courier_name,
    trackingNumber: r.tracking_number,
    trackingToken: r.tracking_token || r.tracking_number || r.id,
    currentLocation: r.current_location || 'Fashion Point Central Fulfilment Hub, Indore',
    expectedDeliveryDate: r.expected_delivery_date || r.estimated_delivery || '3 - 5 Business Days',
    shippingName: r.shipping_name || (typeof r.customer === 'string' ? JSON.parse(r.customer)?.fullName : r.customer?.fullName),
    shippingPhone: r.shipping_phone || (typeof r.customer === 'string' ? JSON.parse(r.customer)?.mobileNumber : r.customer?.mobileNumber),
    shippingAddressLine: r.shipping_address_line,
    shippingCity: r.shipping_city || (typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address)?.city : r.shipping_address?.city),
    shippingDistrict: r.shipping_district || (typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address)?.district : r.shipping_address?.district),
    shippingState: r.shipping_state || (typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address)?.state : r.shipping_address?.state),
    shippingPincode: r.shipping_pincode || (typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address)?.pinCode : r.shipping_address?.pinCode),
    awbNumber: r.awb_number,
    invoiceNumber: r.invoice_number,
    estimatedDelivery: r.estimated_delivery,
    timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline,
    customerNote: r.customer_note,
    adminNote: r.admin_note,
    paymentDetails: typeof r.payment_details === 'string' ? JSON.parse(r.payment_details) : r.payment_details,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
  };
}

class PostgresDatabaseManager {
  private pool: Pool;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.pool = pool;
    this.initDatabase().catch((err) => {
      console.error('Database initialization error:', err);
    });
  }

  /**
   * Initializes database with seed records in PostgreSQL if tables are empty
   */
  private async initDatabase(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // 1. Verify categories
        const catCheck = await this.pool.query('SELECT count(*)::int as count FROM categories');
        if (catCheck.rows[0].count === 0) {
          const initialCategories = [
            { id: 'cat-men', name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80' },
            { id: 'cat-women', name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' },
            { id: 'cat-kids', name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80' }
          ];
          for (const cat of initialCategories) {
            await this.pool.query(
              'INSERT INTO categories (id, name, slug, image) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
              [cat.id, cat.name, cat.slug, cat.image]
            );
          }
        }

        // 2. Verify products
        const prodCheck = await this.pool.query('SELECT count(*)::int as count FROM products');
        if (prodCheck.rows[0].count === 0) {
          for (const p of INITIAL_PRODUCTS) {
            const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const categoryId = p.category.toLowerCase() === 'men' ? 'cat-men' : p.category.toLowerCase() === 'women' ? 'cat-women' : 'cat-kids';
            await this.pool.query(
              `INSERT INTO products (
                id, name, slug, category_id, category, sub_category, description, price, mrp, discount,
                sizes, colors, stock, sku, status, is_featured, is_new_arrival, is_bestseller, is_active,
                images, rating, reviews_count, material, care_instructions
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19,
                $20, $21, $22, $23, $24
              ) ON CONFLICT (id) DO NOTHING`,
              [
                p.id,
                p.name,
                slug,
                categoryId,
                p.category,
                p.subCategory || 'Apparel',
                p.description,
                Number(p.price),
                Number(p.mrp),
                p.discount || Math.round(((p.mrp - p.price) / p.mrp) * 100),
                JSON.stringify(p.sizes),
                JSON.stringify(p.colors),
                Number(p.stock),
                p.sku,
                p.status || 'PUBLISHED',
                Boolean(p.isFeatured),
                Boolean(p.isNewArrival),
                Boolean(p.isBestseller),
                p.status !== 'UNPUBLISHED',
                JSON.stringify(p.images),
                p.rating || 4.8,
                p.reviewsCount || 20,
                p.material || '100% Pure Combed Cotton',
                p.careInstructions || 'Machine wash cold with like colors'
              ]
            );
          }
        }

        // 3. Verify coupons
        const couponCheck = await this.pool.query('SELECT count(*)::int as count FROM coupons');
        if (couponCheck.rows[0].count === 0) {
          for (const c of INITIAL_COUPONS) {
            const maxDiscount = (c as any).maxDiscountAmount || (c as any).maxDiscount || (c.discountType === 'PERCENTAGE' ? 1000 : c.discountValue);
            await this.pool.query(
              `INSERT INTO coupons (
                id, code, discount_type, discount_value, min_order_amount, max_discount_amount,
                usage_limit, usage_count, is_active, expires_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (code) DO NOTHING`,
              [
                c.id,
                c.code.toUpperCase(),
                c.discountType,
                Number(c.discountValue),
                Number(c.minOrderAmount || 0),
                Number(maxDiscount),
                500,
                0,
                c.isActive !== false,
                c.validUntil ? new Date(c.validUntil) : new Date('2026-12-31T23:59:59Z')
              ]
            );
          }
        }

      // 4. Verify Super Admin Account - NO HARDCODED PASSWORDS
      const adminCheck = await this.pool.query('SELECT count(*)::int as count FROM admins');
      if (adminCheck.rows[0].count === 0) {
        const envPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD;
        const initialPassword = envPassword || crypto.randomBytes(9).toString('base64url');
        const passwordHash = bcrypt.hashSync(initialPassword, 10);

        await this.pool.query(
          `INSERT INTO admins (id, username, password_hash, full_name, role, phone, email, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true) ON CONFLICT (id) DO NOTHING`,
          [
            'ADM-SUPER-01',
            'admin',
            passwordHash,
            'Meraj Alam (Store Owner)',
            'SUPER_ADMIN',
            '+91 73523 19943',
            'contact@fashionpoint.store'
          ]
        );

        if (!envPassword) {
          console.log('\n======================================================');
          console.log(' [Fashion Point Security Notice]');
          console.log(` Initial Super Admin created: username="admin" password="${initialPassword}"`);
          console.log(' Set ADMIN_INITIAL_PASSWORD in environment for a permanent secret.');
          console.log('======================================================\n');
        } else {
          console.log('Initial Super Admin "admin" created with configured ADMIN_INITIAL_PASSWORD.');
        }
      } else if (process.env.ADMIN_INITIAL_PASSWORD) {
        const passwordHash = bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD.trim(), 10);
        await this.pool.query(
          `UPDATE admins SET password_hash = $1 WHERE username = 'admin'`,
          [passwordHash]
        );
      }

      // 5. Verify Banners
      const bannerCheck = await this.pool.query('SELECT count(*)::int as count FROM banners');
      if (bannerCheck.rows[0].count === 0) {
        for (let i = 0; i < INITIAL_BANNERS.length; i++) {
          const b = INITIAL_BANNERS[i];
          await this.pool.query(
            `INSERT INTO banners (id, title, subtitle, cta_text, link, badge, image, is_active, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8) ON CONFLICT (id) DO NOTHING`,
            [b.id, b.title, b.subtitle, b.ctaText, b.link, b.badge, b.imageUrl, i]
          );
        }
      }

      // 6. Verify Store Settings
      const settingsCheck = await this.pool.query('SELECT count(*)::int as count FROM store_settings');
      if (settingsCheck.rows[0].count === 0) {
        const defaultSettings = {
          storeName: STORE_CONFIG.name,
          tagline: STORE_CONFIG.tagline,
          contactEmail: STORE_CONFIG.email,
          supportPhone: STORE_CONFIG.phone,
          ownerName: 'Meraj Alam',
          gstin: STORE_CONFIG.gstin,
          defaultTaxRate: 5,
          freeShippingThreshold: STORE_CONFIG.freeShippingThreshold,
          standardShippingFee: 49,
          isCodEnabled: true,
          isOnlinePaymentEnabled: true,
          address: STORE_CONFIG.address
        };
        await this.pool.query(
          'INSERT INTO store_settings (id, settings) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
          ['default', JSON.stringify(defaultSettings)]
        );
      }

      this.isInitialized = true;
      console.log('PostgreSQL database verified and ready.');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL tables/seed:', err);
    } finally {
      this.initPromise = null;
    }
  })();

  return this.initPromise;
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
    await this.initDatabase();

    const conditions: string[] = ['is_active = true'];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.category && filters.category.toLowerCase() !== 'all') {
      conditions.push(`LOWER(category) = LOWER($${paramIndex++})`);
      values.push(filters.category);
    }

    if (filters?.subCategory && filters.subCategory.toLowerCase() !== 'all') {
      conditions.push(`LOWER(sub_category) = LOWER($${paramIndex++})`);
      values.push(filters.subCategory);
    }

    if (filters?.search) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(
        `(LOWER(name) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex} OR LOWER(sku) LIKE $${paramIndex} OR LOWER(category) LIKE $${paramIndex})`
      );
      values.push(q);
      paramIndex++;
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(`price >= $${paramIndex++}`);
      values.push(filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(`price <= $${paramIndex++}`);
      values.push(filters.maxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Order By
    let orderBy = 'created_at DESC';
    if (filters?.sort === 'price-low') {
      orderBy = 'price ASC';
    } else if (filters?.sort === 'price-high') {
      orderBy = 'price DESC';
    } else if (filters?.sort === 'newest') {
      orderBy = 'created_at DESC';
    } else if (filters?.sort === 'popular') {
      orderBy = 'reviews_count DESC';
    }

    // Count query
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int as total FROM products ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.total || 0;

    // Paginated list
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const listQuery = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const listRes = await this.pool.query(listQuery, [...values, limit, offset]);

    return {
      products: listRes.rows.map(mapProductRow),
      total,
      limit,
      offset
    };
  }

  public async getProductById(id: string) {
    await this.initDatabase();
    const res = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return mapProductRow(res.rows[0]);
  }

  public async createProduct(productData: any) {
    await this.initDatabase();
    const id = productData.id || `fp-prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryId = productData.categoryId || (productData.category?.toLowerCase() === 'men' ? 'cat-men' : productData.category?.toLowerCase() === 'women' ? 'cat-women' : 'cat-kids');

    const res = await this.pool.query(
      `INSERT INTO products (
        id, name, slug, category_id, category, sub_category, description, price, mrp, discount,
        sizes, colors, stock, sku, status, is_featured, is_new_arrival, is_bestseller, is_active,
        images, rating, reviews_count, material, care_instructions, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, NOW(), NOW()
      ) RETURNING *`,
      [
        id,
        productData.name,
        slug,
        categoryId,
        productData.category,
        productData.subCategory || 'Apparel',
        productData.description || '',
        Number(productData.price),
        Number(productData.mrp || productData.price),
        Number(productData.discount || 0),
        JSON.stringify(Array.isArray(productData.sizes) ? productData.sizes : ['M', 'L', 'XL']),
        JSON.stringify(Array.isArray(productData.colors) ? productData.colors : [{ name: 'Standard', hex: '#111111' }]),
        Number(productData.stock || 0),
        productData.sku || `FP-${Date.now().toString().slice(-6)}`,
        productData.status || 'PUBLISHED',
        Boolean(productData.isFeatured),
        Boolean(productData.isNewArrival),
        Boolean(productData.isBestseller),
        productData.status !== 'UNPUBLISHED',
        JSON.stringify(Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80']),
        5.0,
        1,
        productData.material || 'Cotton',
        productData.careInstructions || 'Machine wash cold'
      ]
    );

    return mapProductRow(res.rows[0]);
  }

  public async updateProduct(id: string, updates: any) {
    await this.initDatabase();

    const fields: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
      fields.push(`slug = $${idx++}`);
      values.push(updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.subCategory !== undefined) {
      fields.push(`sub_category = $${idx++}`);
      values.push(updates.subCategory);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(Number(updates.price));
    }
    if (updates.mrp !== undefined) {
      fields.push(`mrp = $${idx++}`);
      values.push(Number(updates.mrp));
    }
    if (updates.discount !== undefined) {
      fields.push(`discount = $${idx++}`);
      values.push(Number(updates.discount));
    }
    if (updates.stock !== undefined) {
      fields.push(`stock = $${idx++}`);
      values.push(Number(updates.stock));
    }
    if (updates.sku !== undefined) {
      fields.push(`sku = $${idx++}`);
      values.push(updates.sku);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
      fields.push(`is_active = $${idx++}`);
      values.push(updates.status !== 'UNPUBLISHED');
    }
    if (updates.isFeatured !== undefined) {
      fields.push(`is_featured = $${idx++}`);
      values.push(Boolean(updates.isFeatured));
    }
    if (updates.isNewArrival !== undefined) {
      fields.push(`is_new_arrival = $${idx++}`);
      values.push(Boolean(updates.isNewArrival));
    }
    if (updates.isBestseller !== undefined) {
      fields.push(`is_bestseller = $${idx++}`);
      values.push(Boolean(updates.isBestseller));
    }
    if (updates.images !== undefined) {
      fields.push(`images = $${idx++}`);
      values.push(JSON.stringify(updates.images));
    }
    if (updates.sizes !== undefined) {
      fields.push(`sizes = $${idx++}`);
      values.push(JSON.stringify(updates.sizes));
    }
    if (updates.colors !== undefined) {
      fields.push(`colors = $${idx++}`);
      values.push(JSON.stringify(updates.colors));
    }
    if (updates.material !== undefined) {
      fields.push(`material = $${idx++}`);
      values.push(updates.material);
    }
    if (updates.careInstructions !== undefined) {
      fields.push(`care_instructions = $${idx++}`);
      values.push(updates.careInstructions);
    }

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.pool.query(query, values);

    return mapProductRow(res.rows[0]);
  }

  public async deleteProduct(id: string) {
    await this.initDatabase();
    const res = await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  public async getCategories() {
    await this.initDatabase();
    const res = await this.pool.query('SELECT id, name, slug, image FROM categories ORDER BY name ASC');
    return res.rows;
  }

  // --- ORDERS & TRANSACTIONAL CHECKOUT ---
  public async getOrders(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    await this.initDatabase();

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters?.userId) {
      conditions.push(`user_id = $${idx++}`);
      values.push(filters.userId);
    }

    if (filters?.status && filters.status.toUpperCase() !== 'ALL') {
      conditions.push(`(order_status = $${idx} OR status = $${idx})`);
      values.push(filters.status.toUpperCase());
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await this.pool.query(`SELECT COUNT(*)::int as total FROM orders ${whereClause}`, values);
    const total = countRes.rows[0]?.total || 0;

    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    const query = `
      SELECT * FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const res = await this.pool.query(query, [...values, limit, offset]);

    return {
      orders: res.rows.map(mapOrderRow),
      total
    };
  }

  public async getOrderById(id: string) {
    await this.initDatabase();
    const res = await this.pool.query(
      'SELECT * FROM orders WHERE id = $1 OR invoice_number = $1 OR tracking_number = $1 OR razorpay_order_id = $1',
      [id]
    );
    return mapOrderRow(res.rows[0]);
  }

  public async trackOrder(query: string, mobileNumber?: string) {
    await this.initDatabase();
    const clean = query.trim();
    const cleanUpper = clean.toUpperCase();

    let sql = `
      SELECT * FROM orders
      WHERE (UPPER(id) = $1 OR UPPER(tracking_number) = $1 OR UPPER(invoice_number) = $1 OR tracking_token = $2)
    `;
    const params: any[] = [cleanUpper, clean];

    if (mobileNumber) {
      const cleanDigits = mobileNumber.replace(/\D/g, '').slice(-10);
      sql += ` AND (customer->>'mobileNumber' LIKE '%' || $3)`;
      params.push(cleanDigits);
    }

    sql += ' ORDER BY created_at DESC LIMIT 1';
    const res = await this.pool.query(sql, params);
    return mapOrderRow(res.rows[0]);
  }

  /**
   * Real PostgreSQL Transactional Checkout:
   * 1. Acquires row locks on products using SELECT ... FOR UPDATE
   * 2. Validates live inventory
   * 3. Calculates pricing and taxes server-side
   * 4. Atomically decrements product stock in PostgreSQL
   * 5. Inserts Order into orders table with initial timeline event
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
    await this.initDatabase();

    if (!orderPayload.items || orderPayload.items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const verifiedItems: any[] = [];
      let calculatedSubtotal = 0;

      // 1. Lock and verify each product row
      for (const item of orderPayload.items) {
        const prodRes = await client.query(
          'SELECT * FROM products WHERE id = $1 FOR UPDATE',
          [item.productId]
        );

        if (prodRes.rows.length === 0) {
          throw new Error(`Product with ID "${item.productId}" was not found in catalog.`);
        }

        const product = mapProductRow(prodRes.rows[0])!;
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

      // 2. Validate coupon
      let couponDiscount = 0;
      if (orderPayload.couponCode) {
        const cleanCode = orderPayload.couponCode.trim().toUpperCase();
        const cRes = await client.query(
          'SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true FOR UPDATE',
          [cleanCode]
        );

        if (cRes.rows.length > 0) {
          const coupon = cRes.rows[0];
          const minOrder = Number(coupon.min_order_amount || 0);
          if (calculatedSubtotal >= minOrder) {
            if (coupon.discount_type === 'PERCENTAGE') {
              const val = Math.round((calculatedSubtotal * Number(coupon.discount_value)) / 100);
              const maxD = Number(coupon.max_discount_amount);
              couponDiscount = maxD && val > maxD ? maxD : val;
            } else {
              couponDiscount = Math.min(Number(coupon.discount_value), calculatedSubtotal);
            }

            // Increment usage count
            await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [coupon.id]);
          }
        }
      }

      // 3. Shipping & GST Calculations
      const deliveryCharge = calculatedSubtotal >= 999 ? 0 : 49;
      const grandTotal = Math.max(0, calculatedSubtotal + deliveryCharge - couponDiscount);
      const taxRate = 5; // 5% GST for apparel
      const taxableAmount = Math.round((grandTotal / (1 + taxRate / 100)) * 100) / 100;
      const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;
      const cgst = Math.round((totalGst / 2) * 100) / 100;
      const sgst = cgst;

      // 4. Atomically decrement stock in PostgreSQL
      for (const item of orderPayload.items) {
        await client.query(
          'UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = NOW() WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      // 5. Generate identifiers
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

      const pricing = {
        subtotal: calculatedSubtotal,
        deliveryCharge,
        discount: couponDiscount,
        grandTotal
      };

      const taxBreakdown = {
        taxableAmount,
        cgst,
        sgst,
        totalGst
      };

      const insertRes = await client.query(
        `INSERT INTO orders (
          id, user_id, order_status, status, payment_method, payment_status, customer,
          shipping_address, shipping_name, shipping_phone, shipping_address_line,
          shipping_city, shipping_district, shipping_state, shipping_pincode,
          tracking_token, current_location, expected_delivery_date,
          items, pricing, total_amount, tax_breakdown, courier_name,
          tracking_number, awb_number, invoice_number, estimated_delivery, timeline,
          customer_note, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18,
          $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28,
          $29, NOW(), NOW()
        ) RETURNING *`,
        [
          orderId,
          orderPayload.userId || null,
          'ORDER_PLACED',
          'ORDER_PLACED',
          orderPayload.paymentMethod,
          'PENDING',
          JSON.stringify(orderPayload.customer),
          JSON.stringify(orderPayload.shippingAddress),
          shippingName,
          shippingPhone,
          shippingAddressLine,
          shippingCity,
          shippingDistrict,
          shippingState,
          shippingPincode,
          trackingToken,
          currentLocation,
          expectedDelivery,
          JSON.stringify(verifiedItems),
          JSON.stringify(pricing),
          grandTotal,
          JSON.stringify(taxBreakdown),
          'Delhivery Express',
          trackingNumber,
          trackingNumber,
          invoiceNumber,
          expectedDelivery,
          JSON.stringify([initialTimelineEvent]),
          orderPayload.customerNote || null
        ]
      );

      // Also record in order_tracking_events
      const trackingEventId = `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await client.query(
        `INSERT INTO order_tracking_events (
          id, order_id, tracking_number, status, location, description, source, scanned_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          trackingEventId,
          orderId,
          trackingNumber,
          'ORDER_PLACED',
          currentLocation,
          orderPayload.paymentMethod === 'COD' ? 'Order Placed (Cash on Delivery)' : 'Order Placed',
          'SYSTEM',
          'SYSTEM'
        ]
      );

      await client.query('COMMIT');
      return mapOrderRow(insertRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async updateOrderStatus(
    orderId: string,
    status: string,
    courierName?: string,
    awbNumber?: string,
    note?: string
  ) {
    await this.initDatabase();
    const upperStatus = status.toUpperCase();

    const currentOrder = await this.getOrderById(orderId);
    if (!currentOrder) return null;

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

    const updatedTimeline = [...(currentOrder.timeline || []), newTimelineEvent];
    const finalCourier = courierName || currentOrder.courierName;
    const finalAwb = awbNumber || currentOrder.awbNumber;

    const res = await this.pool.query(
      `UPDATE orders SET
        order_status = $1,
        status = $1,
        payment_status = $2,
        courier_name = $3,
        awb_number = $4,
        tracking_number = $4,
        admin_note = $5,
        timeline = $6,
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [upperStatus, paymentStatus, finalCourier, finalAwb, note || currentOrder.adminNote, JSON.stringify(updatedTimeline), orderId]
    );

    return mapOrderRow(res.rows[0]);
  }

  public async updateOrderPaymentVerified(
    orderId: string,
    data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      paymentDetails: any;
    }
  ) {
    await this.initDatabase();
    const currentOrder = await this.getOrderById(orderId);
    if (!currentOrder) return null;

    const paymentTimelineEvent = {
      status: 'PAID',
      title: 'Payment Received',
      description: `Online payment of ₹${currentOrder.pricing?.grandTotal || currentOrder.totalAmount} captured successfully via Razorpay (Ref: ${data.razorpayPaymentId}).`,
      timestamp: new Date().toISOString(),
      location: 'Razorpay Gateway'
    };

    const updatedTimeline = [...(currentOrder.timeline || []), paymentTimelineEvent];

    const res = await this.pool.query(
      `UPDATE orders SET
        payment_status = 'PAID',
        order_status = 'CONFIRMED',
        status = 'CONFIRMED',
        razorpay_order_id = $1,
        razorpay_payment_id = $2,
        payment_details = $3,
        timeline = $4,
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [
        data.razorpayOrderId,
        data.razorpayPaymentId,
        JSON.stringify(data.paymentDetails),
        JSON.stringify(updatedTimeline),
        orderId
      ]
    );

    return mapOrderRow(res.rows[0]);
  }

  // --- COUPONS ---
  public async getCoupons() {
    await this.initDatabase();
    const res = await this.pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      discountType: r.discount_type,
      discountValue: Number(r.discount_value),
      minOrderAmount: Number(r.min_order_amount || 0),
      maxDiscountAmount: r.max_discount_amount ? Number(r.max_discount_amount) : undefined,
      usageLimit: Number(r.usage_limit || 500),
      usageCount: Number(r.usage_count || 0),
      isActive: Boolean(r.is_active),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));
  }

  public async validateCoupon(code: string, subtotal: number) {
    await this.initDatabase();
    const clean = code.trim().toUpperCase();
    const res = await this.pool.query(
      'SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true',
      [clean]
    );

    if (res.rows.length === 0) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
    }

    const coupon = res.rows[0];
    const minOrder = Number(coupon.min_order_amount || 0);

    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires a minimum purchase of ₹${minOrder}. Current subtotal is ₹${subtotal}.`
      };
    }

    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
      const maxDiscount = Number(coupon.max_discount_amount);
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      discount = Math.min(Number(coupon.discount_value), subtotal);
    }

    return {
      valid: true,
      discount,
      message: `Success! You saved ₹${discount} with ${coupon.code}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value)
      }
    };
  }

  // --- DASHBOARD REAL SQL METRICS ---
  public async getStats(): Promise<DbStats> {
    await this.initDatabase();

    const ordersRes = await this.pool.query(`
      SELECT
        COUNT(*)::int as total_orders,
        COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' THEN total_amount ELSE 0 END), 0)::int as total_sales,
        COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' AND created_at >= CURRENT_DATE THEN total_amount ELSE 0 END), 0)::int as today_sales,
        COUNT(CASE WHEN order_status NOT IN ('DELIVERED', 'CANCELLED') THEN 1 END)::int as pending_orders,
        COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END)::int as delivered_orders,
        COUNT(CASE WHEN order_status = 'CANCELLED' THEN 1 END)::int as cancelled_orders,
        COUNT(DISTINCT customer->>'mobileNumber')::int as total_customers
      FROM orders
    `);

    const productsRes = await this.pool.query(`
      SELECT
        COUNT(*)::int as total_products,
        COUNT(CASE WHEN stock < 5 THEN 1 END)::int as low_stock_count
      FROM products
    `);

    const oRow = ordersRes.rows[0] || {};
    const pRow = productsRes.rows[0] || {};

    return {
      totalSales: oRow.total_sales || 0,
      todaySales: oRow.today_sales || 0,
      totalOrders: oRow.total_orders || 0,
      pendingOrders: oRow.pending_orders || 0,
      deliveredOrders: oRow.delivered_orders || 0,
      cancelledOrders: oRow.cancelled_orders || 0,
      totalCustomers: oRow.total_customers || 0,
      totalProducts: pRow.total_products || 0,
      lowStockCount: pRow.low_stock_count || 0
    };
  }

  // --- USERS & AUTH ---
  public async getUserByEmailOrMobile(identifier: string) {
    await this.initDatabase();
    const clean = identifier.trim().toLowerCase();
    const res = await this.pool.query(
      `SELECT id, uid, email, phone, password_hash as "passwordHash", full_name as "fullName", role, is_active as "isActive", created_at as "createdAt"
       FROM users WHERE LOWER(email) = $1 OR phone = $1 OR phone = $2 LIMIT 1`,
      [clean, identifier.replace(/\D/g, '').slice(-10)]
    );
    return res.rows[0] || null;
  }

  public async getUserById(id: string) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, uid, email, phone, password_hash as "passwordHash", full_name as "fullName", role, is_active as "isActive", created_at as "createdAt"
       FROM users WHERE id::text = $1 OR uid = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async createUser(userData: {
    fullName: string;
    email?: string;
    mobile: string;
    password?: string;
  }) {
    await this.initDatabase();
    const passwordHash = userData.password ? bcrypt.hashSync(userData.password, 10) : null;
    const uid = `usr-${Date.now()}`;

    const res = await this.pool.query(
      `INSERT INTO users (uid, full_name, email, phone, password_hash, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, 'CUSTOMER', true, NOW())
       RETURNING id, uid, email, phone as mobile, full_name as "fullName", role, is_active as "isActive", created_at as "createdAt"`,
      [
        uid,
        userData.fullName.trim(),
        userData.email?.trim().toLowerCase() || null,
        userData.mobile.trim(),
        passwordHash
      ]
    );

    return res.rows[0];
  }

  // --- ADMINS ---
  public async getAdminByUsername(username: string) {
    await this.initDatabase();
    const clean = username.trim().toLowerCase();
    const res = await this.pool.query(
      `SELECT id, username, password_hash as "passwordHash", full_name as "fullName", role, phone, email, is_active as "isActive", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM admins WHERE LOWER(username) = $1 AND is_active = true LIMIT 1`,
      [clean]
    );
    return res.rows[0] || null;
  }

  public async getAdmins() {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, username, full_name as "fullName", role, phone, email, is_active as "isActive", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM admins ORDER BY created_at ASC`
    );
    return res.rows;
  }

  public async createAdmin(data: {
    username: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
    email?: string;
  }) {
    await this.initDatabase();
    const existing = await this.getAdminByUsername(data.username);
    if (existing) {
      throw new Error(`Username "${data.username}" is already taken.`);
    }

    const passwordHash = bcrypt.hashSync(data.password.trim(), 10);
    const id = `ADM-${Math.floor(100 + Math.random() * 900)}`;

    const res = await this.pool.query(
      `INSERT INTO admins (id, username, password_hash, full_name, role, phone, email, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       RETURNING id, username, full_name as "fullName", role, phone, email, is_active as "isActive", created_at as "createdAt"`,
      [
        id,
        data.username.trim().toLowerCase(),
        passwordHash,
        data.fullName.trim(),
        data.role || 'STORE_MANAGER',
        data.phone?.trim() || null,
        data.email?.trim() || null
      ]
    );

    return res.rows[0];
  }

  public async updateAdminPassword(adminId: string, newPassword: string) {
    await this.initDatabase();
    const passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
    const res = await this.pool.query(
      'UPDATE admins SET password_hash = $1 WHERE id = $2',
      [passwordHash, adminId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async updateAdmin(adminId: string, updates: {
    isActive?: boolean;
    role?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    password?: string;
  }) {
    await this.initDatabase();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(updates.isActive);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.fullName);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(updates.email);
    }
    if (updates.password) {
      fields.push(`password_hash = $${idx++}`);
      values.push(bcrypt.hashSync(updates.password.trim(), 10));
    }

    if (fields.length === 0) return true;

    values.push(adminId);
    const query = `UPDATE admins SET ${fields.join(', ')} WHERE id = $${idx}`;
    const res = await this.pool.query(query, values);
    return (res.rowCount ?? 0) > 0;
  }

  public async deleteAdmin(adminId: string) {
    await this.initDatabase();
    const res = await this.pool.query('DELETE FROM admins WHERE id = $1', [adminId]);
    return (res.rowCount ?? 0) > 0;
  }

  // --- SETTINGS ---
  public async getSettings() {
    await this.initDatabase();
    const res = await this.pool.query('SELECT settings FROM store_settings WHERE id = $1', ['default']);
    if (res.rows.length === 0) {
      return {
        storeName: STORE_CONFIG.name,
        tagline: STORE_CONFIG.tagline,
        contactEmail: STORE_CONFIG.email,
        supportPhone: STORE_CONFIG.phone,
        ownerName: 'Meraj Alam',
        gstin: STORE_CONFIG.gstin,
        defaultTaxRate: 5,
        freeShippingThreshold: STORE_CONFIG.freeShippingThreshold,
        standardShippingFee: 49,
        isCodEnabled: true,
        isOnlinePaymentEnabled: true,
        address: STORE_CONFIG.address
      };
    }
    return typeof res.rows[0].settings === 'string' ? JSON.parse(res.rows[0].settings) : res.rows[0].settings;
  }

  public async updateSettings(updates: Record<string, any>) {
    await this.initDatabase();
    const current = await this.getSettings();
    const merged = { ...current, ...updates };

    await this.pool.query(
      'INSERT INTO store_settings (id, settings, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET settings = $2, updated_at = NOW()',
      ['default', JSON.stringify(merged)]
    );
    return merged;
  }

  // --- CUSTOMER PROFILE ---
  public async getCustomerProfile(userId: string | number) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, uid, email, phone as mobile, full_name as "fullName",
              date_of_birth as "dateOfBirth", gender, role,
              is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
       FROM users
       WHERE id::text = $1 OR uid = $1
       LIMIT 1`,
      [String(userId)]
    );
    return res.rows[0] || null;
  }

  public async updateCustomerProfile(userId: string | number, data: {
    fullName: string;
    mobile: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
  }) {
    await this.initDatabase();
    const res = await this.pool.query(
      `UPDATE users
       SET full_name = $1,
           phone = $2,
           email = $3,
           date_of_birth = $4,
           gender = $5,
           updated_at = NOW()
       WHERE id::text = $6 OR uid = $6
       RETURNING id, uid, email, phone as mobile, full_name as "fullName",
                 date_of_birth as "dateOfBirth", gender, role,
                 is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        data.fullName.trim(),
        data.mobile.trim(),
        data.email?.trim().toLowerCase() || null,
        data.dateOfBirth?.trim() || null,
        data.gender?.trim() || null,
        String(userId)
      ]
    );
    return res.rows[0] || null;
  }

  // --- CUSTOMER ADDRESSES ---
  public async getCustomerAddresses(userId: string | number) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, user_id as "userId", full_name as "fullName", mobile_number as "mobileNumber",
              house_building as "houseBuilding", street_area as "streetArea",
              village_town_city as "villageTownCity", post_office as "postOffice",
              district, state, pin_code as "pinCode", landmark,
              address_type as "addressType", is_default as "isDefault",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM customer_addresses
       WHERE user_id::text = $1
       ORDER BY is_default DESC, created_at DESC`,
      [String(userId)]
    );
    return res.rows;
  }

  public async createCustomerAddress(userId: string | number, addr: {
    fullName: string;
    mobileNumber: string;
    houseBuilding: string;
    streetArea: string;
    villageTownCity: string;
    postOffice?: string;
    district: string;
    state: string;
    pinCode: string;
    landmark?: string;
    addressType?: string;
    isDefault?: boolean;
  }) {
    await this.initDatabase();
    const id = `addr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Check if user has any existing addresses
    const countRes = await this.pool.query(
      'SELECT count(*)::int as count FROM customer_addresses WHERE user_id::text = $1',
      [String(userId)]
    );
    const shouldBeDefault = addr.isDefault || countRes.rows[0].count === 0;

    if (shouldBeDefault) {
      // Clear other defaults
      await this.pool.query(
        'UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1',
        [String(userId)]
      );
    }

    const res = await this.pool.query(
      `INSERT INTO customer_addresses (
        id, user_id, full_name, mobile_number, house_building, street_area,
        village_town_city, post_office, district, state, pin_code, landmark,
        address_type, is_default, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id, user_id as "userId", full_name as "fullName", mobile_number as "mobileNumber",
                house_building as "houseBuilding", street_area as "streetArea",
                village_town_city as "villageTownCity", post_office as "postOffice",
                district, state, pin_code as "pinCode", landmark,
                address_type as "addressType", is_default as "isDefault",
                created_at as "createdAt", updated_at as "updatedAt"`,
      [
        id,
        Number(userId),
        addr.fullName.trim(),
        addr.mobileNumber.trim(),
        addr.houseBuilding.trim(),
        addr.streetArea.trim(),
        addr.villageTownCity.trim(),
        addr.postOffice?.trim() || null,
        addr.district.trim(),
        addr.state.trim(),
        addr.pinCode.trim(),
        addr.landmark?.trim() || null,
        addr.addressType || 'HOME',
        shouldBeDefault
      ]
    );

    return res.rows[0];
  }

  public async updateCustomerAddress(addressId: string, userId: string | number, addr: {
    fullName: string;
    mobileNumber: string;
    houseBuilding: string;
    streetArea: string;
    villageTownCity: string;
    postOffice?: string;
    district: string;
    state: string;
    pinCode: string;
    landmark?: string;
    addressType?: string;
    isDefault?: boolean;
  }) {
    await this.initDatabase();

    if (addr.isDefault) {
      await this.pool.query(
        'UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1',
        [String(userId)]
      );
    }

    const res = await this.pool.query(
      `UPDATE customer_addresses SET
        full_name = $1,
        mobile_number = $2,
        house_building = $3,
        street_area = $4,
        village_town_city = $5,
        post_office = $6,
        district = $7,
        state = $8,
        pin_code = $9,
        landmark = $10,
        address_type = $11,
        is_default = COALESCE($12, is_default),
        updated_at = NOW()
       WHERE id = $13 AND user_id::text = $14
       RETURNING id, user_id as "userId", full_name as "fullName", mobile_number as "mobileNumber",
                 house_building as "houseBuilding", street_area as "streetArea",
                 village_town_city as "villageTownCity", post_office as "postOffice",
                 district, state, pin_code as "pinCode", landmark,
                 address_type as "addressType", is_default as "isDefault",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [
        addr.fullName.trim(),
        addr.mobileNumber.trim(),
        addr.houseBuilding.trim(),
        addr.streetArea.trim(),
        addr.villageTownCity.trim(),
        addr.postOffice?.trim() || null,
        addr.district.trim(),
        addr.state.trim(),
        addr.pinCode.trim(),
        addr.landmark?.trim() || null,
        addr.addressType || 'HOME',
        addr.isDefault !== undefined ? addr.isDefault : null,
        addressId,
        String(userId)
      ]
    );

    return res.rows[0] || null;
  }

  public async deleteCustomerAddress(addressId: string, userId: string | number) {
    await this.initDatabase();
    const res = await this.pool.query(
      'DELETE FROM customer_addresses WHERE id = $1 AND user_id::text = $2 RETURNING is_default',
      [addressId, String(userId)]
    );
    if ((res.rowCount ?? 0) > 0 && res.rows[0]?.is_default) {
      // Pick another address to become default if available
      await this.pool.query(
        `UPDATE customer_addresses
         SET is_default = true, updated_at = NOW()
         WHERE id = (SELECT id FROM customer_addresses WHERE user_id::text = $1 ORDER BY created_at DESC LIMIT 1)`,
        [String(userId)]
      );
    }
    return (res.rowCount ?? 0) > 0;
  }

  public async setDefaultCustomerAddress(addressId: string, userId: string | number) {
    await this.initDatabase();
    await this.pool.query(
      'UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1',
      [String(userId)]
    );
    const res = await this.pool.query(
      'UPDATE customer_addresses SET is_default = true, updated_at = NOW() WHERE id = $1 AND user_id::text = $2 RETURNING id',
      [addressId, String(userId)]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // --- POSTAL CODES ---
  public async lookupPostalCode(pincode: string) {
    await this.initDatabase();
    const clean = pincode.replace(/\D/g, '');
    const res = await this.pool.query(
      `SELECT id, pincode, post_office as "postOffice", district, state, city
       FROM postal_codes
       WHERE pincode = $1
       ORDER BY post_office ASC`,
      [clean]
    );
    return res.rows;
  }

  // --- CUSTOMER ORDERS ---
  public async getCustomerOrders(userId: string | number, mobile?: string, email?: string) {
    await this.initDatabase();
    let sql = 'SELECT * FROM orders WHERE user_id::text = $1';
    const params: any[] = [String(userId)];

    if (mobile || email) {
      const orClauses: string[] = [];
      if (mobile) {
        params.push(mobile.replace(/\D/g, '').slice(-10));
        orClauses.push(`customer->>'mobileNumber' LIKE '%' || $${params.length}`);
      }
      if (email) {
        params.push(email.trim().toLowerCase());
        orClauses.push(`LOWER(customer->>'email') = $${params.length}`);
      }
      if (orClauses.length > 0) {
        sql = `SELECT * FROM orders WHERE (user_id::text = $1 OR ${orClauses.join(' OR ')})`;
      }
    }

    sql += ' ORDER BY created_at DESC';
    const res = await this.pool.query(sql, params);
    return res.rows.map(mapOrderRow);
  }

  // --- ORDER TRACKING & QR EVENTS ---
  public async getOrderByTrackingToken(tokenOrTracking: string) {
    await this.initDatabase();
    const clean = tokenOrTracking.trim();
    const res = await this.pool.query(
      `SELECT * FROM orders
       WHERE tracking_token = $1
          OR UPPER(tracking_number) = UPPER($1)
          OR UPPER(id) = UPPER($1)
       LIMIT 1`,
      [clean]
    );
    return mapOrderRow(res.rows[0]);
  }

  public async getOrderTrackingEvents(orderId: string) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, order_id as "orderId", tracking_number as "trackingNumber",
              status, location, description, source, scanned_by as "scannedBy",
              created_at as "createdAt"
       FROM order_tracking_events
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [orderId]
    );
    return res.rows;
  }

  public async addOrderTrackingEvent(payload: {
    orderId: string;
    status: string;
    location?: string;
    description: string;
    source?: 'ADMIN' | 'COURIER' | 'WAREHOUSE' | 'SYSTEM';
    scannedBy?: string;
    courierName?: string;
    awbNumber?: string;
  }) {
    await this.initDatabase();
    const order = await this.getOrderById(payload.orderId);
    if (!order) return null;

    const eventId = `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const upperStatus = payload.status.toUpperCase();
    const trackingNum = payload.awbNumber || order.trackingNumber || `DEL-${Date.now().toString().slice(-7)}`;

    // Insert into order_tracking_events
    await this.pool.query(
      `INSERT INTO order_tracking_events (
        id, order_id, tracking_number, status, location, description, source, scanned_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        eventId,
        order.id,
        trackingNum,
        upperStatus,
        payload.location || null,
        payload.description,
        payload.source || 'ADMIN',
        payload.scannedBy || 'STAFF'
      ]
    );

    // Update order status, location, courier, timeline
    const newTimelineItem = {
      status: upperStatus,
      title: upperStatus.replace(/_/g, ' '),
      description: payload.description,
      location: payload.location,
      timestamp: new Date().toISOString()
    };

    const updatedTimeline = [...(order.timeline || []), newTimelineItem];
    let paymentStatus = order.paymentStatus;
    if (upperStatus === 'DELIVERED') {
      paymentStatus = 'PAID';
    } else if (upperStatus === 'CANCELLED' && order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID') {
      paymentStatus = 'REFUNDED';
    } else if (upperStatus === 'REFUNDED') {
      paymentStatus = 'REFUNDED';
    }

    const res = await this.pool.query(
      `UPDATE orders SET
        order_status = $1,
        status = $1,
        payment_status = $2,
        current_location = COALESCE($3, current_location),
        courier_name = COALESCE($4, courier_name),
        awb_number = COALESCE($5, awb_number),
        tracking_number = COALESCE($5, tracking_number),
        timeline = $6,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        upperStatus,
        paymentStatus,
        payload.location || null,
        payload.courierName || null,
        payload.awbNumber || null,
        JSON.stringify(updatedTimeline),
        order.id
      ]
    );

    return {
      order: mapOrderRow(res.rows[0]),
      event: {
        id: eventId,
        orderId: order.id,
        trackingNumber: trackingNum,
        status: upperStatus,
        location: payload.location,
        description: payload.description,
        source: payload.source || 'ADMIN',
        scannedBy: payload.scannedBy,
        createdAt: new Date().toISOString()
      }
    };
  }

  public async recordQrScan(payload: {
    orderId: string;
    trackingNumber: string;
    scannedBy?: string;
    scannerType: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'COURIER';
    location?: string;
  }) {
    await this.initDatabase();
    const id = `scan-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await this.pool.query(
      `INSERT INTO qr_scan_events (
        id, order_id, tracking_number, scanned_by, scanner_type, location, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        id,
        payload.orderId,
        payload.trackingNumber,
        payload.scannedBy || null,
        payload.scannerType,
        payload.location || null
      ]
    );
    return id;
  }
}

export const db = new PostgresDatabaseManager();
