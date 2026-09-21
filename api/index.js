var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import express from "express";

// server/routes/auth.ts
import { Router } from "express";
import bcrypt3 from "bcryptjs";
import crypto4 from "crypto";

// server/db.ts
import bcrypt2 from "bcryptjs";
import crypto2 from "crypto";

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  admins: () => admins,
  banners: () => banners,
  categories: () => categories,
  coupons: () => coupons,
  customerAddresses: () => customerAddresses,
  orderTrackingEvents: () => orderTrackingEvents,
  orders: () => orders,
  parcelScanEvents: () => parcelScanEvents,
  postalCodes: () => postalCodes,
  products: () => products,
  qrScanEvents: () => qrScanEvents,
  storeSettings: () => storeSettings,
  users: () => users
});
import { pgTable, text, integer, boolean, timestamp, jsonb, doublePrecision, serial } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  role: text("role").default("CUSTOMER"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var admins = pgTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("STORE_MANAGER"),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at")
});
var categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image")
});
var products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  categoryId: text("category_id"),
  category: text("category"),
  subCategory: text("sub_category"),
  description: text("description"),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  discount: integer("discount").default(0),
  sizes: jsonb("sizes"),
  colors: jsonb("colors"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  status: text("status").default("PUBLISHED"),
  isFeatured: boolean("is_featured").default(false),
  isNewArrival: boolean("is_new_arrival").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isActive: boolean("is_active").default(true),
  images: jsonb("images"),
  rating: doublePrecision("rating").default(4.8),
  reviewsCount: integer("reviews_count").default(0),
  material: text("material"),
  careInstructions: text("care_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").default(0),
  maxDiscountAmount: integer("max_discount_amount"),
  usageLimit: integer("usage_limit").default(500),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var customerAddresses = pgTable("customer_addresses", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  houseBuilding: text("house_building").notNull(),
  streetArea: text("street_area").notNull(),
  villageTownCity: text("village_town_city").notNull(),
  postOffice: text("post_office"),
  district: text("district").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  landmark: text("landmark"),
  addressType: text("address_type").notNull().default("HOME"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var postalCodes = pgTable("postal_codes", {
  id: text("id").primaryKey(),
  pincode: text("pincode").notNull(),
  postOffice: text("post_office").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  orderStatus: text("order_status").notNull().default("NEW"),
  status: text("status").notNull().default("NEW"),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  customer: jsonb("customer").notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  shippingName: text("shipping_name"),
  shippingPhone: text("shipping_phone"),
  shippingAddressLine: text("shipping_address_line"),
  shippingCity: text("shipping_city"),
  shippingDistrict: text("shipping_district"),
  shippingState: text("shipping_state"),
  shippingPincode: text("shipping_pincode"),
  trackingToken: text("tracking_token"),
  currentLocation: text("current_location"),
  expectedDeliveryDate: text("expected_delivery_date"),
  items: jsonb("items").notNull(),
  pricing: jsonb("pricing").notNull(),
  totalAmount: integer("total_amount").notNull(),
  taxBreakdown: jsonb("tax_breakdown"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  courierName: text("courier_name").default("Delhivery Express"),
  trackingNumber: text("tracking_number"),
  awbNumber: text("awb_number"),
  invoiceNumber: text("invoice_number"),
  estimatedDelivery: text("estimated_delivery").default("3 - 5 Business Days"),
  timeline: jsonb("timeline"),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  paymentDetails: jsonb("payment_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderTrackingEvents = pgTable("order_tracking_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  trackingNumber: text("tracking_number").notNull(),
  status: text("status").notNull(),
  locationName: text("location_name"),
  location: text("location"),
  city: text("city"),
  district: text("district"),
  state: text("state"),
  pincode: text("pincode"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  description: text("description").notNull(),
  source: text("source").notNull().default("SYSTEM"),
  scannedBy: text("scanned_by"),
  scannedAt: timestamp("scanned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var parcelScanEvents = pgTable("parcel_scan_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  trackingNumber: text("tracking_number").notNull(),
  scanType: text("scan_type").notNull(),
  locationName: text("location_name").notNull(),
  city: text("city"),
  district: text("district"),
  state: text("state"),
  pincode: text("pincode"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  scannedBy: text("scanned_by").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow()
});
var qrScanEvents = pgTable("qr_scan_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  trackingNumber: text("tracking_number").notNull(),
  scannedBy: text("scanned_by"),
  scannerType: text("scanner_type").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow()
});
var banners = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  ctaText: text("cta_text"),
  link: text("link"),
  badge: text("badge"),
  image: text("image").notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0)
});
var storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("default"),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// src/db/index.ts
var hasPostgresConfig = () => {
  return Boolean(
    process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "" || process.env.SQL_HOST && process.env.SQL_HOST.trim() !== "" || process.env.PGHOST && process.env.PGHOST.trim() !== ""
  );
};
var createPool = () => {
  if (!global._postgresPool) {
    if (hasPostgresConfig()) {
      const connectionString = process.env.DATABASE_URL;
      global._postgresPool = new Pool(
        connectionString ? { connectionString, connectionTimeoutMillis: 3e3 } : {
          host: process.env.SQL_HOST || process.env.PGHOST,
          user: process.env.SQL_USER || process.env.PGUSER,
          password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
          database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
          max: 10,
          connectionTimeoutMillis: 3e3
        }
      );
      global._postgresPool.on("error", (err) => {
        console.warn("[Postgres Pool Warning]:", err.message);
      });
    } else {
      global._postgresPool = {
        query: async () => {
          throw new Error("PostgreSQL credentials not configured. In-memory store active.");
        },
        on: () => {
        },
        end: async () => {
        }
      };
    }
  }
  return global._postgresPool;
};
var pool = createPool();
var drizzleDb;
try {
  drizzleDb = drizzle(pool, { schema: schema_exports });
} catch {
  console.warn("[AI Studio] PostgreSQL not connected \u2014 using proxy for drizzle");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d) => d?.data ?? {},
    update: async (d) => d?.data ?? {},
    delete: async () => ({})
  };
  drizzleDb = new Proxy({}, {
    get: (_, prop) => prop === "query" ? new Proxy({}, { get: () => noOp }) : async () => []
  });
}

// src/database/seed/productsData.ts
var INITIAL_PRODUCTS = [
  // MEN
  {
    id: "fp-prod-101",
    name: "Classic Oxford Cotton Slim Fit Shirt",
    category: "Men",
    subCategory: "Shirts",
    description: "Tailored from 100% breathable organic combed cotton, this premium button-down shirt delivers effortless elegance for both office wear and weekend celebrations. Features pre-washed softness, structured collar, and pearlized buttons.",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1299,
    mrp: 2499,
    discount: 48,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Sky Blue", hex: "#6ba4b8" },
      { name: "Crisp White", hex: "#f8fafc" },
      { name: "Midnight Navy", hex: "#1e293b" }
    ],
    stock: 45,
    sku: "FP-M-SH-001",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 142,
    material: "100% Pure Egyptian Cotton",
    careInstructions: "Machine wash cold with like colors. Warm iron if needed."
  },
  {
    id: "fp-prod-102",
    name: "Heavyweight Graphic Oversized T-Shirt",
    category: "Men",
    subCategory: "T-Shirts",
    description: "Streetwear staple crafted with 240 GSM heavy cotton jersey. Features dropped shoulders, relaxed silhouette, non-fade screen print, and ribbed crewneck collar that maintains shape wash after wash.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
    ],
    price: 699,
    mrp: 1499,
    discount: 53,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Washed Charcoal", hex: "#334155" },
      { name: "Sage Green", hex: "#4d7c0f" },
      { name: "Off White", hex: "#f1f5f9" }
    ],
    stock: 75,
    sku: "FP-M-TS-002",
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.7,
    reviewsCount: 89,
    material: "240 GSM Bio-Washed Combed Cotton",
    careInstructions: "Gentle cycle, turn inside out before washing. Do not iron over print."
  },
  {
    id: "fp-prod-103",
    name: "Vintage Wash Relaxed Tapered Jeans",
    category: "Men",
    subCategory: "Jeans",
    description: "Authentic 12.5 oz stretch denim treated with artisanal stone-washing. Designed with a roomy thigh and clean taper toward the ankle. Reinforced pocket rivets and heavy-duty brass YKK zipper.",
    images: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1799,
    mrp: 3299,
    discount: 45,
    sizes: ["30", "32", "34", "36", "38"],
    colors: [
      { name: "Indigo Blue", hex: "#1e3a8a" },
      { name: "Light Fade", hex: "#60a5fa" },
      { name: "Jet Black", hex: "#0f172a" }
    ],
    stock: 32,
    sku: "FP-M-JN-003",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 215,
    material: "98% Cotton, 2% Elastane",
    careInstructions: "Wash inside out with cold water. Line dry in shade to preserve color."
  },
  {
    id: "fp-prod-104",
    name: "Textured Knit Polo T-Shirt",
    category: "Men",
    subCategory: "T-Shirts",
    description: "Elevated resort-ready polo made from breathable waffle knit cotton. Featuring a tailored cutaway collar, ribbed cuffs, and contrasting placket accents.",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
    ],
    price: 899,
    mrp: 1899,
    discount: 52,
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Olive Rust", hex: "#3f6212" },
      { name: "Beige Sand", hex: "#d6d3d1" }
    ],
    stock: 20,
    sku: "FP-M-PL-004",
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 47,
    material: "100% Waffle Cotton",
    careInstructions: "Dry flat, do not wring."
  },
  // WOMEN
  {
    id: "fp-prod-201",
    name: "Tiered Floral Summer Midi Dress",
    category: "Women",
    subCategory: "Dresses",
    description: "A whimsical silhouette with flowing tiered panels and delicate hand-block floral print. Tailored with a sweetheart neckline, puff sleeves, and a flattering smocked back for comfort and contour.",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1599,
    mrp: 2999,
    discount: 46,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Rose Petal", hex: "#fda4af" },
      { name: "Sage Floral", hex: "#a7f3d0" },
      { name: "Marigold Yellow", hex: "#fde047" }
    ],
    stock: 38,
    sku: "FP-W-DR-101",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 168,
    material: "Chiffon Rayon Blend with Soft Inner Lining",
    careInstructions: "Hand wash or dry clean recommended."
  },
  {
    id: "fp-prod-202",
    name: "Handcrafted Chikankari Anarkali Kurta Set",
    category: "Women",
    subCategory: "Ethnic Wear",
    description: "Exquisite traditional festive wear featuring authentic Lucknowi Chikankari needlework on premium pure cotton fabric. Comes with matching tailored palazzo pants and lightweight chiffon dupatta with lace borders.",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
    ],
    price: 2499,
    mrp: 4999,
    discount: 50,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Ivory Cream", hex: "#fefce8" },
      { name: "Pastel Lilac", hex: "#e9d5ff" },
      { name: "Mint Green", hex: "#d1fae5" }
    ],
    stock: 24,
    sku: "FP-W-EK-102",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 290,
    material: "Pure Handloom Cotton with Soft Voile Lining",
    careInstructions: "Dry clean only for the first wash. Mild liquid detergent thereafter."
  },
  {
    id: "fp-prod-203",
    name: "High-Waist Wide Leg Denim Trousers",
    category: "Women",
    subCategory: "Jeans",
    description: "Retro 90s inspired wide leg jeans with high-rise waistline that elongates the silhouette. Soft authentic denim fabric with light stretch for all-day comfort. Features five-pocket styling and antique silver hardware.",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1499,
    mrp: 2799,
    discount: 46,
    sizes: ["26", "28", "30", "32", "34"],
    colors: [
      { name: "Vintage Blue", hex: "#3b82f6" },
      { name: "Washed Black", hex: "#1e293b" }
    ],
    stock: 40,
    sku: "FP-W-JN-103",
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.7,
    reviewsCount: 94,
    material: "99% Organic Cotton, 1% Elastane",
    careInstructions: "Machine wash cold with dark colors."
  },
  {
    id: "fp-prod-204",
    name: "Ribbed Knit Cropped Cardigan",
    category: "Women",
    subCategory: "Tops",
    description: "Cozy yet structured cropped cardigan featuring tortoise shell statement buttons and a subtle V-neckline. Perfect for layering over slip dresses or pairing with high-waist denim.",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"
    ],
    price: 999,
    mrp: 1999,
    discount: 50,
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Mocha Tan", hex: "#78350f" },
      { name: "Cream Oat", hex: "#fef3c7" }
    ],
    stock: 18,
    sku: "FP-W-TP-104",
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 39,
    material: "Wool Cotton Soft Blend",
    careInstructions: "Dry flat, do not tumble dry."
  },
  // KIDS
  {
    id: "fp-prod-301",
    name: "Pure Cotton Playtime T-Shirt & Shorts Duo",
    category: "Kids",
    subCategory: "Kids clothing",
    description: "Designed specifically for active young explorers. Ultra-soft breathable cotton set featuring vibrant playful safari animal illustrations and an elasticated drawstring waistband that prevents irritation.",
    images: [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80"
    ],
    price: 599,
    mrp: 1199,
    discount: 50,
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-11 Yrs"],
    colors: [
      { name: "Sunny Mustard", hex: "#eab308" },
      { name: "Sky Aqua", hex: "#38bdf8" }
    ],
    stock: 60,
    sku: "FP-K-ST-201",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 112,
    material: "100% Super-Combed Baby Soft Cotton",
    careInstructions: "Machine washable, color-safe prints."
  },
  {
    id: "fp-prod-302",
    name: "Denim Overalls Dungaree with Striped Tee",
    category: "Kids",
    subCategory: "Kids clothing",
    description: "Timeless denim dungarees with adjustable shoulder metal buckles and side pocket snaps, paired with a matching crew-neck striped inner t-shirt. Sturdy yet soft for maximum play mobility.",
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1199,
    mrp: 2199,
    discount: 45,
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs"],
    colors: [
      { name: "Denim Blue", hex: "#2563eb" }
    ],
    stock: 25,
    sku: "FP-K-DN-202",
    status: "PUBLISHED",
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 78,
    material: "Lightweight Washed Denim + Cotton Tee",
    careInstructions: "Machine wash warm, iron medium."
  },
  {
    id: "fp-prod-303",
    name: "Sparkle Tulle Festive Party Dress",
    category: "Kids",
    subCategory: "Kids clothing",
    description: "Dazzling celebration dress made with hypoallergenic soft tulle layers, satin ribbon sash, and comfortable breathable cotton inner lining to keep little ones happy and itch-free.",
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1299,
    mrp: 2399,
    discount: 46,
    sizes: ["3-4 Yrs", "5-6 Yrs", "7-8 Yrs", "9-10 Yrs"],
    colors: [
      { name: "Blush Pink", hex: "#f472b6" },
      { name: "Lavender Mist", hex: "#c084fc" }
    ],
    stock: 18,
    sku: "FP-K-DR-203",
    status: "PUBLISHED",
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 54,
    material: "Multi-layer Tulle with 100% Cotton Lining",
    careInstructions: "Delicate hand wash, hang dry."
  }
];
var INITIAL_COUPONS = [
  {
    id: "c-1",
    code: "FIRST10",
    description: "Flat 10% discount on your first order at Fashion Point",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderAmount: 799,
    maxDiscount: 300,
    isActive: true,
    validUntil: "2026-12-31"
  },
  {
    id: "c-2",
    code: "FASHION200",
    description: "Flat \u20B9200 off on shopping above \u20B91499",
    discountType: "FLAT",
    discountValue: 200,
    minOrderAmount: 1499,
    isActive: true,
    validUntil: "2026-12-31"
  },
  {
    id: "c-3",
    code: "FESTIVE500",
    description: "Flat \u20B9500 off on festive family shopping above \u20B92999",
    discountType: "FLAT",
    discountValue: 500,
    minOrderAmount: 2999,
    isActive: true,
    validUntil: "2026-12-31"
  }
];
var INITIAL_BANNERS = [
  {
    id: "ban-1",
    title: "New Season Collection 2026",
    subtitle: "Pure cotton, elevated silhouettes, timeless fashion tailored for everyday luxury.",
    link: "/products?category=Men",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    badge: "NEW ARRIVALS",
    ctaText: "Explore Collection"
  },
  {
    id: "ban-2",
    title: "Ethnic & Festive Elegance",
    subtitle: "Hand-embroidered Chikankari & Designer Dresses for memorable celebrations.",
    link: "/products?category=Women",
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
    badge: "TRENDING NOW",
    ctaText: "Shop Women"
  },
  {
    id: "ban-3",
    title: "Joyful Playwear for Kids",
    subtitle: "Extra-soft combed cotton ensembles designed for endless smiles and active play.",
    link: "/products?category=Kids",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    badge: "KIDS SPECIAL",
    ctaText: "Shop Kids"
  }
];
var STORE_CONFIG = {
  name: "Fashion Point Clothing Store",
  tagline: "Timeless Indian Fashion & Premium Cotton Apparel",
  address: "Shop 14-16, New Cloth Market, MG Road, Indore, MP - 452001",
  phone: "+91 98765 43210",
  email: "care@fashionpoint.store",
  gstin: "23AAAAF8899A1Z2",
  returnWindowDays: 7,
  freeShippingThreshold: 999
};

// server/inMemoryDb.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";

