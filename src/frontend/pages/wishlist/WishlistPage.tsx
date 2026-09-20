import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { cartManager } from '../../../utils/cartManager';
import { apiClient } from '../../../api/client';
import { ProductCard } from '../../components/product-card/ProductCard';
import { Heart, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

interface WishlistPageProps {
  wishlistIds?: string[];
  onToggleWishlist?: (id: string) => void;
  onSelectProduct?: (product: Product) => void;
  onProductClick?: (productId: string) => void;
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistIds: propWishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onProductClick,
  onNavigate
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const currentWishlistIds = propWishlistIds || cartManager.getWishlist();

  useEffect(() => {
    let isCancelled = false;
    apiClient.products.list({ limit: 100 })
      .then((res) => {
        if (!isCancelled && res?.products) {
          setAllProducts(res.products);
        }
      })
      .catch((err) => {
        console.error('Failed to load products for wishlist:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const wishlistedProducts = allProducts.filter((p) => currentWishlistIds.includes(p.id));

  const handleSelectProduct = (p: Product) => {
    if (onProductClick) onProductClick(p.id);
    else if (onSelectProduct) onSelectProduct(p);
    else onNavigate(`/product/${p.id}`);
  };

  const handleToggleWishlist = (id: string) => {
    if (onToggleWishlist) onToggleWishlist(id);
    else cartManager.toggleWishlist(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
                My Wishlist
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              You have <strong className="font-mono text-black">{wishlistedProducts.length}</strong> styles saved for later
            </p>
          </div>

          {wishlistedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="text-xs font-bold text-neutral-800 hover:text-black flex items-center gap-1"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-neutral-500 mt-1.5 max-w-xs mx-auto">
              Save your favorite shirts, dresses, kurtas and kids wear here to buy anytime.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="mt-6 px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Start Exploring Styles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={handleSelectProduct}
                isWishlisted={true}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
