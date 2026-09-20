import { Order, OrderItem } from '../../types';

function createSeedItem(item: {
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
}): OrderItem {
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
      category: 'Men',
      subCategory: 'Apparel',
      description: 'Handcrafted premium garments designed for durability, pure comfort, and modern Indian style.',
      images: [item.image],
      price: item.price,
      mrp: item.mrp,
      discount: Math.round(((item.mrp - item.price) / item.mrp) * 100),
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: item.colorName, hex: item.colorHex }],
      stock: 40,
      rating: 4.8,
      reviewsCount: 36
    }
  };
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'FP-10001',
    customer: {
      fullName: 'Aman Kumar Verma',
      mobileNumber: '9876543210',
      alternateNumber: '9123456780',
      email: 'aman.verma@example.com'
    },
    shippingAddress: {
      houseShopNo: 'Plot No. 42, Anand Vihar Colony',
      street: 'Station Road, Near Shiv Temple',
      villageArea: 'Civil Lines Sector 3',
      city: 'Kanpur',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh',
      pinCode: '208001',
      landmark: 'Behind SBI Main Branch'
    },
    items: [
      createSeedItem({
        productId: 'fp-prod-101',
        name: 'Classic Oxford Cotton Slim Fit Shirt',
        sku: 'FP-M-SH-001',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        size: 'L',
        colorName: 'Sky Blue',
        colorHex: '#6ba4b8',
        price: 1299,
        mrp: 2499,
        quantity: 1
      }),
      createSeedItem({
        productId: 'fp-prod-103',
        name: 'Vintage Wash Relaxed Tapered Jeans',
        sku: 'FP-M-JN-003',
        image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
        size: '34',
        colorName: 'Indigo Blue',
        colorHex: '#1e3a8a',
        price: 1799,
        mrp: 3299,
        quantity: 1
      })
    ],
    pricing: {
      subtotal: 3098,
      deliveryCharge: 0,
      discount: 200,
      couponCode: 'FASHION200',
      grandTotal: 2898
    },
    totalAmount: 2898,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    status: 'SHIPPED',
    courierName: 'Delhivery Surface Express',
    awbNumber: 'DLV983214890',
    trackingNumber: 'DLV983214890',
    invoiceNumber: 'INV-2026-10001',
    createdAt: '2026-09-17T10:30:00Z',
    timeline: [
      {
        status: 'NEW',
        timestamp: '2026-09-17T10:30:00Z',
        title: 'Order Placed',
        description: 'Customer placed order FP-10001 via UPI payment.',
        location: 'Fashion Point Store, Main Hub'
      },
      {
        status: 'CONFIRMED',
        timestamp: '2026-09-17T11:15:00Z',
        title: 'Order Confirmed',
        description: 'Inventory allocated and order accepted by store fulfillment team.',
        location: 'Fashion Point Central Warehouse'
      },
      {
        status: 'PACKED',
        timestamp: '2026-09-17T15:40:00Z',
        title: 'Quality Checked & Packed',
        description: 'Items packed in eco-friendly tamper-proof parcel with shipping label.',
        location: 'Fulfillment Station A2'
      },
      {
        status: 'SHIPPED',
        timestamp: '2026-09-18T09:20:00Z',
        title: 'Dispatched with Courier',
        description: 'Handed over to Delhivery Logistics (AWB: DLV983214890). In transit to destination hub.',
        location: 'Regional Sorting Hub'
      }
    ]
  },
  {
    id: 'FP-10002',
    customer: {
      fullName: 'Priya Sundaram',
      mobileNumber: '9811223344',
      alternateNumber: '9877001122',
      email: 'priya.s@example.com'
    },
    shippingAddress: {
      houseShopNo: 'Flat 304, Green Heights',
      street: '7th Cross, Gandhi Nagar',
      villageArea: 'Near Water Tank',
      city: 'Bhopal',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      pinCode: '462001',
      landmark: 'Opposite Community Hall'
    },
    items: [
      createSeedItem({
        productId: 'fp-prod-201',
        name: 'Tiered Floral Summer Midi Dress',
        sku: 'FP-W-DR-101',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        size: 'M',
        colorName: 'Rose Petal',
        colorHex: '#fda4af',
        price: 1599,
        mrp: 2999,
        quantity: 1
      })
    ],
    pricing: {
      subtotal: 1599,
      deliveryCharge: 0,
      discount: 160,
      couponCode: 'FIRST10',
      grandTotal: 1439
    },
    totalAmount: 1439,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'CONFIRMED',
    status: 'CONFIRMED',
    trackingNumber: 'DEL-8874129',
    invoiceNumber: 'INV-2026-10002',
    createdAt: '2026-09-18T14:15:00Z',
    timeline: [
      {
        status: 'NEW',
        timestamp: '2026-09-18T14:15:00Z',
        title: 'Order Placed',
        description: 'Order placed with Cash on Delivery option.',
        location: 'Fashion Point Store'
      },
      {
        status: 'CONFIRMED',
        timestamp: '2026-09-18T16:00:00Z',
        title: 'Order Confirmed',
        description: 'Store verified customer address and confirmed order for packing.',
        location: 'Fashion Point Hub'
      }
    ]
  },
  {
    id: 'FP-10003',
    customer: {
      fullName: 'Rohan Gupta',
      mobileNumber: '9988776655',
      email: 'rohan.gupta@example.com'
    },
    shippingAddress: {
      houseShopNo: 'House No. 12, Ward 4',
      street: 'Bazaar Road',
      villageArea: 'Old Town Area',
      city: 'Patna',
      district: 'Patna',
      state: 'Bihar',
      pinCode: '800001',
      landmark: 'Near Gandhi Chowk'
    },
    items: [
      createSeedItem({
        productId: 'fp-prod-301',
        name: 'Pure Cotton Playtime T-Shirt & Shorts Duo',
        sku: 'FP-K-ST-201',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
        size: '4-5 Yrs',
        colorName: 'Sunny Mustard',
        colorHex: '#eab308',
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
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    status: 'DELIVERED',
    courierName: 'BlueDart Air',
    awbNumber: 'BLD4459821',
    trackingNumber: 'BLD4459821',
    invoiceNumber: 'INV-2026-10003',
    createdAt: '2026-09-14T08:00:00Z',
    timeline: [
      {
        status: 'NEW',
        timestamp: '2026-09-14T08:00:00Z',
        title: 'Order Placed',
        description: 'Payment verified successfully.'
      },
      {
        status: 'CONFIRMED',
        timestamp: '2026-09-14T09:30:00Z',
        title: 'Order Confirmed',
        description: 'Ready for fulfillment.'
      },
      {
        status: 'PACKED',
        timestamp: '2026-09-14T12:00:00Z',
        title: 'Parcel Packed',
        description: 'Packed and barcoded.'
      },
      {
        status: 'SHIPPED',
        timestamp: '2026-09-14T17:00:00Z',
        title: 'In Transit',
        description: 'Dispatched via BlueDart.'
      },
      {
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-09-16T08:30:00Z',
        title: 'Out for Delivery',
        description: 'Courier executive out for final mile delivery.'
      },
      {
        status: 'DELIVERED',
        timestamp: '2026-09-16T14:45:00Z',
        title: 'Delivered',
        description: 'Delivered successfully to customer.'
      }
    ]
  }
];