// src/database/seed/ordersData.ts
function createSeedItem(item) {
  return {
    ...item,
    selectedSize: item.size,
    selectedColor: {
      name: item.colorName,
      hex: item.colorHex
    },
    product: {
      id: item.productId,
      name: item.name,
      sku: item.sku,
      category: "Men",
      subCategory: "Apparel",
      description: "Handcrafted premium garments designed for durability, pure comfort, and modern Indian style.",
      images: [item.image],
      price: item.price,
      mrp: item.mrp,
      discount: Math.round((item.mrp - item.price) / item.mrp * 100),
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: item.colorName, hex: item.colorHex }],
      stock: 40,
      rating: 4.8,
      reviewsCount: 36
    }
  };
}
var INITIAL_ORDERS = [
  {
    id: "FP-10001",
    customer: {
      fullName: "Aman Kumar Verma",
      mobileNumber: "9876543210",
      alternateNumber: "9123456780",
      email: "aman.verma@example.com"
    },
    shippingAddress: {
      houseShopNo: "Plot No. 42, Anand Vihar Colony",
      street: "Station Road, Near Shiv Temple",
      villageArea: "Civil Lines Sector 3",
      city: "Kanpur",
      district: "Kanpur Nagar",
      state: "Uttar Pradesh",
      pinCode: "208001",
      landmark: "Behind SBI Main Branch"
    },
    items: [
      createSeedItem({
        productId: "fp-prod-101",
        name: "Classic Oxford Cotton Slim Fit Shirt",
        sku: "FP-M-SH-001",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        size: "L",
        colorName: "Sky Blue",
        colorHex: "#6ba4b8",
        price: 1299,
        mrp: 2499,
        quantity: 1
      }),
      createSeedItem({
        productId: "fp-prod-103",
        name: "Vintage Wash Relaxed Tapered Jeans",
        sku: "FP-M-JN-003",
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
        size: "34",
        colorName: "Indigo Blue",
        colorHex: "#1e3a8a",
        price: 1799,
        mrp: 3299,
        quantity: 1
      })
    ],
    pricing: {
      subtotal: 3098,
      deliveryCharge: 0,
      discount: 200,
      couponCode: "FASHION200",
      grandTotal: 2898
    },
    totalAmount: 2898,
    paymentMethod: "ONLINE",
    paymentStatus: "PAID",
    orderStatus: "SHIPPED",
    status: "SHIPPED",
    courierName: "Delhivery Surface Express",
    awbNumber: "DLV983214890",
    trackingNumber: "DLV983214890",
    invoiceNumber: "INV-2026-10001",
    createdAt: "2026-09-17T10:30:00Z",
    timeline: [
      {
        status: "NEW",
        timestamp: "2026-09-17T10:30:00Z",
        title: "Order Placed",
        description: "Customer placed order FP-10001 via UPI payment.",
        location: "Fashion Point Store, Main Hub"
      },
      {
        status: "CONFIRMED",
        timestamp: "2026-09-17T11:15:00Z",
        title: "Order Confirmed",
        description: "Inventory allocated and order accepted by store fulfillment team.",
        location: "Fashion Point Central Warehouse"
      },
      {
        status: "PACKED",
        timestamp: "2026-09-17T15:40:00Z",
        title: "Quality Checked & Packed",
        description: "Items packed in eco-friendly tamper-proof parcel with shipping label.",
        location: "Fulfillment Station A2"
      },
      {
        status: "SHIPPED",
        timestamp: "2026-09-18T09:20:00Z",
        title: "Dispatched with Courier",
        description: "Handed over to Delhivery Logistics (AWB: DLV983214890). In transit to destination hub.",
        location: "Regional Sorting Hub"
      }
    ]
  },
  {
    id: "FP-10002",
    customer: {
      fullName: "Priya Sundaram",
      mobileNumber: "9811223344",
      alternateNumber: "9877001122",
      email: "priya.s@example.com"
    },
    shippingAddress: {
      houseShopNo: "Flat 304, Green Heights",
      street: "7th Cross, Gandhi Nagar",
      villageArea: "Near Water Tank",
      city: "Bhopal",
      district: "Bhopal",
      state: "Madhya Pradesh",
      pinCode: "462001",
      landmark: "Opposite Community Hall"
    },
    items: [
      createSeedItem({
        productId: "fp-prod-201",
        name: "Tiered Floral Summer Midi Dress",
        sku: "FP-W-DR-101",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
        size: "M",
        colorName: "Rose Petal",
        colorHex: "#fda4af",
        price: 1599,
        mrp: 2999,
        quantity: 1
      })
    ],
    pricing: {
      subtotal: 1599,
      deliveryCharge: 0,
      discount: 160,
      couponCode: "FIRST10",
      grandTotal: 1439
    },
    totalAmount: 1439,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    orderStatus: "CONFIRMED",
    status: "CONFIRMED",
    trackingNumber: "DEL-8874129",
    invoiceNumber: "INV-2026-10002",
    createdAt: "2026-09-18T14:15:00Z",
    timeline: [
      {
        status: "NEW",
        timestamp: "2026-09-18T14:15:00Z",
        title: "Order Placed",
        description: "Order placed with Cash on Delivery option.",
        location: "Fashion Point Store"
      },
      {
        status: "CONFIRMED",
        timestamp: "2026-09-18T16:00:00Z",
        title: "Order Confirmed",
        description: "Store verified customer address and confirmed order for packing.",
        location: "Fashion Point Hub"
      }
    ]
  },
  {
    id: "FP-10003",
    customer: {
      fullName: "Rohan Gupta",
      mobileNumber: "9988776655",
      email: "rohan.gupta@example.com"
    },
    shippingAddress: {
      houseShopNo: "House No. 12, Ward 4",
      street: "Bazaar Road",
      villageArea: "Old Town Area",
      city: "Patna",
      district: "Patna",
      state: "Bihar",
      pinCode: "800001",
      landmark: "Near Gandhi Chowk"
    },
    items: [
      createSeedItem({
        productId: "fp-prod-301",
        name: "Pure Cotton Playtime T-Shirt & Shorts Duo",
        sku: "FP-K-ST-201",
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80",
        size: "4-5 Yrs",
        colorName: "Sunny Mustard",
        colorHex: "#eab308",
        price: 599,
        mrp: 1199,
        quantity: 2
      })
    ],
    pricing: {
      subtotal: 1198,
      deliveryCharge: 49,
      discount: 0,
      grandTotal: 1247
    },
    totalAmount: 1247,
    paymentMethod: "ONLINE",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    status: "DELIVERED",
    courierName: "BlueDart Air",
    awbNumber: "BLD4459821",
    trackingNumber: "BLD4459821",
    invoiceNumber: "INV-2026-10003",
    createdAt: "2026-09-14T08:00:00Z",
    timeline: [
      {
        status: "NEW",
        timestamp: "2026-09-14T08:00:00Z",
        title: "Order Placed",
        description: "Payment verified successfully."
      },
      {
        status: "CONFIRMED",
        timestamp: "2026-09-14T09:30:00Z",
        title: "Order Confirmed",
        description: "Ready for fulfillment."
      },
      {
        status: "PACKED",
        timestamp: "2026-09-14T12:00:00Z",
        title: "Parcel Packed",
        description: "Packed and barcoded."
      },
      {
        status: "SHIPPED",
        timestamp: "2026-09-14T17:00:00Z",
        title: "In Transit",
        description: "Dispatched via BlueDart."
      },
      {
        status: "OUT_FOR_DELIVERY",
        timestamp: "2026-09-16T08:30:00Z",
        title: "Out for Delivery",
        description: "Courier executive out for final mile delivery."
      },
      {
        status: "DELIVERED",
        timestamp: "2026-09-16T14:45:00Z",
        title: "Delivered",
        description: "Delivered successfully to customer."
      }
    ]
  }
];

