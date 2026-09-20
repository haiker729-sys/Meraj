import React, { useState, useEffect } from 'react';
import { Product, ProductColor } from '../../../types';
import { apiClient } from '../../../api/client';
import { cartManager } from '../../../utils/cartManager';
import { SizeChartModal } from '../../components/modal/SizeChartModal';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Check,
  ChevronRight,
  MapPin,
  Loader2
} from 'lucide-react';

interface ProductDetailsPageProps {
  product?: Product;
  productId?: string;
  onNavigate: (path: string) => void;
  onSelectProduct?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  onOpenCart?: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product: initialProduct,
  productId,
  onNavigate,
  onSelectProduct,
  isWishlisted: propIsWishlisted,
  onToggleWishlist,
  onOpenCart
}) => {
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!initialProduct && !!productId);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      return;
    }
    if (productId) {
      setLoading(true);
      apiClient.products.getById(productId)
        .then((res) => {
          if (res?.product) {
            setProduct(res.product);
          }
        })
        .catch((err) => {
          console.error('Failed to load product details:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [initialProduct, productId]);

  useEffect(() => {
    if (product?.category) {
      apiClient.products.list({ category: product.category, limit: 5 })
        .then((res) => {
          if (res?.products) {
            setRelatedProducts(res.products.filter((p) => p.id !== product.id).slice(0, 4));
          }
        })
        .catch(() => {});
    }
  }, [product?.id, product?.category]);

  const isWishlisted = propIsWishlisted ?? (product ? cartManager.isInWishlist(product.id) : false);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>({ name: 'Standard', hex: '#000000' });
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.sizes?.[0]) setSelectedSize(product.sizes[0]);
      if (product.colors?.[0]) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <button
            onClick={() => onNavigate('/products')}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : product.discount;

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length === 6 && /^\d+$/.test(pinCode)) {
      const today = new Date();
      today.setDate(today.getDate() + 3);
      const formattedDate = today.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      setDeliveryEstimate(`Delivery guaranteed by ${formattedDate} | Cash on delivery available`);
    } else {
      setDeliveryEstimate('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleAddToCart = () => {
    cartManager.addToCart({
      productId: product.id,
      product,
      selectedSize,
      selectedColor,
      quantity
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    cartManager.addToCart({
      productId: product.id,
      product,
      selectedSize,
      selectedColor,
      quantity
    });
    onNavigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <button onClick={() => onNavigate('/home')} className="hover:text-black">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate(`/products?category=${product.category}`)} className="hover:text-black">
            {product.category}
          </button>
          <span>/</span>
          <button onClick={() => onNavigate(`/products?category=${product.category}&subCategory=${product.subCategory}`)} className="hover:text-black">
            {product.subCategory}
          </button>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (3:4 Ratio) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-16 h-22 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIdx === idx ? 'border-black shadow-xs' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Active Image with Zoom Feel */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 pb-[133%]">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                {discountPercent > 0 && (
                  <span className="bg-black text-white text-xs font-black uppercase px-2.5 py-1 rounded tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-amber-500 text-white text-xs font-bold uppercase px-2 py-0.5 rounded">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Wishlist Button on image */}
              <button
                type="button"
                onClick={() => {
                  if (onToggleWishlist) onToggleWishlist(product.id);
                  else cartManager.toggleWishlist(product.id);
                }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 shadow-md'
                    : 'bg-white/90 text-neutral-700 hover:text-black hover:bg-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Buy Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                  {product.category} • {product.subCategory}
                </span>
                <span className="text-xs font-mono text-neutral-400">SKU: {product.sku}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 mt-1.5 leading-snug">
                {product.name}
              </h1>

              {/* Rating review row */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-900">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  {product.reviewsCount} verified customer reviews
                </span>
              </div>

              {/* Price Block */}
              <div className="mt-4 pt-4 border-t border-neutral-100 flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-neutral-950">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-base text-neutral-400 line-through font-mono">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save ₹{(product.mrp - product.price).toLocaleString('en-IN')} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Inclusive of all taxes. Free shipping over ₹999.</p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Color:{' '}
                      <strong className="text-neutral-600 font-medium">{selectedColor.name}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className={`group relative p-1 rounded-full border-2 transition-all ${
                          selectedColor.name === c.name ? 'border-black scale-105' : 'border-transparent hover:border-neutral-300'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: c.hex }}
                          className="block w-6 h-6 rounded-full border border-neutral-300 shadow-2xs"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector & Size Chart trigger */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Select Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1 underline underline-offset-2"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 h-11 px-3 text-xs font-mono font-bold rounded-xl border flex items-center justify-center transition-all ${
                        selectedSize === s
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Quantity</span>
                <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-mono text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-mono text-xs font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-mono text-sm"
                  >
                    +
                  </button>
                </div>
                {product.stock <= 5 && (
                  <span className="text-xs font-bold text-amber-700">
                    Only {product.stock} items remaining in stock
                  </span>
                )}
              </div>

              {/* Primary Action Buttons: Add to Cart & Buy Now */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Delivery Pin Code Checker */}
              <div className="mt-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-neutral-900">
                  <Truck className="w-4 h-4" />
                  <span>Check Delivery Date & COD Availability</span>
                </div>
                <form onSubmit={handleCheckDelivery} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN code"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                  >
                    Check
                  </button>
                </form>
                {deliveryEstimate && (
                  <p className="text-[11px] font-medium text-emerald-800 mt-2">
                    ✓ {deliveryEstimate}
                  </p>
                )}
              </div>

              {/* Product Specifications Accordion / Description */}
              <div className="mt-8 space-y-4 text-xs leading-relaxed border-t border-neutral-200 pt-6">
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-neutral-900 mb-1.5">
                    Product Description
                  </h3>
                  <p className="text-neutral-600">{product.description}</p>
                </div>

                {product.material && (
                  <div className="flex items-start gap-2 pt-2">
                    <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-900">Fabric & Composition:</strong>
                      <p className="text-neutral-600">{product.material}</p>
                    </div>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="flex items-start gap-2 pt-1">
                    <RotateCcw className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-900">Wash & Care Instructions:</strong>
                      <p className="text-neutral-600">{product.careInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-neutral-200">
            <h2 className="text-xl font-bold font-serif text-neutral-900 mb-6">
              Complete Your Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(rel);
                    } else {
                      onNavigate(`/product/${rel.id}`);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer group"
                >
                  <div className="w-full pb-[133%] relative rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-semibold text-xs text-neutral-900 mt-2 truncate group-hover:underline">
                    {rel.name}
                  </h4>
                  <p className="font-mono text-xs font-bold text-black mt-0.5">
                    ₹{rel.price.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />
    </div>
  );
};
