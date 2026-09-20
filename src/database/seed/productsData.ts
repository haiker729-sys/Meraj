import { Product, Coupon, Banner, StoreReview } from '../../types';

export const INITIAL_PRODUCTS: Product[] = [
  // MEN
  {
    id: 'fp-prod-101',
    name: 'Classic Oxford Cotton Slim Fit Shirt',
    category: 'Men',
    subCategory: 'Shirts',
    description: 'Tailored from 100% breathable organic combed cotton, this premium button-down shirt delivers effortless elegance for both office wear and weekend celebrations. Features pre-washed softness, structured collar, and pearlized buttons.',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1299,
    mrp: 2499,
    discount: 48,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Sky Blue', hex: '#6ba4b8' },
      { name: 'Crisp White', hex: '#f8fafc' },
      { name: 'Midnight Navy', hex: '#1e293b' }
    ],
    stock: 45,
    sku: 'FP-M-SH-001',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 142,
    material: '100% Pure Egyptian Cotton',
    careInstructions: 'Machine wash cold with like colors. Warm iron if needed.'
  },
  {
    id: 'fp-prod-102',
    name: 'Heavyweight Graphic Oversized T-Shirt',
    category: 'Men',
    subCategory: 'T-Shirts',
    description: 'Streetwear staple crafted with 240 GSM heavy cotton jersey. Features dropped shoulders, relaxed silhouette, non-fade screen print, and ribbed crewneck collar that maintains shape wash after wash.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    price: 699,
    mrp: 1499,
    discount: 53,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Charcoal', hex: '#334155' },
      { name: 'Sage Green', hex: '#4d7c0f' },
      { name: 'Off White', hex: '#f1f5f9' }
    ],
    stock: 75,
    sku: 'FP-M-TS-002',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.7,
    reviewsCount: 89,
    material: '240 GSM Bio-Washed Combed Cotton',
    careInstructions: 'Gentle cycle, turn inside out before washing. Do not iron over print.'
  },
  {
    id: 'fp-prod-103',
    name: 'Vintage Wash Relaxed Tapered Jeans',
    category: 'Men',
    subCategory: 'Jeans',
    description: 'Authentic 12.5 oz stretch denim treated with artisanal stone-washing. Designed with a roomy thigh and clean taper toward the ankle. Reinforced pocket rivets and heavy-duty brass YKK zipper.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1799,
    mrp: 3299,
    discount: 45,
    sizes: ['30', '32', '34', '36', '38'],
    colors: [
      { name: 'Indigo Blue', hex: '#1e3a8a' },
      { name: 'Light Fade', hex: '#60a5fa' },
      { name: 'Jet Black', hex: '#0f172a' }
    ],
    stock: 32,
    sku: 'FP-M-JN-003',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 215,
    material: '98% Cotton, 2% Elastane',
    careInstructions: 'Wash inside out with cold water. Line dry in shade to preserve color.'
  },
  {
    id: 'fp-prod-104',
    name: 'Textured Knit Polo T-Shirt',
    category: 'Men',
    subCategory: 'T-Shirts',
    description: 'Elevated resort-ready polo made from breathable waffle knit cotton. Featuring a tailored cutaway collar, ribbed cuffs, and contrasting placket accents.',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'
    ],
    price: 899,
    mrp: 1899,
    discount: 52,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Olive Rust', hex: '#3f6212' },
      { name: 'Beige Sand', hex: '#d6d3d1' }
    ],
    stock: 20,
    sku: 'FP-M-PL-004',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 47,
    material: '100% Waffle Cotton',
    careInstructions: 'Dry flat, do not wring.'
  },

  // WOMEN
  {
    id: 'fp-prod-201',
    name: 'Tiered Floral Summer Midi Dress',
    category: 'Women',
    subCategory: 'Dresses',
    description: 'A whimsical silhouette with flowing tiered panels and delicate hand-block floral print. Tailored with a sweetheart neckline, puff sleeves, and a flattering smocked back for comfort and contour.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1599,
    mrp: 2999,
    discount: 46,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Rose Petal', hex: '#fda4af' },
      { name: 'Sage Floral', hex: '#a7f3d0' },
      { name: 'Marigold Yellow', hex: '#fde047' }
    ],
    stock: 38,
    sku: 'FP-W-DR-101',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 168,
    material: 'Chiffon Rayon Blend with Soft Inner Lining',
    careInstructions: 'Hand wash or dry clean recommended.'
  },
  {
    id: 'fp-prod-202',
    name: 'Handcrafted Chikankari Anarkali Kurta Set',
    category: 'Women',
    subCategory: 'Ethnic Wear',
    description: 'Exquisite traditional festive wear featuring authentic Lucknowi Chikankari needlework on premium pure cotton fabric. Comes with matching tailored palazzo pants and lightweight chiffon dupatta with lace borders.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    price: 2499,
    mrp: 4999,
    discount: 50,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Ivory Cream', hex: '#fefce8' },
      { name: 'Pastel Lilac', hex: '#e9d5ff' },
      { name: 'Mint Green', hex: '#d1fae5' }
    ],
    stock: 24,
    sku: 'FP-W-EK-102',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 290,
    material: 'Pure Handloom Cotton with Soft Voile Lining',
    careInstructions: 'Dry clean only for the first wash. Mild liquid detergent thereafter.'
  },
  {
    id: 'fp-prod-203',
    name: 'High-Waist Wide Leg Denim Trousers',
    category: 'Women',
    subCategory: 'Jeans',
    description: 'Retro 90s inspired wide leg jeans with high-rise waistline that elongates the silhouette. Soft authentic denim fabric with light stretch for all-day comfort. Features five-pocket styling and antique silver hardware.',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1499,
    mrp: 2799,
    discount: 46,
    sizes: ['26', '28', '30', '32', '34'],
    colors: [
      { name: 'Vintage Blue', hex: '#3b82f6' },
      { name: 'Washed Black', hex: '#1e293b' }
    ],
    stock: 40,
    sku: 'FP-W-JN-103',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.7,
    reviewsCount: 94,
    material: '99% Organic Cotton, 1% Elastane',
    careInstructions: 'Machine wash cold with dark colors.'
  },
  {
    id: 'fp-prod-204',
    name: 'Ribbed Knit Cropped Cardigan',
    category: 'Women',
    subCategory: 'Tops',
    description: 'Cozy yet structured cropped cardigan featuring tortoise shell statement buttons and a subtle V-neckline. Perfect for layering over slip dresses or pairing with high-waist denim.',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80'
    ],
    price: 999,
    mrp: 1999,
    discount: 50,
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Mocha Tan', hex: '#78350f' },
      { name: 'Cream Oat', hex: '#fef3c7' }
    ],
    stock: 18,
    sku: 'FP-W-TP-104',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.6,
    reviewsCount: 39,
    material: 'Wool Cotton Soft Blend',
    careInstructions: 'Dry flat, do not tumble dry.'
  },

  // KIDS
  {
    id: 'fp-prod-301',
    name: 'Pure Cotton Playtime T-Shirt & Shorts Duo',
    category: 'Kids',
    subCategory: 'Kids clothing',
    description: 'Designed specifically for active young explorers. Ultra-soft breathable cotton set featuring vibrant playful safari animal illustrations and an elasticated drawstring waistband that prevents irritation.',
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80'
    ],
    price: 599,
    mrp: 1199,
    discount: 50,
    sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs', '10-11 Yrs'],
    colors: [
      { name: 'Sunny Mustard', hex: '#eab308' },
      { name: 'Sky Aqua', hex: '#38bdf8' }
    ],
    stock: 60,
    sku: 'FP-K-ST-201',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: true,
    isBestseller: true,
    rating: 4.9,
    reviewsCount: 112,
    material: '100% Super-Combed Baby Soft Cotton',
    careInstructions: 'Machine washable, color-safe prints.'
  },
  {
    id: 'fp-prod-302',
    name: 'Denim Overalls Dungaree with Striped Tee',
    category: 'Kids',
    subCategory: 'Kids clothing',
    description: 'Timeless denim dungarees with adjustable shoulder metal buckles and side pocket snaps, paired with a matching crew-neck striped inner t-shirt. Sturdy yet soft for maximum play mobility.',
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1199,
    mrp: 2199,
    discount: 45,
    sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs'],
    colors: [
      { name: 'Denim Blue', hex: '#2563eb' }
    ],
    stock: 25,
    sku: 'FP-K-DN-202',
    status: 'PUBLISHED',
    isFeatured: true,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.8,
    reviewsCount: 78,
    material: 'Lightweight Washed Denim + Cotton Tee',
    careInstructions: 'Machine wash warm, iron medium.'
  },
  {
    id: 'fp-prod-303',
    name: 'Sparkle Tulle Festive Party Dress',
    category: 'Kids',
    subCategory: 'Kids clothing',
    description: 'Dazzling celebration dress made with hypoallergenic soft tulle layers, satin ribbon sash, and comfortable breathable cotton inner lining to keep little ones happy and itch-free.',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'
    ],
    price: 1299,
    mrp: 2399,
    discount: 46,
    sizes: ['3-4 Yrs', '5-6 Yrs', '7-8 Yrs', '9-10 Yrs'],
    colors: [
      { name: 'Blush Pink', hex: '#f472b6' },
      { name: 'Lavender Mist', hex: '#c084fc' }
    ],
    stock: 18,
    sku: 'FP-K-DR-203',
    status: 'PUBLISHED',
    isFeatured: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.9,
    reviewsCount: 54,
    material: 'Multi-layer Tulle with 100% Cotton Lining',
    careInstructions: 'Delicate hand wash, hang dry.'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'FIRST10',
    description: 'Flat 10% discount on your first order at Fashion Point',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderAmount: 799,
    maxDiscount: 300,
    isActive: true,
    validUntil: '2026-12-31'
  },
  {
    id: 'c-2',
    code: 'FASHION200',
    description: 'Flat ₹200 off on shopping above ₹1499',
    discountType: 'FLAT',
    discountValue: 200,
    minOrderAmount: 1499,
    isActive: true,
    validUntil: '2026-12-31'
  },
  {
    id: 'c-3',
    code: 'FESTIVE500',
    description: 'Flat ₹500 off on festive family shopping above ₹2999',
    discountType: 'FLAT',
    discountValue: 500,
    minOrderAmount: 2999,
    isActive: true,
    validUntil: '2026-12-31'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'New Season Collection 2026',
    subtitle: 'Pure cotton, elevated silhouettes, timeless fashion tailored for everyday luxury.',
    link: '/products?category=Men',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    badge: 'NEW ARRIVALS',
    ctaText: 'Explore Collection'
  },
  {
    id: 'ban-2',
    title: 'Ethnic & Festive Elegance',
    subtitle: 'Hand-embroidered Chikankari & Designer Dresses for memorable celebrations.',
    link: '/products?category=Women',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
    badge: 'TRENDING NOW',
    ctaText: 'Shop Women'
  },
  {
    id: 'ban-3',
    title: 'Joyful Playwear for Kids',
    subtitle: 'Extra-soft combed cotton ensembles designed for endless smiles and active play.',
    link: '/products?category=Kids',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80',
    badge: 'KIDS SPECIAL',
    ctaText: 'Shop Kids'
  }
];