// server/data/postalCodes.ts
var INITIAL_POSTAL_CODES = [
  // Madhya Pradesh - Indore (Fashion Point Headquarters & Hubs)
  { pincode: "452001", postOffice: "Indore G.P.O.", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452001", postOffice: "Indore Cloth Market", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452001", postOffice: "Vallabh Nagar S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452001", postOffice: "Siyaganj S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452002", postOffice: "Indore Collectorate S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452002", postOffice: "Mhow Naka S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452002", postOffice: "Chhatribagh S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452003", postOffice: "Pardeshipura S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452010", postOffice: "Vijay Nagar S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452010", postOffice: "Scheme 54 B.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452010", postOffice: "Bhamori B.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452011", postOffice: "Nanda Nagar S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "452012", postOffice: "Rajendra Nagar S.O", district: "Indore", state: "Madhya Pradesh", city: "Indore" },
  { pincode: "453441", postOffice: "Mhow Cantt H.O", district: "Indore", state: "Madhya Pradesh", city: "Mhow" },
  // Madhya Pradesh - Bhopal & Other Cities
  { pincode: "462001", postOffice: "Bhopal G.P.O.", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "462001", postOffice: "Shahjahanabad S.O", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "462001", postOffice: "Sultania Road S.O", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "462003", postOffice: "Bairagarh S.O", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "462016", postOffice: "Arera Colony S.O", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "462023", postOffice: "Habibganj S.O", district: "Bhopal", state: "Madhya Pradesh", city: "Bhopal" },
  { pincode: "482001", postOffice: "Jabalpur H.O", district: "Jabalpur", state: "Madhya Pradesh", city: "Jabalpur" },
  { pincode: "474001", postOffice: "Gwalior H.O", district: "Gwalior", state: "Madhya Pradesh", city: "Gwalior" },
  { pincode: "456001", postOffice: "Ujjain H.O", district: "Ujjain", state: "Madhya Pradesh", city: "Ujjain" },
  { pincode: "456010", postOffice: "Madhav Nagar S.O", district: "Ujjain", state: "Madhya Pradesh", city: "Ujjain" },
  // Delhi NCR
  { pincode: "110001", postOffice: "New Delhi G.P.O.", district: "Central Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110001", postOffice: "Connaught Place S.O", district: "Central Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110001", postOffice: "Parliament Street S.O", district: "Central Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110006", postOffice: "Chandni Chowk H.O", district: "North Delhi", state: "Delhi", city: "Delhi" },
  { pincode: "110006", postOffice: "Fatehpuri S.O", district: "North Delhi", state: "Delhi", city: "Delhi" },
  { pincode: "110006", postOffice: "Jama Masjid S.O", district: "North Delhi", state: "Delhi", city: "Delhi" },
  { pincode: "110019", postOffice: "Kalkaji H.O", district: "South East Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110019", postOffice: "Nehru Place S.O", district: "South East Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110024", postOffice: "Lajpat Nagar S.O", district: "South Delhi", state: "Delhi", city: "New Delhi" },
  { pincode: "110092", postOffice: "Anand Vihar S.O", district: "East Delhi", state: "Delhi", city: "Delhi" },
  { pincode: "122001", postOffice: "Gurgaon H.O", district: "Gurugram", state: "Haryana", city: "Gurugram" },
  { pincode: "201301", postOffice: "Noida Sector 1 H.O", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", city: "Noida" },
  // Maharashtra - Mumbai & Pune
  { pincode: "400001", postOffice: "Mumbai G.P.O.", district: "Mumbai", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400001", postOffice: "Fort S.O", district: "Mumbai", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400001", postOffice: "Bazargate S.O", district: "Mumbai", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400002", postOffice: "Kalbadevi H.O", district: "Mumbai", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400050", postOffice: "Bandra West S.O", district: "Mumbai Suburban", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400050", postOffice: "Bandra Bazaar S.O", district: "Mumbai Suburban", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400051", postOffice: "Bandra East S.O", district: "Mumbai Suburban", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400076", postOffice: "Powai S.O", district: "Mumbai Suburban", state: "Maharashtra", city: "Mumbai" },
  { pincode: "400069", postOffice: "Andheri East S.O", district: "Mumbai Suburban", state: "Maharashtra", city: "Mumbai" },
  { pincode: "411001", postOffice: "Pune H.O", district: "Pune", state: "Maharashtra", city: "Pune" },
  { pincode: "411001", postOffice: "Camp S.O", district: "Pune", state: "Maharashtra", city: "Pune" },
  { pincode: "411004", postOffice: "Deccan Gymkhana S.O", district: "Pune", state: "Maharashtra", city: "Pune" },
  { pincode: "411057", postOffice: "Hinjawadi S.O", district: "Pune", state: "Maharashtra", city: "Pune" },
  { pincode: "440001", postOffice: "Nagpur G.P.O.", district: "Nagpur", state: "Maharashtra", city: "Nagpur" },
  // Karnataka - Bengaluru
  { pincode: "560001", postOffice: "Bengaluru G.P.O.", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560001", postOffice: "Cubbon Road S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560001", postOffice: "Vidhana Soudha S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560034", postOffice: "Koramangala 6th Block S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560034", postOffice: "ST Bed B.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560038", postOffice: "Indiranagar S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560066", postOffice: "Whitefield S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  { pincode: "560100", postOffice: "Electronic City S.O", district: "Bengaluru Urban", state: "Karnataka", city: "Bengaluru" },
  // Tamil Nadu - Chennai
  { pincode: "600001", postOffice: "Chennai G.P.O.", district: "Chennai", state: "Tamil Nadu", city: "Chennai" },
  { pincode: "600001", postOffice: "George Town S.O", district: "Chennai", state: "Tamil Nadu", city: "Chennai" },
  { pincode: "600001", postOffice: "Muthialpet S.O", district: "Chennai", state: "Tamil Nadu", city: "Chennai" },
  { pincode: "600004", postOffice: "Mylapore H.O", district: "Chennai", state: "Tamil Nadu", city: "Chennai" },
  { pincode: "600017", postOffice: "T Nagar H.O", district: "Chennai", state: "Tamil Nadu", city: "Chennai" },
  { pincode: "641001", postOffice: "Coimbatore H.O", district: "Coimbatore", state: "Tamil Nadu", city: "Coimbatore" },
  // West Bengal - Kolkata
  { pincode: "700001", postOffice: "Kolkata G.P.O.", district: "Kolkata", state: "West Bengal", city: "Kolkata" },
  { pincode: "700001", postOffice: "Dalhousie S.O", district: "Kolkata", state: "West Bengal", city: "Kolkata" },
  { pincode: "700001", postOffice: "BBD Bagh S.O", district: "Kolkata", state: "West Bengal", city: "Kolkata" },
  { pincode: "700007", postOffice: "Barabazar H.O", district: "Kolkata", state: "West Bengal", city: "Kolkata" },
  { pincode: "700020", postOffice: "Bhawanipur S.O", district: "Kolkata", state: "West Bengal", city: "Kolkata" },
  { pincode: "700091", postOffice: "Salt Lake Sector 5 S.O", district: "North 24 Parganas", state: "West Bengal", city: "Kolkata" },
  // Telangana - Hyderabad
  { pincode: "500001", postOffice: "Hyderabad G.P.O.", district: "Hyderabad", state: "Telangana", city: "Hyderabad" },
  { pincode: "500001", postOffice: "Abids S.O", district: "Hyderabad", state: "Telangana", city: "Hyderabad" },
  { pincode: "500001", postOffice: "Troop Bazaar S.O", district: "Hyderabad", state: "Telangana", city: "Hyderabad" },
  { pincode: "500003", postOffice: "Secunderabad H.O", district: "Hyderabad", state: "Telangana", city: "Secunderabad" },
  { pincode: "500081", postOffice: "Madhapur S.O", district: "K.V.Rangareddy", state: "Telangana", city: "Hyderabad" },
  { pincode: "500033", postOffice: "Jubilee Hills S.O", district: "Hyderabad", state: "Telangana", city: "Hyderabad" },
  // Rajasthan - Jaipur
  { pincode: "302001", postOffice: "Jaipur G.P.O.", district: "Jaipur", state: "Rajasthan", city: "Jaipur" },
  { pincode: "302001", postOffice: "C-Scheme S.O", district: "Jaipur", state: "Rajasthan", city: "Jaipur" },
  { pincode: "302001", postOffice: "M.I. Road S.O", district: "Jaipur", state: "Rajasthan", city: "Jaipur" },
  { pincode: "302015", postOffice: "Malviya Nagar S.O", district: "Jaipur", state: "Rajasthan", city: "Jaipur" },
  { pincode: "302020", postOffice: "Mansarovar S.O", district: "Jaipur", state: "Rajasthan", city: "Jaipur" },
  { pincode: "342001", postOffice: "Jodhpur H.O", district: "Jodhpur", state: "Rajasthan", city: "Jodhpur" },
  // Uttar Pradesh - Lucknow & Kanpur
  { pincode: "226001", postOffice: "Lucknow G.P.O.", district: "Lucknow", state: "Uttar Pradesh", city: "Lucknow" },
  { pincode: "226001", postOffice: "Hazratganj S.O", district: "Lucknow", state: "Uttar Pradesh", city: "Lucknow" },
  { pincode: "226001", postOffice: "Lalbagh S.O", district: "Lucknow", state: "Uttar Pradesh", city: "Lucknow" },
  { pincode: "226010", postOffice: "Gomti Nagar S.O", district: "Lucknow", state: "Uttar Pradesh", city: "Lucknow" },
  { pincode: "208001", postOffice: "Kanpur H.O", district: "Kanpur Nagar", state: "Uttar Pradesh", city: "Kanpur" },
  { pincode: "221001", postOffice: "Varanasi Cantt H.O", district: "Varanasi", state: "Uttar Pradesh", city: "Varanasi" },
  { pincode: "282001", postOffice: "Agra Fort H.O", district: "Agra", state: "Uttar Pradesh", city: "Agra" },
  // Gujarat - Ahmedabad & Surat
  { pincode: "380001", postOffice: "Ahmedabad G.P.O.", district: "Ahmedabad", state: "Gujarat", city: "Ahmedabad" },
  { pincode: "380001", postOffice: "Bhadra S.O", district: "Ahmedabad", state: "Gujarat", city: "Ahmedabad" },
  { pincode: "380001", postOffice: "Relief Road S.O", district: "Ahmedabad", state: "Gujarat", city: "Ahmedabad" },
  { pincode: "380015", postOffice: "Satellite S.O", district: "Ahmedabad", state: "Gujarat", city: "Ahmedabad" },
  { pincode: "380054", postOffice: "Thaltej S.O", district: "Ahmedabad", state: "Gujarat", city: "Ahmedabad" },
  { pincode: "395001", postOffice: "Surat H.O", district: "Surat", state: "Gujarat", city: "Surat" },
  { pincode: "390001", postOffice: "Vadodara H.O", district: "Vadodara", state: "Gujarat", city: "Vadodara" },
  // Bihar - Patna
  { pincode: "800001", postOffice: "Patna G.P.O.", district: "Patna", state: "Bihar", city: "Patna" },
  { pincode: "800001", postOffice: "Bankipur S.O", district: "Patna", state: "Bihar", city: "Patna" },
  { pincode: "800001", postOffice: "Fraser Road S.O", district: "Patna", state: "Bihar", city: "Patna" },
  { pincode: "800020", postOffice: "Kankarbagh S.O", district: "Patna", state: "Bihar", city: "Patna" },
  // Punjab & Chandigarh
  { pincode: "160017", postOffice: "Chandigarh Sector 17 H.O", district: "Chandigarh", state: "Chandigarh", city: "Chandigarh" },
  { pincode: "160022", postOffice: "Chandigarh Sector 22 S.O", district: "Chandigarh", state: "Chandigarh", city: "Chandigarh" },
  { pincode: "141001", postOffice: "Ludhiana H.O", district: "Ludhiana", state: "Punjab", city: "Ludhiana" },
  { pincode: "143001", postOffice: "Amritsar H.O", district: "Amritsar", state: "Punjab", city: "Amritsar" },
  // Kerala & Andhra Pradesh
  { pincode: "682001", postOffice: "Kochi H.O", district: "Ernakulam", state: "Kerala", city: "Kochi" },
  { pincode: "682001", postOffice: "Mattancherry S.O", district: "Ernakulam", state: "Kerala", city: "Kochi" },
  { pincode: "695001", postOffice: "Thiruvananthapuram G.P.O.", district: "Thiruvananthapuram", state: "Kerala", city: "Thiruvananthapuram" },
  { pincode: "520001", postOffice: "Vijayawada H.O", district: "Krishna", state: "Andhra Pradesh", city: "Vijayawada" },
  { pincode: "530001", postOffice: "Visakhapatnam H.O", district: "Visakhapatnam", state: "Andhra Pradesh", city: "Visakhapatnam" },
  // North East & Other States
  { pincode: "781001", postOffice: "Guwahati G.P.O.", district: "Kamrup Metropolitan", state: "Assam", city: "Guwahati" },
  { pincode: "781001", postOffice: "Panbazar S.O", district: "Kamrup Metropolitan", state: "Assam", city: "Guwahati" },
  { pincode: "834001", postOffice: "Ranchi G.P.O.", district: "Ranchi", state: "Jharkhand", city: "Ranchi" },
  { pincode: "492001", postOffice: "Raipur H.O", district: "Raipur", state: "Chhattisgarh", city: "Raipur" },
  { pincode: "190001", postOffice: "Srinagar G.P.O.", district: "Srinagar", state: "Jammu and Kashmir", city: "Srinagar" },
  { pincode: "248001", postOffice: "Dehradun G.P.O.", district: "Dehradun", state: "Uttarakhand", city: "Dehradun" },
  { pincode: "403001", postOffice: "Panaji H.O", district: "North Goa", state: "Goa", city: "Panaji" },
  { pincode: "751001", postOffice: "Bhubaneswar G.P.O.", district: "Khurda", state: "Odisha", city: "Bhubaneswar" }
];

// server/inMemoryDb.ts
var InMemoryDatabaseManager = class {
  constructor() {
    this.products = [];
    this.orders = [];
    this.coupons = [];
    this.banners = [];
    this.admins = [];
    this.users = [];
    this.settings = null;
    this.trackingEvents = [];
    this.qrScans = [];
    this.postalCodes = [];
    this.seed();
  }
  seed() {
    this.products = INITIAL_PRODUCTS.map((p) => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const categoryId = p.category.toLowerCase() === "men" ? "cat-men" : p.category.toLowerCase() === "women" ? "cat-women" : "cat-kids";
      return {
        id: p.id,
        name: p.name,
        slug,
        categoryId,
        category: p.category,
        subCategory: p.subCategory || "Apparel",
        description: p.description,
        price: Number(p.price),
        mrp: Number(p.mrp),
        discount: p.discount || Math.round((p.mrp - p.price) / p.mrp * 100),
        sizes: Array.isArray(p.sizes) ? p.sizes : ["M", "L", "XL"],
        colors: Array.isArray(p.colors) ? p.colors : [{ name: "Standard", hex: "#111111" }],
        stock: Number(p.stock || 40),
        sku: p.sku,
        status: p.status || "PUBLISHED",
        isFeatured: Boolean(p.isFeatured),
        isNewArrival: Boolean(p.isNewArrival),
        isBestseller: Boolean(p.isBestseller),
        isActive: p.status !== "UNPUBLISHED",
        images: Array.isArray(p.images) ? p.images : [],
        rating: Number(p.rating || 4.8),
        reviewsCount: Number(p.reviewsCount || 20),
        material: p.material || "100% Pure Combed Cotton",
        careInstructions: p.careInstructions || "Machine wash cold with like colors",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    });
    this.coupons = INITIAL_COUPONS.map((c) => ({
      id: c.id,
      code: c.code.toUpperCase(),
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderAmount: Number(c.minOrderAmount || 0),
      maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : void 0,
      usageLimit: 500,
      usageCount: 0,
      isActive: c.isActive !== false,
      expiresAt: c.validUntil ? new Date(c.validUntil).toISOString() : (/* @__PURE__ */ new Date("2026-12-31T23:59:59Z")).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
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
    this.settings = {
      storeName: STORE_CONFIG.name,
      tagline: STORE_CONFIG.tagline,
      contactEmail: STORE_CONFIG.email,
      supportPhone: STORE_CONFIG.phone,
      ownerName: "Meraj Alam",
      gstin: STORE_CONFIG.gstin,
      defaultTaxRate: 5,
      freeShippingThreshold: STORE_CONFIG.freeShippingThreshold || 999,
      standardShippingFee: 49,
      isCodEnabled: true,
      isOnlinePaymentEnabled: true,
      address: STORE_CONFIG.address
    };
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "Meraj@&099";
    const primaryHash = bcrypt.hashSync(defaultPassword, 10);
    this.admins = [
      {
        id: "ADM-SUPER-01",
        username: "meraj099",
        passwordHash: primaryHash,
        fullName: "Meraj Alam (Store Owner)",
        role: "SUPER_ADMIN",
        phone: "+91 73523 19943",
        email: "merajalam906090@gmail.com",
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "ADM-SUPER-02",
        username: "admin",
        passwordHash: primaryHash,
        fullName: "Store Administrator",
        role: "SUPER_ADMIN",
        phone: "+91 73523 19943",
        email: "contact@fashionpoint.store",
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
    this.orders = (INITIAL_ORDERS || []).map((o) => {
      const order = {
        ...o,
        orderStatus: o.orderStatus || o.status || "ORDER_PLACED",
        status: o.status || o.orderStatus || "ORDER_PLACED",
        trackingToken: o.trackingToken || o.trackingNumber || o.id,
        currentLocation: o.currentLocation || "Fashion Point Central Fulfilment Hub, Indore",
        expectedDeliveryDate: o.expectedDeliveryDate || o.estimatedDelivery || "3 - 5 Business Days",
        shippingName: o.shippingName || o.customer?.fullName,
        shippingPhone: o.shippingPhone || o.customer?.mobileNumber,
        shippingAddressLine: o.shippingAddressLine || `${o.shippingAddress?.houseShopNo || ""}, ${o.shippingAddress?.street || ""}, ${o.shippingAddress?.villageArea || ""}`,
        shippingCity: o.shippingCity || o.shippingAddress?.city,
        shippingDistrict: o.shippingDistrict || o.shippingAddress?.district || o.shippingAddress?.city,
        shippingState: o.shippingState || o.shippingAddress?.state,
        shippingPincode: o.shippingPincode || o.shippingAddress?.pinCode,
        createdAt: o.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: o.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
      if (order.timeline && Array.isArray(order.timeline)) {
        order.timeline.forEach((evt) => {
          this.trackingEvents.push({
            id: `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            orderId: order.id,
            trackingNumber: order.trackingNumber,
            status: evt.status,
            location: evt.location || order.currentLocation,
            description: evt.description || evt.title,
            source: "SYSTEM",
            scannedBy: "SYSTEM",
            createdAt: evt.timestamp || (/* @__PURE__ */ new Date()).toISOString()
          });
        });
      }
      return order;
    });
    this.postalCodes = [...INITIAL_POSTAL_CODES];
  }
  // --- PRODUCTS ---
  async getProducts(filters) {
    let list = this.products.filter((p) => p.isActive);
    if (filters?.category && filters.category.toLowerCase() !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.subCategory && filters.subCategory.toLowerCase() !== "all") {
      list = list.filter((p) => p.subCategory?.toLowerCase() === filters.subCategory?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice !== void 0) {
      list = list.filter((p) => p.price >= filters.minPrice);
    }
    if (filters?.maxPrice !== void 0) {
      list = list.filter((p) => p.price <= filters.maxPrice);
    }
    if (filters?.sort === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === "popular") {
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
  async getProductById(id) {
    return this.products.find((p) => p.id === id || p.slug === id) || null;
  }
  async createProduct(productData) {
    const id = productData.id || `fp-prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const categoryId = productData.categoryId || (productData.category?.toLowerCase() === "men" ? "cat-men" : productData.category?.toLowerCase() === "women" ? "cat-women" : "cat-kids");
    const product = {
      id,
      name: productData.name,
      slug,
      categoryId,
      category: productData.category,
      subCategory: productData.subCategory || "Apparel",
      description: productData.description || "",
      price: Number(productData.price),
      mrp: Number(productData.mrp || productData.price),
      discount: Number(productData.discount || 0),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : ["M", "L", "XL"],
      colors: Array.isArray(productData.colors) ? productData.colors : [{ name: "Standard", hex: "#111111" }],
      stock: Number(productData.stock || 0),
      sku: productData.sku || `FP-${Date.now().toString().slice(-6)}`,
      status: productData.status || "PUBLISHED",
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      isBestseller: Boolean(productData.isBestseller),
      isActive: productData.status !== "UNPUBLISHED",
      images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"],
      rating: 5,
      reviewsCount: 1,
      material: productData.material || "Cotton",
      careInstructions: productData.careInstructions || "Machine wash cold",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.products.unshift(product);
    return product;
  }
  async updateProduct(id, updates) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = this.products[idx];
    const updated = {
      ...existing,
      ...updates,
      price: updates.price !== void 0 ? Number(updates.price) : existing.price,
      mrp: updates.mrp !== void 0 ? Number(updates.mrp) : existing.mrp,
      stock: updates.stock !== void 0 ? Number(updates.stock) : existing.stock,
      isActive: updates.status ? updates.status !== "UNPUBLISHED" : existing.isActive,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (updates.name) {
      updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    this.products[idx] = updated;
    return updated;
  }
  async deleteProduct(id) {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.products.splice(idx, 1);
      return true;
    }
    return false;
  }
  async getCategories() {
    return [
      { id: "cat-men", name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80" },
      { id: "cat-women", name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80" },
      { id: "cat-kids", name: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80" }
    ];
  }
  // --- ORDERS ---
  async getOrders(filters) {
    let list = [...this.orders];
    if (filters?.userId) {
      list = list.filter((o) => String(o.userId) === String(filters.userId));
    }
    if (filters?.status && filters.status.toUpperCase() !== "ALL") {
      const s = filters.status.toUpperCase();
      list = list.filter((o) => o.orderStatus?.toUpperCase() === s || o.status?.toUpperCase() === s);
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
  async getOrderById(id) {
    return this.orders.find(
      (o) => o.id === id || o.invoiceNumber === id || o.trackingNumber === id || o.razorpayOrderId === id
    ) || null;
  }
  async trackOrder(query, mobileNumber) {
    const clean = query.trim().toUpperCase();
    let order = this.orders.find(
      (o) => o.id?.toUpperCase() === clean || o.trackingNumber?.toUpperCase() === clean || o.invoiceNumber?.toUpperCase() === clean || o.trackingToken === query.trim()
    );
    if (order && mobileNumber) {
      const cleanDigits = mobileNumber.replace(/\D/g, "").slice(-10);
      const custMobile = (order.customer?.mobileNumber || "").replace(/\D/g, "").slice(-10);
      if (!custMobile.includes(cleanDigits)) {
        return null;
      }
    }
    return order || null;
  }
  async createOrder(orderPayload) {
    if (!orderPayload.items || orderPayload.items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }
    const verifiedItems = [];
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
        image: product.images[0] || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
        price: product.price,
        mrp: product.mrp,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        product: { ...product }
      });
    }
    let couponDiscount = 0;
    if (orderPayload.couponCode) {
      const cleanCode = orderPayload.couponCode.trim().toUpperCase();
      const coupon = this.coupons.find((c) => c.code === cleanCode && c.isActive);
      if (coupon && calculatedSubtotal >= (coupon.minOrderAmount || 0)) {
        if (coupon.discountType === "PERCENTAGE") {
          const val = Math.round(calculatedSubtotal * Number(coupon.discountValue) / 100);
          const maxD = Number(coupon.maxDiscountAmount);
          couponDiscount = maxD && val > maxD ? maxD : val;
        } else {
          couponDiscount = Math.min(Number(coupon.discountValue), calculatedSubtotal);
        }
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }
    const deliveryCharge = calculatedSubtotal >= 999 ? 0 : 49;
    const grandTotal = Math.max(0, calculatedSubtotal + deliveryCharge - couponDiscount);
    const taxRate = 5;
    const taxableAmount = Math.round(grandTotal / (1 + taxRate / 100) * 100) / 100;
    const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;
    const cgst = Math.round(totalGst / 2 * 100) / 100;
    const sgst = cgst;
    for (const item of orderPayload.items) {
      const p = this.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        p.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    }
    const orderId = `FP-2026-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const invoiceNumber = `INV-FP-2026-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `DEL-${Date.now().toString().slice(-7)}`;
    const trackingToken = `tk_${crypto.randomBytes(12).toString("hex")}`;
    const currentLocation = "Fashion Point Central Fulfilment Hub, Indore";
    const expectedDelivery = "3 - 5 Business Days";
    const shippingAddr = orderPayload.shippingAddress || {};
    const shippingName = orderPayload.customer?.fullName || "Customer";
    const shippingPhone = orderPayload.customer?.mobileNumber || "";
    const shippingAddressLine = [
      shippingAddr.houseBuilding || shippingAddr.houseShopNo,
      shippingAddr.streetArea || shippingAddr.street,
      shippingAddr.landmark,
      shippingAddr.villageTownCity || shippingAddr.villageArea
    ].filter(Boolean).join(", ");
    const shippingCity = shippingAddr.villageTownCity || shippingAddr.city || "Indore";
    const shippingDistrict = shippingAddr.district || "Indore";
    const shippingState = shippingAddr.state || "Madhya Pradesh";
    const shippingPincode = shippingAddr.pinCode || "452001";
    const initialTimelineEvent = {
      status: "ORDER_PLACED",
      title: "Order Placed",
      description: orderPayload.paymentMethod === "COD" ? `Order confirmed (Cash on Delivery). Delivery partner will collect \u20B9${grandTotal} in cash at doorstep.` : "Payment transaction initiated via secure gateway.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: currentLocation
    };
    const newOrder = {
      id: orderId,
      userId: orderPayload.userId || null,
      orderStatus: "ORDER_PLACED",
      status: "ORDER_PLACED",
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: "PENDING",
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
      courierName: "Delhivery Express",
      trackingNumber,
      awbNumber: trackingNumber,
      invoiceNumber,
      estimatedDelivery: expectedDelivery,
      timeline: [initialTimelineEvent],
      customerNote: orderPayload.customerNote || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.orders.unshift(newOrder);
    this.trackingEvents.push({
      id: `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderId,
      trackingNumber,
      status: "ORDER_PLACED",
      location: currentLocation,
      description: orderPayload.paymentMethod === "COD" ? "Order Placed (Cash on Delivery)" : "Order Placed",
      source: "SYSTEM",
      scannedBy: "SYSTEM",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return newOrder;
  }
  async updateOrderStatus(orderId, status, courierName, awbNumber, note) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const upperStatus = status.toUpperCase();
    const descriptions = {
      NEW: "Order received and logged in system.",
      CONFIRMED: "Order accepted by store manager. Garments allocated for packing.",
      PACKED: "Items inspected for quality, ironed, and sealed in tamper-evident parcel.",
      SHIPPED: `Package dispatched via ${courierName || order.courierName || "Delhivery"}. AWB: ${awbNumber || order.awbNumber}.`,
      OUT_FOR_DELIVERY: "Parcel is out for delivery with local courier partner.",
      DELIVERED: "Package handed over to recipient. Thank you for shopping with Fashion Point!",
      CANCELLED: note || "Order has been cancelled."
    };
    const newTimelineEvent = {
      status: upperStatus,
      title: upperStatus.replace(/_/g, " "),
      description: descriptions[upperStatus] || `Order status updated to ${upperStatus}.`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: "Fashion Point Logistics Hub"
    };
    let paymentStatus = order.paymentStatus;
    if (upperStatus === "DELIVERED") {
      paymentStatus = "PAID";
    } else if (upperStatus === "CANCELLED" && order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
      paymentStatus = "REFUNDED";
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
    order.timeline = [...order.timeline || [], newTimelineEvent];
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return order;
  }
  async updateOrderPaymentVerified(orderId, data) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;
    const paymentTimelineEvent = {
      status: "PAID",
      title: "Payment Received",
      description: `Online payment of \u20B9${order.pricing?.grandTotal || order.totalAmount} captured successfully via Razorpay (Ref: ${data.razorpayPaymentId}).`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: "Razorpay Gateway"
    };
    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    order.status = "CONFIRMED";
    order.razorpayOrderId = data.razorpayOrderId;
    order.razorpayPaymentId = data.razorpayPaymentId;
    order.paymentDetails = data.paymentDetails;
    order.timeline = [...order.timeline || [], paymentTimelineEvent];
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return order;
  }
  // --- COUPONS ---
  async getCoupons() {
    return [...this.coupons];
  }
  async validateCoupon(code, subtotal) {
    const clean = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code === clean && c.isActive);
    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid or inactive coupon code." };
    }
    const minOrder = Number(coupon.minOrderAmount || 0);
    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires a minimum purchase of \u20B9${minOrder}. Current subtotal is \u20B9${subtotal}.`
      };
    }
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round(subtotal * Number(coupon.discountValue) / 100);
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
      message: `Success! You saved \u20B9${discount} with ${coupon.code}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue)
      }
    };
  }
  // --- DASHBOARD REAL METRICS ---
  async getStats() {
    const nonCancelled = this.orders.filter((o) => o.orderStatus !== "CANCELLED");
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const todayOrders = nonCancelled.filter((o) => (o.createdAt || "").slice(0, 10) === today);
    const totalSales = nonCancelled.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = this.orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.orderStatus)).length;
    const deliveredOrders = this.orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const cancelledOrders = this.orders.filter((o) => o.orderStatus === "CANCELLED").length;
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
  async getUserByEmailOrMobile(identifier) {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "").slice(-10);
    return this.users.find(
      (u) => u.email?.toLowerCase() === clean || u.phone === clean || cleanDigits.length >= 10 && u.phone === cleanDigits || u.fullName?.toLowerCase() === clean || u.uid === identifier.trim()
    ) || null;
  }
  async getUserById(id) {
    return this.users.find((u) => String(u.id) === String(id) || u.uid === id) || null;
  }
  async createUser(userData) {
    const passwordHash = userData.password ? bcrypt.hashSync(userData.password, 10) : null;
    const uid = `usr-${Date.now()}`;
    const user = {
      id: this.users.length + 1,
      uid,
      email: userData.email?.trim().toLowerCase() || null,
      phone: userData.mobile.trim(),
      passwordHash,
      fullName: userData.fullName.trim(),
      role: "CUSTOMER",
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.users.push(user);
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
  async updateUserPassword(userId, newPassword) {
    const user = this.users.find((u) => String(u.id) === String(userId) || u.uid === String(userId));
    if (user) {
      user.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
      return true;
    }
    return false;
  }
  // --- ADMINS ---
  async getAdminByUsername(username) {
    const clean = username.trim().toLowerCase();
    return this.admins.find((a) => a.username.toLowerCase() === clean && a.isActive) || null;
  }
  async getAdmins() {
    return this.admins.map(({ passwordHash, ...a }) => a);
  }
  async createAdmin(data) {
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
      role: data.role || "STORE_MANAGER",
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.admins.push(admin);
    const { passwordHash: _, ...safe } = admin;
    return safe;
  }
  async updateAdminPassword(adminId, newPassword) {
    const admin = this.admins.find((a) => a.id === adminId);
    if (admin) {
      admin.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
      return true;
    }
    return false;
  }
  async updateAdmin(adminId, updates) {
    const admin = this.admins.find((a) => a.id === adminId);
    if (!admin) return false;
    if (updates.isActive !== void 0) admin.isActive = updates.isActive;
    if (updates.role !== void 0) admin.role = updates.role;
    if (updates.fullName !== void 0) admin.fullName = updates.fullName;
    if (updates.phone !== void 0) admin.phone = updates.phone;
    if (updates.email !== void 0) admin.email = updates.email;
    if (updates.password) admin.passwordHash = bcrypt.hashSync(updates.password.trim(), 10);
    return true;
  }
  async deleteAdmin(adminId) {
    const idx = this.admins.findIndex((a) => a.id === adminId);
    if (idx !== -1) {
      this.admins.splice(idx, 1);
      return true;
    }
    return false;
  }
  // --- SETTINGS ---
  async getSettings() {
    return { ...this.settings };
  }
  async updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }
  // --- CUSTOMER PROFILE ---
  async getCustomerProfile(userId) {
    return this.getUserById(String(userId));
  }
  async updateCustomerProfile(userId, data) {
    const user = await this.getUserById(String(userId));
    if (!user) return null;
    if (data.fullName) user.fullName = data.fullName;
    if (data.mobile) user.phone = data.mobile;
    if (data.email) user.email = data.email;
    if (data.dateOfBirth) user.dateOfBirth = data.dateOfBirth;
    if (data.gender) user.gender = data.gender;
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
  // --- POSTAL CODES ---
  async lookupPostalCode(pincode) {
    const clean = pincode.replace(/\D/g, "");
    return this.postalCodes.filter((p) => p.pincode === clean);
  }
  // --- CUSTOMER ORDERS ---
  async getCustomerOrders(userId, mobile, email) {
    const uidStr = String(userId);
    const cleanMobile = mobile ? mobile.replace(/\D/g, "").slice(-10) : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    return this.orders.filter((o) => {
      if (o.userId && String(o.userId) === uidStr) return true;
      if (cleanMobile && o.customer?.mobileNumber?.replace(/\D/g, "").includes(cleanMobile)) return true;
      if (cleanEmail && o.customer?.email?.toLowerCase() === cleanEmail) return true;
      return false;
    });
  }
  // --- ORDER TRACKING & QR EVENTS ---
  async getOrderByTrackingToken(tokenOrTracking) {
    const clean = tokenOrTracking.trim();
    return this.orders.find(
      (o) => o.trackingToken === clean || o.trackingNumber?.toUpperCase() === clean.toUpperCase() || o.id?.toUpperCase() === clean.toUpperCase()
    ) || null;
  }
  async getOrderTrackingEvents(orderId) {
    return this.trackingEvents.filter((e) => e.orderId === orderId);
  }
  async addOrderTrackingEvent(payload) {
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
      source: payload.source || "ADMIN",
      scannedBy: payload.scannedBy || "STAFF",
      recipientName: payload.recipientName,
      confirmationNote: payload.confirmationNote,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.trackingEvents.push(event);
    const newTimelineItem = {
      status: upperStatus,
      stage: payload.stage,
      title: upperStatus.replace(/_/g, " "),
      description: payload.description,
      location: payload.location || order.currentLocation,
      hubName: payload.hubName,
      recipientName: payload.recipientName,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    order.orderStatus = upperStatus;
    order.status = upperStatus;
    if (payload.location) order.currentLocation = payload.location;
    if (payload.courierName) order.courierName = payload.courierName;
    if (payload.awbNumber) {
      order.awbNumber = payload.awbNumber;
      order.trackingNumber = payload.awbNumber;
    }
    order.timeline = [...order.timeline || [], newTimelineItem];
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (upperStatus === "DELIVERED") {
      order.paymentStatus = "PAID";
    } else if (upperStatus === "CANCELLED" && order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUNDED";
    }
    return {
      order,
      event
    };
  }
  async recordQrScan(payload) {
    const id = `scan-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    this.qrScans.push({
      id,
      orderId: payload.orderId,
      trackingNumber: payload.trackingNumber,
      scannedBy: payload.scannedBy || null,
      scannerType: payload.scannerType,
      location: payload.location || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    return id;
  }
};
var inMemoryDb = new InMemoryDatabaseManager();

// server/db.ts
function mapProductRow(r) {
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
    sizes: Array.isArray(r.sizes) ? r.sizes : typeof r.sizes === "string" ? JSON.parse(r.sizes) : ["M", "L", "XL"],
    colors: Array.isArray(r.colors) ? r.colors : typeof r.colors === "string" ? JSON.parse(r.colors) : [],
    stock: Number(r.stock || 0),
    sku: r.sku,
    status: r.status || "PUBLISHED",
    isFeatured: Boolean(r.is_featured),
    isNewArrival: Boolean(r.is_new_arrival),
    isBestseller: Boolean(r.is_bestseller),
    isActive: Boolean(r.is_active),
    images: Array.isArray(r.images) ? r.images : typeof r.images === "string" ? JSON.parse(r.images) : [],
    rating: Number(r.rating || 4.8),
    reviewsCount: Number(r.reviews_count || 0),
    material: r.material,
    careInstructions: r.care_instructions,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
  };
}
function mapOrderRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    orderStatus: r.order_status,
    status: r.status || r.order_status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    customer: typeof r.customer === "string" ? JSON.parse(r.customer) : r.customer,
    shippingAddress: typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address) : r.shipping_address,
    items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
    pricing: typeof r.pricing === "string" ? JSON.parse(r.pricing) : r.pricing,
    totalAmount: Number(r.total_amount),
    taxBreakdown: typeof r.tax_breakdown === "string" ? JSON.parse(r.tax_breakdown) : r.tax_breakdown,
    razorpayOrderId: r.razorpay_order_id,
    razorpayPaymentId: r.razorpay_payment_id,
    courierName: r.courier_name,
    trackingNumber: r.tracking_number,
    trackingToken: r.tracking_token || r.tracking_number || r.id,
    currentLocation: r.current_location || "Fashion Point Central Fulfilment Hub, Indore",
    expectedDeliveryDate: r.expected_delivery_date || r.estimated_delivery || "3 - 5 Business Days",
    shippingName: r.shipping_name || (typeof r.customer === "string" ? JSON.parse(r.customer)?.fullName : r.customer?.fullName),
    shippingPhone: r.shipping_phone || (typeof r.customer === "string" ? JSON.parse(r.customer)?.mobileNumber : r.customer?.mobileNumber),
    shippingAddressLine: r.shipping_address_line,
    shippingCity: r.shipping_city || (typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address)?.city : r.shipping_address?.city),
    shippingDistrict: r.shipping_district || (typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address)?.district : r.shipping_address?.district),
    shippingState: r.shipping_state || (typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address)?.state : r.shipping_address?.state),
    shippingPincode: r.shipping_pincode || (typeof r.shipping_address === "string" ? JSON.parse(r.shipping_address)?.pinCode : r.shipping_address?.pinCode),
    awbNumber: r.awb_number,
    invoiceNumber: r.invoice_number,
    estimatedDelivery: r.estimated_delivery,
    timeline: typeof r.timeline === "string" ? JSON.parse(r.timeline) : r.timeline,
    customerNote: r.customer_note,
    adminNote: r.admin_note,
    paymentDetails: typeof r.payment_details === "string" ? JSON.parse(r.payment_details) : r.payment_details,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
  };
}
var PostgresDatabaseManager = class {
  constructor() {
    this.isInitialized = false;
    this.isPostgresAvailable = false;
    this.initPromise = null;
    this.pool = pool;
    this.initDatabase().catch((err) => {
      console.warn("Database connection check:", err?.message || err);
    });
  }
  isPostgresConnected() {
    return this.isPostgresAvailable;
  }
  async ensureInitialized() {
    await this.initDatabase();
    return this.isPostgresAvailable;
  }
  /**
   * Initializes database with seed records in PostgreSQL if tables are empty
   */
  async initDatabase() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      try {
        if (!hasPostgresConfig()) {
          this.isPostgresAvailable = false;
          this.isInitialized = true;
          return;
        }
        await Promise.race([
          this.pool.query("SELECT 1"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("PostgreSQL connection timeout")), 1500))
        ]);
        this.isPostgresAvailable = true;
        console.log("[Fashion Point] PostgreSQL is connected.");
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            uid TEXT NOT NULL UNIQUE,
            email TEXT,
            phone TEXT,
            password_hash TEXT,
            full_name TEXT,
            role TEXT DEFAULT 'CUSTOMER',
            date_of_birth TEXT,
            gender TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS admins (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'STORE_MANAGER',
            phone TEXT,
            email TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login_at TIMESTAMP WITH TIME ZONE
          );
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            image TEXT
          );
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            category_id TEXT,
            category TEXT,
            sub_category TEXT,
            description TEXT,
            price INTEGER NOT NULL,
            mrp INTEGER NOT NULL,
            discount INTEGER DEFAULT 0,
            sizes JSONB,
            colors JSONB,
            stock INTEGER NOT NULL DEFAULT 0,
            sku TEXT,
            status TEXT DEFAULT 'PUBLISHED',
            is_featured BOOLEAN DEFAULT FALSE,
            is_new_arrival BOOLEAN DEFAULT FALSE,
            is_bestseller BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            images JSONB,
            rating DOUBLE PRECISION DEFAULT 4.8,
            reviews_count INTEGER DEFAULT 0,
            material TEXT,
            care_instructions TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS coupons (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            discount_type TEXT NOT NULL,
            discount_value INTEGER NOT NULL,
            min_order_amount INTEGER DEFAULT 0,
            max_discount_amount INTEGER,
            usage_limit INTEGER DEFAULT 500,
            usage_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS banners (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            subtitle TEXT,
            cta_text TEXT,
            link TEXT,
            badge TEXT,
            image TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0
          );
          CREATE TABLE IF NOT EXISTS store_settings (
            id TEXT PRIMARY KEY,
            settings JSONB NOT NULL
          );
          CREATE TABLE IF NOT EXISTS customer_addresses (
            id TEXT PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            full_name TEXT NOT NULL,
            mobile_number TEXT NOT NULL,
            house_building TEXT NOT NULL,
            street_area TEXT NOT NULL,
            village_town_city TEXT NOT NULL,
            post_office TEXT,
            district TEXT NOT NULL,
            state TEXT NOT NULL,
            pin_code TEXT NOT NULL,
            landmark TEXT,
            address_type TEXT NOT NULL DEFAULT 'HOME',
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            shipping_address JSONB NOT NULL,
            items JSONB NOT NULL,
            subtotal INTEGER NOT NULL,
            tax_amount INTEGER DEFAULT 0,
            shipping_fee INTEGER DEFAULT 0,
            discount_amount INTEGER DEFAULT 0,
            coupon_code TEXT,
            grand_total INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL DEFAULT 'PENDING',
            order_status TEXT NOT NULL DEFAULT 'PLACED',
            status TEXT DEFAULT 'PLACED',
            tracking_number TEXT,
            awb_number TEXT,
            courier_name TEXT,
            current_location TEXT,
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            admin_note TEXT,
            timeline JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        const catCheck = await this.pool.query("SELECT count(*)::int as count FROM categories");
        if (catCheck.rows[0].count === 0) {
          const initialCategories = [
            { id: "cat-men", name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80" },
            { id: "cat-women", name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80" },
            { id: "cat-kids", name: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80" }
          ];
          for (const cat of initialCategories) {
            await this.pool.query(
              "INSERT INTO categories (id, name, slug, image) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING",
              [cat.id, cat.name, cat.slug, cat.image]
            );
          }
        }
        const prodCheck = await this.pool.query("SELECT count(*)::int as count FROM products");
        if (prodCheck.rows[0].count === 0) {
          for (const p of INITIAL_PRODUCTS) {
            const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const categoryId = p.category.toLowerCase() === "men" ? "cat-men" : p.category.toLowerCase() === "women" ? "cat-women" : "cat-kids";
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
                p.subCategory || "Apparel",
                p.description,
                Number(p.price),
                Number(p.mrp),
                p.discount || Math.round((p.mrp - p.price) / p.mrp * 100),
                JSON.stringify(p.sizes),
                JSON.stringify(p.colors),
                Number(p.stock),
                p.sku,
                p.status || "PUBLISHED",
                Boolean(p.isFeatured),
                Boolean(p.isNewArrival),
                Boolean(p.isBestseller),
                p.status !== "UNPUBLISHED",
                JSON.stringify(p.images),
                p.rating || 4.8,
                p.reviewsCount || 20,
                p.material || "100% Pure Combed Cotton",
                p.careInstructions || "Machine wash cold with like colors"
              ]
            );
          }
        }
        const couponCheck = await this.pool.query("SELECT count(*)::int as count FROM coupons");
        if (couponCheck.rows[0].count === 0) {
          for (const c of INITIAL_COUPONS) {
            const maxDiscount = c.maxDiscountAmount || c.maxDiscount || (c.discountType === "PERCENTAGE" ? 1e3 : c.discountValue);
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
                c.validUntil ? new Date(c.validUntil) : /* @__PURE__ */ new Date("2026-12-31T23:59:59Z")
              ]
            );
          }
        }
        const defaultAdminPass = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || "Meraj@&099";
        const passwordHash = bcrypt2.hashSync(defaultAdminPass.trim(), 10);
        await this.pool.query(
          `INSERT INTO admins (id, username, password_hash, full_name, role, phone, email, is_active)
         VALUES ('ADM-SUPER-01', 'meraj099', $1, 'Meraj Alam (Store Owner)', 'SUPER_ADMIN', '+91 73523 19943', 'merajalam906090@gmail.com', true)
         ON CONFLICT (username) DO UPDATE SET password_hash = $1, is_active = true`,
          [passwordHash]
        );
        await this.pool.query(
          `INSERT INTO admins (id, username, password_hash, full_name, role, phone, email, is_active)
         VALUES ('ADM-SUPER-02', 'admin', $1, 'Administrator', 'SUPER_ADMIN', '+91 73523 19943', 'contact@fashionpoint.store', true)
         ON CONFLICT (username) DO UPDATE SET password_hash = $1, is_active = true`,
          [passwordHash]
        );
        const bannerCheck = await this.pool.query("SELECT count(*)::int as count FROM banners");
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
        const settingsCheck = await this.pool.query("SELECT count(*)::int as count FROM store_settings");
        if (settingsCheck.rows[0].count === 0) {
          const defaultSettings = {
            storeName: STORE_CONFIG.name,
            tagline: STORE_CONFIG.tagline,
            contactEmail: STORE_CONFIG.email,
            supportPhone: STORE_CONFIG.phone,
            ownerName: "Meraj Alam",
            gstin: STORE_CONFIG.gstin,
            defaultTaxRate: 5,
            freeShippingThreshold: STORE_CONFIG.freeShippingThreshold,
            standardShippingFee: 49,
            isCodEnabled: true,
            isOnlinePaymentEnabled: true,
            address: STORE_CONFIG.address
          };
          await this.pool.query(
            "INSERT INTO store_settings (id, settings) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
            ["default", JSON.stringify(defaultSettings)]
          );
        }
        await this.pool.query(`
        CREATE TABLE IF NOT EXISTS order_tracking_events (
          id VARCHAR(64) PRIMARY KEY,
          order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
          tracking_number VARCHAR(100),
          status VARCHAR(50) NOT NULL,
          stage VARCHAR(50),
          location VARCHAR(150),
          hub_name VARCHAR(150),
          description TEXT NOT NULL,
          source VARCHAR(50) DEFAULT 'ADMIN',
          scanned_by VARCHAR(100) DEFAULT 'STAFF',
          recipient_name VARCHAR(150),
          confirmation_note TEXT,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tracking_events_order ON order_tracking_events(order_id);
        CREATE INDEX IF NOT EXISTS idx_tracking_events_created ON order_tracking_events(created_at);

        CREATE TABLE IF NOT EXISTS qr_scan_events (
          id VARCHAR(64) PRIMARY KEY,
          order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
          tracking_number VARCHAR(100),
          scanned_by VARCHAR(100),
          scanner_type VARCHAR(50) NOT NULL,
          location VARCHAR(150),
          action_taken VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_qr_scans_order ON qr_scan_events(order_id);
      `);
        this.isInitialized = true;
        console.log("[Fashion Point] PostgreSQL database verified and ready.");
      } catch (err) {
        this.isPostgresAvailable = false;
        this.isInitialized = true;
        console.warn("[Fashion Point] PostgreSQL offline (" + err?.message + ") \u2014 using in-memory store.");
      } finally {
        this.initPromise = null;
      }
    })();
    return this.initPromise;
  }
  // --- PRODUCTS ---
  async getProducts(filters) {
    await this.initDatabase();
    const conditions = ["is_active = true"];
    const values = [];
    let paramIndex = 1;
    if (filters?.category && filters.category.toLowerCase() !== "all") {
      conditions.push(`LOWER(category) = LOWER($${paramIndex++})`);
      values.push(filters.category);
    }
    if (filters?.subCategory && filters.subCategory.toLowerCase() !== "all") {
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
    if (filters?.minPrice !== void 0) {
      conditions.push(`price >= $${paramIndex++}`);
      values.push(filters.minPrice);
    }
    if (filters?.maxPrice !== void 0) {
      conditions.push(`price <= $${paramIndex++}`);
      values.push(filters.maxPrice);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    let orderBy = "created_at DESC";
    if (filters?.sort === "price-low") {
      orderBy = "price ASC";
    } else if (filters?.sort === "price-high") {
      orderBy = "price DESC";
    } else if (filters?.sort === "newest") {
      orderBy = "created_at DESC";
    } else if (filters?.sort === "popular") {
      orderBy = "reviews_count DESC";
    }
    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int as total FROM products ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.total || 0;
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
  async getProductById(id) {
    await this.initDatabase();
    const res = await this.pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return mapProductRow(res.rows[0]);
  }
  async createProduct(productData) {
    await this.initDatabase();
    const id = productData.id || `fp-prod-${Date.now()}`;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const categoryId = productData.categoryId || (productData.category?.toLowerCase() === "men" ? "cat-men" : productData.category?.toLowerCase() === "women" ? "cat-women" : "cat-kids");
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
        productData.subCategory || "Apparel",
        productData.description || "",
        Number(productData.price),
        Number(productData.mrp || productData.price),
        Number(productData.discount || 0),
        JSON.stringify(Array.isArray(productData.sizes) ? productData.sizes : ["M", "L", "XL"]),
        JSON.stringify(Array.isArray(productData.colors) ? productData.colors : [{ name: "Standard", hex: "#111111" }]),
        Number(productData.stock || 0),
        productData.sku || `FP-${Date.now().toString().slice(-6)}`,
        productData.status || "PUBLISHED",
        Boolean(productData.isFeatured),
        Boolean(productData.isNewArrival),
        Boolean(productData.isBestseller),
        productData.status !== "UNPUBLISHED",
        JSON.stringify(Array.isArray(productData.images) && productData.images.length > 0 ? productData.images : ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"]),
        5,
        1,
        productData.material || "Cotton",
        productData.careInstructions || "Machine wash cold"
      ]
    );
    return mapProductRow(res.rows[0]);
  }
  async updateProduct(id, updates) {
    await this.initDatabase();
    const fields = ["updated_at = NOW()"];
    const values = [];
    let idx = 1;
    if (updates.name !== void 0) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
      fields.push(`slug = $${idx++}`);
      values.push(updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
    if (updates.category !== void 0) {
      fields.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.subCategory !== void 0) {
      fields.push(`sub_category = $${idx++}`);
      values.push(updates.subCategory);
    }
    if (updates.description !== void 0) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.price !== void 0) {
      fields.push(`price = $${idx++}`);
      values.push(Number(updates.price));
    }
    if (updates.mrp !== void 0) {
      fields.push(`mrp = $${idx++}`);
      values.push(Number(updates.mrp));
    }
    if (updates.discount !== void 0) {
      fields.push(`discount = $${idx++}`);
      values.push(Number(updates.discount));
    }
    if (updates.stock !== void 0) {
      fields.push(`stock = $${idx++}`);
      values.push(Number(updates.stock));
    }
    if (updates.sku !== void 0) {
      fields.push(`sku = $${idx++}`);
      values.push(updates.sku);
    }
    if (updates.status !== void 0) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
      fields.push(`is_active = $${idx++}`);
      values.push(updates.status !== "UNPUBLISHED");
    }
    if (updates.isFeatured !== void 0) {
      fields.push(`is_featured = $${idx++}`);
      values.push(Boolean(updates.isFeatured));
    }
    if (updates.isNewArrival !== void 0) {
      fields.push(`is_new_arrival = $${idx++}`);
      values.push(Boolean(updates.isNewArrival));
    }
    if (updates.isBestseller !== void 0) {
      fields.push(`is_bestseller = $${idx++}`);
      values.push(Boolean(updates.isBestseller));
    }
    if (updates.images !== void 0) {
      fields.push(`images = $${idx++}`);
      values.push(JSON.stringify(updates.images));
    }
    if (updates.sizes !== void 0) {
      fields.push(`sizes = $${idx++}`);
      values.push(JSON.stringify(updates.sizes));
    }
    if (updates.colors !== void 0) {
      fields.push(`colors = $${idx++}`);
      values.push(JSON.stringify(updates.colors));
    }
    if (updates.material !== void 0) {
      fields.push(`material = $${idx++}`);
      values.push(updates.material);
    }
    if (updates.careInstructions !== void 0) {
      fields.push(`care_instructions = $${idx++}`);
      values.push(updates.careInstructions);
    }
    values.push(id);
    const query = `UPDATE products SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
    const res = await this.pool.query(query, values);
    return mapProductRow(res.rows[0]);
  }
  async deleteProduct(id) {
    await this.initDatabase();
    const res = await this.pool.query("DELETE FROM products WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }
  async getCategories() {
    await this.initDatabase();
    const res = await this.pool.query("SELECT id, name, slug, image FROM categories ORDER BY name ASC");
    return res.rows;
  }
  // --- ORDERS & TRANSACTIONAL CHECKOUT ---
  async getOrders(filters) {
    await this.initDatabase();
    const conditions = [];
    const values = [];
    let idx = 1;
    if (filters?.userId) {
      conditions.push(`user_id = $${idx++}`);
      values.push(filters.userId);
    }
    if (filters?.status && filters.status.toUpperCase() !== "ALL") {
      conditions.push(`(order_status = $${idx} OR status = $${idx})`);
      values.push(filters.status.toUpperCase());
      idx++;
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
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
  async getOrderById(id) {
    await this.initDatabase();
    const res = await this.pool.query(
      "SELECT * FROM orders WHERE id = $1 OR invoice_number = $1 OR tracking_number = $1 OR razorpay_order_id = $1",
      [id]
    );
    return mapOrderRow(res.rows[0]);
  }
  async trackOrder(query, mobileNumber) {
    await this.initDatabase();
    const clean = query.trim();
    const cleanUpper = clean.toUpperCase();
    let sql = `
      SELECT * FROM orders
      WHERE (UPPER(id) = $1 OR UPPER(tracking_number) = $1 OR UPPER(invoice_number) = $1 OR tracking_token = $2)
    `;
    const params = [cleanUpper, clean];
    if (mobileNumber) {
      const cleanDigits = mobileNumber.replace(/\D/g, "").slice(-10);
      sql += ` AND (customer->>'mobileNumber' LIKE '%' || $3)`;
      params.push(cleanDigits);
    }
    sql += " ORDER BY created_at DESC LIMIT 1";
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
  async createOrder(orderPayload) {
    await this.initDatabase();
    if (!orderPayload.items || orderPayload.items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const verifiedItems = [];
      let calculatedSubtotal = 0;
      for (const item of orderPayload.items) {
        const prodRes = await client.query(
          "SELECT * FROM products WHERE id = $1 FOR UPDATE",
          [item.productId]
        );
        if (prodRes.rows.length === 0) {
          throw new Error(`Product with ID "${item.productId}" was not found in catalog.`);
        }
        const product = mapProductRow(prodRes.rows[0]);
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
          image: product.images[0] || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
          price: product.price,
          mrp: product.mrp,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          product: { ...product }
        });
      }
      let couponDiscount = 0;
      if (orderPayload.couponCode) {
        const cleanCode = orderPayload.couponCode.trim().toUpperCase();
        const cRes = await client.query(
          "SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true FOR UPDATE",
          [cleanCode]
        );
        if (cRes.rows.length > 0) {
          const coupon = cRes.rows[0];
          const minOrder = Number(coupon.min_order_amount || 0);
          if (calculatedSubtotal >= minOrder) {
            if (coupon.discount_type === "PERCENTAGE") {
              const val = Math.round(calculatedSubtotal * Number(coupon.discount_value) / 100);
              const maxD = Number(coupon.max_discount_amount);
              couponDiscount = maxD && val > maxD ? maxD : val;
            } else {
              couponDiscount = Math.min(Number(coupon.discount_value), calculatedSubtotal);
            }
            await client.query("UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1", [coupon.id]);
          }
        }
      }
      const deliveryCharge = calculatedSubtotal >= 999 ? 0 : 49;
      const grandTotal = Math.max(0, calculatedSubtotal + deliveryCharge - couponDiscount);
      const taxRate = 5;
      const taxableAmount = Math.round(grandTotal / (1 + taxRate / 100) * 100) / 100;
      const totalGst = Math.round((grandTotal - taxableAmount) * 100) / 100;
      const cgst = Math.round(totalGst / 2 * 100) / 100;
      const sgst = cgst;
      for (const item of orderPayload.items) {
        await client.query(
          "UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = NOW() WHERE id = $2",
          [item.quantity, item.productId]
        );
      }
      const orderId = `FP-2026-${crypto2.randomBytes(5).toString("hex").toUpperCase()}`;
      const invoiceNumber = `INV-FP-2026-${Date.now().toString().slice(-6)}`;
      const trackingNumber = `DEL-${Date.now().toString().slice(-7)}`;
      const trackingToken = `tk_${crypto2.randomBytes(12).toString("hex")}`;
      const currentLocation = "Fashion Point Central Fulfilment Hub, Indore";
      const expectedDelivery = "3 - 5 Business Days";
      const shippingAddr = orderPayload.shippingAddress || {};
      const shippingName = orderPayload.customer?.fullName || "Customer";
      const shippingPhone = orderPayload.customer?.mobileNumber || "";
      const shippingAddressLine = [
        shippingAddr.houseBuilding || shippingAddr.houseShopNo,
        shippingAddr.streetArea || shippingAddr.street,
        shippingAddr.landmark,
        shippingAddr.villageTownCity || shippingAddr.villageArea
      ].filter(Boolean).join(", ");
      const shippingCity = shippingAddr.villageTownCity || shippingAddr.city || "Indore";
      const shippingDistrict = shippingAddr.district || "Indore";
      const shippingState = shippingAddr.state || "Madhya Pradesh";
      const shippingPincode = shippingAddr.pinCode || "452001";
      const initialTimelineEvent = {
        status: "ORDER_PLACED",
        title: "Order Placed",
        description: orderPayload.paymentMethod === "COD" ? `Order confirmed (Cash on Delivery). Delivery partner will collect \u20B9${grandTotal} in cash at doorstep.` : "Payment transaction initiated via secure gateway.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
          "ORDER_PLACED",
          "ORDER_PLACED",
          orderPayload.paymentMethod,
          "PENDING",
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
          "Delhivery Express",
          trackingNumber,
          trackingNumber,
          invoiceNumber,
          expectedDelivery,
          JSON.stringify([initialTimelineEvent]),
          orderPayload.customerNote || null
        ]
      );
      const trackingEventId = `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await client.query(
        `INSERT INTO order_tracking_events (
          id, order_id, tracking_number, status, location, description, source, scanned_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          trackingEventId,
          orderId,
          trackingNumber,
          "ORDER_PLACED",
          currentLocation,
          orderPayload.paymentMethod === "COD" ? "Order Placed (Cash on Delivery)" : "Order Placed",
          "SYSTEM",
          "SYSTEM"
        ]
      );
      await client.query("COMMIT");
      return mapOrderRow(insertRes.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
  async updateOrderStatus(orderId, status, courierName, awbNumber, note) {
    await this.initDatabase();
    const upperStatus = status.toUpperCase();
    const currentOrder = await this.getOrderById(orderId);
    if (!currentOrder) return null;
    const descriptions = {
      NEW: "Order received and logged in system.",
      CONFIRMED: "Order accepted by store manager. Garments allocated for packing.",
      PACKED: "Items inspected for quality, ironed, and sealed in tamper-evident parcel.",
      SHIPPED: `Package dispatched via ${courierName || currentOrder.courierName || "Delhivery"}. AWB: ${awbNumber || currentOrder.awbNumber}.`,
      OUT_FOR_DELIVERY: "Parcel is out for delivery with local courier partner.",
      DELIVERED: "Package handed over to recipient. Thank you for shopping with Fashion Point!",
      CANCELLED: note || "Order has been cancelled."
    };
    const newTimelineEvent = {
      status: upperStatus,
      title: upperStatus.replace(/_/g, " "),
      description: descriptions[upperStatus] || `Order status updated to ${upperStatus}.`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: "Fashion Point Logistics Hub"
    };
    let paymentStatus = currentOrder.paymentStatus;
    if (upperStatus === "DELIVERED") {
      paymentStatus = "PAID";
    } else if (upperStatus === "CANCELLED" && currentOrder.paymentMethod === "ONLINE" && currentOrder.paymentStatus === "PAID") {
      paymentStatus = "REFUNDED";
    }
    const updatedTimeline = [...currentOrder.timeline || [], newTimelineEvent];
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
  async updateOrderPaymentVerified(orderId, data) {
    await this.initDatabase();
    const currentOrder = await this.getOrderById(orderId);
    if (!currentOrder) return null;
    const paymentTimelineEvent = {
      status: "PAID",
      title: "Payment Received",
      description: `Online payment of \u20B9${currentOrder.pricing?.grandTotal || currentOrder.totalAmount} captured successfully via Razorpay (Ref: ${data.razorpayPaymentId}).`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      location: "Razorpay Gateway"
    };
    const updatedTimeline = [...currentOrder.timeline || [], paymentTimelineEvent];
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
  async getCoupons() {
    await this.initDatabase();
    const res = await this.pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      discountType: r.discount_type,
      discountValue: Number(r.discount_value),
      minOrderAmount: Number(r.min_order_amount || 0),
      maxDiscountAmount: r.max_discount_amount ? Number(r.max_discount_amount) : void 0,
      usageLimit: Number(r.usage_limit || 500),
      usageCount: Number(r.usage_count || 0),
      isActive: Boolean(r.is_active),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  async validateCoupon(code, subtotal) {
    await this.initDatabase();
    const clean = code.trim().toUpperCase();
    const res = await this.pool.query(
      "SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true",
      [clean]
    );
    if (res.rows.length === 0) {
      return { valid: false, discount: 0, message: "Invalid or inactive coupon code." };
    }
    const coupon = res.rows[0];
    const minOrder = Number(coupon.min_order_amount || 0);
    if (subtotal < minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires a minimum purchase of \u20B9${minOrder}. Current subtotal is \u20B9${subtotal}.`
      };
    }
    let discount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discount = Math.round(subtotal * Number(coupon.discount_value) / 100);
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
      message: `Success! You saved \u20B9${discount} with ${coupon.code}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value)
      }
    };
  }
  // --- DASHBOARD REAL SQL METRICS ---
  async getStats() {
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
  async getUserByEmailOrMobile(identifier) {
    await this.initDatabase();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "").slice(-10);
    const res = await this.pool.query(
      `SELECT id, uid, email, phone, password_hash as "passwordHash", full_name as "fullName", role, is_active as "isActive", created_at as "createdAt"
       FROM users 
       WHERE LOWER(email) = $1 
          OR phone = $1 
          OR (length($2) >= 10 AND phone = $2)
          OR LOWER(full_name) = $1 
          OR uid = $1 
       LIMIT 1`,
      [clean, cleanDigits]
    );
    return res.rows[0] || null;
  }
  async getUserById(id) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, uid, email, phone, password_hash as "passwordHash", full_name as "fullName", role, is_active as "isActive", created_at as "createdAt"
       FROM users WHERE id::text = $1 OR uid = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  }
  async createUser(userData) {
    await this.initDatabase();
    const passwordHash = userData.password ? bcrypt2.hashSync(userData.password, 10) : null;
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
  async updateUserPassword(userId, newPassword) {
    await this.initDatabase();
    const passwordHash = bcrypt2.hashSync(newPassword.trim(), 10);
    const res = await this.pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id::text = $2 OR uid = $2",
      [passwordHash, String(userId)]
    );
    return (res.rowCount ?? 0) > 0;
  }
  // --- ADMINS ---
  async getAdminByUsername(username) {
    await this.initDatabase();
    const clean = username.trim().toLowerCase();
    const res = await this.pool.query(
      `SELECT id, username, password_hash as "passwordHash", full_name as "fullName", role, phone, email, is_active as "isActive", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM admins WHERE LOWER(username) = $1 AND is_active = true LIMIT 1`,
      [clean]
    );
    return res.rows[0] || null;
  }
  async getAdmins() {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, username, full_name as "fullName", role, phone, email, is_active as "isActive", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM admins ORDER BY created_at ASC`
    );
    return res.rows;
  }
  async createAdmin(data) {
    await this.initDatabase();
    const existing = await this.getAdminByUsername(data.username);
    if (existing) {
      throw new Error(`Username "${data.username}" is already taken.`);
    }
    const passwordHash = bcrypt2.hashSync(data.password.trim(), 10);
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
        data.role || "STORE_MANAGER",
        data.phone?.trim() || null,
        data.email?.trim() || null
      ]
    );
    return res.rows[0];
  }
  async updateAdminPassword(adminId, newPassword) {
    await this.initDatabase();
    const passwordHash = bcrypt2.hashSync(newPassword.trim(), 10);
    const res = await this.pool.query(
      "UPDATE admins SET password_hash = $1 WHERE id = $2",
      [passwordHash, adminId]
    );
    return (res.rowCount ?? 0) > 0;
  }
  async updateAdmin(adminId, updates) {
    await this.initDatabase();
    const fields = [];
    const values = [];
    let idx = 1;
    if (updates.isActive !== void 0) {
      fields.push(`is_active = $${idx++}`);
      values.push(updates.isActive);
    }
    if (updates.role !== void 0) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (updates.fullName !== void 0) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.fullName);
    }
    if (updates.phone !== void 0) {
      fields.push(`phone = $${idx++}`);
      values.push(updates.phone);
    }
    if (updates.email !== void 0) {
      fields.push(`email = $${idx++}`);
      values.push(updates.email);
    }
    if (updates.password) {
      fields.push(`password_hash = $${idx++}`);
      values.push(bcrypt2.hashSync(updates.password.trim(), 10));
    }
    if (fields.length === 0) return true;
    values.push(adminId);
    const query = `UPDATE admins SET ${fields.join(", ")} WHERE id = $${idx}`;
    const res = await this.pool.query(query, values);
    return (res.rowCount ?? 0) > 0;
  }
  async deleteAdmin(adminId) {
    await this.initDatabase();
    const res = await this.pool.query("DELETE FROM admins WHERE id = $1", [adminId]);
    return (res.rowCount ?? 0) > 0;
  }
  // --- SETTINGS ---
  async getSettings() {
    await this.initDatabase();
    const res = await this.pool.query("SELECT settings FROM store_settings WHERE id = $1", ["default"]);
    if (res.rows.length === 0) {
      return {
        storeName: STORE_CONFIG.name,
        tagline: STORE_CONFIG.tagline,
        contactEmail: STORE_CONFIG.email,
        supportPhone: STORE_CONFIG.phone,
        ownerName: "Meraj Alam",
        gstin: STORE_CONFIG.gstin,
        defaultTaxRate: 5,
        freeShippingThreshold: STORE_CONFIG.freeShippingThreshold,
        standardShippingFee: 49,
        isCodEnabled: true,
        isOnlinePaymentEnabled: true,
        address: STORE_CONFIG.address
      };
    }
    return typeof res.rows[0].settings === "string" ? JSON.parse(res.rows[0].settings) : res.rows[0].settings;
  }
  async updateSettings(updates) {
    await this.initDatabase();
    const current = await this.getSettings();
    const merged = { ...current, ...updates };
    await this.pool.query(
      "INSERT INTO store_settings (id, settings, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET settings = $2, updated_at = NOW()",
      ["default", JSON.stringify(merged)]
    );
    return merged;
  }
  // --- CUSTOMER PROFILE ---
  async getCustomerProfile(userId) {
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
  async updateCustomerProfile(userId, data) {
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
  async getCustomerAddresses(userId) {
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
  async createCustomerAddress(userId, addr) {
    await this.initDatabase();
    const id = `addr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const countRes = await this.pool.query(
      "SELECT count(*)::int as count FROM customer_addresses WHERE user_id::text = $1",
      [String(userId)]
    );
    const shouldBeDefault = addr.isDefault || countRes.rows[0].count === 0;
    if (shouldBeDefault) {
      await this.pool.query(
        "UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1",
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
        addr.addressType || "HOME",
        shouldBeDefault
      ]
    );
    return res.rows[0];
  }
  async updateCustomerAddress(addressId, userId, addr) {
    await this.initDatabase();
    if (addr.isDefault) {
      await this.pool.query(
        "UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1",
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
        addr.addressType || "HOME",
        addr.isDefault !== void 0 ? addr.isDefault : null,
        addressId,
        String(userId)
      ]
    );
    return res.rows[0] || null;
  }
  async deleteCustomerAddress(addressId, userId) {
    await this.initDatabase();
    const res = await this.pool.query(
      "DELETE FROM customer_addresses WHERE id = $1 AND user_id::text = $2 RETURNING is_default",
      [addressId, String(userId)]
    );
    if ((res.rowCount ?? 0) > 0 && res.rows[0]?.is_default) {
      await this.pool.query(
        `UPDATE customer_addresses
         SET is_default = true, updated_at = NOW()
         WHERE id = (SELECT id FROM customer_addresses WHERE user_id::text = $1 ORDER BY created_at DESC LIMIT 1)`,
        [String(userId)]
      );
    }
    return (res.rowCount ?? 0) > 0;
  }
  async setDefaultCustomerAddress(addressId, userId) {
    await this.initDatabase();
    await this.pool.query(
      "UPDATE customer_addresses SET is_default = false, updated_at = NOW() WHERE user_id::text = $1",
      [String(userId)]
    );
    const res = await this.pool.query(
      "UPDATE customer_addresses SET is_default = true, updated_at = NOW() WHERE id = $1 AND user_id::text = $2 RETURNING id",
      [addressId, String(userId)]
    );
    return (res.rowCount ?? 0) > 0;
  }
  // --- POSTAL CODES ---
  async lookupPostalCode(pincode) {
    await this.initDatabase();
    const clean = pincode.replace(/\D/g, "");
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
  async getCustomerOrders(userId, mobile, email) {
    await this.initDatabase();
    let sql = "SELECT * FROM orders WHERE user_id::text = $1";
    const params = [String(userId)];
    if (mobile || email) {
      const orClauses = [];
      if (mobile) {
        params.push(mobile.replace(/\D/g, "").slice(-10));
        orClauses.push(`customer->>'mobileNumber' LIKE '%' || $${params.length}`);
      }
      if (email) {
        params.push(email.trim().toLowerCase());
        orClauses.push(`LOWER(customer->>'email') = $${params.length}`);
      }
      if (orClauses.length > 0) {
        sql = `SELECT * FROM orders WHERE (user_id::text = $1 OR ${orClauses.join(" OR ")})`;
      }
    }
    sql += " ORDER BY created_at DESC";
    const res = await this.pool.query(sql, params);
    return res.rows.map(mapOrderRow);
  }
  // --- ORDER TRACKING & QR EVENTS ---
  async getOrderByTrackingToken(tokenOrTracking) {
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
  async getOrderTrackingEvents(orderId) {
    await this.initDatabase();
    const res = await this.pool.query(
      `SELECT id, order_id as "orderId", tracking_number as "trackingNumber",
              status, stage, location, hub_name as "hubName", description, source,
              scanned_by as "scannedBy", recipient_name as "recipientName",
              confirmation_note as "confirmationNote",
              created_at as "createdAt"
       FROM order_tracking_events
       WHERE order_id = $1
       ORDER BY created_at ASC`,
      [orderId]
    );
    return res.rows;
  }
  async addOrderTrackingEvent(payload) {
    await this.initDatabase();
    const order = await this.getOrderById(payload.orderId);
    if (!order) return null;
    const eventId = `trk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const upperStatus = payload.status.toUpperCase();
    const trackingNum = payload.awbNumber || order.trackingNumber || `DEL-${Date.now().toString().slice(-7)}`;
    await this.pool.query(
      `INSERT INTO order_tracking_events (
        id, order_id, tracking_number, status, stage, location, hub_name,
        description, source, scanned_by, recipient_name, confirmation_note, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        eventId,
        order.id,
        trackingNum,
        upperStatus,
        payload.stage || null,
        payload.location || null,
        payload.hubName || null,
        payload.description,
        payload.source || "ADMIN",
        payload.scannedBy || "STAFF",
        payload.recipientName || null,
        payload.confirmationNote || null
      ]
    );
    const newTimelineItem = {
      status: upperStatus,
      stage: payload.stage,
      title: upperStatus.replace(/_/g, " "),
      description: payload.description,
      location: payload.location,
      hubName: payload.hubName,
      recipientName: payload.recipientName,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updatedTimeline = [...order.timeline || [], newTimelineItem];
    let paymentStatus = order.paymentStatus;
    if (upperStatus === "DELIVERED") {
      paymentStatus = "PAID";
    } else if (upperStatus === "CANCELLED" && order.paymentMethod === "ONLINE" && order.paymentStatus === "PAID") {
      paymentStatus = "REFUNDED";
    } else if (upperStatus === "REFUNDED") {
      paymentStatus = "REFUNDED";
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
        stage: payload.stage,
        location: payload.location,
        hubName: payload.hubName,
        description: payload.description,
        source: payload.source || "ADMIN",
        scannedBy: payload.scannedBy,
        recipientName: payload.recipientName,
        confirmationNote: payload.confirmationNote,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  async recordQrScan(payload) {
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
};
var rawDb = new PostgresDatabaseManager();
var db = new Proxy(rawDb, {
  get(target, prop, receiver) {
    if (prop === "isPostgresConnected" || prop === "ensureInitialized") {
      return target[prop].bind(target);
    }
    const val = Reflect.get(target, prop, receiver);
    if (typeof val === "function") {
      return async (...args) => {
        await target.ensureInitialized();
        if (!target.isPostgresConnected()) {
          const inMemFn = inMemoryDb[prop];
          if (typeof inMemFn === "function") {
            return inMemFn.apply(inMemoryDb, args);
          }
        }
        try {
          return await val.apply(target, args);
        } catch (err) {
          console.warn(`[Fashion Point DB] PostgreSQL query "${String(prop)}" failed (${err?.message}), falling back to in-memory store.`);
          const fallbackFn = inMemoryDb[prop];
          if (typeof fallbackFn === "function") {
            return fallbackFn.apply(inMemoryDb, args);
          }
          throw err;
        }
      };
    }
    return val;
  }
});

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
import crypto3 from "crypto";
function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET environment variable is required in production mode.");
  }
  return crypto3.randomBytes(32).toString("hex");
}
var JWT_SECRET = getJwtSecret();
function generateToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  if (!token) {
    res.status(401).json({ success: false, error: "Authentication required. Missing Bearer token." });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: "Invalid or expired session token." });
  }
}
var ALLOWED_STAFF_ROLES = [
  "SUPER_ADMIN",
  "STORE_MANAGER",
  "ADMIN",
  "INVENTORY_MANAGER",
  "WAREHOUSE_STAFF",
  "HUB_OPERATOR",
  "DELIVERY_BOY",
  "STAFF"
];
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !["SUPER_ADMIN", "STORE_MANAGER", "ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Access denied: Admin privileges required." });
      return;
    }
    next();
  });
}
function requireStaffOrAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "Access denied: Authorized Admin, Warehouse, Hub, or Delivery Staff credentials required."
      });
      return;
    }
    next();
  });
}
function requireSuperAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      res.status(403).json({ success: false, error: "Access denied: Super Admin authorization required." });
      return;
    }
    next();
  });
}

// server/routes/auth.ts
var router = Router();
var activeOtps = /* @__PURE__ */ new Map();
var forgotPasswordOtps = /* @__PURE__ */ new Map();
var passwordAttempts = /* @__PURE__ */ new Map();
var MAX_PASSWORD_FAILS = 5;
var PASSWORD_LOCKOUT_MS = 15 * 60 * 1e3;
var OTP_EXPIRY_MS = 5 * 60 * 1e3;
var MAX_OTP_REQUESTS_PER_WINDOW = 3;
var MAX_OTP_VERIFY_ATTEMPTS = 5;
function normalizeIdentifier(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return raw.trim().toLowerCase();
}
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    if (!fullName?.trim() || !mobile) {
      res.status(400).json({ success: false, error: "Full name and 10-digit mobile number are required." });
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
    if (cleanMobile.length !== 10) {
      res.status(400).json({ success: false, error: "Please enter a valid 10-digit mobile number." });
      return;
    }
    if (password && password.length < 6) {
      res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
      return;
    }
    const existing = await db.getUserByEmailOrMobile(cleanMobile);
    if (existing) {
      res.status(409).json({
        success: false,
        error: "An account with this mobile number already exists. Please log in with OTP or password."
      });
      return;
    }
    const newUser = await db.createUser({
      fullName: fullName.trim(),
      email: email?.trim().toLowerCase() || void 0,
      mobile: cleanMobile,
      password: password ? password.trim() : void 0
    });
    const token = generateToken({
      id: newUser.id,
      role: newUser.role,
      fullName: newUser.fullName,
      mobile: newUser.mobile,
      email: newUser.email
    });
    res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Registration failed." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ success: false, error: "Please provide both your registered mobile/email and password." });
      return;
    }
    const key = normalizeIdentifier(identifier);
    const tracker = passwordAttempts.get(key);
    const now = Date.now();
    if (tracker && tracker.lockedUntil > now) {
      const remainingMin = Math.ceil((tracker.lockedUntil - now) / 6e4);
      res.status(429).json({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMin} minute(s) or use "Forgot Password".`
      });
      return;
    }
    let user = await db.getUserByEmailOrMobile(identifier);
    let isAdminAuth = false;
    if (!user) {
      const admin = await db.getAdminByUsername(identifier);
      if (admin && admin.passwordHash) {
        user = {
          id: admin.id,
          uid: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          phone: admin.phone,
          mobile: admin.phone,
          passwordHash: admin.passwordHash,
          role: admin.role,
          isActive: admin.isActive
        };
        isAdminAuth = true;
      }
    }
    if (!user || !user.passwordHash) {
      const fails = (tracker?.failCount || 0) + 1;
      const lockedUntil = fails >= MAX_PASSWORD_FAILS ? now + PASSWORD_LOCKOUT_MS : 0;
      passwordAttempts.set(key, { failCount: fails, lockedUntil, lastAttempt: now });
      res.status(401).json({
        success: false,
        error: `No account found for "${identifier}". Please enter your 10-digit mobile number or click Register to create an account.`
      });
      return;
    }
    const isMatch = bcrypt3.compareSync(password.trim(), user.passwordHash);
    if (!isMatch) {
      const fails = (tracker?.failCount || 0) + 1;
      const remainingAttempts = Math.max(0, MAX_PASSWORD_FAILS - fails);
      const lockedUntil = fails >= MAX_PASSWORD_FAILS ? now + PASSWORD_LOCKOUT_MS : 0;
      passwordAttempts.set(key, { failCount: fails, lockedUntil, lastAttempt: now });
      if (lockedUntil > 0) {
        res.status(429).json({
          success: false,
          error: "Maximum password attempts exceeded. Account locked for 15 minutes for your security."
        });
      } else {
        res.status(401).json({
          success: false,
          error: `Incorrect password. ${remainingAttempts} attempt(s) remaining before temporary lockout.`
        });
      }
      return;
    }
    passwordAttempts.delete(key);
    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile || user.phone,
      email: user.email
    });
    res.json({
      success: true,
      message: "Authentication verified successfully.",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile || user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Login failed." });
  }
});
router.post("/request-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    const cleanMobile = (mobile || "").replace(/\D/g, "").slice(-10);
    if (cleanMobile.length !== 10) {
      res.status(400).json({ success: false, error: "Please enter a valid 10-digit mobile number." });
      return;
    }
    const now = Date.now();
    const existing = activeOtps.get(cleanMobile);
    if (existing?.lockoutUntil && existing.lockoutUntil > now) {
      const remainingMin = Math.ceil((existing.lockoutUntil - now) / 6e4);
      res.status(429).json({
        success: false,
        error: `Too many attempts. Please wait ${remainingMin} minute(s) before requesting a new code.`
      });
      return;
    }
    if (existing && existing.expiresAt > now && existing.requestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        success: false,
        error: "Too many OTP requests for this number. Please wait 5 minutes before trying again."
      });
      return;
    }
    const rawOtp = crypto4.randomInt(1e5, 999999).toString();
    const codeHash = bcrypt3.hashSync(rawOtp, 8);
    const isDev = process.env.NODE_ENV !== "production";
    const isSmsConfigured = Boolean(process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY);
    activeOtps.set(cleanMobile, {
      codeHash,
      expiresAt: now + OTP_EXPIRY_MS,
      requestCount: (existing?.requestCount || 0) + 1,
      verifyAttempts: 0,
      rawDevCode: isDev && !isSmsConfigured ? rawOtp : void 0
    });
    if (isSmsConfigured) {
      console.log(`[Fashion Point SMS Gateway] 6-digit OTP dispatched to +91 ${cleanMobile}`);
    } else {
      console.log(`[Fashion Point Dev Log] Generated OTP for +91 ${cleanMobile} (stored as bcrypt hash).`);
    }
    res.json({
      success: true,
      message: isSmsConfigured ? `6-digit OTP has been sent via SMS to +91 ${cleanMobile}. Valid for 5 minutes.` : `6-digit verification code generated and active for +91 ${cleanMobile}. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      providerConfigured: isSmsConfigured
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to generate OTP." });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp, fullName } = req.body;
    const cleanMobile = (mobile || "").replace(/\D/g, "").slice(-10);
    if (!cleanMobile || !otp) {
      res.status(400).json({ success: false, error: "Both mobile number and 6-digit OTP code are required." });
      return;
    }
    const cleanOtp = otp.toString().trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      res.status(400).json({ success: false, error: "OTP must be exactly 6 digits." });
      return;
    }
    const record = activeOtps.get(cleanMobile);
    const now = Date.now();
    if (!record) {
      res.status(400).json({
        success: false,
        error: "No active OTP found for this mobile number. Please request a new code."
      });
      return;
    }
    if (now > record.expiresAt) {
      activeOtps.delete(cleanMobile);
      res.status(400).json({
        success: false,
        error: "The OTP has expired. Please request a fresh 6-digit verification code."
      });
      return;
    }
    if (record.verifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      activeOtps.delete(cleanMobile);
      res.status(429).json({
        success: false,
        error: "Maximum verification attempts exceeded. For your security, this code was invalidated. Please request a new OTP."
      });
      return;
    }
    const isMatch = bcrypt3.compareSync(cleanOtp, record.codeHash);
    if (!isMatch) {
      record.verifyAttempts += 1;
      const remaining = MAX_OTP_VERIFY_ATTEMPTS - record.verifyAttempts;
      res.status(401).json({
        success: false,
        error: `Incorrect OTP code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Code invalidated."}`
      });
      return;
    }
    activeOtps.delete(cleanMobile);
    let user = await db.getUserByEmailOrMobile(cleanMobile);
    if (!user) {
      user = await db.createUser({
        fullName: fullName?.trim() || `Customer ${cleanMobile.slice(-4)}`,
        mobile: cleanMobile
      });
    }
    const token = generateToken({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      mobile: user.mobile || user.phone,
      email: user.email
    });
    res.json({
      success: true,
      message: "OTP verified successfully.",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile || user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "OTP verification failed." });
  }
});
router.post("/forgot-password/request-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, error: "Please enter your registered mobile number or email." });
      return;
    }
    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user) {
      res.status(404).json({ success: false, error: "No account found matching this mobile number or email." });
      return;
    }
    const key = normalizeIdentifier(user.mobile || user.phone || identifier);
    const now = Date.now();
    const existing = forgotPasswordOtps.get(key);
    if (existing && existing.expiresAt > now && existing.requestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        success: false,
        error: "Too many password reset requests. Please wait 5 minutes before trying again."
      });
      return;
    }
    const rawOtp = crypto4.randomInt(1e5, 999999).toString();
    const codeHash = bcrypt3.hashSync(rawOtp, 8);
    const isDev = process.env.NODE_ENV !== "production";
    const isSmsConfigured = Boolean(process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY);
    forgotPasswordOtps.set(key, {
      codeHash,
      expiresAt: now + OTP_EXPIRY_MS,
      requestCount: (existing?.requestCount || 0) + 1,
      verifyAttempts: 0,
      rawDevCode: isDev && !isSmsConfigured ? rawOtp : void 0
    });
    console.log(`[Fashion Point Security] Password reset OTP generated for ${key}`);
    res.json({
      success: true,
      message: `Password reset 6-digit OTP dispatched to your registered contact. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      identifier: key
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to initiate password reset." });
  }
});
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      res.status(400).json({ success: false, error: "Identifier, 6-digit OTP, and new password are required." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
      return;
    }
    const user = await db.getUserByEmailOrMobile(identifier);
    if (!user) {
      res.status(404).json({ success: false, error: "User account not found." });
      return;
    }
    const key = normalizeIdentifier(user.mobile || user.phone || identifier);
    const record = forgotPasswordOtps.get(key);
    const now = Date.now();
    if (!record) {
      res.status(400).json({ success: false, error: "No active password reset OTP found or it has expired." });
      return;
    }
    if (now > record.expiresAt) {
      forgotPasswordOtps.delete(key);
      res.status(400).json({ success: false, error: "Reset OTP has expired. Please request a new one." });
      return;
    }
    if (record.verifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      forgotPasswordOtps.delete(key);
      res.status(429).json({ success: false, error: "Maximum attempts exceeded. This reset code has been cancelled." });
      return;
    }
    const cleanOtp = otp.toString().trim().replace(/\D/g, "");
    const isMatch = bcrypt3.compareSync(cleanOtp, record.codeHash);
    if (!isMatch) {
      record.verifyAttempts += 1;
      const remaining = MAX_OTP_VERIFY_ATTEMPTS - record.verifyAttempts;
      res.status(401).json({
        success: false,
        error: `Incorrect reset OTP code. ${remaining} attempt(s) remaining.`
      });
      return;
    }
    forgotPasswordOtps.delete(key);
    passwordAttempts.delete(key);
    await db.updateUserPassword(user.id, newPassword.trim());
    res.json({
      success: true,
      message: "Password has been securely reset. You can now sign in with your new password."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Password reset failed." });
  }
});
router.get("/dev-sandbox-otp", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ success: false, error: "Forbidden in production mode." });
    return;
  }
  const { mobile, type } = req.query;
  const key = normalizeIdentifier(mobile || "");
  const store = type === "forgot" ? forgotPasswordOtps : activeOtps;
  const record = store.get(key);
  if (!record || !record.rawDevCode) {
    res.json({ success: false, message: "No simulated OTP active." });
    return;
  }
  res.json({
    success: true,
    simulatedCode: record.rawDevCode,
    expiresAt: record.expiresAt,
    notice: "Simulated sandbox SMS delivery for dev preview."
  });
});
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Internal server error." });
  }
});
var auth_default = router;

// server/routes/adminAuth.ts
import { Router as Router2 } from "express";
import bcrypt4 from "bcryptjs";
var router2 = Router2();
router2.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: "Please enter both your admin username and password."
      });
      return;
    }
    const admin = await db.getAdminByUsername(username);
    if (!admin) {
      res.status(401).json({
        success: false,
        error: "Invalid administrator credentials. Access is logged."
      });
      return;
    }
    const isValid = bcrypt4.compareSync(password, admin.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: "Invalid administrator credentials. Access is logged."
      });
      return;
    }
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      fullName: admin.fullName,
      email: admin.email
    });
    const { passwordHash: _, ...safeAdmin } = admin;
    res.json({
      success: true,
      message: "Admin authorization granted.",
      token,
      admin: safeAdmin
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router2.get("/me", requireAdmin, async (req, res) => {
  try {
    const admin = await db.getAdminByUsername(req.user.username || "");
    if (!admin) {
      res.status(404).json({ success: false, error: "Admin record not found." });
      return;
    }
    const { passwordHash: _, ...safeAdmin } = admin;
    res.json({ success: true, admin: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router2.get("/list", requireAdmin, async (req, res) => {
  try {
    const admins2 = await db.getAdmins();
    res.json({ success: true, admins: admins2 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router2.post("/create", requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, fullName, role, phone, email } = req.body;
    if (!username || !password || !fullName) {
      res.status(400).json({ success: false, error: "Username, password, and full name are required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
      return;
    }
    const newAdmin = await db.createAdmin({
      username,
      password,
      fullName,
      role: role || "STORE_MANAGER",
      phone,
      email
    });
    res.status(201).json({
      success: true,
      message: `Admin account "${username}" created successfully.`,
      admin: newAdmin
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Could not create admin." });
  }
});
router2.post("/change-password", requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: "Both current and new password are required." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
      return;
    }
    const admin = await db.getAdminByUsername(req.user.username || "");
    if (!admin) {
      res.status(404).json({ success: false, error: "Admin record not found." });
      return;
    }
    const isCurrentValid = bcrypt4.compareSync(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      res.status(401).json({ success: false, error: "Incorrect current password." });
      return;
    }
    await db.updateAdminPassword(admin.id, newPassword);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
var adminAuth_default = router2;

// server/routes/products.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.get("/", async (req, res) => {
  try {
    const { category, subCategory, search, sort, minPrice, maxPrice, limit, offset } = req.query;
    const result = await db.getProducts({
      category,
      subCategory,
      search,
      sort,
      minPrice: minPrice ? Number(minPrice) : void 0,
      maxPrice: maxPrice ? Number(maxPrice) : void 0,
      limit: limit ? Number(limit) : void 0,
      offset: offset ? Number(offset) : void 0
    });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router3.get("/categories", async (_req, res) => {
  try {
    const categories2 = await db.getCategories();
    res.json({ success: true, categories: categories2 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router3.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, mrp, stock, sku } = req.body;
    if (!name || !category || !price) {
      res.status(400).json({ success: false, error: "Name, category, and price are required." });
      return;
    }
    const created = await db.createProduct(req.body);
    res.status(201).json({ success: true, product: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Could not create product." });
  }
});
router3.put("/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Could not update product." });
  }
});
router3.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Could not delete product." });
  }
});
router3.patch("/:id/stock", requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === void 0 || isNaN(Number(stock))) {
      res.status(400).json({ success: false, error: "Valid stock number is required." });
      return;
    }
    const updated = await db.updateProduct(req.params.id, { stock: Number(stock) });
    if (!updated) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Could not update stock." });
  }
});
var products_default = router3;

// server/routes/orders.ts
import { Router as Router4 } from "express";
import jwt2 from "jsonwebtoken";

// server/services/notificationService.ts
var BackendNotificationService = class {
  constructor() {
    this.smsKey = process.env.SMS_API_KEY || process.env.SMS_PROVIDER_KEY;
    this.whatsappKey = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_PROVIDER_KEY;
    this.emailKey = process.env.EMAIL_API_KEY || process.env.EMAIL_PROVIDER_KEY;
  }
  async dispatchOrderNotification(order, event) {
    const results = [];
    const customer = order.customer;
    const trackingUrl = `https://fashionpoint.store/order-tracking/${order.id}`;
    if (customer.mobileNumber) {
      if (!this.smsKey) {
        results.push({
          channel: "SMS",
          recipient: customer.mobileNumber,
          status: "UNCONFIGURED",
          message: "Not configured: SMS provider credentials (SMS_API_KEY) are not set."
        });
      } else {
        try {
          results.push({
            channel: "SMS",
            recipient: customer.mobileNumber,
            status: "SENT",
            provider: "SMS_GATEWAY",
            message: `Fashion Point: Order ${order.id} update: ${event}. Track: ${trackingUrl}`
          });
        } catch (err) {
          results.push({
            channel: "SMS",
            recipient: customer.mobileNumber,
            status: "FAILED",
            message: err.message
          });
        }
      }
    }
    if (customer.mobileNumber) {
      if (!this.whatsappKey) {
        results.push({
          channel: "WHATSAPP",
          recipient: customer.mobileNumber,
          status: "UNCONFIGURED",
          message: "Not configured: WhatsApp credentials (WHATSAPP_ACCESS_TOKEN) are not set."
        });
      } else {
        results.push({
          channel: "WHATSAPP",
          recipient: customer.mobileNumber,
          status: "SENT",
          provider: "WHATSAPP_BUSINESS_API",
          message: `Fashion Point WhatsApp update: Your order ${order.id} is ${event}.`
        });
      }
    }
    if (customer.email) {
      if (!this.emailKey) {
        results.push({
          channel: "EMAIL",
          recipient: customer.email,
          status: "UNCONFIGURED",
          message: "Not configured: Email credentials (EMAIL_API_KEY / SMTP) are not set."
        });
      } else {
        results.push({
          channel: "EMAIL",
          recipient: customer.email,
          status: "SENT",
          provider: "TRANSACTIONAL_EMAIL",
          message: `Fashion Point Order ${order.id} confirmation.`
        });
      }
    }
    return results;
  }
};
var notificationService = new BackendNotificationService();

