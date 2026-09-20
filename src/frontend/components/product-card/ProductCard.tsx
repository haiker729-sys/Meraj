import React from 'react';
import { Product, ProductColor } from '../../../types';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { cartManager } from '../../../utils/cartManager';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickAddToCart,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : product.discount;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    } else {
      cartManager.toggleWishlist(product.id);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAddToCart) {
      onQuickAddToCart(product);
    } else {
      // Default to first size and color
      cartManager.addToCart({
        productId: product.id,
        product,
        selectedSize: product.sizes[0] || 'M',
        selectedColor: product.colors[0] || { name: 'Standard', hex: '#000000' },
        quantity: 1
      });
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Container (3:4 Portrait Ratio) */}
      <div className="relative w-full pb-[133%] bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges: Discount, Bestseller, New */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-blue-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label="Save to Wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-neutral-600 hover:text-black hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-2 bottom-2 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 py-2 bg-black/90 hover:bg-black text-white text-xs font-bold rounded-lg backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
            <span className="font-medium uppercase tracking-wider">{product.category} • {product.subCategory}</span>
            <div className="flex items-center gap-0.5 font-bold text-neutral-800">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-neutral-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-900 text-sm line-clamp-1 group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>

          {/* Color swatches preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((c: ProductColor, i: number) => (
                <span
                  key={i}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs"
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-neutral-400 font-medium">+{product.colors.length - 4}</span>
              )}
              {/* Sizes preview */}
              <span className="text-[10px] text-neutral-400 ml-auto font-mono">
                {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-neutral-950 font-mono">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-neutral-400 line-through font-mono">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
