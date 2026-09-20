import React, { useState, useEffect } from 'react';
import { Product, Banner } from '../../../types';
import { apiClient } from '../../../api/client';
import { ProductCard } from '../../components/product-card/ProductCard';
import { INITIAL_REVIEWS, INITIAL_BANNERS } from '../../../database/seed/productsData';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Star, ShieldCheck, Flame, Tag } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onProductClick?: (productId: string) => void;
  onSelectProduct?: (product: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
}

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
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'NEW') return p.isNewArrival;
    if (activeTab === 'BESTSELLER') return p.isBestseller;
    return p.isFeatured || p.isBestseller;
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-16">
      {/* Hero Carousel Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        {banners.length > 0 && (
          <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={banners[activeBannerIdx].imageUrl}
                alt={banners[activeBannerIdx].title}
                className="w-full h-full object-cover object-center opacity-40 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-2xl">
                {banners[activeBannerIdx].badge && (
                  <span className="inline-block bg-amber-400 text-neutral-950 font-black text-xs uppercase px-2.5 py-1 rounded-sm tracking-wider mb-4">
                    {banners[activeBannerIdx].badge}
                  </span>
                )}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight text-white">
                  {banners[activeBannerIdx].title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                  {banners[activeBannerIdx].subtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate(banners[activeBannerIdx].link || '/products')}
                    className="px-7 py-3.5 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <span>{banners[activeBannerIdx].ctaText || 'Shop Collection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/order-tracking')}
                    className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider rounded-xl backdrop-blur-md transition-colors"
                  >
                    Track My Order
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Buttons */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)
                }
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Featured Categories (Men, Women, Kids) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-neutral-500">Curated For You</p>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/categories')}
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 group"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Men */}
          <div
            onClick={() => onNavigate('/products?category=Men')}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-neutral-200"
          >
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
              alt="Men's Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Men's Wardrobe</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Shirts, Tees & Jeans</h3>
              <p className="text-xs text-neutral-300 mt-1">Pure cotton casuals & tailored fits</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Men's Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Women */}
          <div
            onClick={() => onNavigate('/products?category=Women')}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-neutral-200"
          >
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"
              alt="Women's Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">Women's Collection</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Dresses & Ethnic Kurtas</h3>
              <p className="text-xs text-neutral-300 mt-1">Chikankari, Florals & High-waist denim</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Women's Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Kids */}
          <div
            onClick={() => onNavigate('/products?category=Kids')}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-neutral-200"
          >
            <img
              src="https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80"
              alt="Kids Clothing"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">Little Stars</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Playwear & Sets</h3>
              <p className="text-xs text-neutral-300 mt-1">Soft bio-washed sets & dungarees</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-white underline underline-offset-4">
                Explore Kids Wear <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Showcase Section with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900">
              Popular Styles
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Handpicked garments crafted with comfort & longevity</p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex bg-neutral-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('TRENDING')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'TRENDING'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Trending Now
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NEW')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'NEW'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              New Arrivals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BESTSELLER')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'BESTSELLER'
                  ? 'bg-black text-white shadow-xs'
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
            className="px-8 py-3.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Promotional Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-neutral-800">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs tracking-wider uppercase mb-2">
              <Flame className="w-4 h-4" />
              <span>Limited Time Store Offer</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
              Get Flat 10% Off On Your First Wardrobe Upgrade
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Use code <strong className="font-mono text-amber-400 text-sm px-1.5 py-0.5 bg-white/10 rounded">FIRST10</strong> during checkout. Valid on entire men, women, and kids collections.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-6 py-3 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-colors shadow-md"
              >
                Claim Offer Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-neutral-500">Loved by 10,000+ Customers</p>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 mt-1">
            Real Stories From Real Buyers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between"
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
                <div>
                  <h4 className="font-bold text-neutral-900">{rev.author}</h4>
                  <p className="text-[10px] text-neutral-500">{rev.city}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
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
