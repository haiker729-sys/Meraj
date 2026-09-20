export type CategoryType = 'Men' | 'Women' | 'Kids';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  subCategory: string;
  description: string;
  images: string[];
  price: number;
  mrp: number;
  discount: number;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  sku: string;
  status?: 'PUBLISHED' | 'UNPUBLISHED';
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  material?: string;
  careInstructions?: string;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
  quantity: number;
}

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'Order Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned';

export type PaymentMethod = 'COD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  alternateNumber?: string;
  email?: string;
}

export interface ShippingAddress {
  houseShopNo: string;
  street: string;
  villageArea: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  landmark?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  mrp: number;
  quantity: number;
  // Guaranteed compatibility fields
  product: Product;
  selectedSize: string;
  selectedColor: ProductColor;
}

export interface OrderPricing {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  title: string;
  description: string;
  location?: string;
}

export interface Order {
  id: string; // e.g. FP-10001
  customer: CustomerDetails;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  courierName?: string;
  awbNumber?: string;
  trackingNumber: string;
  totalAmount: number;
  invoiceNumber: string;
  notes?: string;
  estimatedDelivery?: string;
  taxBreakdown?: {
    taxableAmount: number;
    cgst: number;
    sgst: number;
    totalGst: number;
  };
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  validUntil: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  imageUrl: string;
  badge?: string;
  ctaText: string;
  category?: CategoryType;
}

export interface StoreReview {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export type AdminRole = 'SUPER_ADMIN' | 'STORE_MANAGER' | 'INVENTORY_MANAGER';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: AdminRole;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}
