import React, { useState, useEffect } from 'react';
import { Product, Banner } from '../../../types';
import { apiClient } from '../../../api/client';
import { ProductCard } from '../../components/product-card/ProductCard';
import { INITIAL_REVIEWS, INITIAL_BANNERS } from '../../../database/seed/productsData';
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Flame,
  Truck,
  RotateCcw,
  Check,
  Copy,
  BadgeCheck,
  Shirt,
  Sparkle
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onProductClick?: (productId: string) => void;
  onSelectProduct?: (product: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
}

const QUICK_CATEGORIES = [
  {
    name: 'Men',
    label: "Men's Edit",
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80',
    link: '/products?category=Men'
  },
  {
    name: 'Women',
    label: "Women's Edit",
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=300&q=80',
    link: '/products?category=Women'
  },
  {
    name: 'Kids',
    label: "Kids Wear",
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=300&q=80',
    link: '/products?category=Kids'
  },
  {
    name: 'Shirts',
    label: 'Cotton Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
    link: '/products?category=Men'
  },
  {
    name: 'Kurtas',
    label: 'Ethnic Kurtas',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    link: '/products?category=Women'
  },
  {
    name: 'Denim',
    label: 'Denims & Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
    link: '/products'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onProductClick,
  onSelectProduct,
  wishlist = [],
  onToggleWishlist
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'TRENDING' | 'NEW' | 'BESTSELLER'>('TRENDING');
  const [products, setProducts] = useState<Product[]>([]);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onProductClick) {
      onProductClick(product.id);
    } else {
      onNavigate(`/product-details?id=${product.id}`);
    }
  };

  useEffect(() => {
    setBanners(INITIAL_BANNERS);

    const fetchHomeProducts = async () => {
      try {
        const res = await apiClient.products.list({ limit: 50 });
        if (res?.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load products for homepage:', err);
      }
    };

    fetchHomeProducts();
  }, []);

  // Banner autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'NEW') return p.isNewArrival;
    if (activeTab === 'BESTSELLER') return p.isBestseller;
    return p.isFeatured || p.isBestseller;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20">
      {/* 1. Fresh Top Quality Ribbon */}
      <div className="bg-neutral-900 text-white text-[11px] py-2 px-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-neutral-200">
              🌿 100% Bio-Washed Combed Cotton
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="text-neutral-300 hidden sm:inline">
              Free Delivery over ₹999
            </span>
            <span className="text-neutral-600 hidden md:inline">•</span>
            <span className="text-neutral-300 hidden md:inline">
              Cash on Delivery Available Across 28,000+ PIN Codes
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => onNavigate('/order-tracking')}
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Track Live Order</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Carousel Section */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        {banners.length > 0 && (
          <div className="relative min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
            {/* Background Banner Image */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={banners[activeBannerIdx].imageUrl}
                alt={banners[activeBannerIdx].title}
                className="w-full h-full object-cover object-center opacity-45 scale-100 transition-all duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="max-w-2xl">
                {banners[activeBannerIdx].badge && (
                  <div className="inline-flex items-center gap-1.5 bg-amber-400 text-neutral-950 font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-widest mb-4 shadow-xs">
                    <Sparkle className="w-3 h-3 fill-neutral-950" />
                    <span>{banners[activeBannerIdx].badge}</span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight text-white drop-shadow-sm">
                  {banners[activeBannerIdx].title}
                </h1>

                <p className="mt-4 text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed font-normal max-w-xl">
                  {banners[activeBannerIdx].subtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => onNavigate(banners[activeBannerIdx].link || '/products')}
                    className="px-6 py-3.5 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{banners[activeBannerIdx].ctaText || 'Shop Collection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/order-tracking')}
                    className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider rounded-xl backdrop-blur-md transition-colors cursor-pointer border border-white/15"
                  >
                    Track My Order (लाइव स्टेटस)
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-neutral-300">
                <span>0{activeBannerIdx + 1}</span>
                <span className="text-neutral-500">/</span>
                <span>0{banners.length}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)
                  }
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Clinical Quality & Trust Assurance Bar */}
      <section className="bg-neutral-50 border-b border-neutral-200/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/70 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">100% Pure Cotton</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Bio-washed breathable cloth</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/70 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">All India PIN Coverage</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Direct Post Office delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/70 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">Doorstep COD</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Cash on delivery available</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/70 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">7-Day Easy Exchange</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">Hassle-free doorstep size swap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Category Story Circles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              Explore Collections
            </span>
            <h2 className="text-lg font-bold text-neutral-900">Quick Wardrobe Picks</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/categories')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 group cursor-pointer"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {QUICK_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onNavigate(cat.link)}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 border-neutral-200 group-hover:border-black transition-all overflow-hidden bg-white shadow-2xs">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-bold text-neutral-800 group-hover:text-black transition-colors whitespace-nowrap">
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Curated Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Men */}
          <div
            onClick={() => onNavigate('/products?category=Men')}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-xs border border-neutral-200/90"
          >
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
              alt="Men's Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                Men's Wardrobe
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Shirts, Tees & Jeans</h3>
              <p className="text-xs text-neutral-300 mt-1">Pure combed cotton casuals & tailored fits</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Men's Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Women */}
          <div
            onClick={() => onNavigate('/products?category=Women')}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-xs border border-neutral-200/90"
          >
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"
              alt="Women's Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                Women's Collection
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Kurtas, Sets & Dresses</h3>
              <p className="text-xs text-neutral-300 mt-1">Authentic Chikankari, Florals & High-waist denim</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Women's Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Kids */}
          <div
            onClick={() => onNavigate('/products?category=Kids')}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-xs border border-neutral-200/90"
          >
            <img
              src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80"
              alt="Kids Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                Little Stars
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Playwear & Daily Sets</h3>
              <p className="text-xs text-neutral-300 mt-1">Extra-soft bio-washed sets & dungarees</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Kids Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Main Product Showcase Section with Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900">
                Fresh Wardrobe Styles
              </h2>
              <span className="text-[11px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full border border-neutral-200">
                {displayedProducts.length} Items
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Handpicked clothing tailored for comfort, breathable fabric & durability
            </p>
          </div>

          {/* Clean Segmented Filter Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('TRENDING')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'TRENDING'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Trending Now
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NEW')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'NEW'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              New Drops
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BESTSELLER')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'BESTSELLER'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Bestsellers
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={handleSelectProduct}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/products')}
            className="px-8 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span>Explore All 50+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 7. Promotional Offer Banner with 1-Click Voucher Copy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-neutral-800 shadow-sm">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs tracking-wider uppercase mb-2">
              <Flame className="w-4 h-4" />
              <span>Special Store Voucher</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
              Get Flat 10% Off On Your Wardrobe Order
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Apply coupon at checkout. Valid across entire men, women, and kids premium cotton wear.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => copyCouponCode('FIRST10')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="text-amber-400 font-black">FIRST10</span>
                {copiedCoupon ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </span>
                ) : (
                  <span className="text-neutral-400 flex items-center gap-1 text-[10px]">
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-6 py-2.5 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-colors shadow-md cursor-pointer"
              >
                Claim Offer Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Verified Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500">
            Real Customer Experiences
          </p>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1">
            Loved by 10,000+ Happy Buyers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold text-xs flex items-center justify-center border border-neutral-200">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{rev.author}</h4>
                    <p className="text-[10px] text-neutral-500">{rev.city}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