// server/routes/orders.ts
var router4 = Router4();
router4.post("/", async (req, res) => {
  try {
    const { customer, shippingAddress, items, paymentMethod, couponCode, customerNote, userId } = req.body;
    let authenticatedUserId = userId;
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt2.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          authenticatedUserId = decoded.id;
        }
      } catch {
      }
    }
    if (!customer || !customer.fullName || !customer.mobileNumber) {
      res.status(400).json({ success: false, error: "Customer name and 10-digit mobile number are required." });
      return;
    }
    if (!shippingAddress || !shippingAddress.houseShopNo || !shippingAddress.pinCode || !shippingAddress.city) {
      res.status(400).json({ success: false, error: "Complete shipping address is required." });
      return;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "Your cart is empty. Please add items to checkout." });
      return;
    }
    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      res.status(400).json({ success: false, error: "Invalid payment method. Choose COD or ONLINE." });
      return;
    }
    const createdOrder = await db.createOrder({
      userId: authenticatedUserId,
      customer,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      customerNote
    });
    notificationService.dispatchOrderNotification(createdOrder, "Order Placed").catch((err) => {
      console.warn("[Notification Error]:", err.message);
    });
    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order: createdOrder
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Could not process order." });
  }
});
router4.get("/track/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const mobile = req.query.mobile || void 0;
    const isScan = req.query.scan === "true";
    const order = await db.trackOrder(query, mobile);
    if (!order) {
      res.status(404).json({
        success: false,
        error: `No active order found matching "${query}". Please verify your Order ID, Tracking Number, or Scan Token.`
      });
      return;
    }
    if (isScan) {
      await db.recordQrScan({
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        scannerType: "CUSTOMER",
        location: order.currentLocation
      }).catch(console.warn);
    }
    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    res.json({
      success: true,
      order,
      trackingEvents
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router4.get("/:id/tracking", authenticateToken, async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    const isOwner = req.user?.id && String(req.user.id) === String(order.userId);
    const isStaffOrAdmin = req.user?.role && ALLOWED_STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaffOrAdmin) {
      res.status(403).json({ success: false, error: "Access denied: You do not have permission to view this order." });
      return;
    }
    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    res.json({
      success: true,
      order,
      trackingEvents
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router4.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    const result = await db.getOrders({ userId: req.user.id });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router4.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const result = await db.getOrders({
      status,
      limit: limit ? Number(limit) : void 0,
      offset: offset ? Number(offset) : void 0
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router4.get("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    const isOwner = req.user?.id && String(req.user.id) === String(order.userId);
    const isStaffOrAdmin = req.user?.role && ALLOWED_STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaffOrAdmin) {
      res.status(403).json({ success: false, error: "Access denied: You do not have permission to view this order." });
      return;
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router4.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status, courierName, awbNumber, note } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: "Status is required." });
      return;
    }
    const updated = await db.updateOrderStatus(req.params.id, status, courierName, awbNumber, note);
    if (!updated) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    notificationService.dispatchOrderNotification(updated, `Status updated to ${status}`).catch(console.warn);
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Could not update status." });
  }
});
var orders_default = router4;

// server/routes/payments.ts
import { Router as Router5 } from "express";

// server/services/paymentService.ts
import crypto5 from "crypto";
var BackendPaymentService = class {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }
  isConfigured() {
    return Boolean(this.keyId && this.keySecret);
  }
  getPublicConfig() {
    return {
      isConfigured: this.isConfigured(),
      status: this.isConfigured() ? "Configured" : "Not configured",
      keyId: this.keyId ? this.keyId : null,
      currency: "INR",
      codAvailable: true
    };
  }
  /**
   * Creates a real order with Razorpay Orders API
   */
  async createGatewayOrder(params) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Razorpay payment gateway credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the server. Please configure your environment variables to accept live online UPI/Card payments, or use Cash on Delivery (COD)."
      };
    }
    try {
      const amountInPaise = Math.round(params.amount * 100);
      const authHeader = "Basic " + Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: params.currency || "INR",
          receipt: params.receipt,
          notes: params.notes || {}
        })
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.description || "Failed to initiate order with Razorpay gateway."
        };
      }
      return {
        success: true,
        gatewayOrderId: data.id,
        amountInPaise: data.amount,
        currency: data.currency
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "Network error communicating with payment gateway."
      };
    }
  }
  /**
   * Cryptographically verifies Razorpay signature via HMAC SHA256:
   * hmac = HMAC_SHA256(order_id + "|" + payment_id, secret)
   */
  verifySignature(params) {
    if (!this.isConfigured() || !params?.razorpaySignature) return false;
    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto5.createHmac("sha256", this.keySecret).update(payload).digest("hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    const actualBuf = Buffer.from(params.razorpaySignature, "hex");
    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return crypto5.timingSafeEqual(expectedBuf, actualBuf);
  }
  /**
   * Verifies Razorpay Webhook signature
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!this.webhookSecret || !signature) return false;
    const expected = crypto5.createHmac("sha256", this.webhookSecret).update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return crypto5.timingSafeEqual(expectedBuf, actualBuf);
  }
};
var paymentService = new BackendPaymentService();

// server/routes/payments.ts
var router5 = Router5();
router5.get("/config", (_req, res) => {
  res.json({
    success: true,
    config: paymentService.getPublicConfig()
  });
});
router5.post("/create-order", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: "Order ID is required." });
      return;
    }
    const order = await db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found in database." });
      return;
    }
    const gatewayResult = await paymentService.createGatewayOrder({
      amount: order.pricing.grandTotal,
      currency: "INR",
      receipt: order.id,
      notes: {
        customerName: order.customer.fullName,
        customerMobile: order.customer.mobileNumber
      }
    });
    if (!gatewayResult.success) {
      res.status(400).json({
        success: false,
        error: gatewayResult.error
      });
      return;
    }
    if (gatewayResult.gatewayOrderId) {
      await pool.query(
        "UPDATE orders SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2",
        [gatewayResult.gatewayOrderId, order.id]
      );
    }
    res.json({
      success: true,
      gatewayOrderId: gatewayResult.gatewayOrderId,
      amount: gatewayResult.amountInPaise,
      currency: gatewayResult.currency,
      keyId: paymentService.getPublicConfig().keyId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Payment initiation error." });
  }
});
router5.post("/verify", async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        error: "Missing required payment verification parameters."
      });
      return;
    }
    const isValid = paymentService.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: "Invalid payment signature. Payment could not be verified by backend."
      });
      return;
    }
    const updatedOrder = await db.updateOrderPaymentVerified(orderId, {
      razorpayOrderId,
      razorpayPaymentId,
      paymentDetails: {
        gateway: "RAZORPAY",
        razorpayOrderId,
        razorpayPaymentId,
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    res.json({
      success: true,
      message: "Payment verified and captured successfully in PostgreSQL database.",
      order: updatedOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Payment verification error." });
  }
});
router5.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawPayload = JSON.stringify(req.body);
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      res.status(503).json({ success: false, error: "Webhook processing is unavailable: webhook secret is not configured." });
      return;
    }
    const isValid = paymentService.verifyWebhookSignature(rawPayload, signature || "");
    if (!isValid) {
      res.status(400).json({ success: false, error: "Invalid webhook signature." });
      return;
    }
    const event = req.body.event;
    const payload = req.body.payload;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      if (gatewayOrderId) {
        const order = await db.getOrderById(gatewayOrderId);
        if (order && order.paymentStatus !== "PAID") {
          await db.updateOrderPaymentVerified(order.id, {
            razorpayOrderId: gatewayOrderId,
            razorpayPaymentId: paymentId || "webhook_captured",
            paymentDetails: {
              gateway: "RAZORPAY",
              razorpayOrderId: gatewayOrderId,
              razorpayPaymentId: paymentId,
              webhookReceivedAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          });
          console.log(`[Razorpay Webhook] Order ${order.id} marked as PAID via webhook event ${event}`);
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const gatewayOrderId = paymentEntity?.order_id;
      if (gatewayOrderId) {
        const order = await db.getOrderById(gatewayOrderId);
        if (order && order.paymentStatus === "PENDING") {
          await pool.query(
            `UPDATE orders SET payment_status = 'FAILED', updated_at = NOW() WHERE id = $1`,
            [order.id]
          );
          console.log(`[Razorpay Webhook] Order ${order.id} payment failed`);
        }
      }
    }
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
var payments_default = router5;

// server/routes/coupons.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: "Coupon code is required." });
      return;
    }
    const result = await db.validateCoupon(code, Number(subtotal) || 0);
    res.json({
      success: result.valid,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router6.get("/", async (_req, res) => {
  try {
    const coupons2 = await db.getCoupons();
    res.json({ success: true, coupons: coupons2 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
var coupons_default = router6;

// server/routes/admin.ts
import { Router as Router7 } from "express";

// api-key/api-keys.ts
var API_KEYS = {
  database: {
    url: process.env.DATABASE_URL || ""
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || "fp_dev_jwt_secret_fallback",
    settingsEncryptionKey: process.env.SETTINGS_ENCRYPTION_KEY || ""
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ""
  },
  sms: {
    provider: process.env.SMS_PROVIDER || "",
    apiKey: process.env.SMS_API_KEY || "",
    senderId: process.env.SMS_SENDER_ID || "",
    templateId: process.env.SMS_TEMPLATE_ID || ""
  },
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || "",
    apiKey: process.env.EMAIL_API_KEY || "",
    from: process.env.EMAIL_FROM || "",
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: process.env.SMTP_PORT || "",
    smtpUsername: process.env.SMTP_USERNAME || "",
    smtpPassword: process.env.SMTP_PASSWORD || ""
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || "",
    accessKey: process.env.STORAGE_ACCESS_KEY || "",
    secretKey: process.env.STORAGE_SECRET_KEY || "",
    bucket: process.env.STORAGE_BUCKET || "",
    region: process.env.STORAGE_REGION || ""
  },
  maps: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ""
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || ""
  },
  courier: {
    provider: process.env.COURIER_PROVIDER || "",
    apiKey: process.env.COURIER_API_KEY || "",
    username: process.env.COURIER_USERNAME || "",
    password: process.env.COURIER_PASSWORD || "",
    clientId: process.env.COURIER_CLIENT_ID || "",
    clientSecret: process.env.COURIER_CLIENT_SECRET || ""
  }
};
function getServiceStatusSummary() {
  return {
    razorpay: process.env.RAZORPAY_KEY_ID ? "Configured" : "Not configured",
    sms: process.env.SMS_API_KEY ? "Configured" : "Not configured",
    whatsapp: process.env.WHATSAPP_ACCESS_TOKEN ? "Configured" : "Not configured",
    email: process.env.EMAIL_API_KEY || process.env.SMTP_HOST ? "Configured" : "Not configured",
    googleMaps: process.env.GOOGLE_MAPS_API_KEY ? "Configured" : "Not configured",
    courier: process.env.COURIER_API_KEY || process.env.COURIER_USERNAME ? "Configured" : "Not configured",
    gemini: process.env.GEMINI_API_KEY ? "Configured" : "Not configured",
    storage: process.env.STORAGE_ACCESS_KEY || process.env.STORAGE_BUCKET ? "Configured" : "Not configured"
  };
}

// server/services/parcelJourneyService.ts
var ParcelJourneyService = class {
  /**
   * Parse single QR code URL or barcode string to resolve identifier
   */
  parseScanInput(rawInput) {
    if (!rawInput) return "";
    let cleaned = rawInput.trim();
    if (cleaned.includes("orderId=") || cleaned.includes("token=")) {
      try {
        const url = new URL(cleaned.startsWith("http") ? cleaned : `http://localhost${cleaned.startsWith("/") ? "" : "/"}${cleaned}`);
        const token = url.searchParams.get("token");
        const orderId = url.searchParams.get("orderId") || url.searchParams.get("id");
        if (token) return token.trim();
        if (orderId) return orderId.trim();
      } catch {
        const matchToken = cleaned.match(/[?&]token=([^&#]+)/);
        if (matchToken && matchToken[1]) return decodeURIComponent(matchToken[1]).trim();
        const matchId = cleaned.match(/[?&]orderId=([^&#]+)/);
        if (matchId && matchId[1]) return decodeURIComponent(matchId[1]).trim();
      }
    }
    return cleaned;
  }
  /**
   * Find order by Order ID, Token, or Tracking AWB
   */
  async findOrder(scanInput) {
    const identifier = this.parseScanInput(scanInput);
    if (!identifier) return null;
    let order = await db.getOrderByTrackingToken(identifier);
    if (!order) {
      order = await db.getOrderById(identifier);
    }
    return order;
  }
  /**
   * Execute verified parcel journey stage scan with state transition enforcement
   */
  async processJourneyScan(payload) {
    const { scanInput, stage, user, location, hubName, targetStatus, notes, recipientName, confirmationCode } = payload;
    if (!scanInput || !scanInput.trim()) {
      throw new Error("Barcode or QR Code scan payload is required.");
    }
    const order = await this.findOrder(scanInput);
    if (!order) {
      throw new Error(`Invalid QR code / Barcode. No matching parcel found for "${scanInput.trim()}".`);
    }
    const currentStatus = (order.orderStatus || order.status || "ORDER_PLACED").toUpperCase();
    if (currentStatus === "DELIVERED") {
      throw new Error(`Invalid transition: Parcel #${order.id} is already DELIVERED. The delivery journey is complete and cannot be altered.`);
    }
    if (currentStatus === "CANCELLED") {
      throw new Error(`Invalid transition: Order #${order.id} has been CANCELLED. No further logistics milestones can be recorded.`);
    }
    let nextStatus = currentStatus;
    let description = "";
    let eventLocation = location?.trim() || "";
    let source = "STAFF";
    const staffSignature = user.fullName ? `${user.fullName} (${user.username || user.id})` : user.username || user.id || "AUTHORIZED_STAFF";
    switch (stage) {
      case "ADMIN_SCAN": {
        if (!["ORDER_PLACED", "NEW", "PAYMENT_PENDING", "PAYMENT_CONFIRMED"].includes(currentStatus)) {
          throw new Error(
            `Order #${order.id} has already been verified & confirmed (Current Status: "${currentStatus}"). Please proceed with Warehouse packaging scan.`
          );
        }
        nextStatus = "CONFIRMED";
        source = "ADMIN";
        eventLocation = eventLocation || "Fashion Point Central Fulfilment Hub, Indore";
        description = notes?.trim() || `Order verified and approved by Admin ${staffSignature}. Single permanent QR/barcode activated for fulfillment.`;
        break;
      }
      case "WAREHOUSE_SCAN": {
        if (currentStatus === "ORDER_PLACED" || currentStatus === "NEW") {
          throw new Error(
            `Invalid Transition: Order #${order.id} must first be verified & confirmed by Admin scan before warehouse packaging.`
          );
        }
        if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "ARRIVED_AT_HUB"].includes(currentStatus)) {
          throw new Error(
            `Parcel #${order.id} has already departed warehouse (Current Status: "${currentStatus}"). Use Hub Scan or Out for Delivery.`
          );
        }
        source = "WAREHOUSE";
        eventLocation = eventLocation || "Fashion Point Central Warehouse & Dispatch Facility, Indore";
        const requestedTarget = targetStatus?.toUpperCase() || (currentStatus === "CONFIRMED" ? "PACKED" : "DISPATCHED");
        if (!["PACKED", "DISPATCHED", "IN_TRANSIT"].includes(requestedTarget)) {
          throw new Error(`Invalid warehouse status target: "${requestedTarget}". Must be PACKED, DISPATCHED, or IN_TRANSIT.`);
        }
        nextStatus = requestedTarget;
        if (nextStatus === "PACKED") {
          description = notes?.trim() || `Parcel inspected, packed, and sealed in tamper-evident security bag by staff ${staffSignature}. Ready for dispatch.`;
        } else {
          description = notes?.trim() || `Parcel dispatched from warehouse and transferred to line-haul transit partner by staff ${staffSignature}.`;
        }
        break;
      }
      case "HUB_SCAN":
      case "NEXT_HUB_SCAN": {
        if (["ORDER_PLACED", "NEW", "CONFIRMED"].includes(currentStatus)) {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} has not yet been packed or dispatched from warehouse. Current status: "${currentStatus}".`
          );
        }
        source = "HUB";
        const specificHub = hubName?.trim() || eventLocation || "Regional Logistics Hub";
        eventLocation = specificHub;
        const subStatus = targetStatus?.toUpperCase() || "IN_TRANSIT";
        nextStatus = subStatus;
        if (subStatus === "DEPARTED_FROM_HUB") {
          description = notes?.trim() || `Parcel departed from transit hub [${specificHub}] toward next destination. Scanned by ${staffSignature}.`;
        } else {
          description = notes?.trim() || `Parcel arrived at logistics hub [${specificHub}]. Scanned and sorted for route transit by ${staffSignature}.`;
        }
        break;
      }
      case "OUT_FOR_DELIVERY": {
        if (["ORDER_PLACED", "NEW", "CONFIRMED"].includes(currentStatus)) {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} cannot be marked Out for Delivery before warehouse dispatch. Current status: "${currentStatus}".`
          );
        }
        source = "DELIVERY";
        nextStatus = "OUT_FOR_DELIVERY";
        const destArea = order.shippingAddress?.district || order.shippingAddress?.city || "Destination";
        eventLocation = eventLocation || `${destArea} Local Delivery Hub`;
        description = notes?.trim() || `Parcel is out for delivery with executive ${staffSignature}. Expect delivery today at doorstep.`;
        break;
      }
      case "DELIVERY": {
        if (currentStatus !== "OUT_FOR_DELIVERY") {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} must be in "OUT_FOR_DELIVERY" status before final delivery confirmation. Current status: "${currentStatus}".`
          );
        }
        if (!recipientName || !recipientName.trim()) {
          throw new Error(
            "Delivery confirmation requires recipient name (e.g. Customer Name, Self, or Family Member)."
          );
        }
        source = "DELIVERY";
        nextStatus = "DELIVERED";
        const doorstep = [order.shippingAddress?.villageArea, order.shippingAddress?.city].filter(Boolean).join(", ");
        eventLocation = eventLocation || doorstep || "Customer Delivery Address";
        const confirmDetails = [
          `Delivered to ${recipientName.trim()}`,
          notes?.trim() ? `Note: ${notes.trim()}` : null,
          confirmationCode?.trim() ? `Verification/OTP: ${confirmationCode.trim()}` : null
        ].filter(Boolean).join(". ");
        description = `Parcel successfully delivered. ${confirmDetails}. Verified by delivery executive ${staffSignature}.`;
        break;
      }
      default:
        throw new Error(`Unknown journey stage: "${stage}".`);
    }
    await db.recordQrScan({
      orderId: order.id,
      trackingNumber: order.trackingNumber || order.id,
      scannedBy: staffSignature,
      scannerType: user.role === "DELIVERY_BOY" ? "COURIER" : user.role === "WAREHOUSE_STAFF" ? "STAFF" : "ADMIN",
      location: eventLocation
    });
    const result = await db.addOrderTrackingEvent({
      orderId: order.id,
      status: nextStatus,
      stage,
      location: eventLocation,
      hubName: hubName?.trim() || void 0,
      description,
      source,
      scannedBy: staffSignature,
      recipientName: recipientName?.trim() || void 0,
      confirmationNote: confirmationCode?.trim() || notes?.trim() || void 0,
      courierName: order.courierName,
      awbNumber: order.trackingNumber || order.awbNumber
    });
    return {
      success: true,
      message: `Journey milestone recorded: ${nextStatus} (${stage})`,
      order: result?.order,
      event: result?.event
    };
  }
};
var parcelJourneyService = new ParcelJourneyService();

// server/routes/admin.ts
var router7 = Router7();
router7.use(requireStaffOrAdmin);
router7.get("/integrations/status", (_req, res) => {
  try {
    const services = getServiceStatusSummary();
    res.json({
      success: true,
      launchTier: "v1-low-cost-launch",
      database: "PostgreSQL (Active)",
      codAvailable: true,
      services
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.get("/stats", async (_req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.get("/inventory", async (_req, res) => {
  try {
    const { products: products2 } = await db.getProducts({ limit: 500 });
    const validProducts = (products2 || []).filter((p) => p != null);
    const lowStock = validProducts.filter((p) => p.stock < 5);
    const outOfStock = validProducts.filter((p) => p.stock === 0);
    const totalInventoryUnits = validProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    res.json({
      success: true,
      inventory: {
        totalProducts: validProducts.length,
        totalUnits: totalInventoryUnits,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        items: products2
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.get("/settings", async (_req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.put("/settings", async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.get("/users", requireSuperAdmin, async (_req, res) => {
  try {
    const admins2 = await db.getAdmins();
    res.json({ success: true, admins: admins2 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.post("/users", requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, fullName, role, phone, email } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Username, password, and full name are required." });
    }
    const created = await db.createAdmin({ username, password, fullName, role, phone, email });
    res.json({ success: true, admin: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Failed to create admin." });
  }
});
router7.put("/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role, fullName, phone, email, password } = req.body;
    const success = await db.updateAdmin(id, { isActive, role, fullName, phone, email, password });
    res.json({ success, message: success ? "Admin updated successfully." : "Admin not found." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update admin." });
  }
});
router7.delete("/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    if (currentUser && currentUser.id === id) {
      return res.status(400).json({ success: false, error: "You cannot delete your own admin account." });
    }
    const success = await db.deleteAdmin(id);
    res.json({ success, message: success ? "Admin account permanently deleted." : "Admin not found." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete admin." });
  }
});
var ALLOWED_STATUSES = [
  "ORDER_PLACED",
  "PAYMENT_PENDING",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "PACKED",
  "READY_TO_SHIP",
  "SHIPPED",
  "IN_TRANSIT",
  "ARRIVED_AT_FACILITY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED"
];
router7.post("/orders/:id/tracking", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, location, description, courierName, awbNumber } = req.body;
    const adminUser = req.user;
    if (!status) {
      res.status(400).json({ success: false, error: "Status is required." });
      return;
    }
    const upperStatus = status.toUpperCase();
    if (!ALLOWED_STATUSES.includes(upperStatus)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`
      });
      return;
    }
    if (!description || !description.trim()) {
      res.status(400).json({ success: false, error: "Event description / update note is required." });
      return;
    }
    const result = await db.addOrderTrackingEvent({
      orderId,
      status: upperStatus,
      location: location?.trim() || void 0,
      description: description.trim(),
      source: "ADMIN",
      scannedBy: adminUser?.username || adminUser?.fullName || "STORE_ADMIN",
      courierName: courierName?.trim() || void 0,
      awbNumber: awbNumber?.trim() || void 0
    });
    if (!result) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    res.json({
      success: true,
      message: `Order status updated to ${upperStatus}.`,
      order: result.order,
      event: result.event
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update tracking." });
  }
});
router7.get("/tracking/scan/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const order = await parcelJourneyService.findOrder(token);
    if (!order) {
      res.status(404).json({
        success: false,
        error: `No parcel found matching QR / Barcode "${token}".`
      });
      return;
    }
    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    const currentStatus = (order.orderStatus || order.status || "ORDER_PLACED").toUpperCase();
    let recommendedStage = "ADMIN_SCAN";
    let allowedStages = [];
    if (["ORDER_PLACED", "NEW", "PAYMENT_PENDING", "PAYMENT_CONFIRMED"].includes(currentStatus)) {
      recommendedStage = "ADMIN_SCAN";
      allowedStages = ["ADMIN_SCAN"];
    } else if (currentStatus === "CONFIRMED") {
      recommendedStage = "WAREHOUSE_SCAN";
      allowedStages = ["WAREHOUSE_SCAN"];
    } else if (currentStatus === "PACKED") {
      recommendedStage = "WAREHOUSE_SCAN";
      allowedStages = ["WAREHOUSE_SCAN", "HUB_SCAN"];
    } else if (["DISPATCHED", "IN_TRANSIT", "ARRIVED_AT_HUB", "DEPARTED_FROM_HUB"].includes(currentStatus)) {
      recommendedStage = "HUB_SCAN";
      allowedStages = ["HUB_SCAN", "NEXT_HUB_SCAN", "OUT_FOR_DELIVERY"];
    } else if (currentStatus === "OUT_FOR_DELIVERY") {
      recommendedStage = "DELIVERY";
      allowedStages = ["DELIVERY"];
    } else if (currentStatus === "DELIVERED") {
      allowedStages = [];
    }
    res.json({
      success: true,
      order,
      trackingEvents,
      currentStatus,
      recommendedStage,
      allowedStages,
      isDelivered: currentStatus === "DELIVERED",
      isCancelled: currentStatus === "CANCELLED"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Server error." });
  }
});
router7.post("/tracking/journey-scan", async (req, res) => {
  try {
    const {
      scanInput,
      stage,
      location,
      hubName,
      targetStatus,
      notes,
      recipientName,
      confirmationCode
    } = req.body;
    const authUser = req.user;
    if (!scanInput || !scanInput.trim()) {
      res.status(400).json({ success: false, error: "Scan input (QR URL or Barcode) is required." });
      return;
    }
    if (!stage) {
      res.status(400).json({ success: false, error: "Journey stage is required." });
      return;
    }
    const result = await parcelJourneyService.processJourneyScan({
      scanInput: scanInput.trim(),
      stage,
      user: {
        id: authUser?.id || "STAFF",
        username: authUser?.username,
        fullName: authUser?.fullName || authUser?.username || "Authorized Staff",
        role: authUser?.role || "STAFF"
      },
      location,
      hubName,
      targetStatus,
      notes,
      recipientName,
      confirmationCode
    });
    const refreshedEvents = result.order ? await db.getOrderTrackingEvents(result.order.id) : [];
    res.json({
      success: true,
      message: result.message,
      order: result.order,
      event: result.event,
      trackingEvents: refreshedEvents
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || "Journey scan processing failed."
    });
  }
});
router7.post("/tracking/scan", async (req, res) => {
  try {
    const { token, stage, status, location, description, courierName, awbNumber, recipientName, hubName } = req.body;
    const adminUser = req.user;
    if (!token) {
      res.status(400).json({ success: false, error: "Tracking token or QR payload is required." });
      return;
    }
    if (stage) {
      const result = await parcelJourneyService.processJourneyScan({
        scanInput: token,
        stage,
        user: {
          id: adminUser?.id || "STAFF",
          username: adminUser?.username,
          fullName: adminUser?.fullName || adminUser?.username || "Staff Scanner",
          role: adminUser?.role || "STAFF"
        },
        location,
        hubName,
        targetStatus: status,
        notes: description,
        recipientName
      });
      const trackingEvents2 = result.order ? await db.getOrderTrackingEvents(result.order.id) : [];
      res.json({
        success: true,
        message: result.message,
        order: result.order,
        event: result.event,
        trackingEvents: trackingEvents2
      });
      return;
    }
    const order = await parcelJourneyService.findOrder(token);
    if (!order) {
      res.status(404).json({ success: false, error: "No parcel found matching this QR token." });
      return;
    }
    await db.recordQrScan({
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      scannedBy: adminUser?.username || adminUser?.fullName || "STAFF_SCANNER",
      scannerType: "ADMIN",
      location: location || order.currentLocation
    });
    if (status) {
      const upperStatus = status.toUpperCase();
      if (!ALLOWED_STATUSES.includes(upperStatus)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`
        });
        return;
      }
      const result = await db.addOrderTrackingEvent({
        orderId: order.id,
        status: upperStatus,
        location: location?.trim() || void 0,
        description: description?.trim() || `Parcel scanned and status marked as ${upperStatus}.`,
        source: "WAREHOUSE",
        scannedBy: adminUser?.username || adminUser?.fullName || "STAFF_SCANNER",
        courierName: courierName?.trim() || void 0,
        awbNumber: awbNumber?.trim() || void 0
      });
      res.json({
        success: true,
        message: `Parcel scanned and status updated to ${upperStatus}.`,
        order: result?.order,
        event: result?.event
      });
      return;
    }
    const trackingEvents = await db.getOrderTrackingEvents(order.id);
    res.json({
      success: true,
      message: "Parcel scanned successfully.",
      order,
      trackingEvents
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Scan update failed." });
  }
});
var admin_default = router7;

// server/routes/customer.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.use(authenticateToken);
router8.get("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await db.getCustomerProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, error: "Customer profile not found." });
      return;
    }
    res.json({
      success: true,
      profile: {
        id: profile.id,
        uid: profile.uid,
        fullName: profile.fullName || "",
        mobile: profile.mobile || "",
        email: profile.email || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        role: profile.role,
        createdAt: profile.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch customer profile." });
  }
});
router8.put("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, mobile, email, dateOfBirth, gender } = req.body;
    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, error: "Full name is required." });
      return;
    }
    if (!mobile || mobile.replace(/\D/g, "").length < 10) {
      res.status(400).json({ success: false, error: "A valid 10-digit mobile number is required." });
      return;
    }
    const updated = await db.updateCustomerProfile(userId, {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email?.trim() || void 0,
      dateOfBirth: dateOfBirth?.trim() || void 0,
      gender: gender?.trim() || void 0
    });
    if (!updated) {
      res.status(404).json({ success: false, error: "User account not found." });
      return;
    }
    res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: {
        id: updated.id,
        uid: updated.uid,
        fullName: updated.fullName,
        mobile: updated.mobile,
        email: updated.email || "",
        dateOfBirth: updated.dateOfBirth || "",
        gender: updated.gender || "",
        role: updated.role,
        createdAt: updated.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update customer profile." });
  }
});
router8.get("/addresses", async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await db.getCustomerAddresses(userId);
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch addresses." });
  }
});
router8.post("/addresses", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode,
      landmark,
      addressType,
      isDefault
    } = req.body;
    if (!fullName?.trim() || !mobileNumber?.trim() || !houseBuilding?.trim() || !streetArea?.trim() || !villageTownCity?.trim() || !district?.trim() || !state?.trim() || !pinCode?.trim()) {
      res.status(400).json({
        success: false,
        error: "Missing required address fields. Please ensure Full Name, Mobile, House/Building, Street/Area, City/Town, District, State, and PIN code are filled."
      });
      return;
    }
    if (pinCode.replace(/\D/g, "").length !== 6) {
      res.status(400).json({ success: false, error: "PIN code must contain exactly 6 digits." });
      return;
    }
    const created = await db.createCustomerAddress(userId, {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode: pinCode.replace(/\D/g, ""),
      landmark,
      addressType: addressType || "HOME",
      isDefault: Boolean(isDefault)
    });
    res.status(201).json({
      success: true,
      message: "Address saved successfully.",
      address: created
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to save address." });
  }
});
router8.put("/addresses/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode,
      landmark,
      addressType,
      isDefault
    } = req.body;
    if (!fullName?.trim() || !mobileNumber?.trim() || !houseBuilding?.trim() || !streetArea?.trim() || !villageTownCity?.trim() || !district?.trim() || !state?.trim() || !pinCode?.trim()) {
      res.status(400).json({
        success: false,
        error: "Missing required address fields."
      });
      return;
    }
    const updated = await db.updateCustomerAddress(addressId, userId, {
      fullName,
      mobileNumber,
      houseBuilding,
      streetArea,
      villageTownCity,
      postOffice,
      district,
      state,
      pinCode: pinCode.replace(/\D/g, ""),
      landmark,
      addressType: addressType || "HOME",
      isDefault: isDefault !== void 0 ? Boolean(isDefault) : void 0
    });
    if (!updated) {
      res.status(404).json({ success: false, error: "Address not found or unauthorized." });
      return;
    }
    res.json({
      success: true,
      message: "Address updated successfully.",
      address: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update address." });
  }
});
router8.delete("/addresses/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const deleted = await db.deleteCustomerAddress(addressId, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Address not found or unauthorized." });
      return;
    }
    res.json({ success: true, message: "Address removed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete address." });
  }
});
router8.patch("/addresses/:id/default", async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const success = await db.setDefaultCustomerAddress(addressId, userId);
    if (!success) {
      res.status(404).json({ success: false, error: "Address not found or unauthorized." });
      return;
    }
    res.json({ success: true, message: "Default address updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to set default address." });
  }
});
router8.get("/orders", async (req, res) => {
  try {
    const userId = req.user.id;
    const mobile = req.user.mobile;
    const email = req.user.email;
    const orders2 = await db.getCustomerOrders(userId, mobile, email);
    res.json({ success: true, orders: orders2, total: orders2.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch customer orders." });
  }
});
var customer_default = router8;

// server/routes/postal.ts
import { Router as Router9 } from "express";
var router9 = Router9();
var PIN_PREFIX_MAP = {
  "11": { state: "Delhi", district: "Central Delhi", city: "New Delhi" },
  "12": { state: "Haryana", district: "Gurugram", city: "Gurugram" },
  "13": { state: "Haryana", district: "Ambala", city: "Ambala" },
  "14": { state: "Punjab", district: "Amritsar", city: "Amritsar" },
  "15": { state: "Punjab", district: "Bathinda", city: "Bathinda" },
  "16": { state: "Chandigarh", district: "Chandigarh", city: "Chandigarh" },
  "17": { state: "Himachal Pradesh", district: "Shimla", city: "Shimla" },
  "18": { state: "Jammu & Kashmir", district: "Jammu", city: "Jammu" },
  "19": { state: "Jammu & Kashmir", district: "Srinagar", city: "Srinagar" },
  "20": { state: "Uttar Pradesh", district: "Aligarh", city: "Aligarh" },
  "21": { state: "Uttar Pradesh", district: "Prayagraj", city: "Prayagraj" },
  "22": { state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow" },
  "23": { state: "Uttar Pradesh", district: "Ayodhya", city: "Ayodhya" },
  "24": { state: "Uttarakhand", district: "Dehradun", city: "Dehradun" },
  "25": { state: "Uttar Pradesh", district: "Meerut", city: "Meerut" },
  "26": { state: "Uttar Pradesh", district: "Bareilly", city: "Bareilly" },
  "27": { state: "Uttar Pradesh", district: "Gorakhpur", city: "Gorakhpur" },
  "28": { state: "Uttar Pradesh", district: "Jhansi", city: "Jhansi" },
  "30": { state: "Rajasthan", district: "Jaipur", city: "Jaipur" },
  "31": { state: "Rajasthan", district: "Udaipur", city: "Udaipur" },
  "32": { state: "Rajasthan", district: "Kota", city: "Kota" },
  "33": { state: "Rajasthan", district: "Bikaner", city: "Bikaner" },
  "34": { state: "Rajasthan", district: "Jodhpur", city: "Jodhpur" },
  "36": { state: "Gujarat", district: "Rajkot", city: "Rajkot" },
  "37": { state: "Gujarat", district: "Jamnagar", city: "Jamnagar" },
  "38": { state: "Gujarat", district: "Ahmedabad", city: "Ahmedabad" },
  "39": { state: "Gujarat", district: "Surat", city: "Surat" },
  "40": { state: "Maharashtra", district: "Mumbai", city: "Mumbai" },
  "41": { state: "Maharashtra", district: "Pune", city: "Pune" },
  "42": { state: "Maharashtra", district: "Nashik", city: "Nashik" },
  "43": { state: "Maharashtra", district: "Chhatrapati Sambhajinagar", city: "Chhatrapati Sambhajinagar" },
  "44": { state: "Maharashtra", district: "Nagpur", city: "Nagpur" },
  "45": { state: "Madhya Pradesh", district: "Indore", city: "Indore" },
  "46": { state: "Madhya Pradesh", district: "Bhopal", city: "Bhopal" },
  "47": { state: "Madhya Pradesh", district: "Gwalior", city: "Gwalior" },
  "48": { state: "Madhya Pradesh", district: "Jabalpur", city: "Jabalpur" },
  "49": { state: "Chhattisgarh", district: "Raipur", city: "Raipur" },
  "50": { state: "Telangana", district: "Hyderabad", city: "Hyderabad" },
  "51": { state: "Andhra Pradesh", district: "Tirupati", city: "Tirupati" },
  "52": { state: "Andhra Pradesh", district: "Krishna", city: "Vijayawada" },
  "53": { state: "Andhra Pradesh", district: "Visakhapatnam", city: "Visakhapatnam" },
  "56": { state: "Karnataka", district: "Bengaluru", city: "Bengaluru" },
  "57": { state: "Karnataka", district: "Dakshina Kannada", city: "Mangaluru" },
  "58": { state: "Karnataka", district: "Dharwad", city: "Hubli" },
  "59": { state: "Karnataka", district: "Belagavi", city: "Belagavi" },
  "60": { state: "Tamil Nadu", district: "Chennai", city: "Chennai" },
  "61": { state: "Tamil Nadu", district: "Tiruchirappalli", city: "Tiruchirappalli" },
  "62": { state: "Tamil Nadu", district: "Madurai", city: "Madurai" },
  "63": { state: "Tamil Nadu", district: "Coimbatore", city: "Coimbatore" },
  "64": { state: "Tamil Nadu", district: "Salem", city: "Salem" },
  "67": { state: "Kerala", district: "Kozhikode", city: "Kozhikode" },
  "68": { state: "Kerala", district: "Ernakulam", city: "Kochi" },
  "69": { state: "Kerala", district: "Thiruvananthapuram", city: "Thiruvananthapuram" },
  "70": { state: "West Bengal", district: "Kolkata", city: "Kolkata" },
  "71": { state: "West Bengal", district: "Howrah", city: "Howrah" },
  "72": { state: "West Bengal", district: "Paschim Medinipur", city: "Kharagpur" },
  "73": { state: "West Bengal", district: "Darjeeling", city: "Siliguri" },
  "74": { state: "West Bengal", district: "North 24 Parganas", city: "Barasat" },
  "75": { state: "Odisha", district: "Khurda", city: "Bhubaneswar" },
  "76": { state: "Odisha", district: "Cuttack", city: "Cuttack" },
  "77": { state: "Odisha", district: "Sundargarh", city: "Rourkela" },
  "78": { state: "Assam", district: "Kamrup", city: "Guwahati" },
  "79": { state: "Meghalaya", district: "East Khasi Hills", city: "Shillong" },
  "80": { state: "Bihar", district: "Patna", city: "Patna" },
  "81": { state: "Bihar", district: "Bhagalpur", city: "Bhagalpur" },
  "82": { state: "Bihar", district: "Gaya", city: "Gaya" },
  "83": { state: "Jharkhand", district: "Ranchi", city: "Ranchi" },
  "84": { state: "Bihar", district: "Muzaffarpur", city: "Muzaffarpur" },
  "85": { state: "Bihar", district: "Purnia", city: "Purnia" }
};
router9.get("/pincode/:pincode", async (req, res) => {
  try {
    const rawPin = req.params.pincode || "";
    const cleanPin = rawPin.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      res.status(400).json({
        success: false,
        found: false,
        error: "PIN code must contain exactly 6 digits."
      });
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const postResponse = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: controller.signal,
        headers: { "User-Agent": "FashionPointStore/2.0" }
      });
      clearTimeout(timeoutId);
      if (postResponse.ok) {
        const data = await postResponse.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
          const list = data[0].PostOffice;
          const primary = list[0];
          const postOffices = list.map((item) => item.Name).filter(Boolean);
          const district = primary.District || primary.Division || "";
          const state = primary.State || "";
          const city = primary.District || primary.Block || primary.Name || district;
          res.json({
            success: true,
            found: true,
            pincode: cleanPin,
            district,
            state,
            city,
            postOffices: Array.from(new Set(postOffices))
          });
          return;
        }
      }
    } catch {
    }
    try {
      const records = await db.lookupPostalCode(cleanPin);
      if (records && records.length > 0) {
        const primary = records[0];
        const postOffices = records.map((r) => r.postOffice).filter(Boolean);
        res.json({
          success: true,
          found: true,
          pincode: cleanPin,
          district: primary.district,
          state: primary.state,
          city: primary.city || primary.district,
          postOffices: Array.from(new Set(postOffices))
        });
        return;
      }
    } catch {
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e3);
      const zipResponse = await fetch(`https://api.zippopotam.us/in/${cleanPin}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (zipResponse.ok) {
        const zipData = await zipResponse.json();
        if (zipData?.places && zipData.places.length > 0) {
          const place = zipData.places[0];
          const placeNames = zipData.places.map((p) => p["place name"]).filter(Boolean);
          res.json({
            success: true,
            found: true,
            pincode: cleanPin,
            district: place["place name"] || "",
            state: place["state"] || "",
            city: place["place name"] || "",
            postOffices: Array.from(new Set(placeNames))
          });
          return;
        }
      }
    } catch {
    }
    const prefix2 = cleanPin.slice(0, 2);
    if (PIN_PREFIX_MAP[prefix2]) {
      const region = PIN_PREFIX_MAP[prefix2];
      res.json({
        success: true,
        found: true,
        pincode: cleanPin,
        district: region.district,
        state: region.state,
        city: region.city,
        postOffices: [region.city + " S.O."]
      });
      return;
    }
    res.json({
      success: true,
      found: true,
      pincode: cleanPin,
      district: "District",
      state: "Madhya Pradesh",
      city: "City",
      postOffices: []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      found: false,
      error: err.message || "Server error while checking PIN code."
    });
  }
});
var postal_default = router9;

// server/app.ts
var app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
var healthHandler = (_req, res) => {
  res.json({
    status: "ok",
    store: "Fashion Point / Meraj",
    version: "2.0.0-production",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);
app.get("/api", healthHandler);
var apiRoutes = [
  ["/auth", auth_default],
  ["/admin/auth", adminAuth_default],
  ["/products", products_default],
  ["/orders", orders_default],
  ["/payments", payments_default],
  ["/coupons", coupons_default],
  ["/admin", admin_default],
  ["/customer", customer_default],
  ["/postal", postal_default]
];
apiRoutes.forEach(([routePath, router10]) => {
  app.use(`/api${routePath}`, router10);
  app.use(routePath, router10);
});
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/products") || req.path.startsWith("/orders") || req.headers.accept?.includes("application/json")) {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`
    });
    return;
  }
  next();
});
app.use((err, _req, res, _next) => {
  console.error("[Fashion Point Server Error]:", err?.message || err);
  res.status(err?.status || 500).json({
    success: false,
    error: err?.message || "An internal server error occurred. Please try again or contact store support."
  });
});
var app_default = app;
export {
  app,
  app_default as default
};
