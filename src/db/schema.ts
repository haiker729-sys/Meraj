import { pgTable, text, integer, boolean, timestamp, jsonb, doublePrecision, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email'),
  phone: text('phone'),
  passwordHash: text('password_hash'),
  fullName: text('full_name'),
  role: text('role').default('CUSTOMER'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const admins = pgTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('STORE_MANAGER'),
  phone: text('phone'),
  email: text('email'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  categoryId: text('category_id'),
  category: text('category'),
  subCategory: text('sub_category'),
  description: text('description'),
  price: integer('price').notNull(),
  mrp: integer('mrp').notNull(),
  discount: integer('discount').default(0),
  sizes: jsonb('sizes'),
  colors: jsonb('colors'),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
  status: text('status').default('PUBLISHED'),
  isFeatured: boolean('is_featured').default(false),
  isNewArrival: boolean('is_new_arrival').default(false),
  isBestseller: boolean('is_bestseller').default(false),
  isActive: boolean('is_active').default(true),
  images: jsonb('images'),
  rating: doublePrecision('rating').default(4.8),
  reviewsCount: integer('reviews_count').default(0),
  material: text('material'),
  careInstructions: text('care_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(),
  minOrderAmount: integer('min_order_amount').default(0),
  maxDiscountAmount: integer('max_discount_amount'),
  usageLimit: integer('usage_limit').default(500),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  orderStatus: text('order_status').notNull().default('NEW'),
  status: text('status').notNull().default('NEW'),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull().default('PENDING'),
  customer: jsonb('customer').notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  items: jsonb('items').notNull(),
  pricing: jsonb('pricing').notNull(),
  totalAmount: integer('total_amount').notNull(),
  taxBreakdown: jsonb('tax_breakdown'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  courierName: text('courier_name').default('Delhivery Express'),
  trackingNumber: text('tracking_number'),
  awbNumber: text('awb_number'),
  invoiceNumber: text('invoice_number'),
  estimatedDelivery: text('estimated_delivery').default('3 - 5 Business Days'),
  timeline: jsonb('timeline'),
  customerNote: text('customer_note'),
  adminNote: text('admin_note'),
  paymentDetails: jsonb('payment_details'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const banners = pgTable('banners', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  ctaText: text('cta_text'),
  link: text('link'),
  badge: text('badge'),
  image: text('image').notNull(),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
});

export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey().default('default'),
  settings: jsonb('settings').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