export const INITIAL_REVIEWS: StoreReview[] = [
  {
    id: 'rev-1',
    author: 'Rahul Sharma',
    city: 'Jaipur, Rajasthan',
    rating: 5,
    comment: 'The quality of the Oxford Cotton shirt exceeded all my expectations! Pure soft cotton, perfect fitting, and delivered in just 2 days. Fashion Point is my new go-to store.',
    date: '14 Sep 2026',
    verifiedPurchase: true
  },
  {
    id: 'rev-2',
    author: 'Pooja Verma',
    city: 'Lucknow, UP',
    rating: 5,
    comment: 'The Chikankari Anarkali kurta set is simply breathtaking. The embroidery is neat, pure cotton fabric keeps you comfortable all day. Excellent packaging and prompt tracking updates!',
    date: '08 Sep 2026',
    verifiedPurchase: true
  },
  {
    id: 'rev-3',
    author: 'Vikram Mehta',
    city: 'Indore, MP',
    rating: 5,
    comment: 'Ordered dungarees for my 4 year old boy. Sturdy cloth, bright colors, very comfortable for him to run around in. Great local store feel with national e-commerce speed.',
    date: '02 Sep 2026',
    verifiedPurchase: true
  }
];

export const STORE_CONFIG = {
  name: 'Fashion Point Clothing Store',
  tagline: 'Timeless Indian Fashion & Premium Cotton Apparel',
  address: 'Shop 14-16, New Cloth Market, MG Road, Indore, MP - 452001',
  phone: '+91 98765 43210',
  email: 'care@fashionpoint.store',
  gstin: '23AAAAF8899A1Z2',
  returnWindowDays: 7,
  freeShippingThreshold: 999
};

