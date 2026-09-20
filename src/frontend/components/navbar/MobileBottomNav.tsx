import React from 'react';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 lg:hidden shadow-lg">
      <nav className="grid grid-cols-5 h-16 items-center">
        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('/home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/home' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={() => onNavigate('/categories')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/categories' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Categories</span>
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => onNavigate('/wishlist')}
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/wishlist' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Wishlist</span>
        </button>

        {/* Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center gap-1 text-neutral-500 hover:text-black transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-black text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>

        {/* Account */}
        <button
          type="button"
          onClick={() => onNavigate('/account')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentPath === '/account' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Account</span>
        </button>
      </nav>
    </div>
  );
};
